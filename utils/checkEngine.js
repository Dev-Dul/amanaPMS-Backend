function checkSeatNumber(trip){
    const tripBus = trip.bus;
    if(trip.boardings.length <= tripBus.capacity){
        const lastTrip = trip.boardings[trip.boardings.length - 1];
        if(lastTrip){
            return lastTrip.seatNumber++;
        }else{
            return 1;
        }
    }else{
        return false;
    }
}


function checkBalance(user, price){
    const bal = user.wallet.balance;
    if(bal < price){
        return false;
    }else{
        return true;
    }
}

module.exports = {
    checkBalance,
    checkSeatNumber
}