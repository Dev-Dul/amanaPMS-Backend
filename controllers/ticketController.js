const crypto = require("crypto");
const db = require("../models/queries");
const { getIO } = require("../socket/socket");
const { checkSeatNumber, checkBalance } = require("../utils/checkEngine");



async function createNewTicket(req, res){
  const { price, userId, tripId } = req.body;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(!userId || !price || !tripId) return res.status(400).json({ message: "Incomplete Credentials!" });

  const check = checkBalance(req.user, parseFloat(price));
  if(!check) return res.status(400).json({ message: "Insufficient balance!" });

  try{
    const ticketId = 'tk' + crypto.randomBytes(8).toString('hex');
    const qrToken = crypto.randomBytes(16).toString('hex');
    const trip = await db.fetchTrip(tripId);
    const seatNum = checkSeatNumber(trip);
    if(!seatNum) return res.status(403).json({ message: "No available seat!" });
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    await db.createNewTicket(ticketId, qrToken, Number(price), tomorrow, Number(userId), tripId, seatNum);
    res.status(200).json({ message: "Ticket purchased succesfully!"});
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}

async function fetchTicket(req, res){
  const { ticketId } = req.param;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(!userId || !price) return res.status(400).json({ message: "Incomplete Credentials!" });

  try {
    const ticket = await db.fetchTicket(ticketId);
    res.status(200).json({ success: true, ticket: ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function verifyTicket(req, res){
  const { payload } = req.body;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(!payload) return res.status(400).json({ message: "Incomplete Credentials!" });

  try{
    const ticket = await db.fetchTicketByToken(payload);
    if(!ticket) return res.status(400).json({ message: "Ticket Not Found!" });

    const check = ticket.status !== "ACTIVE";
    if(check) return res.status(409).json({ message: "Invalid ticket!" });

    await db.markTicketAsUsed(ticket.id);
    res.status(200).json({ message: "Ticket successfully verified!", ticket: ticket });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  fetchTicket,
  verifyTicket,
  createNewTicket
}
    