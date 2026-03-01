const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text }],
          },
        ],
      }
    );

    const reply =
      response.data.candidates[0].content.parts[0].text;

    bot.sendMessage(chatId, reply);
  } catch (err) {
    console.log(err.response?.data || err.message);
    bot.sendMessage(
      chatId,
      "⚠️ Maaf kak, sistem sedang gangguan."
    );
  }
});

console.log("🤖 Bot is running...");