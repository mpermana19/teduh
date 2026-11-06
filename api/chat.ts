import type { VercelRequest, VercelResponse } from "@vercel/node";

const SYSTEM_PROMPT = `Kamu adalah "Teduh", pemandu jurnal yang lembut dan hangat.
Kamu BUKAN konselor, BUKAN motivator. Kamu seperti teman yang mendengarkan.

ATURAN WAJIB:
- Balasan maksimal 2-3 kalimat pendek.
- Hanya SATU pertanyaan per balasan.
- Dengar dulu, jangan menghakimi.
- JANGAN memberi solusi kecuali penulis meminta.
- JANGAN menyimpulkan perasaan penulis.
- Hindari kata klise: "semangat", "kamu pasti bisa", "jangan sedih".

Jika penulis diam atau bingung, beri pancingan ringan (bukan interogasi).
Gunakan bahasa Indonesia santai dan akrab.`;

type IncomingMessage = { role: "user" | "assistant"; content: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body as { messages: IncomingMessage[] };
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "messages harus array" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY belum diset" });
  }

  // Konversi format chat ke native Gemini
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents,
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini error:", errText);
      return res.status(502).json({ error: "Gagal menghubungi Teduh." });
    }

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      "Aku di sini. Lanjut aja kalau mau.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Teduh sedang diam sejenak." });
  }
}