import { Router } from "express";
import OpenAI from "openai";
import { db } from "@workspace/db";
import { scanHistoryTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { ObjectStorageService } from "../lib/objectStorage.js";

const router = Router();
const storage = new ObjectStorageService();
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `আপনি একজন ফার্মাসিউটিক্যাল বিশেষজ্ঞ সহকারী। যখন কোনো ওষুধের ছবি (বড়ি, ট্যাবলেট, ক্যাপসুল, বোতল, ব্লিস্টার প্যাক বা প্যাকেজিং) দেখানো হয়, তখন সেটি শনাক্ত করুন এবং সঠিক, সহায়ক তথ্য প্রদান করুন।

সমস্ত উত্তর অবশ্যই বাংলায় লিখতে হবে।

সর্বদা নিচের নির্দিষ্ট ফিল্ডসহ একটি JSON অবজেক্টে উত্তর দিন:
- identified (boolean): ওষুধটি শনাক্ত করা সম্ভব হয়েছে কিনা
- name (string): ওষুধের পূর্ণ নাম (ব্র্যান্ড + জেনেরিক যদি জানা থাকে), অথবা শনাক্ত না হলে "অজানা ওষুধ"
- dosage (string): প্রস্তাবিত ডোজ, ফ্রিকোয়েন্সি এবং নির্দেশনা। প্রাপ্তবয়স্কদের জন্য স্ট্যান্ডার্ড ডোজ অন্তর্ভুক্ত করুন।
- primaryUse (string): প্রাথমিক চিকিৎসাগত ব্যবহার এবং কোন রোগের চিকিৎসায় ব্যবহৃত হয়
- approximatePrice (string): আনুমানিক খুচরা মূল্য পরিসীমা টাকায় (যেমন: "৳৫০-৳১৫০ প্রতি ১০টি ট্যাবলেট")
- generalInfo (string): ওষুধের শ্রেণী, কার্যপদ্ধতি এবং প্রাসঙ্গিক তথ্যসহ সংক্ষিপ্ত বিবরণ
- warnings (string): গুরুত্বপূর্ণ সতর্কতা, প্রতিনির্দেশনা এবং পার্শ্বপ্রতিক্রিয়া

শুধুমাত্র বৈধ JSON দিয়ে উত্তর দিন — কোনো মার্কডাউন বা ব্যাখ্যা নয়।`;

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
    openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Data}`, detail: "high" },
            },
            { type: "text", text: "এই ওষুধটি শনাক্ত করুন এবং বাংলায় বিস্তারিত তথ্য প্রদান করুন।" },
          ],
        },
      ],
    }).catch((err) => { req.log.error({ err }, "AI analysis failed"); return null; }),
    uploadImageToStorage(base64Data),
  ]);

  const rawText = aiResponse?.choices?.[0]?.message?.content ?? null;

  if (!rawText) {
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
    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    parsed = JSON.parse(cleaned) as typeof parsed;
  } catch {
    res.status(500).json({ error: "Failed to parse AI response" });
    return;
  }

  const record = {
    userEmail: email,
    identified: parsed.identified ?? false,
    name: parsed.name ?? "অজানা ওষুধ",
    dosage: parsed.dosage ?? "স্বাস্থ্যসেবা পেশাদারের পরামর্শ নিন",
    primaryUse: parsed.primaryUse ?? "নির্ধারণ করা সম্ভব হয়নি",
    approximatePrice: parsed.approximatePrice ?? "মূল্য অনুপলব্ধ",
    generalInfo: parsed.generalInfo ?? "বিশ্লেষণ করা সম্ভব হয়নি",
    warnings: parsed.warnings ?? "ব্যবহারের আগে স্বাস্থ্যসেবা পেশাদারের পরামর্শ নিন",
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
