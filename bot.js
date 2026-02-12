require('dotenv').config();
const { Telegraf } = require('telegraf');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const bot = new Telegraf(process.env.BOT_TOKEN);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Хранилище контекста для каждого пользователя
const userSessions = new Map();

// Настройки
const MESSAGE_CHUNK_SIZE = 4000;

// Функция для получения/создания сессии чата
function getUserSession(userId) {
  if (!userSessions.has(userId)) {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', // Твоя модель
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
    
    const chat = model.startChat({
      history: [],
    });
    
    userSessions.set(userId, {
      chat,
      model: 'gemini-2.5-flash',
      messageCount: 0
    });
  }
  return userSessions.get(userId);
}

// Функция для разбивки длинных сообщений
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
  const welcomeMessage = `👋 Hello! I'm an AI bot powered by Gemini 2.5 Flash.

📝 I understand context and remember our conversation.

🔧 Commands:
/clear - Clear chat history
/help - Show help

Just send me a message!`;
  
  ctx.reply(welcomeMessage);
});

// Команда /help
bot.command('help', (ctx) => {
  const helpMessage = `ℹ️ Bot Help:

/start - Start the bot
/clear - Clear conversation history
/help - Show this help

💡 Tip: I remember our conversation context, so feel free to ask follow-up questions!`;
  
  ctx.reply(helpMessage);
});

// Команда /clear
bot.command('clear', (ctx) => {
  const userId = ctx.from.id;
  userSessions.delete(userId);
  ctx.reply('✅ Chat history cleared!');
});

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const userMessage = ctx.message.text;
  
  // Игнорируем команды
  if (userMessage.startsWith('/')) return;
  
  try {
    // Показываем индикатор набора текста
    await ctx.sendChatAction('typing');
    
    const session = getUserSession(userId);
    
    // Отправляем сообщение в чат
    const result = await session.chat.sendMessage(userMessage);
    const aiResponse = result.response.text();
    
    // Увеличиваем счётчик сообщений
    session.messageCount++;
    
    // Разбиваем длинный ответ на части
    const chunks = splitMessage(aiResponse);
    
    // Отправляем все части
    for (const chunk of chunks) {
      await ctx.reply(chunk);
      // Небольшая задержка между частями
      if (chunks.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
    
    let errorMessage = '❌ An error occurred: ' + error.message;
    
    // Специфичные ошибки
    if (error.message.includes('429')) {
      errorMessage = '⚠️ Rate limit exceeded. Please try again in a minute.';
    } else if (error.message.includes('SAFETY')) {
      errorMessage = '⚠️ Content filtered by safety settings. Try rephrasing your message.';
    } else if (error.message.includes('404')) {
      errorMessage = '⚠️ Model not found. Check your Gemini API access.';
    }
    
    await ctx.reply(errorMessage);
  }
});

// Обработка остановки бота
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

bot.launch();
console.log('🤖 AI Bot started successfully with Gemini 2.5 Flash!');
