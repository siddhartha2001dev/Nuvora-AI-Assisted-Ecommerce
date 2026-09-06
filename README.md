# 🌌 NUVORA — Monochrome D2C E-Commerce Platform with Google Gemini AI & Razorpay

[![Live Demo](https://img.shields.io/badge/Live%20Demo-nuvora--ekart.vercel.app-black?style=for-the-badge&logo=vercel)](https://nuvora-ekart.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render)](https://nuvora-ai-assisted-ecommerce.onrender.com/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay%20Gateway-02042B?style=for-the-badge&logo=razorpay)](https://razorpay.com/)

[![React](https://img.shields.io/badge/React-19-black?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-RTK-764abc?logo=redux)](https://redux-toolkit.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?logo=mongodb)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blue?logo=google)](https://ai.google.dev/)
[![Brevo API](https://img.shields.io/badge/Email-Brevo%20REST%20API-0B996F?logo=brevo)](https://www.brevo.com/)

> **NUVORA** is a sleek, monochromatic Direct-to-Consumer (D2C) luxury e-commerce platform built on a clean **Single-Vendor, Multi-Buyer** architecture. Powered by React 19, Redux Toolkit, Node.js Express 5, MongoDB Atlas, Cloudinary CDN, **Razorpay Payment Gateway**, **Brevo HTTPS Email Engine**, and the **Google Gemini 1.5 Flash AI** insights summarizer.

🔗 **Live Application URL**: [https://nuvora-ekart.vercel.app/](https://nuvora-ekart.vercel.app/)  
🛍️ **Product Catalogue / Shop**: [https://nuvora-ekart.vercel.app/shop](https://nuvora-ekart.vercel.app/shop)  
⚡ **Production Backend API**: [https://nuvora-ai-assisted-ecommerce.onrender.com/](https://nuvora-ai-assisted-ecommerce.onrender.com/)

---

## 🌟 Key Features

### 🤖 1. Google Gemini AI Product Insights Summarizer
- **Official Model (`gemini-1.5-flash`)**: High-speed, lightweight endpoint querying Google Generative Language API.
- **Synthesized Product Intelligence**: Ingests product title, category, tech specifications, pricing, savings percentage, and verified MongoDB customer reviews into 3 concise structured takeaways.
- **Fail-Safe Real-Data Fallback**: Automatic deterministic synthesis engine ensuring 100% summary uptime even if quota limits are reached.
- **Dedicated Modal Component (`AiSummaryModal.jsx`)**: Rendered via React `createPortal` with backdrop blur, bold header parsing, and numbered bullet badges.

### 💳 2. Razorpay Online Payment Gateway Integration
- **Full-Stack Checkout**: Native integration with the official Razorpay Checkout SDK supporting UPI (GPay, PhonePe, Paytm, QR), Credit/Debit Cards, NetBanking, and Wallets.
- **Cryptographic Security**: HMAC-SHA256 signature verification in the backend prevents order tampering and ensures 100% genuine payments.
- **Multi-Payment Selection**: Choose between **Razorpay Online** and **Cash on Delivery (COD)** with real-time UI feedback.
- **Automated Stock Deduction**: Orders are placed atomically, product stock is decremented, and user shopping bag is emptied upon successful payment.

### 📬 3. "Stay In The Loop" Newsletter & Real-Time Product Alerts
- **Database Storage**: Captures subscribers in MongoDB with duplicate submission protection.
- **Automated VIP Welcome Email**: Dispatches a luxury dark-mode welcome email via Brevo REST API containing a 10% discount gift code (`NUVORA10`) and collection link.
- **New Product Drop Alerts**: Automatically sends an email alert with product image, price, and direct link to all newsletter subscribers whenever a seller/admin lists a new product.

### 🔐 4. Production-Ready Authentication & Security
- **JWT & Password Security**: Bcrypt hashed credentials and 7-day access / 30-day refresh token architecture.
- **Brevo REST API Email Verification**: Email verification and 15-minute expiring password reset links dispatched via Brevo HTTPS REST API (Port 443) for 100% cloud & Render deployment reliability.
- **Interactive Password Visibility Toggle**: Eye icon toggle (`HiOutlineEye` / `HiOutlineEyeOff`) across Login, Register, Reset Password, and Profile Change Password forms.

### ⭐ 5. Verified Customer Reviews & Profiles
- **Profile Avatar Rendering**: Displays user's uploaded Cloudinary avatar photo next to their review comments with an initials fallback.
- **Dynamic Rating System**: Real-time calculated average ratings; shows a clean `"No reviews available"` badge when a product has zero reviews instead of fake 5 stars.

### 🌊 6. 60 FPS Monochromatic 3D Dots Fabric Wave Hero
- **HTML5 Canvas Trigonometric Simulation**: Pure mathematical 3D perspective projection (`Math.sin` + `Math.cos`) rendering a fluid, floating mesh fabric.
- **Zero Heavy 3D Libraries**: Built directly with native `requestAnimationFrame` for buttery-smooth 60 FPS performance without Three.js overhead.
- **Day & Night Adaptive**: Renders luminous white dots in Dark Mode and deep black dots in Light Mode.

### 🎨 7. Custom Color & Size Variant Management
- **Multi-Color Selector**: Supports 7 preset monochromatic shades plus custom hex/named colors with live removable chips (`[Color ✕]`) and `Enter` key support.
- **Size Selection**: Standard merchandise and clothing sizes (`XS`, `S`, `M`, `L`, `XL`, `XXL`, `3XL`).
- **Cart & Order Tagging**: Selected variants persist across shopping bag, checkout breakdown, order receipts, and invoice records.

### 📦 8. Single-Vendor Admin & Inventory Control Hub
- **Streamlined Store Metrics**: Real-time analytics tracking `Total Revenue (₹)`, `Orders Received`, and `Active Listings`.
- **Instant Stock Refill Modal**: One-click inventory restocker with Additive/Set Absolute Modes.
- **Stock Guard UX**: Displays clean `"In Stock"` or `"Out of Stock"` badges and disables purchase buttons when stock is depleted, auto-enabling upon replenishment.
- **Order Fulfillment Pipeline**: Update shipping states (*Placed → Shipped → Delivered → Cancelled*).

### ☀️/🌙 9. Day & Night Monochrome Theming Engine
- **Self-Contained `ThemeContext.jsx`**: Global theme inverter with media and footer preservation (`.no-invert` protection) while keeping `index.css` completely clean.

### 📍 10. Multi-Address Management (Address Book) & 1-Click Checkout Auto-Apply
- **Profile Address Book**: Buyers can add, edit, delete, and designate a "Default Delivery Address" across labeled destinations (`Home`, `Work`, `Other`).
- **Checkout Auto-Apply**: Default delivery address is automatically fetched and applied at checkout without repetitive manual typing.
- **Interactive Address Selector**: 1-click address card selector allowing instant switching between saved addresses.
- **On-the-Fly Address Addition**: Option to enter a new delivery address directly during checkout with a *"Save to Address Book for future orders"* toggle.
- **Full Compatibility**: Works seamlessly with both Cash on Delivery (COD) and Razorpay Online payments, retaining accurate past order address snapshots.

---

## 🛠️ Tech Stack & Dependencies

### **Frontend**
- **Core**: React 19, Vite 8, HTML5 Canvas API
- **Payments**: Razorpay Checkout SDK (`checkout.js`)
- **Routing**: React Router DOM v7
- **State Management**: Redux Toolkit & Async Thunks (`authSlice`, `cartSlice`, `wishlistSlice`, `orderSlice`, `productSlice`, `reviewSlice`)
- **Styling**: Tailwind CSS
- **Icons & Feedback**: React Icons (`react-icons/hi`), React Hot Toast
- **HTTP Client**: Axios with dynamic baseURL interceptor & JWT token attachment

### **Backend**
- **Runtime & Framework**: Node.js (ES Modules), Express.js 5
- **Database**: MongoDB Atlas with Mongoose ODM
- **Payments**: Official `razorpay` Node SDK & native `crypto` (HMAC SHA256)
- **Authentication**: JWT (JSON Web Tokens), Bcrypt password hashing
- **Media CDN**: Cloudinary SDK & Multer memory storage
- **Email Service**: Brevo REST API (HTTPS Port 443)
- **AI Engine**: Google Gemini 1.5 Flash REST API

---

## 📁 Project Directory Structure

```
nuvora-fs/
├── Frontend/                        # React 19 Client
│   ├── public/                      # Static assets & icons
│   ├── src/
│   │   ├── api/                     # Axios instance (dynamic VITE_API_BASE_URL)
│   │   ├── Components/              # Reusable UI components
│   │   │   ├── Cart/                # CartItem, OrderSummary
│   │   │   ├── Common/              # Navbar, Footer, Loader, ProtectedRoute, BuyerRoute, ThemeToggle
│   │   │   ├── Home/                # HeroFabricBackground (60fps Canvas)
│   │   │   ├── Product/             # ProductCard, ProductFilter, ReviewSection, AiSummaryModal
│   │   │   └── Seller/              # SellerSidebar
│   │   ├── context/                 # ThemeContext (Day/Night state)
│   │   ├── Pages/                   # Application views
│   │   │   ├── Auth/                # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── Customer/            # Cart, WishList, CheckOut, MyOrders, Profile
│   │   │   ├── Public/              # Home, Shop, ProductDetails, VerifyMail
│   │   │   ├── Seller/              # SellerDashboard, AddProduct, SellerOrders
│   │   │   └── Error/               # NotFound (404)
│   │   ├── redux/                   # Redux Toolkit Slices & Store
│   │   ├── App.jsx                  # Application Router
│   │   ├── index.css                # Tailwind base directives
│   │   └── main.jsx                 # Redux Provider & DOM entrypoint
│   ├── package.json
│   └── vite.config.js
│
├── backend/                         # Express REST API Server
│   ├── src/
│   │   ├── config/                  # MongoDB & Cloudinary configurations
│   │   ├── controllers/             # Product, User, Cart, Wishlist, Order, Review
│   │   ├── email/                   # Brevo REST API templates & alert dispatchers
│   │   ├── middlewares/             # JWT auth, Multer, Role guards (isAdmin)
│   │   ├── models/                  # Mongoose schemas (User, Product, Cart, Order, Review, Subscriber)
│   │   ├── routers/                 # Express API routes (including Razorpay & Newsletter)
│   │   └── validator/               # Yup request validation schemas
│   ├── .env.example                 # Safe environment variables template
│   ├── server.js                    # Express app entrypoint
│   └── package.json
│
├── .gitignore                       # Root git ignore (Strictly excludes all .env files)
├── README.md                        # Project documentation
└── NUVORA_API_ARCHITECTURE.md       # Complete API specifications
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas URI**
- **Cloudinary Account Credentials**
- **Brevo API Key** (from [brevo.com](https://brevo.com))
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))
- **Razorpay Key ID & Secret** (from [Razorpay Dashboard](https://dashboard.razorpay.com/))

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory (refer to `.env.example`):
   ```env
   PORT=8000
   CLIENT_URL=http://localhost:5173
   URL=your_mongodb_connection_string
   secretKey=your_super_secret_jwt_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL=your_brevo_verified_email@gmail.com
   BREVO_API_KEY=xkeysib-your_brevo_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *Server will run on `http://localhost:8000`*

---

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. *(Optional)* Create a `.env` file in the `Frontend/` directory:
   ```env
   VITE_API_BASE_URL=https://nuvora-ai-assisted-ecommerce.onrender.com
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend will run on `http://localhost:5173`*

---

## 🌐 Production Deployment Guide

### Live Deployment Links
- **Frontend Storefront (Vercel)**: [https://nuvora-ekart.vercel.app/](https://nuvora-ekart.vercel.app/)
- **Live Shop / Products (Vercel)**: [https://nuvora-ekart.vercel.app/shop](https://nuvora-ekart.vercel.app/shop)
- **Backend API (Render)**: [https://nuvora-ai-assisted-ecommerce.onrender.com/](https://nuvora-ai-assisted-ecommerce.onrender.com/)

### Deploy Backend to Render
1. Create a new **Web Service** on [Render](https://render.com) connected to your GitHub repository.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
3. Add Environment Variables in the **Environment** tab:
   - `PORT`: `8000`
   - `URL`: *(Your MongoDB connection string)*
   - `secretKey`: *(Your JWT Secret)*
   - `EMAIL`: *(Your Brevo sender email)*
   - `BREVO_API_KEY`: *(Your Brevo API Key `xkeysib-...`)*
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - `RAZORPAY_KEY_ID`: *(Your Razorpay Key ID)*
   - `RAZORPAY_KEY_SECRET`: *(Your Razorpay Key Secret)*
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `CLIENT_URL`: `https://nuvora-ekart.vercel.app`

### Deploy Frontend to Vercel
1. Import the repository into [Vercel](https://vercel.com).
2. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `Frontend`
3. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://nuvora-ai-assisted-ecommerce.onrender.com`
4. Click **Deploy**.

---

## 📡 REST API Reference Overview

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/user/register` | `POST` | Public | Register new buyer account & dispatch Brevo verification email |
| `/user/login` | `POST` | Public | Authenticate user & issue signed JWT |
| `/user/profile` | `GET` / `PUT` | Logged In | Fetch / Update user profile |
| `/user/profile/picture` | `PUT` | Buyer | Upload avatar directly to Cloudinary |
| `/user/addresses` | `GET` | Logged In | Fetch user's saved Address Book |
| `/user/address` | `POST` | Logged In | Add new address to Address Book (with default support) |
| `/user/address/:addressId` | `PUT` | Logged In | Update existing saved address |
| `/user/address/:addressId` | `DELETE` | Logged In | Remove address from Address Book |
| `/user/address/:addressId/default` | `PATCH` | Logged In | Set address as primary default delivery address |
| `/user/forgot-password` | `POST` | Public | Send 15-minute Brevo password reset link |
| `/user/reset-password` | `POST` | Public | Verify token and update password |
| `/product/paginate` | `GET` | Public | Unified multi-filter catalog query |
| `/product/:id` | `GET` | Public | Fetch single product specs |
| `/product/:id/ai-summary` | `GET` | Public | Google Gemini AI summary generated from specs & reviews |
| `/product/create` | `POST` | Seller/Admin | Upload new product & automatically alert all newsletter subscribers |
| `/cart` | `GET` / `POST` | Buyer | Get cart items / Add item to bag with color & size |
| `/cart/remove/:cartItemId` | `DELETE` | Buyer | Remove product from bag |
| `/wishlist` | `GET` / `POST` | Buyer | Get wishlist / Save product |
| `/order/place` | `POST` | Buyer | Place order via Cash on Delivery (COD) & deduct stock |
| `/order/razorpay/create-order` | `POST` | Buyer | Initialize Razorpay Order ID for online payment |
| `/order/razorpay/verify-payment` | `POST` | Buyer | Verify HMAC-SHA256 signature, place orders & clear cart |
| `/order/my-orders` | `GET` | Buyer | Customer order history & timeline tracking |
| `/order/seller/orders` | `GET` | Seller/Admin | Store owner order management |
| `/order/seller/status/:id` | `PUT` | Seller/Admin | Update order shipping status |
| `/review/product/:id` | `GET` | Public | Fetch customer reviews, star ratings & user avatars |
| `/review/add` | `POST` | Buyer | Post review & recalculate average product rating |
| `/newsletter/subscribe` | `POST` | Public | Subscribe email, save to MongoDB & dispatch welcome 10% gift email |

---

## 📜 License
This project is licensed under the **MIT License** — open and free for personal and commercial development.
