const crypto = require("crypto");
const db = require("../models/queries");
const { getIO } = require("../socket/socket");
const { checkSeatNumber, checkBalance } = require("../utils/checkEngine");


// drug controllers begin

async function registerNewDrug(req, res){
  const { name, cost, price, quantity, manufacturer, userId } = req.body;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
  if(!name || !userId || !cost || !price || !quantity || !manufacturer) return res.status(400).json({ message: "Incomplete Credentials!" });


  try{
    const drug = await db.registerNewDrug(name, parseFloat(cost), parseFloat(price), Number(quantity), manufacturer, Number(userId))    
    res.status(200).json({ message: `Drug: ${name} registered successfully!`, drug: drug });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


async function updateDrug(req, res){
  const { name, drugId, cost, quantity, price, manufacturer } = req.body;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
  if(!name || !cost || !price || !quantity || !manufacturer || !drugId) return res.status(400).json({ message: "Incomplete Credentials!" });


  try{
    const drug = await db.updateDrug(drugId, name, quantity, parseFloat(price), manufacturer, parseFloat(cost));
    res.status(200).json({ message: `Drug: ${name} updated successfully!`, drug: drug });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}

async function fetchDrug(req, res){
  const { drugId } = req.params;
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
  const { drugId } = req.params;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(!drugId) return res.status(400).json({ message: "Incomplete Credentials!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });


  try {
    const drug = await db.fetchDrug(drugId);
    await db.deleteDrug(drugId);
    res.status(200).json({ message: "Drug deleted successfully!", drug: drug });
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
    const item = await db.registerNewItem(name, type, Number(quantity), manufacturer, parseFloat(price), parseFloat(cost), Number(userId));
    res.status(200).json({ message: `Product: ${name} registered successfully!`, item: item });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


async function updateItem(req, res){
  const { name, itemId, cost, quantity, price, manufacturer, type } = req.body;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
  if(!name || !cost || !price || !quantity || !manufacturer || !type) return res.status(400).json({ message: "Incomplete Credentials!" });


  try{
    const item = await db.updateItem(itemId, name, quantity, type, parseFloat(price), parseFloat(cost), manufacturer);
    res.status(200).json({ message: `Item: ${name} updated successfully!`, item: item });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}

async function fetchItem(req, res){
  const { itemId } = req.params;
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
  const { itemId } = req.params;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(!itemId) return res.status(400).json({ message: "Incomplete Credentials!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
  


  try {
    const item = await db.fetchItem(itemId);
    await db.deleteItem(itemId);
    res.status(200).json({ message: "Item deleted successfully!", item: item });
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
    