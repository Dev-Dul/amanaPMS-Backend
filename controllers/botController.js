const db = require("../models/queries");
const { sendMessage, sendButtonMessage } = require("../utils/messageEngine");

async function botHandler(req, res) {
  try {
    const update = req.body;
    res.sendStatus(200);
    console.log("Received Telegram update:", JSON.stringify(update));
    handleUpdate(update);
  } catch (err) {
    console.error("Webhook handler crashed:", err); // FULL stack trace
    res.sendStatus(500);
  }
}

async function handleUpdate(update) {
  try {
    if(update.message && update.message?.text) {
      const chatId = update?.message?.chat.id;
      const username = update?.message?.from.username;
      const text = update?.message?.text;

      if(text.startsWith("/start")){
        const msg = `Welcome ${username} to AmanaPMS Digital Management System!🚀, the Ultimate management companion built by DevAbdul. Use the button below to login!`;
        await sendButtonMessage(chatId, process.env.MINI_APP_URL, msg);
      }
    }
  } catch (err) {
    console.error("handleUpdate crashed:", err); // FULL stack trace
  }
}

module.exports = botHandler;
