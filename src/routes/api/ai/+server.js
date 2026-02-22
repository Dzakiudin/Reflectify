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

        const apiKey = env.OPENROUTER_API_KEY;

        if (!apiKey || apiKey === 'your-openrouter-api-key') {
            return json({
                response: 'Kunci API OpenRouter belum dikonfigurasi. Silakan atur OPENROUTER_API_KEY di file .env.'
            });
        }

        const apiUrl = `https://openrouter.ai/api/v1/chat/completions`;

        const payload = {
            model: 'google/gemini-2.0-flash-001',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://reflectify.app', // Sesuaikan jika ada domain asli
                'X-Title': 'Reflectify'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenRouter API Error:', errorData);
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        const text = result.choices?.[0]?.message?.content;

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
