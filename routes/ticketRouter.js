const { Router } = require("express");
const ticketRouter = Router();
const ticketController = require("../controllers/ticketController");

// get routes
ticketRouter.get("/:ticketId", ticketController.fetchTicket);

// ticket routes
ticketRouter.post("/new", ticketController.createNewTicket);
ticketRouter.post("/verify", ticketController.verifyTicket);

module.exports = ticketRouter;