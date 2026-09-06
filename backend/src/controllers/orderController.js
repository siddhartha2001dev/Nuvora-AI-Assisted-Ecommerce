import orderSchema from "../models/orderSchema.js";
import productSchema from "../models/productSchema.js";
import cartSchema from "../models/cartSchema.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// 1. Place Order (Buyer)
export const placeOrder = async (req, res) => {
    try {
        const { productId, quantity = 1, address, paymentMethod = "COD", selectedColor = "", selectedSize = "", cartItemId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        if (!address) {
            return res.status(400).json({
                success: false,
                message: "Delivery address is required"
            });
        }

        const qty = Number(quantity) || 1;

        // Check product and stock
        const product = await productSchema.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.stock < qty) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Only ${product.stock} items left.`
            });
        }

        // Calculate total price
        const pricePerUnit = product.discountPrice > 0 ? product.discountPrice : product.price;
        const totalPrice = pricePerUnit * qty;

        // Create Order
        const order = await orderSchema.create({
            buyerId: req.userId,
            productId,
            quantity: qty,
            selectedColor: selectedColor || "",
            selectedSize: selectedSize || "",
            totalPrice,
            address,
            paymentMethod,
            paymentStatus: paymentMethod === "COD" ? "Pending" : "Completed",
            orderStatus: "Placed"
        });

        // Reduce product stock
        product.stock -= qty;
        await product.save();

        // Remove item from cart if it was in user's cart
        if (cartItemId) {
            await cartSchema.findByIdAndDelete(cartItemId);
        } else {
            await cartSchema.findOneAndDelete({
                userId: req.userId,
                productId,
                selectedColor: selectedColor || "",
                selectedSize: selectedSize || ""
            });
        }

        const populatedOrder = await orderSchema.findById(order._id)
            .populate("productId")
            .populate("buyerId", "userName email phone");

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: populatedOrder
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Get Logged-in Buyer's Orders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await orderSchema.find({ buyerId: req.userId })
            .populate("productId")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Get Orders for Seller's Products (Seller Dashboard)
export const getSellerOrders = async (req, res) => {
    try {
        // Find all products owned by this seller
        const sellerProducts = await productSchema.find({ sellerId: req.userId }).select("_id");
        const productIds = sellerProducts.map(p => p._id);

        // Find orders containing any of seller's products
        const orders = await orderSchema.find({ productId: { $in: productIds } })
            .populate("productId")
            .populate("buyerId", "userName email phone address")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 4. Update Order Status (Seller Only)
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus, paymentStatus } = req.body;

        const order = await orderSchema.findById(id).populate("productId");
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Verify seller owns this product
        if (!order.productId || order.productId.sellerId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only update orders for your own products"
            });
        }

        // If order is cancelled, restore stock
        if (orderStatus === "Cancelled" && order.orderStatus !== "Cancelled") {
            await productSchema.findByIdAndUpdate(order.productId._id, {
                $inc: { stock: order.quantity }
            });
        }

        if (orderStatus) {
            order.orderStatus = orderStatus;
        }

        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 5. Cancel Order (Buyer)
export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await orderSchema.findOne({
            _id: id,
            buyerId: req.userId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus === "Delivered") {
            return res.status(400).json({
                success: false,
                message: "Delivered order cannot be cancelled"
            });
        }

        if (order.orderStatus === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Order is already cancelled"
            });
        }

        order.orderStatus = "Cancelled";
        await order.save();

        // Restore product stock
        await productSchema.findByIdAndUpdate(order.productId, {
            $inc: { stock: order.quantity }
        });

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Helper to safely obtain Razorpay credentials (with fallback test keys)
const getRazorpayCredentials = () => {
    const key_id = (process.env.RAZORPAY_KEY_ID || "rzp_test_TYfrRVbqnoyzaT").trim();
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || "aiOrWTX5IVwP5TCrYEZbmSwl").trim();
    return { key_id, key_secret };
};

// 7. Create Razorpay Order
export const createRazorPayOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid amount is required"
            });
        }

        const { key_id, key_secret } = getRazorpayCredentials();

        const razorpayInstance = new Razorpay({
            key_id,
            key_secret
        });

        const options = {
            amount: Math.round(Number(amount) * 100), // paise me convert karna hai (₹1 = 100 paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        return res.status(200).json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: key_id,
        });
    } catch (error) {
        console.error("Razorpay order creation error:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 8. Verify Razorpay Payment & Place Orders
export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            cartItems,
            address
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing Razorpay payment verification parameters"
            });
        }

        const { key_secret } = getRazorpayCredentials();

        // 1. Signature Verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed: Invalid Signature"
            });
        }

        // 2. Signature valid hai, ab orders create karo
        const createdOrders = [];
        const items = Array.isArray(cartItems) ? cartItems : [];

        for (const item of items) {
            const prodId = item.productId?._id || item.productId || item.prodId?._id || item.prodId;
            const product = await productSchema.findById(prodId);

            if (!product) continue;

            const qty = Number(item.quantity) || 1;
            const pricePerUnit = product.discountPrice > 0 ? product.discountPrice : product.price;
            const totalPrice = pricePerUnit * qty;

            const order = await orderSchema.create({
                buyerId: req.userId,
                productId: prodId,
                quantity: qty,
                selectedColor: item.selectedColor || "",
                selectedSize: item.selectedSize || "",
                totalPrice,
                address: address || "",
                paymentMethod: "Razorpay",
                paymentStatus: "Completed",
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                orderStatus: "Placed"
            });

            // Stock kam karo
            product.stock = Math.max(0, product.stock - qty);
            await product.save();

            // Cart se item hatao
            if (item._id) {
                await cartSchema.findByIdAndDelete(item._id);
            }

            createdOrders.push(order);
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified & order placed successfully!",
            orders: createdOrders
        });
    } catch (error) {
        console.error("Payment verification error:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};