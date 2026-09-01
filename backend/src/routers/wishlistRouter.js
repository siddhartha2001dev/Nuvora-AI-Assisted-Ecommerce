import express from "express";
import {
    addToWishlist,
    getMyWishlist,
    removeFromWishlist
} from "../controllers/wishlistController.js";
import { hashToken } from "../middlewares/hashToken.js";

const wishlistRouter = express.Router();

wishlistRouter.post("/add", hashToken, addToWishlist);
wishlistRouter.get("/my-wishlist", hashToken, getMyWishlist);
wishlistRouter.delete("/remove/:id", hashToken, removeFromWishlist);

export default wishlistRouter;
