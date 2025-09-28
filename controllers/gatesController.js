const db = require("../models/queries");
const bcrypt = require("bcryptjs");


async function createNewUser(req, res){
    const { fullname, email, password, role, addNum, staffId } = req.body;
    if(!fullname || !email || !password, !role) return res.status(400).json({ message: "Incomplete Credentials" });
    if(role === "STUDENT" && !addNum) return res.status(400).json({ message: "Admission Number is Missing!." });
    if(role === "STAFF" && !staffId) return res.status(400).json({ message: "StaffId is Missing!." });

    try{
        let user;
        if(role === "STAFF") user = await db.fetchStaff(staffId);
        if(role === "STUDENT") user = await db.fetchStudent(addNum);
        
        if(user) throw new Error("Account or username already exists!");
        const hashedPassword = await bcrypt.hash(password, 10);

        if(role === "STAFF") await db.createNewUser(fullname, email, hashedPassword, role, null, staffId);
        if(role === "STUDENT") await db.createNewUser(fullname, email, hashedPassword, role, addNum, null);
        
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
    createNewUser,
}