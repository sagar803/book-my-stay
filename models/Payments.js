import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    check_in: { 
        type: Date, 
        required: true 
    },
    check_out: { 
        type: Date, 
        required: true 
    },
    cost: { 
        type: Number, 
        required: true 
    },
    updated: {
        type: Boolean,
        required: true
    }
}, { timestamps: true }
);

const Payment = new mongoose.model('Payment' , paymentSchema);

export default Payment;