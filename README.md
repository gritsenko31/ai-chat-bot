# 🤖 AI Chat Bot (Telegram)

Telegram bot powered by **Llama 3.3 70B** via Groq API. Fast, context-aware AI assistant with conversation memory.

**🔗 Try it now: [@ai_chat3_bot](https://t.me/ai_chat3_bot)**

## ✨ Features

- 💬 Natural conversation with context memory
- ⚡ Ultra-fast responses (Groq LPU inference)
- 🧠 Powered by Llama 3.3 70B (70 billion parameters)
- 🌐 Multilingual support
- 📝 Conversation history management
- 🚀 Deployed on Vercel (serverless)

## 🛠️ Tech Stack

- **Bot Framework**: [Telegraf](https://telegraf.js.org/)
- **AI Model**: Llama 3.3 70B via [Groq API](https://groq.com/)
- **Runtime**: Node.js
- **Deployment**: Vercel Serverless Functions
- **Version Control**: Git/GitHub

## 📋 Commands

- `/start` - Start the bot and see welcome message
- `/help` - Show available commands
- `/clear` - Clear conversation history

## 🚀 Setup

### Prerequisites

- Node.js 18+ installed
- Telegram Bot Token ([get from @BotFather](https://t.me/BotFather))
- Groq API Key ([get from console.groq.com](https://console.groq.com/keys))
- Vercel account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ai-chat-bot.git
cd ai-chat-bot
Install dependencies

bash
npm install
Create .env file

text
BOT_TOKEN=your_telegram_bot_token
GROQ_API_KEY=your_groq_api_key
Test locally (optional)

bash
node api/webhook.js
Deployment to Vercel
Install Vercel CLI

bash
npm install -g vercel
Login to Vercel

bash
vercel login
Deploy

bash
vercel --prod
Set environment variables in Vercel Dashboard

Go to Project Settings → Environment Variables

Add BOT_TOKEN and GROQ_API_KEY

Set Telegram webhook

bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-vercel-url.vercel.app/api/webhook"
📁 Project Structure
text
ai-chat-bot/
├── api/
│   └── webhook.js       # Main bot logic & Vercel handler
├── package.json         # Dependencies
├── .env                 # Environment variables (not in git)
├── .gitignore          # Git ignore rules
└── README.md           # This file
🔧 Configuration
Groq API Settings
Model: llama-3.3-70b-versatile

Temperature: 0.7

Max tokens: 2048

Top P: 0.9

Rate Limits (Free Tier)
30 requests per minute (RPM)

14,400 requests per day

7,000 requests per week

Conversation History
Stores last 20 messages per user

Automatically managed in memory

Use /clear to reset

📝 Usage Example
text
User: Hello!
Bot: It's nice to meet you. Is there something I can help you with?

User: What's the capital of France?
Bot: The capital of France is Paris.

User: Tell me more about it
Bot: [Detailed response about Paris with context from previous message]
🐛 Troubleshooting
Bot doesn't respond
Check webhook status: curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

Verify environment variables in Vercel

Check Vercel deployment logs

Rate limit errors
Wait 1 minute (free tier: 30 RPM)

Use /clear if conversation is too long

Webhook errors
Ensure Vercel function is deployed

Verify URL in webhook: https://your-app.vercel.app/api/webhook

📄 License
MIT License - feel free to use for your projects!

🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first.

📧 Contact
Created by gritsenko31
GitHub: @gritsenko31

Telegram: @dmitry3113

🙏 Acknowledgments
Groq for ultra-fast LLM inference

Telegraf for excellent Telegram bot framework

Vercel for serverless deployment

⭐ Star this repo if you found it helpful!
