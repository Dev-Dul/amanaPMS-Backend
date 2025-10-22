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

async function fetchAllStudents(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
   
  
    try{
        const students = await db.fetchAllStudents();
        res.status(200).json({ success: true, students: students });
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

async function assignNewOperator(req, res){
    const { fullname, role, staffId, busId } = req.body;
    if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
    if(!fullname || !role || !staffId || !busId) return res.status(400).json({ message: "Incomplete Information provided!" });
    if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });

    try{
        const user = await db.fetchStaff(staffId);
        if(user) throw new Error("Account or username already exists!");
        const hashedPassword = await bcrypt.hash("12345", 10);
        await db.assignNewOperator(fullname, hashedPassword, staffId, busId, role);
        res.status(200).json({ message: "Operator account created successfully!" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }

}

async function fetchAllOperators(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
  
    try{
        const operators = await db.fetchAllOperators();
        res.status(200).json({ success: true, operators: operators });
    }catch(err){
        res.status(500).json({ message: err.message });
    }
}

async function addNewBus(req, res){
    const { make, model, capacity, plateNum, driverId, conductorId } = req.body;
    if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
    if(!make || !model || !capacity || !plateNum || !driverId || !conductorId) return res.status(400).json({ message: "Incomplete Information provided!" });
    if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });


    try{
      const bus = await db.createNewBus(make, model, plateNum, Number(capacity), Number(driverId), Number(conductorId));
      res.status(200).json({ success: true, bus: bus });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }

}

async function fetchAllBuses(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
    
    try{
        const buses = await db.fetchAllBuses();
        res.status(200).json({ success: true, buses: buses });
    }catch(err){
        res.status(500).json({ message: err.message });
    }
}

async function createNewRoute(req, res){
    const { name, shortName, startPoint, endPoint } = req.body;
    if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
    if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
    if(!name || !shortName || !startPoint || !endPoint) return res.status(400).json({ message: "Incomplete Information provided!" });

    try{
      const route = await db.createNewRoute(name, shortName, startPoint, endPoint);
      res.status(200).json({ success: true, route: route });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }

}

async function fetchAllRoutes(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
    
    try{
        const routes = await db.fetchAllRoutes();
        res.status(200).json({ success: true, routes: routes });
    }catch(err){
        res.status(500).json({ message: err.message });
    }
}


async function fetchRecentData(req, res){
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
    
    try{
        const data = await db.getTripsLast7Days();
        res.status(200).json({ success: true, data: data });
    }catch(err){
        res.status(500).json({ message: err.message });
    }
}

async function fetchWeeklyStats(req, res){
  const { type } = req.params;
  if(!req.isAuthenticated()) return res.status(403).json({ message: "Unauthorized!" });
  if(req.user.role !== "ADMIN") return res.status(403).json({ message: "Unauthorized!" });
  if(!type) return res.status(400).json({ message: "Incomplete Credentials!" });
    
    try{
        const data = await db.getWeeklyStats(type);
        res.status(200).json({ success: true, data: data });
    }catch(err){
        res.status(500).json({ message: err.message });
    }
}




module.exports = {
    addNewBus,
    fetchAllBuses,
    fetchOverview,
    fetchAllStaff,
    fetchAllUsers,
    fetchAllRoutes,
    createNewRoute,
    fetchRecentData,
    fetchAllStudents,
    fetchWeeklyStats,
    fetchAllOperators,
    assignNewOperator,
}