const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();
const { startOfWeek, endOfWeek, startOfDay, subDays } = require("date-fns");

async function createNewUser(fullname, email, password, telegramId){
    const user = await prisma.user.create({
        data: {
            role: "ADMIN",
            email: email,
            fullname: fullname,
            password: password,
            telegramId: telegramId ?? undefined,
        }
    });
}


async function findUserByUsername(username){
     return await prisma.user.findUnique({
      where: { username },
       include: {
        drugs: true,
        items: true,
        batches: true,
        purchase: {
          include: {
            item: true,
            drug: true
          }
        }
       },
     });
}


async function findUserByTGId(telegramId){
     return await prisma.user.findUnique({
      where: { telegramId },
       include: {
        drugs: true,
        items: true,
        batches: true,
        purchase: {
          include: {
            item: true,
            drug: true
          }
        }
       },
     });
}


async function assignNewStaff(fullname, password, email, username){
   const user = await prisma.user.create({
      data: {
        role: "STAFF",
        email: email,
        fullname: fullname,
        username: username,
        password: password,
      },
    });

    return user;

}



async function fetchUserById(userId){
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        drugs: true,
        items: true,
        batches: true,
        purchase: {
          include: {
            item: true,
            drug: true
          }
        }
      },
    });
}


async function fetchAllUsers(){
    return await prisma.user.findMany({
      where: {
        role: {
          not: "ADMIN",
        },
      },
      include: {
        include: {
          drugs: true,
          items: true,
          batches: true,
          purchase: true,
        },
      },
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


async function fetchOverview() {
  // Get start and end of current day
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [
    totalUsers,
    totalDrugs,
    totalItems,
    totalStaff,
    totalBatches,
    finishedDrugs,
    finishedItems,
    availableDrugs,
    availableItems,
    totalPurchases,
    totalRevenue,
    revenueToday
  ] = await Promise.all([
    // All-time stats
    prisma.user.count(),
    prisma.drug.count(),
    prisma.item.count(),
    prisma.user.count({ where: { role: "STAFF" } }),
    prisma.batch.count(),
    prisma.drug.count( { where: { isAvailable: false }} ),
    prisma.item.count( { where: { isAvailable: false }} ),
    prisma.drug.count( { where: { isAvailable: true }} ),
    prisma.item.count( { where: { isAvailable: true }} ),
    prisma.purchase.count(),
    prisma.purchase.aggregate({
      _sum: { price: true }
    }),

    // Today's stats
    prisma.purchase.aggregate({
      _sum: { price: true },
      where: { created: { gte: startOfDay, lte: endOfDay } }
    }),

  ]);

  return {
    // All-time stats
    users: totalUsers,
    allDrugs: totalDrugs,
    items: totalItems,
    staff: totalStaff,
    routes: totalRoutes,
    batches: totalBatches,
    finshedDrugs: finishedDrugs,
    finishedItems: finishedItems,
    availableDrugs: availableDrugs,
    availableItems: availableItems,
    totalPurchases: totalPurchases,
    totalRevenue: totalRevenue._sum.price || 0,

    // Today's stats
    today: {
      revenue: revenueToday._sum.price || 0
    }
  };
}




async function registerNewDrug(name, price, nafdac, quantity, manufacturer, type, userId){
    await prisma.drug.create({
        data: {
            name: name,
            type: type,
            price: price,
            nafdacNum: nafdac,
            quantity: quantity,
            manufacturer: manufacturer,
            registeredBy: { connect: { id: userId }}
        }
    })
}

async function fetchDrug(drugId){
    return await prisma.drug.findUnique({
        where: { id: drugId },
        include: {
            purchase: true,
            registeredBy: true
        }
    })
}


async function updateDrug(drugId, name, type, price, nafdac, manufacturer, cost, userId){
    return await prisma.drug.update({
        where: { id: drugId },
        data: {
          name: name,
          cost: cost,
          type: type,
          price: price,
          nafdacNum: nafdac,
          manufacturer: manufacturer,
          updatedBy: { connect: { id: userId }}
        }
    })
}


async function deleteDrug(drugId){
    return await prisma.drug.delete({
        where: { id: drugId },
    })
}


async function fetchAllDrugs(){
    return await prisma.drug.findMany({
        include: {
            purchase: true,
            registeredBy: true
        }
    })
}

async function fetchPurchasesForToday(){
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 9999);

    return await prisma.purchase.findMany({
        where: { created: {
            gte: startOfToday,
            lte: endOfToday,
        } },
        include: {
            item: true,
            drug: true,
            seller: true,
        }
    })
}


async function fetchAllPurchases(){
    return await prisma.purchase.findMany();
}


async function registerNewItem(name, type, quantity, manufacturer, price, cost, userId){
    await prisma.item.create({
        data: {
            name: name,
            cost: cost,
            type: type,
            price: price,
            quantity: quantity,
            manufacturer: manufacturer,
            registeredBy: { connect: { id: userId }}
        }
    })
}


async function fetchItem(itemId){
  return await prisma.bus.findUnique({
    where: { id: itemId },
    include: {
     purchases: true,
     registeredBy: true,
    }
  });
}
async function updateItem(itemId, name, type, price, cost, manufacturer, updatedBy) {
  return await prisma.item.update({
    where: { id: itemId },
    data: {
      name: name,
      cost: cost,
      type: type,
      price: price,
      manufacturer: manufacturer,
      updatedBy: { connect: { id: updatedBy }}
    },
  });
}


async function deleteItem(itemId){
  return await prisma.bus.delete({
    where: { id: itemId },
  });
}


async function fetchAllItems(){
  return await prisma.bus.findMany({
    include: {
     purchases: true,
     registeredBy: true,
    }
  });
}

async function registerNewPurchase(type, qtt, sellerId, drugId = null, itemId = null){
  await prisma.$transaction(async (tx) => {
    await prisma.tx.create({
        data: {
            type: type,
            quantity: quantity,
            seller: { connect: { id: sellerId }},
            ...(drugId && { drug: { connect: { id: drugId }}}),
            ...(itemId && { item: { connect: { id: itemId }}})
        }
    })

    if(drugId){
      await tx.drug.update({
        where: { id: drugId },
        data: {
          quantity: {
            decrement: qtt
          }
        }
      })
    }else{
      await tx.item.update({
        where: { id: itemId },
        data: {
          quantity: {
            decrement: qtt,
          },
        },
      });
    }

  })
}

async function fetchPurchase(purchaseId) {
  await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      item: true,
      drug: true,
      seller: true,
    },
  });
}


async function fetchAllPurchases() {
  await prisma.purchase.findMany({
    include: {
      item: true,
      drug: true,
      seller: true,
    },
  });
}


async function createNewBatch(totaldrugs, totalItems, totalcost, userId){
    await prisma.batch.create({
        data: {
            totalCost: totalcost,
            totalDrugs: totaldrugs,
            totalItems: totalItems,
            registeredBy: { connect: { id: userId }}
        }
    })
}

async function fetchBatch(batchId) {
  await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      registeredBy: true
    },
  });
}


async function fetchAllBatches() {
  await prisma.batch.findMany({   
    include: {
      registeredBy: true
    },
  });
}



async function getPurchasesLast7Days(){
  const today = startOfDay(new Date());
  const sevenDaysAgo = subDays(today, 6); // includes today

  // Group trips per day for the last 7 days
  const purchases = await prisma.purchase.findMany({
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
    const count = purchases.filter((t) => t.created.toISOString().slice(0, 10) === dateStr).length;
    return { date: dateStr, count };
  });

  return dailyCounts;
}



module.exports = {
    fetchItem,
    fetchDrug,
    clearUsers,
    deleteDrug,
    deleteItem,
    updateDrug,
    fetchBatch,
    updateItem,
    fetchOverview,
    fetchUserById,
    fetchOverview,
    createNewUser,
    fetchAllDrugs,
    fetchAllItems,
    fetchAllStaff,
    fetchPurchase,
    fetchAllUsers,
    createNewBatch,
    assignNewStaff,
    registerNewDrug,
    fetchAllBatches,
    registerNewItem,
    fetchAllPurchases,
    findUserByUsername,
    registerNewPurchase,
    fetchPurchasesForToday,
    getPurchasesLast7Days,
}