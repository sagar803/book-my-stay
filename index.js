import dotenv from "dotenv"
import express from "express"
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import authRoutes from "./routes/auth.js"
import bookingRoutes from "./routes/booking.js"

//CONFIGURATION
dotenv.config();
const  app = express();
app.use(bodyParser.json());

// Define the routes
app.use('/auth', authRoutes);
app.use('/bookings', bookingRoutes);

// Connect to the database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  app.listen(3000, () => console.log("Server is listening on port 3000"));
}).catch(error => console.error(error));