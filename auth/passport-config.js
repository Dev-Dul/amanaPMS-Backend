const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("../models/queries");


passport.use(
  new LocalStrategy(
    async (username, password, done) => {
      try {
        const user = await db.findUserByUsername(username);

        if(!user) return done(null, false, { message: "User not found!" });

        const match = await bcrypt.compare(password, user.password);
        if(!match) return done(null, false, { message: "Password is incorrect!" });

        return done(null, user);
      }catch(err){
        return done(err);
      }
    }
  )
);

passport.use("telegram", new Strategy(async (req, done) => {
  try{
    const initData = req.body.initData || req.query.initData;

    if(!initData) return done(null, false);

    
  }catch(error){
    return done(error);
  }
}))

// Serialize user by ID
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user by ID
passport.deserializeUser(async (id, done) => {
  try{
    const user = await db.fetchUserById(Number(id));
    done(null, user);
  }catch(err){
    done(err, null);
  }
});

// Handle login
function handleLogin(req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if(err) return next(err);
    if(!user){
      return res.status(400).json({message: info?.message || "Invalid admission number or staff ID"});
    }

    req.login(user, (err) => {
      if(err) return next(err);

      // Return full user object
      return res.status(200).json({ message: "Login successful", user });
    });

    
  })(req, res, next);
}

module.exports = {
  passport,
  handleLogin,
};
