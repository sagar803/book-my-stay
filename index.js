import dotenv from "dotenv"
import express from "express"
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import { verifyToken } from "./middleware/auth.js"
import User from "./models/User.js"
import Booking from "./models/Booking.js"
import authRoutes from "./routes/auth.js"

//CONFIGURATION
dotenv.config();
const  app = express();
app.use(bodyParser.json());

// Define the routes
app.use('/auth', authRoutes);

app.get('/bookings', verifyToken, async (req, res) => {
    try {
      const bookings = await Booking.find({ user_id: req.user._id });
      res.json({ bookings });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
});
  
app.post('/bookings', verifyToken, async (req, res) => {
    try {
      const { check_in, check_out, food_category, stay_category } = req.body;
  
      // Calculate the cost of the booking based on the check-in and check-out times
      const checkInTime = new Date(check_in).getTime();
      const checkOutTime = new Date(check_out).getTime();

      const oneDayInMs = 24 * 60 * 60 * 1000;
      let cost;
      if (checkInTime >= checkOutTime) {
         return res.status(400).json({ message: 'Invalid booking dates' });
       } else if (checkInTime < new Date().setHours(14, 0, 0, 0)) {
         cost = oneDayInMs * Math.ceil((checkOutTime - new Date().setHours(14, 0, 0, 0)) / oneDayInMs) * 1000;
       } else if (checkOutTime > new Date().setHours(14, 0, 0, 0)) {
         cost = oneDayInMs * Math.floor((checkOutTime - checkInTime) / oneDayInMs) * 1000;
       } else {
         cost = oneDayInMs * Math.ceil((checkOutTime - checkInTime) / oneDayInMs) * 500;
       }
  
       // Calculate the cost of the food category and stay category
       if (food_category === 'B') {
         cost += 10 * 2;
       } else if (food_category === 'C') {
         cost += 30 * 2;
       }
       if (stay_category === 'Y') {
         cost += 35 * Math.ceil((checkOutTime - checkInTime) / oneDayInMs);
       } else if (stay_category === 'Z') {
         cost += 45 * Math.ceil((checkOutTime - checkInTime) / oneDayInMs);
       } else {
         cost += 25 * Math.ceil((checkOutTime - checkInTime) / oneDayInMs);
       }
  
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
});
  
  app.put('/bookings/:id', verifyToken, async (req, res) => {
    try {
      const { check_in, check_out, food_category, stay_category } = req.body;
      const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user._id });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      // Calculate the new cost of the booking based on the updated check-in and check-out times
      const checkInTime = new Date(check_in).getTime();
      const checkOutTime = new Date(check_out).getTime();
      const oneDayInMs = 24 * 60 * 60 * 1000;
      let cost;
       if (checkInTime >= checkOutTime) {
         return res.status(400).json({ message: 'Invalid booking dates' });
       } else if (checkInTime < new Date().setHours(14, 0, 0, 0)) {
         cost = oneDayInMs * Math.ceil((checkOutTime - new Date().setHours(14, 0, 0, 0)) / oneDayInMs) * 1000;
     } else if (checkOutTime > new Date().setHours(14, 0, 0, 0)) {
         cost = oneDayInMs * Math.floor((checkOutTime - checkInTime) / oneDayInMs) * 1000;
       } else {
         cost = oneDayInMs * Math.ceil((checkOutTime - checkInTime) / oneDayInMs) * 500;
       }
  
      // Calculate the new cost of the food category and stay category
      if (food_category === 'B') {
        cost += 10 * 2;
      } else if (food_category === 'C') {
        cost += 30 * 2;
      }
      if (stay_category === 'Y') {
        cost += 35 * Math.ceil((checkOutTime - checkInTime) / oneDayInMs);
      } else if (stay_category === 'Z') {
        cost += 45 * Math.ceil((checkOutTime - checkInTime) / oneDayInMs);
      } else {
        cost += 25 * Math.ceil((checkOutTime - checkInTime) / oneDayInMs);
      }
  
      // Update the booking and save it to the database
      booking.check_in = check_in;
      booking.check_out = check_out;
      booking.food_category = food_category;
      booking.stay_category = stay_category;
      booking.cost = cost;
      await booking.save();
  
      res.json({ booking });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.delete('/bookings/:id', verifyToken, async (req, res) => {
    try {
      const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user._id });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
  
      // Refund the user if necessary
      const refundAmount = calculateRefund(booking);
      if (refundAmount > 0) {
        await Payment.create({ user_id: req.user._id, amount: refundAmount, type: 'refund' });
      }
  
      // Delete the booking from the database
      await booking.remove();
  
      res.json({ message: 'Booking deleted' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  function calculateRefund(booking) {
    const checkInTime = new Date(booking.checkInTime).getTime();
    const checkOutTime = new Date(booking.checkOutTime).getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;
  
    if (checkOutTime <= checkInTime) {
      throw new Error("Invalid check-out time");
    }
  
    const daysBooked = Math.ceil((checkOutTime - checkInTime) / oneDayInMs);
    let refundAmount = 0;
  
    if (checkOutTime < new Date().setHours(14, 0, 0, 0)) {
      refundAmount = (booking.cost / 2) - (((2 - checkOutTime.getHours()) / 2) * (booking.cost / 2) / 12);
    } else if (checkInTime > new Date().setHours(14, 0, 0, 0)) {
      refundAmount = (booking.cost / 2) + (((checkInTime.getHours() - 14) / 2) * (booking.cost / 2) / 12);
    } else {
      const fullDaysBooked = Math.floor((checkOutTime - new Date().setHours(14, 0, 0, 0)) / oneDayInMs);
      const halfDaysBooked = checkOutTime.getHours() >= 14 ? 1 : 0;
      refundAmount = (fullDaysBooked * 1000) + (halfDaysBooked * (booking.cost / 2));
      const daysRemaining = daysBooked - fullDaysBooked - halfDaysBooked;
      refundAmount += (daysRemaining * 500);
    }
  
    return refundAmount;
}     

// Connect to the database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  app.listen(3000, () => console.log("Server is listening on port 3000"));
}).catch(error => console.error(error));