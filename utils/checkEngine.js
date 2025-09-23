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

module.exports = {
    checkSeatNumber
}