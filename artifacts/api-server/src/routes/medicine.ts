import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { db } from "@workspace/db";
import { scanHistoryTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const router = Router();

const SYSTEM_PROMPT = `You are a pharmaceutical expert assistant. When shown an image of medicine (pill, tablet, capsule, bottle, blister pack, or packaging), identify it and provide accurate, helpful information.

Always respond with a JSON object with these exact fields:
- identified (boolean): whether you could identify the medicine
- name (string): full medicine name (brand + generic if known), or "Unknown Medicine" if not identified
- dosage (string): recommended dosage, frequency, and instructions. Include standard adult dosage. If unidentified, provide general guidance.
- primaryUse (string): primary medical indication and what condition(s) it treats
- approximatePrice (string): approximate retail price range in USD (e.g. "$5-$15 for 30 tablets"). Note if it varies significantly by region.
- generalInfo (string): brief overview including drug class, mechanism of action, and relevant details
- warnings (string): key warnings, contraindications, and important side effects to be aware of

Be helpful, accurate, and concise. Respond ONLY with valid JSON — no markdown, no explanation.`;

router.post("/medicine/analyze", async (req, res) => {
  const { imageBase64 } = req.body as { imageBase64?: string };

  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  const base64Data = imageBase64.startsWith("data:")
    ? (imageBase64.split(",")[1] ?? imageBase64)
    : imageBase64;

  try {
    const response = await ai.models.generateContent({
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
    });

    const text = response.text;
    if (!text) {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    const parsed = JSON.parse(text) as {
      identified?: boolean;
      name?: string;
      dosage?: string;
      primaryUse?: string;
      approximatePrice?: string;
      generalInfo?: string;
      warnings?: string;
    };

    const record = {
      identified: parsed.identified ?? false,
      name: parsed.name ?? "Unknown Medicine",
      dosage: parsed.dosage ?? "Consult a healthcare professional",
      primaryUse: parsed.primaryUse ?? "Unable to determine",
      approximatePrice: parsed.approximatePrice ?? "Price unavailable",
      generalInfo: parsed.generalInfo ?? "Unable to analyze",
      warnings: parsed.warnings ?? "Consult a healthcare professional before use",
    };

    // Save to database
    const [saved] = await db.insert(scanHistoryTable).values(record).returning();

    res.json({
      ...record,
      id: saved?.id ?? 0,
      createdAt: saved?.createdAt ?? new Date(),
    });
  } catch (err) {
    req.log.error({ err }, "Medicine analysis failed");
    res.status(500).json({ error: "Failed to analyze medicine" });
  }
});

router.get("/medicine/history", async (req, res) => {
  try {
    const items = await db
      .select()
      .from(scanHistoryTable)
      .orderBy(desc(scanHistoryTable.createdAt))
      .limit(100);

    res.json({ items, total: items.length });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch scan history");
    res.status(500).json({ error: "Failed to fetch scan history" });
  }
});

export default router;
