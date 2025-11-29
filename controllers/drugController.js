const crypto = require("crypto");
const db = require("../models/queries");
const { getIO } = require("../socket/socket");
const { checkSeatNumber, checkBalance } = require("../utils/checkEngine");


// drug controllers begin

async function registerNewDrug(req, res){
  const { name, cost, price, nafdac, quantity, manufacturer, type, userId } = req.body;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
  if(!name || !userId || !cost || !price || !nafdac || !quantity || !manufacturer || !type) return res.status(400).json({ message: "Incomplete Credentials!" });


  try{
    await db.registerNewDrug(name, parseFloat(cost), parseFloat(price), nafdac, Number(quantity), manufacturer, type, Number(userId))    
    res.status(200).json({ message: `Drug: ${name} registered successfully!`});
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


async function updateDrug(req, res){
  const { name, drugId, cost, price, nafdac, manufacturer, type, userId } = req.body;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
  if(!userId || !name || !cost || !price || !nafdac || !quantity || !manufacturer || !type) return res.status(400).json({ message: "Incomplete Credentials!" });


  try{
    await db.updateDrug(drugId, name, type, parseFloat(price), nafdac, manufacturer, parseFloat(cost), Number(userId));
    res.status(200).json({ message: `Drug: ${name} updated successfully!`});
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}

async function fetchDrug(req, res){
  const { drugId } = req.param;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(!drugId) return res.status(400).json({ message: "Incomplete Credentials!" });

  try {
    const drug = await db.fetchDrug(drugId);
    res.status(200).json({ success: true, drug });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


async function fetchAllDrugs(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" })

  try {
    const drugs = await db.fetchAllDrugs();
    res.status(200).json({ success: true, drugs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


async function deleteDrug(req, res){
  const { drugId } = req.param;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(!drugId) return res.status(400).json({ message: "Incomplete Credentials!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });


  try {
    await db.deleteDrug(drugId);
    res.status(200).json({ message: "Drug deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


// item controllers begin

async function registerNewItem(req, res){
  const { name, cost, price, quantity, manufacturer, type, userId } = req.body;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
  if(!name || !userId || !cost || !price || !quantity || !manufacturer || !type) return res.status(400).json({ message: "Incomplete Credentials!" });


  try{
    await db.registerNewItem(name, type, Number(quantity), manufacturer, parseFloat(price), parseFloat(cost), Number(userId));
    res.status(200).json({ message: `Product: ${name} registered successfully!`});
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


async function updateItem(req, res){
  const { name, itemId, cost, price, manufacturer, type, userId } = req.body;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
  if(!userId || !name || !cost || !price || !quantity || !manufacturer || !type) return res.status(400).json({ message: "Incomplete Credentials!" });


  try{
    await db.updateItem(itemId, name, type, parseFloat(price), parseFloat(cost), manufacturer, Number(userId));
    res.status(200).json({ message: `Item: ${name} updated successfully!`});
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}

async function fetchItem(req, res){
  const { itemId } = req.param;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(!itemId) return res.status(400).json({ message: "Incomplete Credentials!" });

  try {
    const item = await db.fetchItem(itemId);
    res.status(200).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


async function fetchAllItems(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" })

  try {
    const items = await db.fetchAllItems();
    res.status(200).json({ success: true, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


async function deleteItem(req, res){
  const { itemId } = req.param;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(!itemId) return res.status(400).json({ message: "Incomplete Credentials!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
  


  try {
    await db.deleteItem(itemId);
    res.status(200).json({ message: "Item deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


module.exports = {
  fetchItem,
  fetchDrug,
  updateItem,
  updateDrug,
  deleteDrug,
  deleteItem,
  fetchAllItems,
  fetchAllDrugs,
  registerNewDrug,
  registerNewItem,
}
    