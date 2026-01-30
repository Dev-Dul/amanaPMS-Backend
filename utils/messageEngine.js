const axios = require("axios");
const db = require("../models/queries");
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

async function sendMessage(chatId, text) {
  try {
    const res = await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: text,
    });

    return res.data;
  } catch (err) {
    console.error("❌ sendMessage failed:", {
      message: err.message,
      response: err.response?.data,
      stack: err.stack,
    });
    throw err;
  }
}

async function sendButtonMessage(chatId, url, textMsg) {
  try {
    const res = await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: textMsg,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open App",
              web_app: { url },
            },
          ],
        ],
      },
    });

    return res.data;
  } catch (error) {
    console.error("❌ sendButtonMessage failed:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    throw error;
  }
}


module.exports = { sendMessage, sendButtonMessage };
