import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ""
    },
    avatarUrl: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ["Buyer", "Seller"],
        default: "Buyer"
    },
    shopName: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    token: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
