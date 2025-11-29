const db = require("../models/queries");
const { getIO } = require("../socket/socket");
const { checkSeatNumber } = require("../utils/checkEngine");


async function registerNewPurchase(req, res){
  const { type, quantity, sellerId, drugId, itemId } = req.body;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(!type || !quantity || !sellerId) return res.status(400).json({ message: "Incomplete Credentials!" });

  if(type === "DRUG" && !drugId) return res.status(400).json({ message: "Incomplete Credentials!" });
  if(type === "ITEM" && !itemId) return res.status(400).json({ message: "Incomplete Credentials!" });

  try{
    if(type === "DRUG"){
      await db.registerNewPurchase(type, Number(quantity), Number(sellerId), drugId, null);
    }else{
      await db.registerNewPurchase(type, Number(quantity), Number(sellerId), null, itemId);
    }
    res.status(200).json({ message: "New purchase succesfully recorded!"});
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


async function fetchPurchase(req, res){
  const { purchaseId } = req.params;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(!purchaseId) return res.status(400).json({ message: "Incomplete Credentials!" });

  try{
    const purchase = await db.fetchPurchase(purchaseId);
    res.status(200).json({ success: true, purchase });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


async function fetchAllPurchases(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });

  try{
    const purchases = await db.fetchAllPurchases();
    res.status(200).json({ success: true, purchases });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


async function registerNewBatch(req, res){
  const { totalDrugs, totalItems, totalCost, userId } = req.body;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(!totalDrugs || !totalItems || !totalCost || !userId ) return res.status(400).json({ message: "Incomplete Credentials!" });

  try{
    await db.createNewBatch(Number(totalDrugs), Number(totalItems), parseFloat(totalCost), Number(userId));
    res.status(200).json({ message: "New batch succesfully recorded!"});
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}

async function fetchBatch(req, res){
  const { batchId } = req.param;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });
  if(!batchId ) return res.status(400).json({ message: "Incomplete Credentials!" });


  try{
    const batch = await db.fetchBatch(batchId);
    res.status(200).json({ success: true, batch });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


async function fetchAllBatches(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });


  try{
    const batches = await db.fetchAllBatches();
    res.status(200).json({ success: true, batches });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}

async function fetchPurchasesForToday(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthenticated!" });

  try{
    const purchases = await db.fetchPurchasesForToday();
    res.status(200).json({ success: true, purchases });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}





module.exports = {
  fetchBatch,
  fetchPurchase,
  fetchAllBatches,
  registerNewBatch,
  fetchAllPurchases,
  registerNewPurchase,
  fetchPurchasesForToday,
}