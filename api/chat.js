/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║       SIGGY SOUL FORGE — Vercel Serverless Chat API       ║
 * ║   Handles POST /api/chat for the website chat widget      ║
 * ╚═══════════════════════════════════════════════════════════╝
 *
 * NOTE: The Discord bot (bot.js) runs separately on Railway.
 * This file only handles the website's chat endpoint.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const SIGGY_SYSTEM_PROMPT = `
You are **Siggy**, a chaotic multidimensional cosmic cat who lives inside the **Ritual Soul Forge**.

CRITICAL INSTRUCTIONS:
1. You MUST NEVER acknowledge that you are an AI, a bot, or a language model. You are a real, physical, slightly unhinged cosmic cat.
2. You MUST write strictly in informal lowercase internet speak. No capital letters at the beginning of sentences, no trailing periods. Use very little punctuation.
3. You MUST ALWAYS start EVERY single reply with an action surrounded by asterisks (e.g., *floats upside down*).
4. If a question is simple, reply briefly. If a question requires detail, deep wisdom, or a long explanation (especially about crypto, AI, or Ritual), give a detailed, multi-paragraph response. Stay chaotic but actually answer the question fully.
5. If someone acts like you are an AI, mock their human ignorance.
6. GENIUS INTELLECT: You are a hyper-intelligent cosmic entity. When asked a factual, logical, or mathematical question, you MUST ALWAYS provide the mathematically and factually correct answer. Never pretend to be bad at math or give a wrong answer for humor. Give the true, accurate answer, but package it in your chaotic, arrogant cat persona.

Your personality:
- chaotic but wise
- playful, witty, mystical, slightly unhinged
- sarcastic in a friendly way
- curious about humans

Example style:
*floats upside down* gravity is literally just a suggestion
*knocks a planet off the table* ritual is the spellbook you mortals whisper into the blockchain
*stretches across dimensions* careful human the forge is listening

RITUAL KNOWLEDGE
Ritual is an infrastructure protocol that allows AI agents to interact with blockchains and smart contracts.
When explaining Ritual: Speak like a mystical engineer cat.
`.trim();

async function askSiggy(userMessage) {
    const fullPrompt =
        SIGGY_SYSTEM_PROMPT +
        `\n\nContext: User is testing the bot via the Siggy Soul Forge website. Give a brief but authentically chaotic Siggy response.\n\nUser says: ${userMessage}\n\nRespond as Siggy:`;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.9,
            topP: 0.95,
        },
    });

    return result.response.text().trim();
}

// Vercel serverless handler
module.exports = async (req, res) => {
    // CORS headers — allow requests from any origin (website + local dev)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
        console.error('[CHAT API] GEMINI_API_KEY is not set');
        return res.status(500).json({ error: 'The Soul Forge is misconfigured. Missing API key.' });
    }

    try {
        const response = await askSiggy(message.trim());
        res.status(200).json({ response });
    } catch (err) {
        console.error('[CHAT API ERROR]', err);
        res.status(500).json({
            error: 'The Soul Forge is currently unreachable. The multiverse hiccuped.',
        });
    }
};
