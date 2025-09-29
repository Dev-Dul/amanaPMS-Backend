const { Router } = require("express");
const ticketRouter = Router();
const ticketController = require("../controllers/ticketController");

// get routes
ticketRouter.get("/:ticketId", ticketController.fetchTicket);

// ticket routes
ticketRouter.ticket("/new", ticketController.createNewTicket);

module.exports = ticketRouter;