const { Router } = require("express");
const adminRouter = Router();
const adminController = require("../controllers/adminController");

// get routes
adminRouter.get("/overview", adminController.fetchOverview);
adminRouter.get("/users/all", adminController.fetchAllUsers);
adminRouter.get("/users/staff/all", adminController.fetchAllStaff);
adminRouter.get("/data/recent", adminController.fetch7daysPurchases);
adminRouter.get("/users/:userId", adminController.fetchUser);
adminRouter.get("/revenue/stats", adminController.fetchStats);

// post routes
adminRouter.post("/staff/new", adminController.assignNewStaff);
adminRouter.post("/profile/update", adminController.updateProfile);
adminRouter.post("/staff/update/:userId", adminController.updateStaff);
adminRouter.post("/staff/delete/:userId", adminController.deleteStaff);
adminRouter.post("/staff/manage/:userId", adminController.manageStaff);


module.exports = adminRouter;