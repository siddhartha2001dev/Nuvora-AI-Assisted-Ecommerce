import express from "express";
import { addToCart, getMyCart, removeFromCart } from "../controllers/cartController.js";
import { hashToken } from "../middlewares/hashToken.js";
import { validate, cartValidationSchema } from "../validator/validator.js";

const cartRouter = express.Router();

cartRouter.post("/add", hashToken, validate(cartValidationSchema), addToCart);
cartRouter.get("/my-cart", hashToken, getMyCart);
cartRouter.delete("/remove/:id", hashToken, removeFromCart);

export default cartRouter;
