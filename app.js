require('dotenv').config();
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const { PrismaClient } = require("./generated/prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { passport } = require("./auth/passport-config");
const adminRouter = require("./routes/adminRouter");
const ticketRouter = require("./routes/ticketRouter");
const tripRouter = require("./routes/tripRouter");
const gatesRouter = require("./routes/gatesRouter");
const profileRouter = require("./routes/profileRouter");
const { setupSocket } = require("./socket/socket");
const http = require('http');

const app = express();
app.set("trust proxy", 1);
app.use(cors({
    origin: process.env.ALLOWED_DOMAIN,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    secret: "dattebayo!",
    resave: true,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
      ttl: 60 * 60 * 24 * 7,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
const server = http.createServer(app);
setupSocket(server);

app.use("/api/v1/", gatesRouter);
app.use("/api/v1/admin/", adminRouter);
app.use("/api/v1/profiles/", profileRouter);
app.use("/api/v1/tickets/", ticketRouter);
app.use("/api/v1/trips/", tripRouter);



app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`server is listening on port: ${PORT}`));