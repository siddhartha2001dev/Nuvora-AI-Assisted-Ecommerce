import userSchema from "../models/userSchema.js";
import sessionSchema from "../models/sessionsSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyEmail, sendResetPasswordEmail } from "../email/verifyEmail.js";
import cloudinary from "../config/cloudinary.js";

// 1. Register
export const register = async (req, res) => {
    try {
        const { userName, email, password, phone, role, shopName, address } = req.body;

        const existingUser = await userSchema.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        // Create user instance
        const newUser = new userSchema({
            userName,
            email,
            password: hashPassword,
            phone: phone || "",
            role: role || "Buyer",
            shopName: shopName || "",
            address: address || "",
            isVerified: false
        });

        // Verification token (1 day validity)
        const token = jwt.sign(
            { _id: newUser._id },
            process.env.secretKey,
            { expiresIn: "1d" }
        );

        // Save token directly into MongoDB document
        newUser.token = token;
        await newUser.save();

        // Send verification email
        await verifyEmail(token, email);

        const userResponse = newUser.toObject();
        delete userResponse.password;

        return res.status(201).json({
            success: true,
            message: "User registered successfully. Verification email sent.",
            token,
            data: userResponse
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Login
export const logIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await userSchema.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User does not exist"
            });
        }

        // Strict Check: Only allow verified users to login
        if (!existingUser.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email first before logging in. Check your inbox for the verification link."
            });
        }

        const matchedPassword = await bcrypt.compare(password, existingUser.password);
        if (matchedPassword) {
            await sessionSchema.findOneAndDelete({ userId: existingUser._id });
            await sessionSchema.create({ userId: existingUser._id });

            const accessToken = jwt.sign({ _id: existingUser._id }, process.env.secretKey, { expiresIn: "7d" });
            const refreshToken = jwt.sign({ _id: existingUser._id }, process.env.secretKey, { expiresIn: "30d" });

            existingUser.isLoggedIn = true;
            await existingUser.save();

            const userResponse = existingUser.toObject();
            delete userResponse.password;

            return res.status(200).json({
                success: true,
                message: "User logged in successfully",
                data: userResponse,
                accessToken,
                refreshToken
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Logout
export const logOut = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Delete session from DB
        await sessionSchema.findOneAndDelete({ userId });

        // Update isLoggedIn status
        await userSchema.findByIdAndUpdate(userId, { isLoggedIn: false });

        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 4. Refresh Token
export const refreshToken = async (req, res) => {
    try {
        let token = null;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.body && req.body.refreshToken) {
            token = req.body.refreshToken;
        } else if (authHeader) {
            token = authHeader;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found"
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.secretKey);
            const { _id } = decoded;

            const user = await userSchema.findById(_id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const activeSession = await sessionSchema.findOne({ userId: _id });
            if (!activeSession) {
                return res.status(401).json({
                    success: false,
                    message: "Session expired or logged out, please login again"
                });
            }

            const newAccessToken = jwt.sign(
                { _id: user._id },
                process.env.secretKey,
                { expiresIn: "7d" }
            );

            return res.status(200).json({
                success: true,
                message: "New access token generated",
                accessToken: newAccessToken
            });

        } catch (jwtErr) {
            if (jwtErr.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "Refresh token expired, please login again"
                });
            }
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 5. Get User Profile
export const getProfile = async (req, res) => {
    try {
        const user = await userSchema.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 6. Update User Profile
export const updateProfile = async (req, res) => {
    try {
        const { userName, email, phone, avatarUrl, shopName, address } = req.body;

        // If email is changing, check if another user already has this email
        if (email) {
            const existing = await userSchema.findOne({ email, _id: { $ne: req.userId } });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Email is already in use by another account"
                });
            }
        }

        const updatedUser = await userSchema.findByIdAndUpdate(
            req.userId,
            { userName, email, phone, avatarUrl, shopName, address },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 7. Change Password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        const user = await userSchema.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password does not match"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 8. Forgot Password (Send Reset Link)
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await userSchema.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "No account found with this email address" });
        }

        // Generate temporary reset token (15 mins)
        const resetToken = jwt.sign(
            { _id: user._id, type: "password_reset" },
            process.env.secretKey,
            { expiresIn: "15m" }
        );

        user.token = resetToken;
        await user.save();

        await sendResetPasswordEmail(resetToken, email);

        return res.status(200).json({
            success: true,
            message: "Password reset link sent to your email!",
            resetToken
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 9. Reset Password (Verify Token & Update)
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: "Token and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.secretKey);
        } catch (jwtErr) {
            return res.status(400).json({ success: false, message: "Reset link has expired or is invalid" });
        }

        const user = await userSchema.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.token = "";
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password has been successfully reset. You can now login with your new password!"
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 10. Upload / Set Profile Picture (Buyer Only)
export const uploadProfilePicture = async (req, res) => {
    try {
        const user = await userSchema.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Only Buyer is allowed to set profile picture as per business requirement
        if (user.role !== "Buyer") {
            return res.status(403).json({
                success: false,
                message: "Only buyers are allowed to update profile picture"
            });
        }

        let avatarUrl = "";

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: "nuvora_avatars",
                        transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }]
                    },
                    (error, uploadResult) => {
                        if (error) reject(error);
                        else resolve(uploadResult);
                    }
                ).end(req.file.buffer);
            });
            avatarUrl = result.secure_url;
        } else if (req.body.avatarUrl) {
            avatarUrl = req.body.avatarUrl.trim();
        } else {
            return res.status(400).json({
                success: false,
                message: "Please upload an image file or provide avatarUrl"
            });
        }

        user.avatarUrl = avatarUrl;
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            avatarUrl,
            data: userResponse
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
