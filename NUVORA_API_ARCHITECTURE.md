# 📘 NUVORA Full-Stack Architecture & API Integration Documentation

Welcome to the complete technical and API implementation documentation for **NUVORA** — a monochromatic luxury e-commerce platform built with React, Redux Toolkit Query, Tailwind CSS, Node.js, Express, and MongoDB.

---

## 📑 Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [Global State & RTK Query Slice](#2-global-state--rtk-query-slice)
3. [Complete 24 API Endpoints & Frontend Mapping Matrix](#3-complete-24-api-endpoints--frontend-mapping-matrix)
4. [Detailed Flow by Feature Area](#4-detailed-flow-by-feature-area)
   - 4.1 [User & Authentication Flow](#41-user--authentication-flow)
   - 4.2 [Products & Catalog Management](#42-products--catalog-management)
   - 4.3 [Cart & Wishlist Real-time Sync](#43-cart--wishlist-real-time-sync)
   - 4.4 [Checkout & Order Processing](#44-checkout--order-processing)
   - 4.5 [Ratings & Customer Reviews](#45-ratings--customer-reviews)
   - 4.6 [Seller Hub & Merchant Fulfillment](#46-seller-hub--merchant-fulfillment)
5. [How to Export this Documentation as PDF](#5-how-to-export-this-documentation-as-pdf)

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    NUVORA REACT FRONTEND                   │
│  (Tailwind CSS • RTK Query • React Router v6 • Toasts)     │
└──────────────┬───────────────────────────────▲──────────────┘
               │ HTTP Requests                 │ Live Cache
               │ (JWT Bearer Token)            │ Invalidation
               ▼                               │
┌──────────────────────────────────────────────┴──────────────┐
│                    EXPRESS BACKEND (PORT 8000)             │
│  - Middleware: hashToken, isSeller, Multer, Yup Validator  │
└──────────────┬───────────────────────────────▲──────────────┘
               │ Mongoose ORM                  │ Cloudinary
               ▼                               │ Media
┌──────────────────────────────────────────────┴──────────────┐
│                    MONGODB DATABASE                         │
│  - Collections: users, sessions, products, carts,           │
│    wishlists, orders, reviews                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Global State & RTK Query Slice

All API operations run through `src/redux/apiSlice.js` with automated JWT authentication injection and cache tags:

```javascript
// Header Injection in apiSlice.js
prepareHeaders: (headers) => {
  const token = localStorage.getItem("nuvora_token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}
```

### Cache Invalidation Tags:
- `User`: Invalidated upon Login, Logout, Profile update, Email verify.
- `Product`: Invalidated upon Product creation, update, deletion, new review.
- `Cart`: Invalidated upon Add to Cart, Remove from Cart, Order Placement.
- `Wishlist`: Invalidated upon Add/Remove from Wishlist.
- `Order`: Invalidated upon Place Order, Cancel Order, Seller Status Update.
- `Review`: Invalidated upon New Review submission.

---

## 3. Complete 24 API Endpoints & Frontend Mapping Matrix

| # | Feature Area | HTTP Method | Endpoint Route | RTK Query Hook | Frontend Component / Page | Payload / Params |
|---|--------------|-------------|----------------|----------------|---------------------------|------------------|
| 1 | Auth | `POST` | `/user/register` | `useRegisterMutation` | `Pages/Auth/Register.jsx` | `{ userName, email, password, phone, role, shopName, address }` |
| 2 | Auth | `POST` | `/user/login` | `useLoginMutation` | `Pages/Auth/Login.jsx` | `{ email, password }` |
| 3 | Auth | `POST` | `/user/verify-email` | `useVerifyEmailMutation` | `Pages/Public/VerifyMail.jsx` | `?token=<jwt_token>` |
| 4 | Auth | `DELETE` | `/user/logout` | `useLogoutMutation` | `Components/Common/Navbar.jsx`, `Profile.jsx` | Header `Bearer <token>` |
| 5 | Auth | `POST` | `/user/refresh-token` | `refreshToken` | `apiSlice.js` (Interceptor) | `{ refreshToken }` |
| 6 | User Profile | `GET` | `/user/profile` | `useGetProfileQuery` | `Pages/Customer/Profile.jsx` | Header `Bearer <token>` |
| 7 | User Profile | `PUT` | `/user/profile` | `useUpdateProfileMutation` | `Pages/Customer/Profile.jsx` | `{ userName, phone, address, shopName }` |
| 8 | Products | `GET` | `/product/all` | `useGetProductsQuery` | `Pages/Public/Home.jsx`, `Shop.jsx` | None (Public) |
| 9 | Products | `GET` | `/product/:id` | `useGetProductDetailsQuery` | `Pages/Public/ProductDetails.jsx` | `req.params.id` |
| 10 | Products | `POST` | `/product/create` | `useCreateProductMutation` | `Pages/Seller/AddProduct.jsx` | `FormData` (Multipart: title, price, discountPrice, stock, category, images) |
| 11 | Products | `PUT` | `/product/update/:id` | `useUpdateProductMutation` | `Pages/Seller/EditProduct.jsx` | `id` + `FormData` |
| 12 | Products | `GET` | `/product/seller/my-products` | `useGetSellerProductsQuery` | `Pages/Seller/SellerDashboard.jsx` | Header `Bearer <token>` (Seller role) |
| 13 | Products | `DELETE` | `/product/delete/:id` | `useDeleteProductMutation` | `Pages/Seller/SellerDashboard.jsx` | `req.params.id` |
| 14 | Cart | `GET` | `/cart/my-cart` | `useGetCartQuery` | `Pages/Customer/Cart.jsx`, `Navbar.jsx` | Header `Bearer <token>` |
| 15 | Cart | `POST` | `/cart/add` | `useAddToCartMutation` | `ProductCard.jsx`, `ProductDetails.jsx`, `CartItem.jsx` | `{ productId, quantity }` |
| 16 | Cart | `DELETE` | `/cart/remove/:id` | `useRemoveFromCartMutation` | `Components/Cart/CartItem.jsx` | `req.params.id` (cart item ID) |
| 17 | Wishlist | `GET` | `/wishlist/my-wishlist` | `useGetWishlistQuery` | `Pages/Customer/WishList.jsx`, `Navbar.jsx` | Header `Bearer <token>` |
| 18 | Wishlist | `POST` | `/wishlist/add` | `useAddToWishlistMutation` | `ProductCard.jsx`, `ProductDetails.jsx` | `{ productId }` |
| 19 | Wishlist | `DELETE` | `/wishlist/remove/:id` | `useRemoveFromWishlistMutation` | `ProductCard.jsx`, `ProductDetails.jsx`, `WishList.jsx` | `req.params.id` |
| 20 | Orders | `POST` | `/order/place` | `usePlaceOrderMutation` | `Pages/Customer/CheckOut.jsx` | `{ productId, quantity, address, paymentMethod }` |
| 21 | Orders | `GET` | `/order/my-orders` | `useGetMyOrdersQuery` | `Pages/Customer/MyOrders.jsx` | Header `Bearer <token>` |
| 22 | Orders | `PUT` | `/order/cancel/:id` | `useCancelOrderMutation` | `Pages/Customer/MyOrders.jsx` | `req.params.id` |
| 23 | Orders | `GET` | `/order/seller/orders` | `useGetSellerOrdersQuery` | `Pages/Seller/SellerOrders.jsx`, `SellerDashboard.jsx` | Header `Bearer <token>` (Seller role) |
| 24 | Orders | `PUT` | `/order/seller/status/:id` | `useUpdateOrderStatusMutation` | `Pages/Seller/SellerOrders.jsx` | `id` + `{ orderStatus: "Shipped" / "Delivered" / ... }` |
| 25 | Reviews | `GET` | `/review/product/:productId` | `useGetProductReviewsQuery` | `Components/Product/ReviewSection.jsx` | `req.params.productId` |
| 26 | Reviews | `POST` | `/review/add` | `useAddReviewMutation` | `Components/Product/ReviewSection.jsx` | `{ productId, rating, comment }` |

---

## 4. Detailed Flow by Feature Area

### 4.1 User & Authentication Flow
1. **Registration**: The user selects role tab (`Buyer` or `Seller`). If `Seller`, extra shop name fields appear. Form submits to `POST /user/register`. A verification JWT is issued and verification email link is generated.
2. **Email Verification**: User visits `/verify-email?token=...` or pastes token. `POST /user/verify-email` sets `isVerified: true` in MongoDB.
3. **Login**: `POST /user/login` checks password with `bcrypt.compare` and validates that the account is email-verified. Returns `accessToken`, `refreshToken`, and sanitized `user` object. Redux `authSlice` stores token in `localStorage` (`nuvora_token` and `nuvora_user`).
4. **Role Routing**: Buyers land on `/` or their last requested page; Sellers are automatically navigated to `/seller/dashboard`.

---

### 4.2 Products & Catalog Management
1. **Public Catalog (`GET /product/all`)**:
   - `Home.jsx` displays clean curated products directly from MongoDB without complicated submenus.
   - `Shop.jsx` displays full product listings with keyword search, price slider (up to ₹25,000), sort options, and clean pagination.
2. **Single Product (`GET /product/:id`)**:
   - Fetches product details, populated seller information, high-res photo gallery thumbnails, stock counter, and real-time review ratings.
3. **Product Creation (`POST /product/create`)**:
   - Available only to verified sellers at `/seller/add-product`.
   - Supports up to 5 image files uploaded via Multer and streamed to Cloudinary folder `nuvora_products`.

---

### 4.3 Cart & Wishlist Real-time Sync
1. **Cart Synchronization (`GET /cart/my-cart`, `POST /cart/add`, `DELETE /cart/remove/:id`)**:
   - Any click on "Add to Bag" on `ProductCard` or `ProductDetails` writes directly to MongoDB `cartSchema`.
   - `Navbar.jsx` displays a real-time badge with active cart item count.
   - `CartItem.jsx` supports increment/decrement of quantities and instant item deletion.
2. **Wishlist Sync (`GET /wishlist/my-wishlist`, `POST /wishlist/add`, `DELETE /wishlist/remove/:id`)**:
   - Heart icon on cards toggles state automatically and updates the Navbar wishlist counter.

---

### 4.4 Checkout & Order Processing
1. **Checkout (`POST /order/place`)**:
   - Buyer enters shipping address and selects payment method: `Cash on Delivery (COD)` or `Razorpay Online`.
   - Submits `placeOrder` for cart items.
   - Reduces inventory stock in DB and clears items from user's cart.
2. **Order History (`GET /order/my-orders`, `PUT /order/cancel/:id`)**:
   - Shows active status badges (`Placed`, `Shipped`, `Delivered`, `Cancelled`).
   - Allows cancelling pending orders.

---

### 4.5 Ratings & Customer Reviews
1. **Fetch Reviews (`GET /review/product/:productId`)**: Populates author names, timestamps, star ratings, and review comments.
2. **Submit Review (`POST /review/add`)**: Only logged-in buyers can write reviews. Star picker (1-5) and feedback box invalidate `Product` and `Review` tags for instant UI updates.

---

### 4.6 Seller Hub & Merchant Fulfillment
1. **Dashboard Metrics (`GET /product/seller/my-products`, `GET /order/seller/orders`)**:
   - Computes total earnings/revenue, pending orders, active listings, and low-stock alerts.
2. **Order Dispatching (`PUT /order/seller/status/:id`)**:
   - Merchant selects updated status (`Placed` ➔ `Shipped` ➔ `Delivered` ➔ `Cancelled`), which updates the order document in real-time.

---

## 5. How to Export this Documentation as PDF

You can generate a PDF copy at any time:
1. Open the companion file **`NUVORA_API_DOCUMENTATION.html`** in Chrome / Edge.
2. Press **`Ctrl + P`** (or `Cmd + P` on Mac).
3. Under Destination, select **"Save as PDF"**.
4. Check **"Background graphics"** and click **Save**.
