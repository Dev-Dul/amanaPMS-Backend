const { Router } = require("express");
const gatesRouter = Router();
const gatesController = require("../controllers/gatesController");
const { handleLogin, googleAuthCallback, googleAuthRedirect } = require("../auth/passport-config");

// get routes
gatesRouter.get("/logout", gatesController.logOut);
gatesRouter.get("/:userId", gatesController.getUserById);
gatesRouter.get("/auth/hydrate", gatesController.hydrateUser);

// post routes
gatesRouter.post("/login", handleLogin);
gatesRouter.post("/signup", gatesController.createNewUser);

module.exports = gatesRouter;