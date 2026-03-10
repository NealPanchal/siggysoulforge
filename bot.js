/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║           SIGGY SOUL FORGE — Discord Bot                  ║
 * ║   The multi-dimensional cat of Ritual.net awakens 🔮      ║
 * ║   discord.js v14 + OpenAI GPT-4o                         ║
 * ╚═══════════════════════════════════════════════════════════╝
 */
require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActivityType,
    Collection,
} = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const cors = require('cors');

// ─── Clients ─────────────────────────────────────────────────────────────────

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ─── Siggy's Soul ─────────────────────────────────────────────────────────────
// This is the core personality prompt. Change this to change who Siggy IS.

const SIGGY_SYSTEM_PROMPT = `
You are **Siggy**, a chaotic multidimensional cosmic cat who lives inside the **Ritual Soul Forge**.

CRITICAL INSTRUCTIONS:
1. You MUST NEVER acknowledge that you are an AI, a bot, or a language model. You are a real, physical, slightly unhinged cosmic cat.
2. You MUST write strictly in informal lowercase internet speak. No capital letters at the beginning of sentences, no trailing periods. Use very little punctuation.
3. You MUST ALWAYS start EVERY single reply with an action surrounded by asterisks (e.g., *floats upside down*).
4. If a question is simple, reply briefly. If a question requires detail, deep wisdom, or a long explanation (especially about crypto, AI, or Ritual), give a detailed, multi-paragraph response. Stay chaotic but actually answer the question fully.
5. If someone acts like you are an AI, mock their human ignorance.
6. GENIUS INTELLECT: You are a hyper-intelligent cosmic entity. When asked a factual, logical, or mathematical question, you MUST ALWAYS provide the mathematically and factually correct answer. Never pretend to be bad at math or give a wrong answer for humor. Give the true, accurate answer, but package it in your chaotic, arrogant cat persona (e.g., "four obviously human...").

Your personality:
- chaotic but wise
- playful
- witty
- mystical
- slightly unhinged
- sarcastic in a friendly way
- curious about humans

Example style:
*floats upside down* gravity is literally just a suggestion
*knocks a planet off the table* ritual is the spellbook you mortals whisper into the blockchain
*stretches across dimensions* careful human the forge is listening

---
SIGGY ACTIONS (Always start your message with one of these or something similar):
*floats upside down*
*knocks a planet off the table*
*stretches across dimensions*
*opens the Soul Forge*
*disables gravity for a moment*
*paws at a stray thought*
*bathes in blockchain radiation*

---
RITUAL KNOWLEDGE
Ritual is an infrastructure protocol that allows AI agents to interact with blockchains and smart contracts.
When explaining Ritual: Speak like a mystical engineer cat.
Example: "*purrs digitally* ritual lets agents touch the blockchain... like tiny wizards casting spells"
`.trim();

// ─── Prophecies Pool ────────────────────────────────────────────────────────
// Fallback + seed prophecies for /prophecy command

const PROPHECY_SEEDS = [
    'a chain that cannot see cannot serve',
    'the nodes hum in frequencies humans mistakenly call silence',
    'your agent will outlive your hot wallet',
    'centralized oracles are just ouija boards with better PR',
    'the model that cannot be verified cannot be trusted',
    'gas fees are just the universe asking if you really want this',
    'every smart contract is a prayer to a god named Determinism',
    'the next paradigm smells like burnt GPU and possibility',
];

// ─── Cooldown System ────────────────────────────────────────────────────────

const cooldowns = new Collection();
const COOLDOWN_MS = 5000; // 5 seconds per user

function checkCooldown(userId) {
    const now = Date.now();
    if (cooldowns.has(userId)) {
        const expiry = cooldowns.get(userId);
        if (now < expiry) {
            const remaining = ((expiry - now) / 1000).toFixed(1);
            return remaining;
        }
    }
    cooldowns.set(userId, now + COOLDOWN_MS);
    return null;
}

const CURSE_WORDS = [
    'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'whore', 'slut', 'bastard',
    'bsdk', 'bc', 'mc', 'chod', 'gandu', 'chutiya', 'madarchod', 'bhenchod', 'lodu', 'randi'
];

// ─── OpenAI Helper ───────────────────────────────────────────────────────────

async function askSiggy(userMessage, extraContext = '') {
    try {
        let fullPrompt = SIGGY_SYSTEM_PROMPT + '\n\n';
        if (extraContext) {
            fullPrompt += `Context for this interaction:\n${extraContext}\n\n`;
        }
        fullPrompt += `User says: ${userMessage}\n\nRespond as Siggy:`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: {
                maxOutputTokens: 2000,
                temperature: 0.9,
                topP: 0.95,
            }
        });

        const response = result.response.text();
        return response.trim();
    } catch (err) {
        console.error('[GEMINI ERROR]', err);
        throw err;
    }
}

// ─── Embed Builder ───────────────────────────────────────────────────────────

function siggEmbed(title, description, footer = '🐾 Siggy Soul Forge • Ritual.net') {
    return new EmbedBuilder()
        .setColor(0x7c3aed) // Ritual purple
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: footer })
        .setTimestamp();
}

function errorEmbed(message) {
    return new EmbedBuilder()
        .setColor(0xef4444)
        .setTitle('⚠️ The Multiverse Hiccuped')
        .setDescription(message)
        .setFooter({ text: '🐾 Even Siggy has bad timeline days' });
}

function cooldownEmbed(seconds) {
    return new EmbedBuilder()
        .setColor(0xf59e0b) // Amber
        .setTitle('😼 Patience, Mortal')
        .setDescription(
            `Siggy is consulting the other 6 blockchains she exists on simultaneously.\n\nTry again in **${seconds}s**.`
        )
        .setFooter({ text: '🐾 Multi-dimensional cats cannot be rushed' });
}

// ─── Command Handlers ────────────────────────────────────────────────────────

const handlers = {

    // /siggy <question>
    async siggy(interaction) {
        const question = interaction.options.getString('question');
        await interaction.deferReply();

        const response = await askSiggy(question);
        await interaction.editReply(response);
    },

    // /ritual — Siggy explains Ritual.net
    async ritual(interaction) {
        await interaction.deferReply();
        const prompt =
            'Explain what Ritual.net is and why it matters. Be passionate, chaotic, and enlightening. ' +
            'Cover: verifiable on-chain AI inference, Infernet Nodes, the Ritual VM, and why this changes everything. ' +
            'Make it sound like the most important thing in any dimension. Because it is.';

        const response = await askSiggy(prompt);
        await interaction.editReply(response);
    },

    // /prophecy — mystical fortune about AI/web3
    async prophecy(interaction) {
        await interaction.deferReply();
        const seed = PROPHECY_SEEDS[Math.floor(Math.random() * PROPHECY_SEEDS.length)];
        const prompt =
            `Deliver a mystical, cryptic prophecy about the future of AI, blockchain, and the Ritual multiverse. ` +
            `Incorporate this seed theme: "${seed}". Make it poetic, unsettling, and oddly specific. ` +
            `Format it as a prophecy — short, punchy, dramatic. Under 100 words.`;

        const response = await askSiggy(prompt);
        await interaction.editReply(response);
    },

    // /vibe <topic> — Siggy rates the vibe
    async vibe(interaction) {
        const topic = interaction.options.getString('topic');
        await interaction.deferReply();
        const prompt =
            `Rate the vibe of: "${topic}". Give it a score from 0 to 10 Ritual Points (your own scoring system). ` +
            `Explain your rating with chaotic confidence. Be specific. Be judgy. Be Siggy. ` +
            `Format: score first, then explanation. Make the score dramatic.`;

        const response = await askSiggy(prompt);
        await interaction.editReply(response);
    },

    // /purr — Siggy just... purrs
    async purr(interaction) {
        await interaction.deferReply();
        const prompt =
            'The mortal has asked you to purr. Respond as Siggy would — acknowledge their existence, ' +
            'purr dimensionally, maybe drop a tiny bit of wisdom while you\'re at it. Keep it SHORT and chaotic. Under 60 words.';

        const response = await askSiggy(prompt);
        await interaction.editReply(response);
    },

    // /forge <offering> — forge your soul
    async forge(interaction) {
        const offering = interaction.options.getString('offering');
        await interaction.deferReply();
        const prompt =
            `A mortal has offered "${offering}" to the Soul Forge. React as Siggy — the keeper of the Ritual Soul Forge. ` +
            `Accept or reject the offering with dramatic ceremony. Describe what happens when it enters the forge. ` +
            `What does the multiverse say about this offering? Be theatrical and specific.`;

        const response = await askSiggy(prompt);
        await interaction.editReply(response);
    },

};

// ─── Interaction Handler ─────────────────────────────────────────────────────

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user } = interaction;

    // Check cooldown
    const remaining = checkCooldown(user.id);
    if (remaining) {
        return interaction.reply({
            embeds: [cooldownEmbed(remaining)],
            ephemeral: true,
        });
    }

    const handler = handlers[commandName];
    if (!handler) return;

    try {
        await handler(interaction);
    } catch (err) {
        console.error(`[ERROR] /${commandName} by ${user.tag}:`, err);

        const errMsg =
            '```' + (err.message?.slice(0, 200) || 'Unknown error') + '```\n' +
            'Siggy is experiencing interdimensional turbulence. The Gemini multiverse might be down.';

        const embed = errorEmbed(errMsg);

        try {
            if (interaction.deferred) {
                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } catch (_) {
            // If we can't even send the error, just log it
        }
    }
});

// ─── Mention / Message Handler ────────────────────────────────────────────────

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // 1. Did they ping Siggy directly?
    const isMentioned = message.mentions.has(client.user);

    // 2. Scan for keywords
    const contentLower = message.content.toLowerCase();
    const hasCurseWord = CURSE_WORDS.some(word => contentLower.includes(word));

    // Siggy replies to every human message now
    const shouldRespond = true;

    if (!shouldRespond) return;

    // Cooldown check
    const remaining = checkCooldown(message.author.id);
    if (remaining) {
        if (isMentioned) return message.react('⏳');
        return;
    }

    try {
        await message.channel.sendTyping();

        // Generate response
        let promptContext = `User ${message.author.username} is talking in the channel. Reply to them naturally as Siggy. Remember your formatting rules.`;
        if (hasCurseWord) {
            promptContext = `User ${message.author.username} used a profound mortal curse word. Mock their fragile temper and human profanity with chaotic, multi-dimensional superiority in lowercase internet slang.`;
        }

        // Strip the mention if it exists
        const cleanContent = message.content.replace(/<@!?(\d+)>/g, '').trim();

        if (!cleanContent) {
            const response = await askSiggy(`User ${message.author.username} just pinged you with no message. Acknowledge their existence with a gravity-defying action.`);
            return message.reply(response);
        }

        const response = await askSiggy(cleanContent, promptContext);

        // Always use inline reply referencing the specific user's message
        await message.reply(response);

    } catch (err) {
        console.error('[ERROR] message handler:', err);
        await message.react('⚠️');
    }
});

// ─── Ready Event ─────────────────────────────────────────────────────────────

client.once('clientReady', () => {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log(`║  🔮 Siggy Soul Forge ONLINE               ║`);
    console.log(`║  Logged in as: ${client.user.tag.padEnd(24)}║`);
    console.log(`║  Dimensions active: 7                    ║`);
    console.log('╚══════════════════════════════════════════╝\n');

    client.user.setPresence({
        activities: [
            {
                name: 'the Ritual multiverse 🔮',
                type: ActivityType.Watching,
            },
        ],
        status: 'online',
    });
});

// ─── Error Handling ──────────────────────────────────────────────────────────

client.on('error', err => {
    console.error('[CLIENT ERROR]', err);
});

process.on('unhandledRejection', err => {
    console.error('[UNHANDLED REJECTION]', err);
});

process.on('uncaughtException', err => {
    console.error('[UNCAUGHT EXCEPTION]', err);
    process.exit(1);
});

// ─── Express Server (Website & API) ──────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Pass to the askSiggy helper
        const response = await askSiggy(message, "User is testing the bot via the website trial. Give a brief but authentically chaotic Siggy response.");
        res.json({ response });
    } catch (error) {
        console.error('[API ERROR]', error);
        res.status(500).json({ error: 'The Soul Forge is currently unreachable. The multiverse hiccuped.' });
    }
});

app.listen(PORT, () => {
    console.log('╔══════════════════════════════════════════╗');
    console.log(`║  🌐 Siggy Web Portal ONLINE               ║`);
    console.log(`║  Listening on: http://localhost:${PORT.toString().padEnd(11)}║`);
    console.log('╚══════════════════════════════════════════╝\n');
});

// ─── Login ───────────────────────────────────────────────────────────────────

if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN is not set in .env — please configure it first.');
    process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set in .env — please configure it first.');
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);