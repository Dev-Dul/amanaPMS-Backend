function checkSeatNumber(trip){
    const lastBus = trip.bus;
    if(trip.boardings[trip.boardings.length - 1]){
        const lastTrip = trip.boardings[trip.boardings.length - 1];
        if(lastTrip.seatNumber > lastBus.capacity){
            return false;
        }else{
            return lastTrip.seatNumber++;
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