import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

router.post("/medicine/analyze", async (req, res) => {
  const { imageBase64 } = req.body as { imageBase64?: string };

  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  const dataUrl = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  const systemPrompt = `You are a pharmaceutical expert assistant. When shown an image of medicine (pill, tablet, capsule, bottle, blister pack, or packaging), identify it and provide accurate, helpful information. 

Always respond with a JSON object with these exact fields:
- identified (boolean): whether you could identify the medicine
- name (string): full medicine name (brand + generic if known), or "Unknown Medicine" if not identified
- dosage (string): recommended dosage, frequency, and instructions. Include standard adult dosage. If unidentified, provide general guidance.
- primaryUse (string): primary medical indication and what condition(s) it treats
- approximatePrice (string): approximate retail price range in USD (e.g. "$5-$15 for 30 tablets"). Note if it varies significantly by region.
- generalInfo (string): brief overview including drug class, mechanism of action, and relevant details
- warnings (string): key warnings, contraindications, and important side effects to be aware of

Be helpful, accurate, and concise. If the image is unclear but shows medicine packaging, do your best to identify it.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 1024,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "high" },
            },
            {
              type: "text",
              text: "Please identify this medicine and provide detailed information about it.",
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    const parsed = JSON.parse(content) as {
      identified?: boolean;
      name?: string;
      dosage?: string;
      primaryUse?: string;
      approximatePrice?: string;
      generalInfo?: string;
      warnings?: string;
    };

    res.json({
      identified: parsed.identified ?? false,
      name: parsed.name ?? "Unknown Medicine",
      dosage: parsed.dosage ?? "Consult a healthcare professional",
      primaryUse: parsed.primaryUse ?? "Unable to determine",
      approximatePrice: parsed.approximatePrice ?? "Price unavailable",
      generalInfo: parsed.generalInfo ?? "Unable to analyze",
      warnings: parsed.warnings ?? "Consult a healthcare professional before use",
    });
  } catch (err) {
    req.log.error({ err }, "Medicine analysis failed");
    res.status(500).json({ error: "Failed to analyze medicine" });
  }
});

export default router;
