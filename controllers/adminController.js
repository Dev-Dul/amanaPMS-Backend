const db = require("../models/queries");
const bcrypt = require("bcryptjs");


async function fetchOverview(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
    
    try{
        const overview = await db.fetchOverview();
        res.status(200).json({ success: true, overview: overview });
    }catch(err){
        res.status(500).json({ message: err.message });
    }
}


async function fetchAllUsers(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
  
    try{
        const users = await db.fetchAllUsers();
        res.status(200).json({ success: true, users: users });
    }catch(err){
        res.status(500).json({ message: err.message });
    }
}


async function fetchAllStaff(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
  
  
    try{
        const staff = await db.fetchAllStaff();
        res.status(200).json({ success: true, staff: staff });
    }catch(err){
        res.status(500).json({ message: err.message });
    }
}

async function assignNewStaff(req, res){
    const { fullname, password, email, username } = req.body;
    if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
    if(!fullname || !password || !username || !email) return res.status(400).json({ message: "Incomplete Information provided!" });
    if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });

    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.assignNewStaff(fullname, hashedPassword, email, username);
        res.status(200).json({ message: "New staff account created successfully!" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }

}


async function fetch7daysPurchases(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  

  try{
    const purchases = await db.getPurchasesLast7Days();
    res.status(200).json({ success: true, purchases });
  }catch(error){
    res.status(500).json({ message: error.message });
  }
}



module.exports = {
    fetchOverview,
    fetchAllStaff,
    fetchAllUsers,
    assignNewStaff,
    fetch7daysPurchases,
}