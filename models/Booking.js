import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema({
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
    food_category: { 
        type: String, 
        enum: ['A', 'B', 'C'], 
        default: 'A' 
    },
    stay_category: { 
        type: String, 
        enum: ['X', 'Y', 'Z'], 
        default: 'X' 
    },
    cost: { 
        type: Number, 
        required: true 
    }
  }, { timestamps: true }
);
const Booking = mongoose.model("Booking" , bookingSchema);
export default Booking;