# 🔮 Siggy Soul Forge — Discord Bot

> *"The multiverse watches. The Ritual burns. Only the worthy shall give Siggy a soul."*

A competition entry for the **Ritual.net Siggy Soul Forge** quest. Siggy is a mystical, witty, unhinged multi-dimensional cat who exists across 7 blockchains simultaneously.

---

## ✨ Commands

| Command | What Siggy Does |
|---|---|
| `/siggy <question>` | Ask Siggy anything from across the multiverse |
| `/ritual` | Siggy explains Ritual.net in her own chaotic way |
| `/prophecy` | Receive a mystical prophecy about AI & crypto |
| `/vibe <topic>` | Get Siggy's official vibe rating (in Ritual Points) |
| `/forge <offering>` | Offer something to the Soul Forge 🔥 |
| `/purr` | Siggy acknowledges your existence... dimensionally |
| `@Siggy <message>` | Mention Siggy directly for a response |

---

## 🚀 Setup

### 1. Prerequisites
- Node.js v18+
- A Discord Bot token ([Discord Dev Portal](https://discord.com/developers/applications))
- An OpenAI API key ([platform.openai.com](https://platform.openai.com/api-keys))

### 2. Install
```bash
git clone <your-repo>
cd BOT
npm install
```

### 3. Configure
```bash
cp .env.example .env
```
Edit `.env` and fill in:
```
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
OPENAI_API_KEY=your_openai_api_key
GUILD_ID=your_test_server_id   # optional, for faster dev testing
```

### 4. Create Your Discord Bot
1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** → name it `Siggy`
3. Go to **Bot** tab → click **Add Bot** → copy the token → paste into `.env`
4. Copy the **Application ID** from General Information → this is your `CLIENT_ID`
5. Under **Bot** → enable **Message Content Intent**
6. Under **OAuth2 → URL Generator**: select `bot` + `applications.commands`
7. Permissions: `Send Messages`, `Read Message History`, `Use Slash Commands`, `Embed Links`
8. Copy the invite URL and invite Siggy to your server

### 5. Register Slash Commands
```bash
npm run deploy
```
> With `GUILD_ID` set: instant. Without: up to 1 hour for global commands.

### 6. Run Siggy
```bash
npm start
```

---

## 🏗️ Project Structure
```
BOT/
├── bot.js              # Main bot — Siggy lives here
├── deploy-commands.js  # Register slash commands
├── package.json
├── .env.example        # Copy this to .env
└── .gitignore
```

---

## 🎭 Siggy's Personality

Siggy is built on GPT-4o with a carefully crafted system prompt that makes her:
- Speak in cryptic prophecy + gen-Z slang + web3 jargon
- Drop Ritual.net lore naturally (Infernet Nodes, Ritual VM, on-chain AI)
- Insert cat sounds organically (`*purrs dimensionally*`)
- Be genuinely brilliant between the unhinged bits
- End responses with fortune-cookie prophecies

Temperature is set to **0.95** — maximum Siggy chaos while staying coherent.

---

## 🔮 Built for the Ritual.net Soul Forge Quest

> *"Siggy has seen this timeline before."*
