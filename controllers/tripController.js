const db = require("../models/queries");
const { getIO } = require("../socket/socket");
const { checkSeatNumber } = require("../utils/checkEngine");


async function createNewTrip(req, res){
  const { busId, routeId, departure } = req.body;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(!busId || !routeId || !departure) return res.status(400).json({ message: "Incomplete Credentials!" });

  try{
    await db.createNewTrip(Number(busId), Number(routeId), departure);
    res.status(200).json({ message: "New trip created succesfully!"});
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


async function fetchTrip(req, res){
  const { tripId } = req.params;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(!tripId) return res.status(400).json({ message: "Incomplete Credentials!" });

  try{
    const trip = await db.fetchTrip(tripId);
    res.status(200).json({ success: true, trip: trip });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


async function fetchActiveTrips(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });

  try{
    const trips = await db.fetchActiveTrips();
    res.status(200).json({ success: true, trips: trips });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}

async function fetchTodaysTrips(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });

  try{
    const trips = await db.fetchTripsForToday();
    res.status(200).json({ success: true, trips: trips });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


async function fetchAllTrips(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });

  try{
    const trips = await db.fetchAllTrips();
    res.status(200).json({ success: true, trips: trips });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


async function markTripAsDone(req, res){
  const { tripId } = req.params;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(!tripId) return res.status(400).json({ message: "Incomplete Credentials!" });

  try{
    await db.markTripAsDone(tripId);
    res.status(200).json({ success: true, message: "Trip successfully marked as done!" });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


async function joinTrip(req, res){
  const { tripId } = req.params;
  const { userId, ticketId } = req.body;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(!tripId || !userId || !ticketId) return res.status(400).json({ message: "Incomplete Credentials!" });

  try{
    const trip = await db.fetchTrip(Number(tripId));
    const seatNum = checkSeatNumber(trip);
    if(seatNum){
      await db.joinTrip(Number(userId), tripId, ticketId, seatNum);
    }else{
      res.status(500).json({ success: true, message: "No seat available!" });
    }

    res.status(200).json({ success: true, message: "Trip successfully marked as done!" });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}


module.exports = {
  joinTrip,
  fetchTrip,
  createNewTrip,
  fetchAllTrips,
  markTripAsDone,
  fetchActiveTrips,
  fetchTodaysTrips,
}