import express from "express";
import {
    placeOrder,
    getMyOrders,
    getSellerOrders,
    updateOrderStatus,
    cancelOrder,
    createRazorPayOrder,
    verifyRazorpayPayment
} from "../controllers/orderController.js";
import { hashToken } from "../middlewares/hashToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { validate, orderValidationSchema } from "../validator/validator.js";

const orderRouter = express.Router();

// Buyer Protected Routes
orderRouter.post("/place", hashToken, validate(orderValidationSchema), placeOrder);
orderRouter.get("/my-orders", hashToken, getMyOrders);
orderRouter.put("/cancel/:id", hashToken, cancelOrder);

// Admin Protected Routes
orderRouter.get("/seller/orders", hashToken, isAdmin, getSellerOrders);
orderRouter.put("/seller/status/:id", hashToken, isAdmin, updateOrderStatus);

orderRouter.post("/razorpay/create-order", hashToken, createRazorPayOrder);
orderRouter.post("/razorpay/verify-payment", hashToken, verifyRazorpayPayment);


export default orderRouter;
