const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();


async function createNewUser(fullname, email, password, role, addNum = null, staffId = null){
    const user = await prisma.user.create({
        data: {
            fullname: fullname,
            email: email,
            password: password
        }
    });

    if(addNum){
        await prisma.user.update({
            where: { id: user.id },
            data: {
                admissionNo: addNum,
            }
        })
    }

    if(staffId){
        await prisma.user.update({
          where:{ id: user.id },
          data: {
            role: role,
            staffId: staffId,
          },
        });
    }
}


async function assignNewOperator(fullname, email, password, staffId, busId){
    await prisma.user.create({
      data: {
        email: email,
        staffId: staffId,
        role: "OPERATOR",
        fullname: fullname,
        password: password,
      },
    });
}

async function fetchStudent(admNo){
    return await prisma.user.findUnique({
        where: { admissionNo: admNo },
        include: {
            bus: bus,
            wallet: true,
            tickets: true,
            boardings: true,
        }
    })
}


async function fetchStaff(staffId){
    return await prisma.user.findUnique({
        where: { staffId: staffId },
        include: {
            bus: bus,
            wallet: true,
            tickets: true,
            boardings: true,
        }
    })
}


async function fetchUserById(userId){
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bus: bus,
        wallet: true,
        tickets: true,
        boardings: true,
      },
    });
}

async function fetchAllUsers(){
    return await prisma.user.findMany({});
}

async function fetchAllStudents(){
    return await prisma.user.findMany({});
}

async function fetchAllStaff(){
    return await prisma.user.findMany({});
}

async function fetchAllOperators(){
    return await prisma.user.findMany({});
}



async function createNewWallet(userId){
    await prisma.wallet.create({
        data: {
            user: { connect: { id: userId }},
        }
    })
}


async function createNewTrip(busId, routeId, departure){
    await prisma.trip.create({
        data: {
            departureTime: departure,
            bus: { connect: { id: busId }},
            route: { connect: { id: routeId }},
        }
    })
}

async function fetchTrip(tripId){
    return await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
            bus: true,
            route: true,
            boardings: true,
        }
    })
}

async function fetchActiveTrips(){
    return await prisma.trip.findMany({
        where: { status: "ACTIVE" }
    })
}


async function fetchAllTrips(){
    return await prisma.trip.findMany();
}

async function markTripAsDone(tripId){
    await prisma.trip.update({
        where: { id: tripId },
        data: {
            status: "EXPIRED",
        }
    })
}

async function joinTrip(userId, tripId, ticketId, seatNumber){
    await prisma.tripBoarding.create({
        data: {
            seatNumber: seatNumber,
            user: { connect: { id: userId }},
            trip: { connect: { id: tripId }},
            ticket: { connect: { id: ticketId }},
        }
    })
}


async function createNewBus(plateNumber, capacity, operatorId){
    await prisma.bus.create({
        data: {
            capacity: capacity,
            plateNumber: plateNumber,
            operator: { connect: { id: operatorId }},
        }
    })
}

async function fetchAllBuses(){
  await prisma.bus.findMany();
}

async function createNewRoute(name, startPoint, endPoint){
    await prisma.route.create({
        data: {
            name: name,
            startPoint: startPoint,
            endPoint: endPoint
        }
    })
}

async function fetchAllRoutes(){
  await prisma.route.findMany();
}


async function createNewTicket(id, qrCode, price, expires, userId){
    await prisma.ticket.create({
        data: {
            id: id,
            qrCode: qrCode,
            price: price,
            expiresAt: expires,
            user: { connect: { id: userId }}
        }
    })
}

async function fetchTicket(ticketId){
    await prisma.ticket.findUnique({
        where: { id: ticketId }
    })
}

async function fetchAllTickets(){
    await prisma.ticket.findMany()
}

async function markTicketAsUsed(ticketId) {
  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: "USED",
    },
  });
}




module.exports = {
    joinTrip,
    fetchTrip,
    fetchStaff,
    fetchTicket,
    createNewBus,
    fetchStudent,
    createNewTrip,
    fetchUserById,
    fetchAllTrips,
    fetchAllBuses,
    fetchAllUsers,
    fetchAllStaff,
    createNewUser,
    createNewRoute,
    fetchAllRoutes,
    markTripAsDone,
    createNewTicket,
    fetchAllTickets,
    createNewWallet,
    fetchActiveTrips,
    markTicketAsUsed,
    fetchAllStudents,
    assignNewOperator,
    fetchAllOperators,
}