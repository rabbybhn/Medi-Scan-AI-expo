import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { db } from "@workspace/db";
import { scanHistoryTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { ObjectStorageService } from "../lib/objectStorage.js";

const router = Router();
const storage = new ObjectStorageService();

const SYSTEM_PROMPT = `You are a pharmaceutical expert assistant. When shown an image of medicine (pill, tablet, capsule, bottle, blister pack, or packaging), identify it and provide accurate, helpful information.

Always respond with a JSON object with these exact fields:
- identified (boolean): whether you could identify the medicine
- name (string): full medicine name (brand + generic if known), or "Unknown Medicine" if not identified
- dosage (string): recommended dosage, frequency, and instructions. Include standard adult dosage.
- primaryUse (string): primary medical indication and what condition(s) it treats
- approximatePrice (string): approximate retail price range in USD (e.g. "$5-$15 for 30 tablets").
- generalInfo (string): brief overview including drug class, mechanism of action, and relevant details
- warnings (string): key warnings, contraindications, and important side effects to be aware of

Respond ONLY with valid JSON — no markdown, no explanation.`;

async function uploadImageToStorage(base64Data: string): Promise<string | null> {
  try {
    const uploadUrl = await storage.getObjectEntityUploadURL();
    const imageBuffer = Buffer.from(base64Data, "base64");
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body: imageBuffer,
    });
    if (!uploadResponse.ok) return null;
    return storage.normalizeObjectEntityPath(uploadUrl.split("?")[0] ?? uploadUrl);
  } catch {
    return null;
  }
}

router.post("/medicine/analyze", async (req, res) => {
  const { imageBase64, userEmail } = req.body as { imageBase64?: string; userEmail?: string };

  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  const email = userEmail?.trim() || "anonymous";

  const base64Data = imageBase64.startsWith("data:")
    ? (imageBase64.split(",")[1] ?? imageBase64)
    : imageBase64;

  const [aiResponse, imageUrl] = await Promise.all([
    ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Data } },
            { text: "Please identify this medicine and provide detailed information about it." },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        maxOutputTokens: 1024,
      },
    }).catch((err) => { req.log.error({ err }, "AI analysis failed"); return null; }),
    uploadImageToStorage(base64Data),
  ]);

  if (!aiResponse?.text) {
    res.status(500).json({ error: "Failed to analyze medicine" });
    return;
  }

  let parsed: {
    identified?: boolean;
    name?: string;
    dosage?: string;
    primaryUse?: string;
    approximatePrice?: string;
    generalInfo?: string;
    warnings?: string;
  };

  try {
    parsed = JSON.parse(aiResponse.text) as typeof parsed;
  } catch {
    res.status(500).json({ error: "Failed to parse AI response" });
    return;
  }

  const record = {
    userEmail: email,
    identified: parsed.identified ?? false,
    name: parsed.name ?? "Unknown Medicine",
    dosage: parsed.dosage ?? "Consult a healthcare professional",
    primaryUse: parsed.primaryUse ?? "Unable to determine",
    approximatePrice: parsed.approximatePrice ?? "Price unavailable",
    generalInfo: parsed.generalInfo ?? "Unable to analyze",
    warnings: parsed.warnings ?? "Consult a healthcare professional before use",
    imageUrl: imageUrl ?? null,
  };

  try {
    const [saved] = await db.insert(scanHistoryTable).values(record).returning();
    res.json({
      ...record,
      id: saved?.id ?? 0,
      createdAt: saved?.createdAt ?? new Date(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save scan to DB");
    res.status(500).json({ error: "Failed to save scan" });
  }
});

router.get("/medicine/history", async (req, res) => {
  const { userEmail } = req.query as { userEmail?: string };

  if (!userEmail?.trim()) {
    res.status(400).json({ error: "userEmail query parameter is required" });
    return;
  }

  try {
    const items = await db
      .select()
      .from(scanHistoryTable)
      .where(eq(scanHistoryTable.userEmail, userEmail.trim()))
      .orderBy(desc(scanHistoryTable.createdAt))
      .limit(100);

    res.json({ items, total: items.length });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch scan history");
    res.status(500).json({ error: "Failed to fetch scan history" });
  }
});

export default router;
