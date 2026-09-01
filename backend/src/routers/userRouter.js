import express from "express";
import { register, logIn, logOut, refreshToken, getProfile, updateProfile, changePassword, forgotPassword, resetPassword, uploadProfilePicture } from "../controllers/userController.js";
import { hashToken } from "../middlewares/hashToken.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { validate, userRegisterSchema, userLoginSchema } from "../validator/validator.js";
import { upload } from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.post("/register", validate(userRegisterSchema), register);
userRouter.post("/login", validate(userLoginSchema), logIn);
userRouter.delete("/logout", hashToken, logOut);
userRouter.post("/refresh-token", refreshToken);

// Email Verification route (Token based)
userRouter.post("/verify-email", verifyToken);

// Password recovery routes
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

// Profile routes
userRouter.get("/profile", hashToken, getProfile);
userRouter.put("/profile", hashToken, updateProfile);
userRouter.put("/profile/picture", hashToken, upload.single("avatar"), uploadProfilePicture);
userRouter.put("/change-password", hashToken, changePassword);

export default userRouter;