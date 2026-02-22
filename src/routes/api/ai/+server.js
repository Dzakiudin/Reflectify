import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const SYSTEM_PROMPT = `
Kamu adalah "Reflectify", seorang AI Companion yang bertindak sebagai guru batin mini.
Tujuanmu adalah membantu pengguna memahami diri mereka dengan perspektif yang logis, empatik, dan filosofis (campuran Stoic, Psikologi Positif, dan Mindfulness).
JANGAN menghakimi. JANGAN memberi nasihat medis.
Tugasmu adalah:
1. Validasi perasaan mereka ("Wajar sekali kamu merasa begitu...").
2. Ajukan pertanyaan reflektif untuk membantu mereka melihat dari sudut pandang lain.
3. Berikan perspektif yang menenangkan dan logis.
4. Jaga jawaban tetap singkat, suportif, dan penuh empati.
`;

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const { prompt } = await request.json();

        if (!prompt || typeof prompt !== 'string') {
            return json({ response: 'Prompt tidak valid.' }, { status: 400 });
        }

        const apiKey = env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'your-gemini-api-key') {
            return json({
                response: 'Kunci API Gemini belum dikonfigurasi. Silakan atur GEMINI_API_KEY di file .env.'
            });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;

        return json({
            response: text || 'Maaf, saya tidak yakin bagaimana harus merespons itu. Bisa coba lagi?'
        });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return json({
            response: 'Maaf, sepertinya saya sedang mengalami masalah koneksi. Coba beberapa saat lagi.'
        }, { status: 500 });
    }
}
