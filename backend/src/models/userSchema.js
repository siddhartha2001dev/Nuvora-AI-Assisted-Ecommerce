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
    gender: {
        type: String,
        enum: ["Male", "Female", "Other", "Prefer not to say", ""],
        default: ""
    },
    avatarUrl: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ["Buyer", "Admin"],
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
    addresses: [{
        fullName: {
            type: String,
            trim: true,
            default: ""
        },
        phone: {
            type: String,
            trim: true,
            default: ""
        },
        street: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        pinCode: {
            type: String,
            required: true,
            trim: true
        },
        label: {
            type: String,
            enum: ["Home", "Work", "Other"],
            default: "Home"
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
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
