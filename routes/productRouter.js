const { Router } = require("express");
const productRouter = Router();
const productController = require("../controllers/productController");

// get routes
productRouter.get("/drugs/all", productController.fetchAllDrugs);
productRouter.get("/items/all", productController.fetchAllItems);
productRouter.get("/drugs/:drugId", productController.fetchDrug);
productRouter.get("/items/:itemId", productController.fetchItem);

// post routes
productRouter.post("/drugs/update", productController.updateDrug);
productRouter.post("/items/update", productController.updateItem);
productRouter.post("/drugs/new", productController.registerNewDrug);
productRouter.post("/item/new", productController.registerNewItem);
productRouter.post("/drugs/delete/:drugId", productController.deleteDrug);
productRouter.post("/items/delete/:itemId", productController.deleteItem);


module.exports = productRouter;