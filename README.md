# 🌌 NUVORA — Monochrome D2C E-Commerce Platform with Google Gemini AI

[![React](https://img.shields.io/badge/React-19-black?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-RTK-764abc?logo=redux)](https://redux-toolkit.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?logo=mongodb)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blue?logo=google)](https://ai.google.dev/)

> **NUVORA** is a sleek, monochromatic Direct-to-Consumer (D2C) luxury e-commerce platform built on a clean **Single-Vendor, Multi-Buyer** architecture. Powered by React 19, Redux Toolkit, Node.js, Express, MongoDB Atlas, Cloudinary CDN, and the **Google Gemini 1.5 Flash AI** engine.

---

## 🌟 Key Features

### 🤖 1. Google Gemini AI Product Insights Summarizer
- **Official Model (`gemini-1.5-flash`)**: High-speed, lightweight endpoint querying Google Generative Language API.
- **Synthesized Product Intelligence**: Ingests product title, category, tech specifications, pricing, savings percentage, and verified MongoDB customer reviews into 3 concise structured takeaways.
- **Fail-Safe Real-Data Fallback**: Automatic deterministic synthesis engine ensuring 100% summary uptime even if quota limits are reached.
- **Dedicated Modal Component (`AiSummaryModal.jsx`)**: Rendered via React `createPortal` with backdrop blur, bold header parsing, and numbered bullet badges.

### 🌊 2. 60 FPS Monochromatic 3D Dots Fabric Wave Hero
- **HTML5 Canvas Trigonometric Simulation**: Pure mathematical 3D perspective projection (`Math.sin` + `Math.cos`) rendering a fluid, floating mesh fabric.
- **Zero Heavy 3D Libraries**: Built directly with native `requestAnimationFrame` for buttery-smooth 60 FPS performance without Three.js overhead.
- **Day & Night Adaptive**: Renders luminous white dots in Dark Mode and deep black dots in Light Mode.

### 🎨 3. Custom Color & Size Variant Management
- **Multi-Color Selector**: Supports 7 preset monochromatic shades plus custom hex/named colors with live removable chips (`[Color ✕]`) and `Enter` key support.
- **Size Selection**: Standard merchandise and clothing sizes (`XS`, `S`, `M`, `L`, `XL`, `XXL`, `3XL`).
- **Cart & Order Tagging**: Selected variants persist across shopping bag, checkout breakdown, order receipts, and invoice records.

### 🔍 4. Unified Catalogue Filter & Search Engine
- **Single-Controller Query Engine (`paginateProducts`)**: Handles live regex text search, category filtering, price range constraints, and multi-level sorting (*Price: Low to High*, *High to Low*, *Top Rated*).
- **Responsive Controls**: Sidebar filtering for desktop and expandable inline filter cards for mobile.

### 📦 5. Single-Vendor Admin & Inventory Control Hub
- **Streamlined Store Metrics**: Real-time analytics tracking `Total Revenue (₹)`, `Orders Received`, and `Active Listings`.
- **Instant Stock Refill Modal**: One-click inventory restocker with Additive/Set Absolute Modes without requiring full product editing.
- **Order Fulfillment Pipeline**: Update shipping states (*Placed → Processing → Shipped → Delivered*) with customer cancel guards.

### 💳 6. Flexible Order Checkout & Stock Management
- **Multi-Payment Selection**: Seamless checkout supporting **Cash on Delivery (COD)** and **Online / Prepaid Payment**.
- **Automated Inventory Deduction**: Atomically decrements product stock upon order placement and guards against overselling.

### ☀️/🌙 7. Day & Night Monochrome Theming Engine
- **Self-Contained `ThemeContext.jsx`**: Global theme inverter with media and footer preservation (`.no-invert` protection) while keeping `index.css` completely clean.

---

## 🛠️ Tech Stack & Dependencies

### **Frontend**
- **Core**: React 19, Vite, HTML5 Canvas API
- **Routing**: React Router DOM v7
- **State Management**: Redux Toolkit & Async Thunks (`authSlice`, `cartSlice`, `wishlistSlice`, `orderSlice`, `productSlice`, `reviewSlice`)
- **Styling**: Tailwind CSS (Minimal directives preserved)
- **Icons & Feedback**: React Icons (Heroicons), React Hot Toast

### **Backend**
- **Runtime & Framework**: Node.js (ES Modules), Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), Bcrypt password hashing
- **Media CDN**: Cloudinary SDK & Multer memory storage
- **Email Service**: Nodemailer (SMTP)
- **AI Engine**: Google Gemini 1.5 Flash REST API

---

## 📁 Project Directory Structure

```
nuvora-fs/
├── Frontend/                        # React 19 Client
│   ├── public/                      # Static assets & icons
│   ├── src/
│   │   ├── api/                     # Axios instance & interceptors
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
│   │   ├── email/                   # Nodemailer verification & reset templates
│   │   ├── middlewares/             # JWT auth, Multer, Role guards (isAdmin)
│   │   ├── models/                  # Mongoose schemas (User, Product, Cart, Order, Review)
│   │   ├── routers/                 # Express API routes
│   │   └── validator/               # Joi request validation schemas
│   ├── .env.example                 # Safe environment variables template
│   ├── server.js                    # Express app entrypoint
│   └── package.json
│
├── .gitignore                       # Root git ignore (Strictly excludes all .env files)
├── README.md                        # Project documentation
└── NUVORA_TECHNICAL_ARCHITECTURE_REPORT.pdf # Complete PDF architecture guide
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas Database URI**
- **Cloudinary Account Credentials**
- **Google Gemini API Key** (from Google AI Studio)

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
   PORT=your_port_number
   URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_app_password
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend development server:
   ```bash
   npm start
   ```
   *Server will run on `http://localhost:<PORT>`*

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
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend will run on `http://localhost:5173`*

---

## 📡 REST API Reference Overview

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/user/register` | `POST` | Public | Register new buyer account & dispatch verification email |
| `/user/login` | `POST` | Public | Authenticate user & issue signed JWT |
| `/user/profile` | `GET` / `PUT` | Logged In | Fetch / Update user profile |
| `/user/profile/picture` | `PUT` | Buyer | Upload avatar directly to Cloudinary |
| `/user/forgot-password` | `POST` | Public | Send 15-minute password reset link |
| `/user/reset-password` | `POST` | Public | Verify token and update password |
| `/product/paginate` | `GET` | Public | Unified multi-filter catalog query |
| `/product/:id` | `GET` | Public | Fetch single product specs |
| `/product/:id/ai-summary` | `GET` | Public | Google Gemini AI summary generated from specs & reviews |
| `/product/add` | `POST` | Seller/Admin | Upload new product with Cloudinary images & variants |
| `/product/refill-stock` | `PATCH` | Seller/Admin | Instant inventory restock (Additive/Absolute) |
| `/cart` | `GET` / `POST` | Buyer | Get cart items / Add item to bag with color & size |
| `/cart/remove/:cartItemId` | `DELETE` | Buyer | Remove product from bag |
| `/wishlist` | `GET` / `POST` | Buyer | Get wishlist / Save product |
| `/order/place` | `POST` | Buyer | Convert bag to order & deduct inventory stock |
| `/order/my-orders` | `GET` | Buyer | Customer order history & timeline tracking |
| `/order/seller-orders` | `GET` | Seller/Admin | Store owner order management |
| `/order/status/:orderId` | `PUT` | Seller/Admin | Update order shipping status |
| `/review/product/:id` | `GET` | Public | Fetch customer reviews and star ratings |
| `/review/add` | `POST` | Buyer | Post review & recalculate average product rating |

---

## 📄 Documentation & PDF Report
A comprehensive, publication-quality technical report and interview preparation guide is available in the repository root:
- 📑 **`NUVORA_TECHNICAL_ARCHITECTURE_REPORT.pdf`**

---

## 📜 License
This project is licensed under the **MIT License** — open and free for personal and commercial development.
