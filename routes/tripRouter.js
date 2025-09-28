const { Router } = require("express");
const tripRouter = Router();
const tripController = require("../controllers/tripController");

// get routes
tripRouter.get("/trips/all", tripController.fetchAllTrips);
tripRouter.get("/trips/active", tripController.fetchActiveTrips);
tripRouter.get("/trips/:tripId", tripController.fetchTrip);
tripRouter.get("/trips/done/:tripId", tripController.markTripAsDone);

// post routes
tripRouter.post("/new", tripController.createNewTrip);
tripRouter.post("/trips/join", tripController.joinTrip);


module.exports = tripRouter;