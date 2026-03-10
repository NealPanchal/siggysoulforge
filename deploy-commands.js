/**
 * deploy-commands.js
 * Run this once to register Siggy's slash commands with Discord.
 * Usage: node deploy-commands.js
 */
require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('siggy')
        .setDescription('Ask Siggy anything from across the multiverse 🔮')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('What do you seek, mortal?')
                .setRequired(true)
                .setMaxLength(500)
        ),

    new SlashCommandBuilder()
        .setName('ritual')
        .setDescription("Let Siggy explain what Ritual.net actually is... in her own chaotic way 😼"),

    new SlashCommandBuilder()
        .setName('prophecy')
        .setDescription('Receive a mystical prophecy from Siggy about the future of AI and crypto 🌌'),

    new SlashCommandBuilder()
        .setName('vibe')
        .setDescription('Get Siggy\'s official vibe rating on anything ✨')
        .addStringOption(option =>
            option
                .setName('topic')
                .setDescription('What shall Siggy judge today?')
                .setRequired(true)
                .setMaxLength(200)
        ),

    new SlashCommandBuilder()
        .setName('purr')
        .setDescription('Siggy acknowledges your existence... dimensionally 🐾'),

    new SlashCommandBuilder()
        .setName('forge')
        .setDescription('Forge your soul into the Ritual multiverse 🔥')
        .addStringOption(option =>
            option
                .setName('offering')
                .setDescription('What do you offer to the Forge? (a word, a dream, a token ticker)')
                .setRequired(true)
                .setMaxLength(200)
        ),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`\n🔮 Siggy Soul Forge — Registering ${commands.length} slash commands...\n`);

        let data;
        if (process.env.GUILD_ID) {
            // Guild-specific (instant update during development)
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log(`✅ Successfully registered ${data.length} commands to guild ${process.env.GUILD_ID}`);
        } else {
            // Global (takes up to 1 hour to propagate)
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
            console.log(`✅ Successfully registered ${data.length} global commands`);
        }

        console.log('\n🐾 Siggy is ready to ascend.\n');
    } catch (error) {
        console.error('❌ Failed to register commands:', error);
        process.exit(1);
    }
})();
