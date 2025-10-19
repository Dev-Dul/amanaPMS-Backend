const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();
const { startOfWeek, endOfWeek, startOfDay, subDays } = require("date-fns");


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



async function findUserStaffIdOrAddNum(username){
     return await prisma.user.findFirst({
       where: {
         OR: [{ admissionNo: username }, { staffId: username }],
       },
       include: {
         bus: true,
         wallet: true,
         tickets: true,
         boardings: {
           include: {
             trip: true,
             ticket: true,
           },
         },
       },
     });
}


async function assignNewOperator(fullname, password, staffId, busId, role){
    await prisma.user.create({
      data: {
        role: role,
        staffId: staffId,
        fullname: fullname,
        password: password,
        bus: {
            connect: { id: busId },
        }
      },
    });
}

async function fetchStudent(admNo){
    return await prisma.user.findUnique({
      where: { admissionNo: admNo },
      include: {
        bus: true,
        wallet: true,
        tickets: true,
        boardings: {
          include: {
            trip: true,
            ticket: true,
          },
        },
      },
    });
}


async function fetchStaff(staffId){
    return await prisma.user.findUnique({
      where: { staffId: staffId },
      include: {
        bus: true,
        wallet: true,
        tickets: true,
        boardings: {
          include: {
            trip: true,
            ticket: true,
          },
        },
      },
    });
}


async function fetchUserById(userId){
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bus: true,
        wallet: true,
        tickets: true,
        boardings: {
          include: {
            trip: true,
            ticket: true,
          }
        },
      },
    });
}

async function fetchAllUsers(){
    return await prisma.user.findMany({
      include: {
        bus: true,
        wallet: true,
        tickets: true,
        boardings: true,
      }
    });
}

async function fetchAllStudents(){
    return await prisma.user.findMany({
        where: {
            role: "STUDENT"
        }
    });
}

async function clearUsers(){
  await prisma.user.deleteMany();
}

async function fetchAllStaff(){
    return await prisma.user.findMany({
        where: {
            role: "STAFF"
        }
    });
}

async function fetchAllOperators(){
    return await prisma.user.findMany({
        where: { 
            role: {
                in: ["CONDUCTOR", "DRIVER"]
            }
        }
    });
}

async function fetchOverview() {
  // Get start and end of current day
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [
    totalUsers,
    totalTrips,
    totalStaff,
    totalBuses,
    totalRoutes,
    activeTrips,
    ticketsSold,
    totalDrivers,
    totalStudents,
    totalConductors,
    totalRevenue,
    tripsToday,
    ticketsToday,
    revenueToday,
    passengersToday
  ] = await Promise.all([
    // All-time stats
    prisma.user.count(),
    prisma.tripBoarding.count(),
    prisma.user.count({ where: { role: "STAFF" } }),
    prisma.bus.count(),
    prisma.route.count(),
    prisma.trip.count({ where: { status: "ACTIVE" } }),
    prisma.ticket.count(),
    prisma.user.count({ where: { role: "DRIVER" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "CONDUCTOR" } }),
    prisma.ticket.aggregate({
      _sum: { price: true }
    }),

    // Today's stats
    prisma.tripBoarding.count({
      where: { boardedAt: { gte: startOfDay, lte: endOfDay } }
    }),
    prisma.ticket.count({
      where: { created: { gte: startOfDay, lte: endOfDay } }
    }),
    prisma.ticket.aggregate({
      _sum: { price: true },
      where: { created: { gte: startOfDay, lte: endOfDay } }
    }),
    prisma.ticket.findMany({
      where: { created: { gte: startOfDay, lte: endOfDay } },
      select: { userId: true },
      distinct: ["userId"]
    })
  ]);

  return {
    // All-time stats
    users: totalUsers,
    trips: totalTrips,
    staff: totalStaff,
    buses: totalBuses,
    routes: totalRoutes,
    tickets: ticketsSold,
    drivers: totalDrivers,
    students: totalStudents,
    activeTrips: activeTrips,
    conductors: totalConductors,
    totalRevenue: totalRevenue._sum.price || 0,

    // Today's stats
    today: {
      trips: tripsToday,
      passengers: passengersToday.length,
      tickets: ticketsToday,
      revenue: revenueToday._sum.price || 0
    }
  };
}



async function createNewWallet(userId, balance){
    await prisma.wallet.create({
        data: {
            balance: balance ?? undefined,
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
            boardings: {
              include: {
                user: true,
                trip: true,
                ticket: true
              }
            },
        }
    })
}

async function fetchTripsForToday(){
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 9999);

    return await prisma.trip.findMany({
        where: { created: {
            gte: startOfToday,
            lte: endOfToday,
        } },
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


async function createNewBus(make, model, plateNumber, capacity, driverId, conductorId){
    await prisma.bus.create({
        data: {
            make: make,
            model: model,
            capacity: capacity,
            plateNumber: plateNumber,
            driver: { connect: { id: driverId }},
            conductor: { connect: { id: conductorId }},
        }
    })
}

async function fetchAllBuses(){
  // routes: true,
  return await prisma.bus.findMany({});
}

async function createNewRoute(name, shortName, startPoint, endPoint, stops = null){
    await prisma.route.create({
        data: {
            name: name,
            endPoint: endPoint,
            shortName: shortName,
            startPoint: startPoint,
            // stops: 
        }
    })
}

async function fetchAllRoutes(){
  return await prisma.route.findMany({
    include: {
      stops: true,
      trips: true,
    }
  });
}


async function createNewTicket(id, qrCode, price, expires, userId, tripId, seatNum){
    await prisma.$transaction(async(tx) => {
        const wallet = await tx.wallet.findUnique({
            where: { userId },
            select: { id: true, balance: true }
        });

        if(!wallet) throw new Error("wallet not found");

        await tx.wallet.update({
            where: { id: wallet.id },
            data: {
                balance: { decrement: price }
            }
        });

        const ticket = await tx.ticket.create({
            data: {
                id: id,
                qrCode: qrCode,
                price: price,
                expiresAt: expires,
                user: { connect: { id: userId }}
            }
        })

        await tx.tripBoarding.create({
          data: {
            seatNumber: seatNum,
            user: { connect: { id: userId } },
            trip: { connect: { id: tripId } },
            ticket: { connect: { id: ticket.id } },
          },
        });
    })
}

async function fetchTicket(ticketId){
    await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
            user: true,
            tripBoarding: true
        }
    })
}

async function fetchTicketByToken(token){
    await prisma.ticket.findUnique({
        where: { qrCode: token },
        include: {
            user: true,
            tripBoarding: true
        }
    })
}

async function fetchAllTickets(){
    await prisma.ticket.findMany()
}

async function markTicketAsUsed(ticketId){
  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: "USED",
    },
  });
}




async function getTripsLast7Days(){
  const today = startOfDay(new Date());
  const sevenDaysAgo = subDays(today, 6); // includes today

  // Group trips per day for the last 7 days
  const trips = await prisma.trip.findMany({
    where: {
      created: {
        gte: sevenDaysAgo,
        lte: today,
      },
    },
    select: {
      id: true,
      created: true,
    },
  });

  // Count trips per day
  const dailyCounts = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dateStr = date.toISOString().slice(0, 10);
    const count = trips.filter((t) => t.created.toISOString().slice(0, 10) === dateStr).length;
    return { date: dateStr, count };
  });

  return dailyCounts;
}


/**
 * Get weekly stats for either TRIP or REV (revenue).
 * @param {"TRIP" | "REV"} type
 */
async function getWeeklyStats(type) {
  const grouped = {};

  // -------------------
  // TRIP MODE
  // -------------------
  if (type === "TRIP") {
    const trips = await prisma.trip.findMany({
      include: { boardings: true },
      orderBy: { created: "asc" },
    });

    for (const trip of trips) {
      const weekStart = startOfWeek(trip.created, { weekStartsOn: 1 });
      const key = weekStart.toISOString();

      if (!grouped[key]) {
        grouped[key] = {
          start: weekStart,
          end: endOfWeek(trip.created, { weekStartsOn: 1 }),
          trips: 0,
          passengers: 0,
        };
      }

      grouped[key].trips += 1;
      grouped[key].passengers += trip.boardings.length;
    }
  }

  // -------------------
  // REVENUE MODE
  // -------------------
  if (type === "REV") {
    const tickets = await prisma.ticket.findMany({
      orderBy: { created: "asc" },
      select: {
        price: true,
        created: true,
      },
    });

    for (const t of tickets) {
      const weekStart = startOfWeek(t.created, { weekStartsOn: 1 });
      const key = weekStart.toISOString();

      if (!grouped[key]) {
        grouped[key] = {
          start: weekStart,
          end: endOfWeek(t.created, { weekStartsOn: 1 }),
          totalRevenue: 0,
          totalTickets: 0,
        };
      }

      grouped[key].totalRevenue += t.price;
      grouped[key].totalTickets += 1;
    }
  }

  // -------------------
  // Return formatted array
  // -------------------
  const results = Object.values(grouped)
    .sort((a, b) => a.start - b.start)
    .map((w, idx) => ({
      num: idx + 1,
      start: w.start,
      end: w.end,
      ...(type === "TRIP"
        ? { trips: w.trips, passengers: w.passengers }
        : { totalRevenue: w.totalRevenue, totalTickets: w.totalTickets }),
    }));

  return results;
}



module.exports = {
    joinTrip,
    fetchTrip,
    fetchStaff,
    fetchTicket,
    clearUsers,
    createNewBus,
    fetchStudent,
    createNewTrip,
    fetchUserById,
    fetchAllTrips,
    fetchAllBuses,
    fetchAllUsers,
    fetchOverview,
    fetchAllStaff,
    createNewUser,
    createNewRoute,
    fetchAllRoutes,
    markTripAsDone,
    getWeeklyStats,
    createNewTicket,
    fetchAllTickets,
    createNewWallet,
    fetchActiveTrips,
    markTicketAsUsed,
    fetchAllStudents,
    assignNewOperator,
    fetchAllOperators,
    fetchTicketByToken,
    fetchTripsForToday,
    getTripsLast7Days,
    findUserStaffIdOrAddNum,
}