import express from "express";
import { getPayments } from "../controllers/payment.js";

const router = express.Router();

router.get('/' , getPayments);

export default router;