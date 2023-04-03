import Payment from "../models/Payments.js";

export const getPayments = async (req, res) => {
    try{
        const payment = await Payment.find({});
        res.json({payment});
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};