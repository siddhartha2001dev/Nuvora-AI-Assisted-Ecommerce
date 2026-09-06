import express from "express";
import {
    register,
    logIn,
    logOut,
    refreshToken,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    uploadProfilePicture,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from "../controllers/userController.js";
import { hashToken } from "../middlewares/hashToken.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { validate, userRegisterSchema, userLoginSchema, addressValidationSchema } from "../validator/validator.js";
import { upload } from "../middlewares/multer.js";
import { getClientUrl } from "../email/verifyEmail.js";

const userRouter = express.Router();

userRouter.post("/register", validate(userRegisterSchema), register);
userRouter.post("/login", validate(userLoginSchema), logIn);
userRouter.delete("/logout", hashToken, logOut);
userRouter.post("/refresh-token", refreshToken);

// Email Verification routes (Token based)
userRouter.post("/verify-email", verifyToken);
userRouter.get("/verify-email", (req, res) => {
    const { token } = req.query;
    const clientUrl = getClientUrl(req.headers.origin || req.headers.referer);
    return res.redirect(`${clientUrl}/verify-email?token=${token || ""}`);
});

// Password recovery routes
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

// Profile routes
userRouter.get("/profile", hashToken, getProfile);
userRouter.put("/profile", hashToken, updateProfile);
userRouter.put("/profile/picture", hashToken, upload.single("avatar"), uploadProfilePicture);
userRouter.put("/change-password", hashToken, changePassword);

// Address Book routes (Protected)
userRouter.get("/addresses", hashToken, getAddresses);
userRouter.post("/address", hashToken, validate(addressValidationSchema), addAddress);
userRouter.put("/address/:addressId", hashToken, validate(addressValidationSchema), updateAddress);
userRouter.delete("/address/:addressId", hashToken, deleteAddress);
userRouter.patch("/address/:addressId/default", hashToken, setDefaultAddress);

export default userRouter;