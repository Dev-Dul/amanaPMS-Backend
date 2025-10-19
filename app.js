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
const { setupSocket } = require("./socket/socket");
const db = require("./models/queries");
const bcrypt = require("bcryptjs");
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
app.use("/api/v1/tickets/", ticketRouter);
app.use("/api/v1/trips/", tripRouter);

async function createNewUserWallet(){
  try{
    await db.createNewWallet(1, 5000);
    console.log("Succesfully created user wallet");
  }catch(error){
    console.error(`Wallet creation failed due to: ${error.message}`);
  }
}

async function clearUsers(){
  try{
    await db.clearUsers();
    console.log("Succesfully cleared all user accounts!");
  }catch(error){
    console.error(`Deleting accounts failed due to: ${error.message}`);
  }
}


// clearUsers();

async function createAdminAccount(){
  try{
    const password = "admin1234";
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.createNewUser("Dr. Abdullahi Mainasara", "admin.ksusta.edu.ng", hashedPassword, "ADMIN", null, "KSUSTA1234");
    console.log("Succesfully created Admin Account");
  }catch(error){
    console.error(`Admin account creation failed due to: ${error.message}`);
  }
}


// createAdminAccount();


app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`server is listening on port: ${PORT}`));