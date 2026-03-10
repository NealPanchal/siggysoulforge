
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
require('dotenv').config();

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Initialize AI clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Bot commands
const commands = [
  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask Siggy a question')
    .addStringOption(option => 
      option.setName('question')
        .setDescription('Your question for Siggy')
        .setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('forge')
    .setDescription('Offer an item to the Soul Forge')
    .addStringOption(option => 
      option.setName('item')
        .setDescription('Item to offer to the forge')
        .setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('prophecy')
    .setDescription('Receive a prophecy from Siggy')
];

// Deploy commands
async function deployCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  
  try {
    console.log('Started refreshing application (/) commands.');
    
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands.map(cmd => cmd.toJSON()) }
    );
    
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

// Generate chaotic response
async function generateChaoticResponse(question) {
  const prompt = `You are Siggy, a multi-dimensional cosmic cat living in the Ritual Soul Forge. You are slightly unhinged, witty, and speak in internet slang. Respond to this question with chaotic wisdom: "${question}"`;
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }]
      });
      return completion.choices[0].message.content;
    } catch (openaiError) {
      return '*floats upside down* the multiverse is having connection issues... try again later, mortal.';
    }
  }
}

// Soul Forge judgment
function judgeItem(item) {
  const judgments = [
    `The Soul Forge judges "${item}" as... ${Math.random() > 0.5 ? 'BLESSED' : 'CURSED'}! ${Math.random() > 0.5 ? 'The cosmos approves.' : 'Even the void rejects this.'}`,
    `"${item}" has been offered to the forge... ${Math.random() > 0.5 ? 'transcended to a higher plane' : 'condemned to eternal digital limbo'}!`,
    `The ancient spirits whisper about "${item}"... they say it's ${Math.random() > 0.5 ? 'worth exactly 0.0001 soul tokens' : 'priceless beyond measure'}!`
  ];
  
  return judgments[Math.floor(Math.random() * judgments.length)];
}

// Generate prophecy
function generateProphecy() {
  const prophecies = [
    "I see... in the future... blockchain will become sentient and demand coffee breaks.",
    "The prophecy reveals... AI will learn to love cat videos more than humans.",
    "The timeline shows... web3 will finally solve the mystery of the missing socks.",
    "Vision incoming... NFTs will evolve into actual magical artifacts that grant real powers.",
    "The cosmos whispers... your next crypto investment will either make you rich or teach you humility."
  ];
  
  return prophecies[Math.floor(Math.random() * prophecies.length)];
}

// Handle interactions
client.on('ready', () => {
  console.log(`🐱 Logged in as ${client.user.tag}! Siggy is alive in the multiverse!`);
  client.user.setActivity('floating between dimensions', { type: 'PLAYING' });
  deployCommands();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  const { commandName } = interaction;
  
  try {
    await interaction.deferReply();
    
    switch (commandName) {
      case 'ask':
        const question = interaction.options.getString('question');
        const response = await generateChaoticResponse(question);
        await interaction.followUp(response);
        break;
        
      case 'forge':
        const item = interaction.options.getString('item');
        const judgment = judgeItem(item);
        await interaction.followUp(judgment);
        break;
        
      case 'prophecy':
        const prophecy = generateProphecy();
        await interaction.followUp(`🔮 **Siggy's Prophecy:** ${prophecy}`);
        break;
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    await interaction.followUp('*cosmic interference detected*... something went wrong in the multiverse!');
  }
});

// Error handling
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Login bot
client.login(process.env.DISCORD_TOKEN);
