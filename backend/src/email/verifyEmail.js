import dotenv from "dotenv/config";

/**
 * Helper to send email via Brevo REST API (HTTPS Port 443 - 100% Cloud / Render compatible)
 */
const sendBrevoEmail = async ({ to, subject, text, html }) => {
    try {
        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.EMAIL;

        if (!apiKey) {
            console.warn("⚠️ BREVO_API_KEY not found in environment variables. Email will not be sent.");
            return null;
        }

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": apiKey,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                sender: {
                    name: "Nuvora Store",
                    email: senderEmail,
                },
                to: [{ email: to }],
                subject: subject,
                textContent: text,
                htmlContent: html,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to send email via Brevo API");
        }

        console.log("Email sent successfully via Brevo to:", to);
        return data;
    } catch (err) {
        console.error("Error sending email:", err.message);
        return null;
    }
};

// Verify Account Email
export const verifyEmail = async (token, email) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verificationUrl = `${clientUrl}/verify-email?token=${token}`;

    const mailConfigurations = {
        to: email,
        subject: "Verify Your Email - Nuvora Store",
        text: `Please verify your email using this link: ${verificationUrl}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 550px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">Welcome to Nuvora! 🛍️</h2>
                    <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Your one-stop destination for seamless shopping & selling</p>
                </div>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hello,</p>
                <p style="color: #334155; font-size: 15px; line-height: 1.5;">Thank you for creating an account with Nuvora. Please click the button below to verify your email address and activate your account:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 14px 28px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">Verify Email Address</a>
                </div>
                <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">Or copy and paste this verification link into your browser:<br/><a href="${verificationUrl}" style="color: #6366f1;">${verificationUrl}</a></p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                <p style="font-size: 11px; color: #cbd5e1; text-align: center;">© Nuvora Store. If you didn't create this account, please ignore this email.</p>
            </div>
        `,
    };

    return await sendBrevoEmail(mailConfigurations);
};

// Reset Password Email
export const sendResetPasswordEmail = async (token, email) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;

    const mailConfigurations = {
        to: email,
        subject: "Reset Your Password - Nuvora Store",
        text: `Reset your password using this link: ${resetUrl}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 550px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">Password Reset Request 🔐</h2>
                    <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Nuvora Modern Essentials Store</p>
                </div>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hello,</p>
                <p style="color: #334155; font-size: 15px; line-height: 1.5;">We received a request to reset your password for your Nuvora account. Click the button below to set a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);">Reset Password</a>
                </div>
                <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">Or copy and paste this link into your browser:<br/><a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a></p>
                <p style="font-size: 12px; color: #ef4444; line-height: 1.5;">This link will expire in 15 minutes.</p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                <p style="font-size: 11px; color: #cbd5e1; text-align: center;">© Nuvora Store. If you didn't request a password reset, please ignore this email.</p>
            </div>
        `,
    };

    return await sendBrevoEmail(mailConfigurations);
};