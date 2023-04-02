import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getBooking, updateBooking, createBooking, deleteBooking } from "../controllers/booking.js";

const router = express.Router();

router.get("/:id" , verifyToken, getBooking);
router.post("/" , verifyToken , createBooking);
router.put("/:id" , verifyToken , updateBooking);
router.delete("/:id" , verifyToken , deleteBooking);

export default router;