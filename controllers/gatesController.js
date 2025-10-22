const db = require("../models/queries");
const bcrypt = require("bcryptjs");


async function createNewUser(req, res){
    const { fullname, email, password, role, id } = req.body;
    if(!fullname || !email || !password || !id || !role) return res.status(400).json({ message: "Incomplete Credentials" });

    try{
        let user;
        if(role === "STAFF") user = await db.fetchStaff(id);
        if(role === "STUDENT") user = await db.fetchStudent(id);
        
        if(user) throw new Error("Account or username already exists!");
        const hashedPassword = await bcrypt.hash(password, 10);

        if(role === "STAFF") await db.createNewUser(fullname, email, hashedPassword, role, null, id);
        if(role === "STUDENT") await db.createNewUser(fullname, email, hashedPassword, role, id, null);
        
        res.status(200).json({ message: `${role} account created successfully!` });
    }catch(err){
        res.status(500).json({ message: err.message });
    }

}


async function getUserById(req, res){
    const { userId } = req.params;
    if(!userId) return res.status(400).json({ message: "Incomplete Credentials!" });

    try{
        const user = await db.fetchUserById(Number(userId));
        res.status(200).json({ status: true, user: user });
    }catch(err){
        res.status(500).json({ message: err.message });
    }

}

async function hydrateUser(req, res){
    if(!req.user) return res.status(400).json({ message: "Expired!" });

    try{
        const user = req.user;
        res.status(200).json({ status: true, user: user });
    }catch(err){
        res.status(500).json({ message: err.message });
    }

}


async function logOut(req, res, next){
    if(!req.isAuthenticated()) return res.status(401).json({ message: "No User Logged In!" });

    req.logout(err => {
        if(err) return next(err);
        res.status(200).json({ message: "User logged out successfully!."});
    });
}


module.exports = {
    logOut,
    getUserById,
    hydrateUser,
    createNewUser,
}