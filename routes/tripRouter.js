const { Router } = require("express");
const tripRouter = Router();
const tripController = require("../controllers/tripController");

// get routes
tripRouter.get("/all", tripController.fetchAllTrips);
tripRouter.get("/active", tripController.fetchActiveTrips);
tripRouter.get("/today", tripController.fetchTripsForToday);
tripRouter.get("/:tripId", tripController.fetchTrip);
tripRouter.get("/done/:tripId", tripController.markTripAsDone);

// post routes
tripRouter.post("/new", tripController.createNewTrip);
tripRouter.post("/join", tripController.joinTrip);


module.exports = tripRouter;