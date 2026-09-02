import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    // Ordered variant attributes
    selectedColor: {
        type: String,
        default: ""
    },
    selectedSize: {
        type: String,
        default: ""
    },
    totalPrice: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        default: ""
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "Razorpay"],
        default: "COD"
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
        default: "Pending"
    },
    razorpayOrderId: {
        type: String,
        default: ""
    },
    razorpayPaymentId: {
        type: String,
        default: ""
    },
    orderStatus: {
        type: String,
        enum: ["Placed", "Shipped", "Delivered", "Cancelled"],
        default: "Placed"
    }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
