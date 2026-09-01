import mongoose from "mongoose";

const sessionsSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        index: { expires: 0 },
    },
    
}, { timestamps: true });

export default mongoose.model('Session', sessionsSchema);