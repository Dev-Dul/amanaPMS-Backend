const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();
const { startOfWeek, endOfWeek, startOfDay, subDays } = require("date-fns");

async function createNewUser(fullname, email, password, telegramId, username){
    const user = await prisma.user.create({
        data: {
            role: "ADMIN",
            fullname: fullname,
            username: username,
            email: email ?? undefined,
            password: password ?? undefined,
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
        purchases: {
          include: {
            item: true,
            drug: true,
            seller: true
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
        purchases: {
          include: {
            item: true,
            drug: true,
            seller: true,
          }
        }
       },
     });
}

async function findUserById(userId){
     return await prisma.user.findUnique({
      where: { id: userId },
       include: {
        drugs: true,
        items: true,
        batches: true,
        purchases: {
          include: {
            item: true,
            drug: true,
            seller: true,
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

      include: {
        purchase: true,
      }
    });

    return user;

}

async function manageStaff(userId){
  let newUser = null;
   const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if(user.status === "ACTIVE"){
      newUser = await prisma.user.update({
         where: { id: userId },
         data: {
           status: "INACTIVE"
         },
       });
       
      }else{
        newUser = await prisma.user.update({
          where: { id: userId },
          data: {
            status: "ACTIVE"
          },
        });
    }


    return newUser;

}



async function deleteStaff(userId){
   const user = await prisma.user.delete({
      where: { id: userId},
    });

    return user;

}

async function updateStaff(fullname, password, email, username, userId){
   const user = await prisma.user.update({
     where: { id: userId },
     data: {
        email: email,
        fullname: fullname,
        username: username,
        password: password,
      },
    });

    return user;

}


async function updateProfile(fullname, password, email, username, userId){
   const user = await prisma.user.update({
     where: { id: userId },
     data: {
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
        purchases: {
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
        },
        include: {
          drugs: true,
          items: true,
          purchases: true,
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
    purchasesToday,
    drugsSoldToday,
    itemsSoldToday,
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
    

    // Today's stats
    prisma.purchase.count({
      where: { created: { gte: startOfDay, lte: endOfDay } }
    }),

    prisma.purchase.count({
      where: { created: { gte: startOfDay, lte: endOfDay }, type: "DRUG" }
    }),

    prisma.purchase.count({
      where: { created: { gte: startOfDay, lte: endOfDay }, type: { not: "DRUG" } }
    }),

  ]);

  const purchases = await prisma.purchase.findMany({
    include: {
      drug: true,
      item: true,
    },
  });

  let tRevenue = 0;
  let tProfit = 0;

  for (const p of purchases) {
    const price = p.drug?.price ?? p.item?.price ?? 0;
    const cost = p.drug?.cost ?? p.item?.cost ?? 0;

    const revenue = price * p.quantity;
    const profit = (price - cost) * p.quantity;

   tRevenue += revenue;
   tProfit += profit;
  }


  const purchasesTd = await prisma.purchase.findMany({
    where: { created: { gte: startOfDay, lte: endOfDay } },
    include: {
      drug: true,
      item: true,
    },
  });

  let tdRevenue = 0;
  let tdProfit = 0;

  for (const p of purchasesTd) {
    const price = p.drug?.price ?? p.item?.price ?? 0;
    const cost = p.drug?.cost ?? p.item?.cost ?? 0;

    const revenue = price * p.quantity;
    const profit = (price - cost) * p.quantity;

    tdRevenue += revenue;
    tdProfit += profit;
  }

  return {
    // All-time stats
    users: totalUsers,
    allDrugs: totalDrugs,
    items: totalItems,
    staff: totalStaff,
    batches: totalBatches,
    finishedDrugs: finishedDrugs,
    finishedItems: finishedItems,
    availableDrugs: availableDrugs,
    availableItems: availableItems,
    totalPurchases: totalPurchases,
    totalRevenue: tRevenue || 0,

    // Today's stats
    today: {
      revenue: tdRevenue || 0,
      profit: tdProfit,
      purchases: purchasesToday,
      drugs: drugsSoldToday,
      items: itemsSoldToday
    }
  };
}




async function registerNewDrug(name, cost, price, quantity, manufacturer, userId){
    await prisma.drug.create({
        data: {
            name: name,
            cost: cost,
            price: price,
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


async function updateDrug(drugId, name, type, quantity, price, manufacturer, cost){
  let isUpdate = null;
  const dg = await prisma.drug.findUnique({
    where: { id: drugId }
  })

  if(dg.quantity <= 0 && quantity > 0){
    isUpdate = true;
  }else{
    isUpdate = false;
  }

    return await prisma.drug.update({
        where: { id: drugId },
        data: {
          name: name,
          cost: cost,
          type: type,
          price: price,
          quantity: quantity,
          isAvailable: isUpdate,
          manufacturer: manufacturer,
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
            purchases: true,
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




async function registerNewItem(name, type, quantity, manufacturer, price, cost, userId){
    return await prisma.item.create({
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


async function updateItem(itemId, name, quantity, type, price, cost, manufacturer) {
  let isUpdate = null;
  const it = await prisma.item.findUnique({
    where: { id: itemId }
  })

  if(it.quantity <= 0 && quantity > 0){
    isUpdate = true;
  }else{
    isUpdate = false;
  }

  return await prisma.item.update({
    where: { id: itemId },
    data: {
      name: name,
      cost: cost,
      type: type,
      price: price,
      quantity: quantity,
      isAvailable: isUpdate,
      manufacturer: manufacturer,
    },
  });
}


async function deleteItem(itemId){
  return await prisma.bus.delete({
    where: { id: itemId },
  });
}


async function fetchAllItems(){
  return await prisma.item.findMany({
    include: {
     purchases: true,
     registeredBy: true,
    }
  });
}

async function registerNewPurchase(type, qtt, sellerId, drugId = null, itemId = null){
  return await prisma.$transaction(async (tx) => {

    const purchase = await tx.purchase.create({
      data: {
        type,
        quantity: qtt,
        seller: { connect: { id: sellerId }},
        ...(drugId && { drug: { connect: { id: drugId }}}),
        ...(itemId && { item: { connect: { id: itemId }}})
      },
      include: {
        item: true,
        drug: true,
        seller: true
      }
    });

    if (drugId) {
      await tx.drug.update({
        where: { id: drugId },
        data: { quantity: { decrement: qtt } }
      });
    } else {
      await tx.item.update({
        where: { id: itemId },
        data: { quantity: { decrement: qtt } }
      });
    }

    return purchase;
  });
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
  return await prisma.purchase.findMany({
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

async function getWeeklyPurchaseStats() {
  const purchases = await prisma.purchase.findMany({
    orderBy: { created: "asc" },
    include: {
      drug: true,
      item: true,
    },
  });

  const grouped = {};

  for (const p of purchases) {
    const weekStart = startOfWeek(p.created, { weekStartsOn: 1 });
    const key = weekStart.toISOString();

    if (!grouped[key]) {
      grouped[key] = {
        start: weekStart,
        end: endOfWeek(p.created, { weekStartsOn: 1 }),
        totalRevenue: 0,
        totalProfit: 0,
        totalPurchases: 0,
      };
    }

    // -------------------------
    // Determine item or drug
    // -------------------------
    const price = p.drug?.price ?? p.item?.price ?? 0;
    const cost = p.drug?.cost ?? p.item?.cost ?? 0;

    const revenue = price * p.quantity;
    const profit = (price - cost) * p.quantity;

    grouped[key].totalRevenue += revenue;
    grouped[key].totalProfit += profit;
    grouped[key].totalPurchases += 1;
  }

  // -------------------------
  // Format output
  // -------------------------
  return Object.values(grouped)
    .sort((a, b) => a.start - b.start)
    .map((w, idx) => ({
      num: idx + 1,
      start: w.start,
      end: w.end,
      totalRevenue: w.totalRevenue,
      totalProfit: w.totalProfit,
      totalPurchases: w.totalPurchases,
    }));
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
    updateStaff,
    deleteStaff,
    manageStaff,
    findUserById,
    fetchOverview,
    fetchUserById,
    createNewUser,
    fetchAllDrugs,
    fetchAllItems,
    fetchAllStaff,
    updateProfile,
    fetchPurchase,
    fetchAllUsers,
    findUserByTGId,
    createNewBatch,
    assignNewStaff,
    registerNewDrug,
    fetchAllBatches,
    registerNewItem,
    fetchAllPurchases,
    findUserByUsername,
    registerNewPurchase,
    getPurchasesLast7Days,
    fetchPurchasesForToday,
    getWeeklyPurchaseStats,
}