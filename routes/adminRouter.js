const { Router } = require("express");
const adminRouter = Router();
const adminController = require("../controllers/adminController");

// get routes
adminRouter.get("/overview", adminController.fetchOverview);
adminRouter.get("/users/all", adminController.fetchAllUsers);
adminRouter.get("/buses/all", adminController.fetchAllBuses);
adminRouter.get("/routes/all", adminController.fetchAllRoutes);
adminRouter.get("/data/recent", adminController.fetchRecentData);
adminRouter.get("/data/weekly/:type", adminController.fetchWeeklyStats);
adminRouter.get("/users/staff/all", adminController.fetchAllStaff);
adminRouter.get("/users/students/all", adminController.fetchAllStudents);
adminRouter.get("/users/operators/all", adminController.fetchAllOperators);

// post routes
adminRouter.post("/buses/new", adminController.addNewBus);
adminRouter.post("/routes/new", adminController.createNewRoute);
adminRouter.post("/operators/new", adminController.assignNewOperator);


module.exports = adminRouter;