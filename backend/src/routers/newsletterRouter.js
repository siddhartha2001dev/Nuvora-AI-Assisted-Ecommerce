import express from "express";
import subscriberSchema from "../models/subscriberSchema.js";
import { sendNewsletterWelcomeEmail } from "../email/verifyEmail.js";

const router = express.Router();

// POST /newsletter/subscribe
router.post("/subscribe", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        // Check if already subscribed
        const existing = await subscriberSchema.findOne({ email: cleanEmail });
        if (existing) {
            return res.status(200).json({
                success: true,
                message: "You're already subscribed to our VIP list!"
            });
        }

        await subscriberSchema.create({ email: cleanEmail });

        // Asynchronously send welcome email via Brevo without delaying response
        sendNewsletterWelcomeEmail(cleanEmail, req.headers.origin).catch((err) =>
            console.error("Newsletter welcome email error:", err.message)
        );

        return res.status(201).json({
            success: true,
            message: "Welcome to Nuvora! Check your inbox for your 10% welcome gift 🎁"
        });
    } catch (err) {
        console.error("Subscription error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Failed to subscribe. Please try again later."
        });
    }
});

export default router;
