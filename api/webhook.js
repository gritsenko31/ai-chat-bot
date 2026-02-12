const { Telegraf } = require('telegraf');
const Groq = require('groq-sdk');

const bot = new Telegraf(process.env.BOT_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Хранилище для сессий
const userSessions = new Map();

const MESSAGE_CHUNK_SIZE = 4000;

// Получить или создать сессию
function getUserSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      history: [],
      messageCount: 0
    });
  }
  return userSessions.get(userId);
}

// Разбивка длинных сообщений
function splitMessage(text, maxLength = MESSAGE_CHUNK_SIZE) {
  const chunks = [];
  let currentChunk = '';
  const lines = text.split('\n');
  
  for (const line of lines) {
    if ((currentChunk + line + '\n').length > maxLength) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = line + '\n';
    } else {
      currentChunk += line + '\n';
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

// Команда /start
bot.start((ctx) => {
  const welcomeMessage = `👋 Hello! I'm an AI bot powered by Llama 3.3 70B via Groq.

📝 I understand context and remember our conversation.

🔧 Commands:
/clear - Clear chat history
/help - Show help

Just send me a message!`;
  
  return ctx.reply(welcomeMessage);
});

// Команда /help
bot.command('help', (ctx) => {
  const helpMessage = `ℹ️ Bot Help:

/start - Start the bot
/clear - Clear conversation history
/help - Show this help

💡 Tip: I remember our conversation context!`;
  
  return ctx.reply(helpMessage);
});

// Команда /clear
bot.command('clear', (ctx) => {
  const userId = ctx.from.id;
  userSessions.delete(userId);
  return ctx.reply('✅ Chat history cleared!');
});

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const userMessage = ctx.message.text;
  
  if (userMessage.startsWith('/')) return;
  
  try {
    await ctx.sendChatAction('typing');
    
    const session = getUserSession(userId);
    
    // Добавляем сообщение пользователя в историю
    session.history.push({
      role: 'user',
      content: userMessage
    });
    
    // Ограничиваем историю последними 20 сообщениями
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }
    
    // Запрос к Groq
    const completion = await groq.chat.completions.create({
      messages: session.history,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    // Добавляем ответ AI в историю
    session.history.push({
      role: 'assistant',
      content: aiResponse
    });
    
    session.messageCount++;
    
    const chunks = splitMessage(aiResponse);
    
    for (const chunk of chunks) {
      await ctx.reply(chunk);
      if (chunks.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (error) {
    console.error('Error:', error);
    
    let errorMessage = '❌ An error occurred: ' + error.message;
    
    if (error.message.includes('429') || error.message.includes('rate_limit')) {
      errorMessage = '⚠️ Rate limit exceeded. Please wait a moment and try again.';
    } else if (error.message.includes('context_length')) {
      errorMessage = '⚠️ Conversation too long. Use /clear to start fresh.';
    }
    
    await ctx.reply(errorMessage);
  }
});

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body);
      res.status(200).json({ ok: true });
    } else {
      res.status(200).json({ status: 'Bot is running on Vercel with Groq!' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};
