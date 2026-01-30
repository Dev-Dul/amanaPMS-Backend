const cron = require("node-cron");
const db = require("../models/queries");
const { sendMessage, sendButtonMessage } = require("../utils/messageEngine");


function generateMessage(name, amount, type){
    return `Hello Admin!.\n Here's an update regarding your inventory:\n\n The following ${type} is almost out of stock.\n\n Details: \n ${type} name: ${name}\n amount left: ${amount}`;
}

function initializeStockChecker() {
  cron.schedule("0 0 * * *", async () => {
    try {
      const drugs = await db.fetchLowDrugs();
      const items = await db.fetchLowItems();
        
      if(drugs.length > 0){
        for(let drug of drugs){
          const msg = generateMessage(drug.name, drug.quantity, "Drug");
          await sendMessage(process.env.ADMIN_ID, msg);
        }
      }

      if(items.length > 0){
        for(let item of items){
          const msg = generateMessage(item.name, item.quantity, "Item");
          await sendMessage(process.env.ADMIN_ID, msg);
        }
      }
      
    }catch (err) {
      console.log("Error sending stock reminders!", err.message);
    }
  });
}

function igniteJobEngine() {
  initializeStockChecker();
}

module.exports = igniteJobEngine;
