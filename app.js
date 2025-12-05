require('dotenv').config();
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const { PrismaClient } = require("./generated/prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { passport } = require("./auth/passport-config");
const adminRouter = require("./routes/adminRouter");
const gatesRouter = require("./routes/gatesRouter");
const productRouter = require("./routes/productRouter");
const purchaseRouter = require("./routes/purchaseRouter");
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
const sevenDays = 7 * 24 * 60 * 60 * 1000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : undefined,
      maxAge: sevenDays,
    },
    secret: "dattebayo!",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 60 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
      ttl: sevenDays / 1000,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
const server = http.createServer(app);
setupSocket(server);

app.use("/api/v1/", gatesRouter);
app.use("/api/v1/admin/", adminRouter);
app.use("/api/v1/products/", productRouter);
app.use("/api/v1/purchases/", purchaseRouter);



async function createNewUser(){
  try{
    const password = '12345678';
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.createNewUser("Abdulrahim Jamil", "abdul@gmail.com", hashedPassword, "123456", "DevAbdul");
    console.log("User account created successfully!")
  }catch(err){
    console.log(err.message)
  }
}

// createNewUser();


app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`server is listening on port: ${PORT}`));