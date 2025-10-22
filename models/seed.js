// prisma/seed.js
// Seed script tailored to your schema + requirements.
//
// Install: npm i bcryptjs @faker-js/faker date-fns
// Run: node prisma/seed.js
//
// IMPORTANT: This script is destructive for the listed models (it deletes many records).
// Run only on dev DB or after backing up.

const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const crypto = require("crypto");
const { subDays, addMinutes, addDays } = require("date-fns");

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function uuidHex(len = 16) {
  return crypto.randomBytes(len).toString("hex");
}

// Price mapping per stop (as provided)
const STOP_PRICES = {
  "School - Aleiro (Gadan Audu)": 50,
  "School - Aleiro (Kashin Zama)": 50,
  "School - Aleiro (Lemi)": 50,
  "School - Jega (Old BLB)": 150,
  "School - Jega (EcoBank)": 150,
  "School - Kalgo": 500,
  "School - BK (AP2)": 700,
  "School - BK (Halliru Abdu)": 700,
};

async function safeDeleteMany() {
  // delete in safe order to avoid FK constraint issues
  await prisma.tripBoarding.deleteMany().catch(() => {});
  await prisma.ticket.deleteMany().catch(() => {});
  await prisma.trip.deleteMany().catch(() => {});
  await prisma.wallet.deleteMany().catch(() => {});
  await prisma.bus.deleteMany().catch(() => {});
  await prisma.stop.deleteMany().catch(() => {});
  await prisma.route.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});
}

async function createTicketAndBoardingTx(tx, { userId, tripId, price, seatNumber, expiresAt }) {
  // tx is a prisma transaction client
  // This mirrors your createNewTicket transaction behavior:
  // - check wallet
  // - decrement balance
  // - create ticket
  // - create tripBoarding
  const wallet = await tx.wallet.findUnique({
    where: { userId },
    select: { id: true, balance: true },
  });

  if (!wallet) {
    // For seeding, create wallet with a generous balance so seeding doesn't fail.
    // In production you'd refuse - but seed needs to run deterministically.
    const newW = await tx.wallet.create({
      data: { user: { connect: { id: userId } }, balance: Math.max(50000, price * 20) },
    });
    // continue using new wallet
    // decrement below will use newW.id
    await tx.wallet.update({
      where: { id: newW.id },
      data: { balance: { decrement: price } },
    });
  } else {
    if (wallet.balance < price) {
      // top up a little so purchase succeeds
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: price * 5 } } });
    }
    await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: price } } });
  }

  const ticketId = "tk" + uuidHex(8);
  const qrToken = uuidHex(16);
  const ticket = await tx.ticket.create({
    data: {
      id: ticketId,
      qrCode: qrToken,
      price,
      expiresAt,
      user: { connect: { id: userId } },
    },
  });

  const boarding = await tx.tripBoarding.create({
    data: {
      seatNumber,
      user: { connect: { id: userId } },
      trip: { connect: { id: tripId } },
      ticket: { connect: { id: ticket.id } },
    },
  });

  return { ticket, boarding };
}

async function main() {
  console.log("⏳ Starting seed...");

  // 0) Wipe existing data for the involved models (CAREFUL)
//   console.log("🧹 Deleting existing seeded records (tripBoarding, tickets, trips, wallets, buses, stops, routes, users)...");
//   await safeDeleteMany();

  // -----------------------------
  // 1) Create Routes
  // -----------------------------
  console.log("🚏 Creating routes...");
  const route1 = await prisma.route.create({
    data: {
      name: "Birnin Kebbi - School",
      shortName: "BK-SCH",
      startPoint: "Birnin Kebbi",
      endPoint: "School",
    },
  });

  const route2 = await prisma.route.create({
    data: {
      name: "School - Birnin Kebbi",
      shortName: "SCH-BK",
      startPoint: "School",
      endPoint: "Birnin Kebbi",
    },
  });

  // -----------------------------
  // 2) Create Stops for each route (the schema requires stops.routeId)
  // -----------------------------
  console.log("📍 Creating stops for both routes...");
  const stopsList = [
    "School - Aleiro (Custom)",
    "School - Aleiro (Gadan Audu)",
    "School - Aleiro (Kashin Zama)",
    "School - Aleiro (Lemi)",
    "School - Jega (Old BLB)",
    "School - Jega (EcoBank)",
    "School - Kalgo",
    "School - BK (AP2)",
    "School - BK (Halliru Abdu)",
  ];

  // helper to create stops for a given route
  async function createStopsForRoute(route) {
    const created = [];
    for (const sName of stopsList) {
      const short = sName
        .replace(/\s+/g, "-")
        .replace(/[()]/g, "")
        .replace(/[^a-zA-Z0-9-]/g, "")
        .slice(0, 40);
      const price = STOP_PRICES[sName] ?? 100;
      const st = await prisma.stop.create({
        data: {
          name: sName,
          shortName: short,
          startPoint: route.startPoint,
          endPoint: route.endPoint,
          route: { connect: { id: route.id } },
          price,
        },
      });
      created.push(st);
    }
    return created;
  }

  const route1Stops = await createStopsForRoute(route1);
  const route2Stops = await createStopsForRoute(route2);

  console.log(`Created ${route1Stops.length} stops for ${route1.shortName} and ${route2Stops.length} for ${route2.shortName}`);

  // -----------------------------
  // 3) Create operators (>=15) alternating DRIVER/CONDUCTOR
  // -----------------------------
  console.log("👷 Creating operator accounts (drivers/conductors)...");
  const operatorCount = 18; // at least 15
  const operators = [];
  for (let i = 0; i < operatorCount; i++) {
    const staffId = `AFUSTA/ST/${String(3000 + i).padStart(4, "0")}`; // operator staff id block
    const passwordPlain = staffId;
    const hashed = await bcrypt.hash(passwordPlain, 10);
    const role = i % 2 === 0 ? "DRIVER" : "CONDUCTOR";
    const op = await prisma.user.create({
      data: {
        fullname: [
          "Abdullahi Muhammad",
          "Hassan Abdullahi",
          "Umar Abubakar",
          "Muhammad Shu'aibu",
        ][i % 4] + (i > 3 ? ` ${i}` : ""), // ensures we include your requested names
        password: hashed,
        role,
        staffId,
        status: "ACTIVE",
        email: `op${i}@afusta.test`,
      },
    });
    operators.push(op);
  }
  console.log(`Created ${operators.length} operators`);

  // -----------------------------
  // 4) Create Buses (10) with varied capacities & assign driver/conductor
  // -----------------------------
  console.log("🚍 Creating 10 buses and assigning drivers & conductors...");
  const capacities = [18, 32, 45, 50, 60, 75, 20, 24, 36, 28]; // includes 18 and 75
  const buses = [];
  for (let i = 0; i < 10; i++) {
    const plate = `AFUSTA-BS-${String(i + 1).padStart(2, "0")}`;
    // rotate operators for drivers/conductors to be distinct
    const driver = operators[(i * 2) % operators.length];
    const conductor = operators[(i * 2 + 1) % operators.length];

    const bus = await prisma.bus.create({
      data: {
        id: undefined, // let prisma auto-generate cuid()
        plateNumber: plate,
        make: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        capacity: capacities[i % capacities.length],
        driver: { connect: { id: driver.id } },
        conductor: { connect: { id: conductor.id } },
      },
    });
    buses.push(bus);
  }
  console.log(`Created ${buses.length} buses`);

  // -----------------------------
  // 5) Create a large number of Trips across last 90 days (to cover 3 months)
  // -----------------------------
  console.log("🗓 Creating trips across the last 90 days...");
  const trips = [];
  const TRIP_COUNT = 300; // create many distinct trips for realism across 3 months
  const now = new Date();
  for (let i = 0; i < TRIP_COUNT; i++) {
    const daysAgo = randInt(0, 89); // within last 90 days
    const departure = subDays(now, daysAgo);
    departure.setHours(randInt(6, 20), randInt(0, 59), 0, 0);
    const arrival = addMinutes(departure, randInt(20, 120));

    const bus = sample(buses);
    const route = Math.random() < 0.5 ? route1 : route2;

    const trip = await prisma.trip.create({
      data: {
        bus: { connect: { id: bus.id } },
        route: { connect: { id: route.id } },
        trip: Math.random() < 0.5 ? "OUTBOUND" : "INBOUND",
        status: "ACTIVE",
        departureTime: departure,
        arrivalTime: arrival,
      },
    });
    trips.push(trip);
  }
  console.log(`Created ${trips.length} trips`);

  // -----------------------------
  // 6) Create Students (499) with admission schemes & hashed passwords
  //    - First chunk: 2010203001 .. 2010203087 (skip 2010203057)
  //    - Then use 22202030001-style then 20105020001-style until 499 total
  // -----------------------------
  console.log("👨‍🎓 Creating 499 student users (Hausa Muslim names) ...");
  const students = [];
  // We'll prepare a pool of Hausa Muslim names and make sure the requested names are included
  const hausaNames = [
    "Lukman Kabiru Bala",
    "Hassan Umar Kamabaza",
    "Umar Shehu",
    "Manir Shehu",
    "Abdullahi Musa",
    "Ibrahim Sani",
    "Abubakar Yusuf",
    "Suleiman Idris",
    "Ahmad Bello",
    "Mustapha Aliyu",
    "Ibrahim Bello",
    "Nasiru Umar",
    "Yakubu Mohammed",
    "Rabi'u Salisu",
    "Mansur Yusuf",
    "Zubairu Abdullahi",
    "Sa'idu Sani",
    "Ishaq Abdullahi",
    "Mahmud Suleiman",
    "Khalid Hassan",
    "Aminu Usman",
    "Sadiq Abubakar",
    "Faruq Ibrahim",
    "Hamza Musa",
    "Kabir Adamu",
    "Ibrahim Rabi",
    "Bello Nurudeen",
    "Suleiman Lawal",
    "Garba Yakubu",
    "Rashid Abdullahi",
    "Danladi Bala",
    "Ibrahim Gidado",
    "Adamu Umar",
    "Isah Bello",
    "Yahaya Ibrahim",
    "Musa Salihu",
    "Rafiu Bello",
    "Nura Usman",
    "Saidu Umar",
    "Zainab Abdullahi",
    "Hauwa Muhammed",
    "Fatima Sani",
    "Aisha Musa",
    "Maryam Bello",
    "Zainab Yusuf",
    "Aminatu Ibrahim"
  ];

  // Admission number pools
  const firstStart = 2010203001;
  const firstEnd = 2010203087;
  const firstRange = [];
  for (let n = firstStart; n <= firstEnd; n++) {
    if (n === 2010203057) continue; // explicit skip
    firstRange.push(String(n));
  }

  // Now generate long-style numbers (we'll use simple sequential generation)
  // second chunk starting from 22202030001
  const secondStart = 22202030001;
  const secondRange = [];
  for (let i = 0; secondRange.length < 250; i++) {
    secondRange.push(String(secondStart + i));
  }

  // third chunk starting from 20105020001
  const thirdStart = 20105020001;
  const thirdRange = [];
  for (let i = 0; thirdRange.length < 250; i++) {
    thirdRange.push(String(thirdStart + i));
  }

  // Combine admission pool in order: firstRange, then secondRange, then thirdRange until 499 items
  const admissionPool = [...firstRange, ...secondRange, ...thirdRange].slice(0, 499);

  // Ensure first four specific Hausa names are included early
  const ensureNames = ["Lukman Kabiru Bala", "Hassan Umar Kamabaza", "Umar Shehu", "Manir Shehu"];

  for (let i = 0; i < 499; i++) {
    const admissionNo = admissionPool[i];
    // pick name: first ensure the 4 names appear near beginning
    let name;
    if (i < ensureNames.length) {
      name = ensureNames[i];
    } else {
      name = sample(hausaNames) + (i > 50 ? ` ${i}` : "");
    }
    const pwd = admissionNo;
    const hashed = await bcrypt.hash(pwd, 10);
    const status = "ACTIVE"; // will randomly change some to SUSPENDED later

    const student = await prisma.user.create({
      data: {
        fullname: name,
        email: `${name.toLowerCase().replace(/[^a-z]/g, "")}${i}@students.afusta`,
        password: hashed,
        role: "STUDENT",
        admissionNo: admissionNo,
        status,
      },
    });

    // Create wallet with a generous balance so ticket purchases succeed
    await prisma.wallet.create({
      data: {
        user: { connect: { id: student.id } },
        balance: 50000 + randInt(0, 50000),
      },
    });

    students.push(student);
  }
  console.log(`Created ${students.length} students`);

  // Randomly mark at least 10 students as SUSPENDED
  const suspendedStudentIndices = new Set();
  while (suspendedStudentIndices.size < 12) suspendedStudentIndices.add(randInt(0, students.length - 1));
  for (const idx of suspendedStudentIndices) {
    const u = students[idx];
    await prisma.user.update({ where: { id: u.id }, data: { status: "SUSPENDED" } });
  }
  console.log(`Marked ${suspendedStudentIndices.size} students as SUSPENDED`);

  // -----------------------------
  // 7) Create Staff (500)
  // -----------------------------
  console.log("👨‍🏫 Creating 500 staff users (Hausa + occasional Christian names)...");
  const staff = [];
  const christianNames = [
    "Chinedu Okafor", "Emmanuel Nwachukwu", "Michael Johnson", "Grace Kalu",
    "Peter Uche", "Daniel Oladele", "Paul Eze", "Joseph Akpan"
  ];
  const staffNamePool = hausaNames.concat(christianNames);

  for (let i = 0; i < 500; i++) {
    const staffId = `AFUSTA/ST/${String(4000 + i).padStart(4, "0")}`;
    const name = sample(staffNamePool) + (i > 50 ? ` ${i}` : "");
    const hashed = await bcrypt.hash(staffId, 10);
    const st = await prisma.user.create({
      data: {
        fullname: name,
        email: `${name.toLowerCase().replace(/[^a-z]/g, "")}${i}@staff.afusta`,
        password: hashed,
        role: "STAFF",
        staffId,
        status: "ACTIVE",
      },
    });

    // wallet
    await prisma.wallet.create({
      data: { user: { connect: { id: st.id } }, balance: 60000 + randInt(0, 40000) },
    });

    staff.push(st);
  }
  console.log(`Created ${staff.length} staff`);

  // Randomly mark at least 10 staff as SUSPENDED
  const suspendedStaffIndices = new Set();
  while (suspendedStaffIndices.size < 12) suspendedStaffIndices.add(randInt(0, staff.length - 1));
  for (const idx of suspendedStaffIndices) {
    const u = staff[idx];
    await prisma.user.update({ where: { id: u.id }, data: { status: "SUSPENDED" } });
  }
  console.log(`Marked ${suspendedStaffIndices.size} staff as SUSPENDED`);

  // -----------------------------
  // 8) Operators were created earlier; we already created 'operators' users - but if you prefer them in staff block, they are distinct.
  // (We created operator users earlier before buses to ensure driver/conductor assignment.)
  // -----------------------------
  // (operators already exist in 'operators' array)

  // -----------------------------
  // 9) Create Ticket & TripBoarding history for each student and staff
  //    Minimum 10 trips per user, randomized between 10 and 20
  // -----------------------------
  console.log("🎟 Creating ticket & trip histories for each student and staff (min 10 each) ...");

  const usersForHistory = [...students, ...staff];
  let createdTickets = 0;
  let createdBoardings = 0;

  for (let ui = 0; ui < usersForHistory.length; ui++) {
    const user = usersForHistory[ui];
    const tripsForUserCount = randInt(10, 20); // min 10
    for (let t = 0; t < tripsForUserCount; t++) {
      const trip = sample(trips);
      // pick a stop that belongs to the trip's route
      const stopsForRoute = trip.routeId === route1.id ? route1Stops : route2Stops;
      // but route1Stops and route2Stops variables are out of scope here; create mapping:
      // We'll fetch stops for the route dynamically (cheap enough for seed)
      // To speed up, we can map once outside loop, but for clarity we'll fetch via filter of earlier lists:
      // Build maps if not already built:
      // (Instead of re-query, we can use route1Stops and route2Stops created earlier.)
      // We'll derive using route id equality:
      const stopsForThisRoute = trip.routeId === route1.id ? route1Stops : route2Stops;

      const chosenStop = sample(stopsForThisRoute);
      const stopName = chosenStop.name;
      const price = STOP_PRICES[stopName] ?? 100;
      const seatNum = randInt(1, trip.bus ? trip.bus.capacity || 32 : 32);

      // compute expiresAt for ticket (departure + 6 hours)
      const departure = trip.departureTime;
      const expiresAt = addDays(new Date(departure), 1); // expire next day (safe)
      // create inside transaction similar to createNewTicket
      try {
        await prisma.$transaction(async (tx) => {
          // call helper to create ticket & boarding that checks wallet & decrements
          await createTicketAndBoardingTx(tx, {
            userId: user.id,
            tripId: trip.id,
            price,
            seatNumber: seatNum,
            expiresAt,
          });
        });

        createdTickets++;
        createdBoardings++;
      } catch (err) {
        console.warn(`Warning: failed to create ticket/boarding for user ${user.id} on trip ${trip.id}: ${err.message}`);
      }
    }

    // light progress logging
    if ((ui + 1) % 100 === 0) {
      console.log(` - processed ${ui + 1}/${usersForHistory.length} users`);
    }
  }

  console.log(`Created ~${createdTickets} tickets and ~${createdBoardings} boardings.`);

  // -----------------------------
  // Final counts summary
  // -----------------------------
  const totalUsers = await prisma.user.count();
  const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
  const totalStaff = await prisma.user.count({ where: { role: "STAFF" } });
  const totalDrivers = await prisma.user.count({ where: { role: "DRIVER" } });
  const totalConductors = await prisma.user.count({ where: { role: "CONDUCTOR" } });
  const totalBuses = await prisma.bus.count();
  const totalRoutes = await prisma.route.count();
  const totalStops = await prisma.stop.count();
  const totalTrips = await prisma.trip.count();
  const totalTicketsFinal = await prisma.ticket.count();
  const totalBoardingsFinal = await prisma.tripBoarding.count();

  console.log("🎉 Seed finished:");
  console.log({
    totalUsers,
    totalStudents,
    totalStaff,
    totalDrivers,
    totalConductors,
    totalBuses,
    totalRoutes,
    totalStops,
    totalTrips,
    totalTickets: totalTicketsFinal,
    totalBoardings: totalBoardingsFinal,
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed error:", e);
  prisma.$disconnect();
  process.exit(1);
});
