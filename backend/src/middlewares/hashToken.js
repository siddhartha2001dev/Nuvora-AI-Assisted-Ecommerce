import jwt from "jsonwebtoken";
import userSchema from "../models/userSchema.js";
import sessionSchema from "../models/sessionsSchema.js";

export const hashToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : req.body?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing"
            });
        }

        const decoded = jwt.verify(token, process.env.secretKey);
        
        // Check user & active session
        const user = await userSchema.findById(decoded._id);
        const activeSession = await sessionSchema.findOne({ userId: decoded._id });

        if (!user || !activeSession) {
            return res.status(401).json({
                success: false,
                message: "Invalid session. Please login again."
            });
        }

        req.userId = decoded._id;
        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};