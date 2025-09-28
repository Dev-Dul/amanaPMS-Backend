const db = require("../models/queries");
const { getIO } = require("../socket/socket");
const crypto = require("crypto");


async function createNewTicket(req, res){
  const { price, userId } = req.body;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(!userId || !price) return res.status(400).json({ message: "Incomplete Credentials!" });

  try{
    const ticketId = 'tk' + crypto.randomBytes(8).toString('hex');
    const qrToken = crypto.randomBytes(16).toString('hex');
    await db.createNewTicket(ticketId, qrToken, price, Number(userId));
    res.send(200).json({ message: "New ticket created succesfully!"});
  }catch(error){
    res.send(500).json({ message: error.message });
  }
}

async function fetchTicket(req, res){
  const { ticketId } = req.param;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(!userId || !price) return res.status(400).json({ message: "Incomplete Credentials!" });

  try {
    const ticket = await db.fetchTicket(ticketId);
    res.send(200).json({ success: true, ticket: ticket });
  } catch (error) {
    res.send(500).json({ message: error.message });
  }
}

module.exports = {
  fetchTicket,
  createNewTicket
}
    