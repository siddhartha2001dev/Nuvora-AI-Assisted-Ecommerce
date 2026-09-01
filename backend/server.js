import express from "express";
import { dbConnect } from "./src/config/dbConnect.js";
import dotenv from "dotenv/config";
import cors from "cors";
import userRouter from "./src/routers/userRouter.js";
import productRouter from "./src/routers/productRouter.js";
import cartRouter from "./src/routers/cartRouter.js";
import reviewRouter from "./src/routers/reviewRouter.js";
import wishlistRouter from "./src/routers/wishlistRouter.js";
import orderRouter from "./src/routers/orderRouter.js";

const app = express();
const port = process.env.PORT || 8000;

// Connect to MongoDB
dbConnect();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Nuvora E-Commerce API is running smoothly 🚀"
    });
});

// API Routes
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);
app.use("/review", reviewRouter);
app.use("/wishlist", wishlistRouter);
app.use("/order", orderRouter);

// 404 Route Handler
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Server Error:", err.stack || err.message);
    return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
