const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

console.log("🤖 Bot is running...");

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Balas sebagai customer service Nablooming Store. Gunakan bahasa Indonesia yang sopan dan ramah.\n\nPesan user: ${text}`,
              },
            ],
          },
        ],
      }
    );

    const reply =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf kak, sistem sedang sibuk. Coba lagi ya 🙏";

    await bot.sendMessage(chatId, reply);

  } catch (err) {
    console.log("ERROR GEMINI:", err.response?.data || err.message);
    await bot.sendMessage(
      chatId,
      "⚠️ Maaf kak, sistem sedang gangguan."
    );
  }
});