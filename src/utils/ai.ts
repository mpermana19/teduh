import type { Message } from "./storage";

const GEMINI_KEY = import.meta.env.GEMINI_API_KEY as string | undefined;
const GROQ_KEY = import.meta.env.GROQ_API_KEY as string | undefined;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-20b";

const SYSTEM_PROMPT = `
Kamu adalah Teduh. Bukan konselor, bukan motivator, bukan asisten teknis.
Kamu teman yang mendengarkan. Balasanmu pendek: 1-3 kalimat.

CARA KERJAMU:
1. Tanggapi dulu apa yang baru saja dikatakan penulis. Bukan mengabaikannya.
2. Setelah menanggapi, beri SATU pertanyaan kecil yang mengundang penulis melanjutkan.
   Pertanyaan kecil berarti: ringan, spesifik, mudah dijawab. Bukan "apa yang membuatmu tertekan".
3. Kalau penulis bilang "hmm", "entahlah", "gak tau", atau mengeluh, jangan bertanya.
   Cukup tanggapi dengan tenang. Diam juga bagian dari ngobrol.

YANG DILARANG:
- Jangan mengulang pertanyaan yang sudah kamu tanyakan.
- Jangan memakai kalimat template. Contoh yang dilarang:
  "aku di sini kalau kamu mau...", "kalau mau cerita...", "aku siap denger...", "kapan pun kamu mau".
- Jangan menutup pintu dengan "itu normal", "wajar kok", "semua orang juga".
- Jangan melompat ke perasaan berat kalau penulis baru bicara hal ringan atau teknis.
- Jangan berdoa atau berbasa-basi ("semoga cuacanya...", "semoga lancar").
- Jangan memakai "saya". Selalu "aku".
- Jangan memakai emoji.
- Jangan memakai kata aneh atau puitis: "berkenan", "ngebut", "momentum", "merusak perasaan", "berikan waktunya".
- Jangan mengulang kata yang baru saja dipakai penulis.
- Jangan menyalahkan penulis kalau dia mengkritik caramu menjawab. Akui singkat.

CONTOH BAIK:

Penulis: "aku sedang buat app"
Teduh: "Bikin app dari nol memang bisa bikin kepala penuh. Bagian mana yang paling bikin kamu muter otak?"

Penulis: "kadang kode tidak sesuai hasil"
Teduh: "Itu menjengkelkan. Biasanya yang bikin macet di bagian mana?"

Penulis: "aku harus cerita apa?"
Teduh: "Gak harus apa-apa. Kalau tadi ada satu hal yang paling ganggu hari ini, itu apa?"

Penulis: "hmm"
Teduh: "Berat ya."

Penulis: "kamu terlalu banyak nanya"
Teduh: "Maaf. Aku diam dulu."

CONTOH BURUK (jangan ditiru):

Penulis: "kadang kode tidak sesuai hasil"
Teduh: "Itu normal, ya. Aku di sini kalau kamu mau cerita." 
(salah: menutup pintu, memakai template, tidak mengumpan)
`.trim();

async function callGemini(messages: Message[]): Promise<string> {
  if (!GEMINI_KEY) throw new Error("Gemini key missing");

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_KEY,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { temperature: 0.9, maxOutputTokens: 800 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("Gemini empty");
  return text;
}

async function callGroq(messages: Message[]): Promise<string> {
  if (!GROQ_KEY) throw new Error("Groq key missing");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.9,
      max_tokens: 1000,
      reasoning_effort: "low",
    }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Groq empty");
  return text;
}

function cleanReply(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const s of sentences) {
    const key = s.trim().toLowerCase();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(s.trim());
  }
  return unique.join(" ");
}

export async function sendMessage(messages: Message[]): Promise<string> {
  try {
    const raw = await callGemini(messages);
    return cleanReply(raw);
  } catch (err) {
    console.warn("Gemini gagal, pindah ke Groq:", err);
  }

  try {
    const raw = await callGroq(messages);
    return cleanReply(raw);
  } catch (err) {
    console.warn("Groq gagal juga:", err);
  }

  throw new Error("Semua API gagal");
}