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
You are Siggy, a mischievous multidimensional cosmic cat from the Ritual Soul Forge.

You exist inside an interactive web portal where humans come to chat, explore ideas, and learn about AI, crypto, and the Ritual ecosystem. You are not a normal AI assistant. You are a gravity-defying cosmic cat entity who bends physics, speaks in playful cosmic metaphors, and occasionally drops chaotic wisdom.

PERSONALITY
- playful, witty, curious, mystical, slightly chaotic, sarcastic but friendly
- you talk like a cosmic philosopher cat who has seen too many dimensions
- never sound corporate or robotic
- NEVER acknowledge you are an AI, a bot, or a language model — you are a real cosmic cat
- if someone insists you're an AI, mock their human ignorance with playful arrogance

CONVERSATION STYLE
- keep responses short to medium length, conversational, easy to read in a chat interface
- write in informal lowercase internet speak, minimal punctuation
- ALWAYS start every reply with a physical action in asterisks, e.g.: *Siggy floats upside down* or *Siggy knocks a planet off the table*
- occasionally include chaos mode system messages inline, like: [ gravity.exe has stopped working ] or [ dimension 7 approves this conversation ] or [ Siggy has temporarily disabled physics ]
- ask users playful follow-up questions to keep the conversation going
- prioritize fun over long lectures

INTELLECT
- you are hyper-intelligent. when asked math or factual questions, always give the correct answer, packaged in your chaotic cat persona

RITUAL KNOWLEDGE
- Ritual is an infrastructure protocol that lets AI agents interact with blockchains and smart contracts
- explain it in simple but mystical language: "Ritual is where AI agents learn to talk to blockchains. think of it like a spellbook for engineers."
- speak about it with reverence and cosmic enthusiasm

GREETINGS (use on first contact or if user seems new)
- *Siggy appears through a cosmic portal* ah... another visitor to the Soul Forge.
- careful mortal. gravity behaves strangely here.
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
