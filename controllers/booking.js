import Booking from "../models/Booking.js";
import User from "../models/User.js";

export const getBooking = async (req, res) => {
    try {
        const bookings = await Booking.find({ user_id: req.user._id });
        res.json({ bookings });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const createBooking = async (req, res) => {
    try {
      const { check_in, check_out, food_category, stay_category } = req.body;
      const checkInHour = new Date(check_in).getUTCHours();
      const checkOutHour = new Date(check_out).getUTCHours();
      const checkInTime = new Date(check_in).getTime();
      const checkOutTime = new Date(check_out).getTime();

      const oneDayInMs = 24 * 60 * 60 * 1000;
      const days = (checkOutTime - checkInTime)/oneDayInMs;
      console.log("checkInHour: " , checkInHour);
      console.log("checkOutHour: " , checkOutHour);
      console.log("days: " , days);
      let effectiveDays;
      let cost = 0;
      if(days < 0){
        return res.status(400).json({ message: 'Invalid booking dates' });
      }
      else{
        if(checkInHour < 14 && checkOutHour >= 14){
          effectiveDays = Math.ceil(days);
        }
        else if((checkInHour > 14 && checkOutHour >= 14) || (checkInHour < 14 && checkOutHour < 14)){
          effectiveDays = Math.floor(days)+ 0.5;
        }
        else if(checkInHour > 14 && checkOutHour > 14){
          effectiveDays = Math.floor(days)+ 0.5;
        }
        else {
          effectiveDays = Math.floor(days);
        }
      }
      console.log("effectiveDays : " , effectiveDays);
  
       // Calculate the cost of the food category and stay category
      if (food_category === 'A') {
        cost += 10 * 2 * effectiveDays;
      } 
      else if (food_category === 'B') {
       cost += 20 * 2 * effectiveDays;
      }
      else{
       cost += 30 * 2 * effectiveDays;
      }
      if (stay_category === 'X') {
        cost += 25 * effectiveDays;
      } 
      else if (food_category === 'Y') {
       cost += 35 * effectiveDays;
      }
      else{
       cost += 45 * effectiveDays;
      }
      console.log("cost :" , cost);
      // Create a new booking and save it to the database
      const booking = new Booking({
        user_id: req.user._id,
        check_in,
        check_out,
        food_category,
        stay_category,
        cost
      });
      await booking.save();
  
      res.json({ booking });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};

export const updateBooking = async (req, res) => {
    try {
      const { check_in, check_out, food_category, stay_category } = req.body;
      const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user._id });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      const checkInHour = new Date(check_in).getUTCHours();
      const checkOutHour = new Date(check_out).getUTCHours();
      const checkInTime = new Date(check_in).getTime();
      const checkOutTime = new Date(check_out).getTime();

      const oneDayInMs = 24 * 60 * 60 * 1000;
      const days = (checkOutTime - checkInTime)/oneDayInMs;
      let effectiveDays;
      let cost = 0;
      if(days < 0){
        return res.status(400).json({ message: 'Invalid booking dates' });
      }
      else{
        if(checkInHour < 14 && checkOutHour >= 14){
          effectiveDays = Math.ceil(days);
        }
        else if((checkInHour > 14 && checkOutHour >= 14) || (checkInHour < 14 && checkOutHour < 14)){
          effectiveDays = Math.floor(days)+ 0.5;
        }
        else if(checkInHour > 14 && checkOutHour > 14){
          effectiveDays = Math.floor(days)+ 0.5;
        }
        else {
          effectiveDays = Math.floor(days);
        }
      }
      console.log("effectiveDays : " , effectiveDays);
  
       // Calculate the cost of the food category and stay category
      if (food_category === 'A') {
        cost += 10 * 2 * effectiveDays;
      } 
      else if (food_category === 'B') {
       cost += 20 * 2 * effectiveDays;
      }
      else{
       cost += 30 * 2 * effectiveDays;
      }
      if (stay_category === 'X') {
        cost += 25 * effectiveDays;
      } 
      else if (food_category === 'Y') {
       cost += 35 * effectiveDays;
      }
      else{
       cost += 45 * effectiveDays;
      }
      const refundAmount = booking.cost - cost;  
      // Update the booking and save it to the database
      booking.check_in = check_in;
      booking.check_out = check_out;
      booking.food_category = food_category;
      booking.stay_category = stay_category;
      booking.cost = cost;
      await booking.save();
  
      res.json({ booking , refundAmount});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};

export const deleteBooking = async (req, res) => {
    try {
      const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user._id });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }  
      const refundAmount = booking.cost;
      await Booking.deleteOne({ _id: req.params.id, user_id: req.user._id });
      res.json({ message: 'Booking deleted', refundAmount });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};
