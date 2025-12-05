const { Router } = require("express");
const purchaseRouter = Router();
const purchaseController = require("../controllers/purchaseController");

// get routes
purchaseRouter.get("/all", purchaseController.fetchAllPurchases);
purchaseRouter.get("/batches/all", purchaseController.fetchAllBatches);
purchaseRouter.get("/today", purchaseController.fetchPurchasesForToday);
purchaseRouter.get("/:purchaseId", purchaseController.fetchPurchase);
purchaseRouter.get("/batches/:batchId", purchaseController.fetchBatch);

// ticket routes
purchaseRouter.post("/new", purchaseController.registerNewPurchase);
purchaseRouter.post("/batches/new", purchaseController.registerNewBatch);

module.exports = purchaseRouter;