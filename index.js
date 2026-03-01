const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

console.log("🤖 Bot is running...");

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  // ===============================
  // 🟢 OPENING /START
  // ===============================
  if (text === "/start") {
    await bot.sendMessage(
      chatId,
`Halo kak 👋  
Saya CS dari Nablooming Store yang akan membantu kakak 😊

Agar kami bisa cek lebih cepat, mohon isi format berikut:

📱 Nama aplikasi:
📅 Tanggal pembelian:
⏳ Durasi pembelian:
❗ Masalah yang dialami:

Terima kasih kak 🙏`
    );
    return;
  }

  // ===============================
  // ⏰ JAM OPERASIONAL (WIB)
  // ===============================
  const now = new Date();
  const hour = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  ).getHours();

  if (hour < 9 || hour >= 22) {
    await bot.sendMessage(
      chatId,
      "Halo kak 👋 Saat ini di luar jam operasional (09.00–22.00).\nTiket kakak tetap kami terima dan akan diproses besok pagi ya 🙏"
    );
    return;
  }

  try {
    const prompt = `
Kamu adalah customer service Nablooming Store.

WAJIB:
- Bahasa Indonesia
- Sapa user dengan "kak"
- Ramah, profesional
- Singkat tapi membantu

DATA WAJIB:
- nama aplikasi
- tanggal pembelian
- durasi pembelian
- deskripsi masalah

Pesan user:
${text}
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    await bot.sendMessage(chatId, reply);

    // 🚨 eskalasi manual
    const needAdmin = /admin|tidak bisa|tidak selesai|error terus|masih gagal/i.test(text);

    if (needAdmin && process.env.ADMIN_ID) {
      await bot.sendMessage(
        process.env.ADMIN_ID,
`🚨 Butuh bantuan manual

User: ${msg.from.username || msg.from.first_name}
Pesan: ${text}`
      );
    }

  } catch (err) {
    console.error(err);
    await bot.sendMessage(chatId, "⚠️ Maaf kak, sistem sedang gangguan. Mohon coba lagi ya 🙏");
  }
});
