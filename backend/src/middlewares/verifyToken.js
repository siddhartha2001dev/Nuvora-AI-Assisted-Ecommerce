import jwt from "jsonwebtoken";
import dotenv from "dotenv/config";
import userSchema from "../models/userSchema.js";

export const verifyToken = async (req, res) => {
    try {
        let token = req.query.token || req.body?.token;

        const authHeader = req.headers.authorization;
        if (!token && authHeader) {
            token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        }

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token not found"
            });
        }

        const decoded = jwt.verify(token, process.env.secretKey);

        const user = await userSchema.findById(decoded._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(200).json({
                success: true,
                message: "Email is already verified. You can login now."
            });
        }

        // Mark verified and clear token from DB
        user.isVerified = true;
        user.token = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully! You can now log in."
        });

    } catch (error) {
        console.error("Verification Error:", error.message);
        return res.status(400).json({
            success: false,
            message: error.message || "Invalid or expired token"
        });
    }
};