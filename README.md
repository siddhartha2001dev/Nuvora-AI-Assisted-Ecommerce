# 🌌 NUVORA — Monochrome D2C E-Commerce Platform with Google Gemini AI

[![React](https://img.shields.io/badge/React-19-black?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-RTK%20Query-764abc?logo=redux)](https://redux-toolkit.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?logo=mongodb)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%203.6%20Flash-blue?logo=google)](https://ai.google.dev/)

> **NUVORA** is a sleek, monochromatic Direct-to-Consumer (D2C) luxury e-commerce platform built on a clean **Single-Vendor, Multi-Buyer** architecture. Powered by React 19, Redux Toolkit Query, Node.js, Express, MongoDB Atlas, and the **Google Gemini 3.6 Flash AI** engine.

---

## 🌟 Key Features

### 🤖 1. Google Gemini AI Product Insights Summarizer
- **Native REST Integration**: Directly queries Google Gemini 3.6 Flash via Node.js native `fetch` with zero heavy dependencies.
- **Real-Time Data Ingestion**: Synthesizes product specifications, pricing, stock, and authentic customer reviews stored in MongoDB.
- **Full-Screen Glassmorphic Modal**: Rendered with React `createPortal` and `z-[99999] backdrop-blur-2xl` for 100% viewport coverage.

### 🔍 2. Unified Catalogue Filter & Search Engine
- **Single-Controller Query Engine (`paginateProducts`)**: Handles live text search, exact category matching (`new RegExp`), dynamic price range constraints (`discountPrice <= maxPrice`), and multi-level sorting (*Low to High*, *High to Low*, *Top Rated*).
- **Smooth Inline Mobile Accordion**: Expandable inline filter card directly beneath search controls without intrusive popups.

### 👤 3. Buyer Profile & Avatar Upload
- **Cloudinary CDN Pipeline**: Direct memory-stream upload via Multer buffer.
- **Role Guarded**: Strictly reserved for verified Buyers (`role === "Buyer"`).
- **Top Navigation Sync**: Real-time avatar thumbnail reflection in the top navigation header.

### 🔐 4. Complete Password Management & Security
- **Logged-in Password Change**: Validates current password with bcrypt before updating.
- **Forgot Password Recovery**: Dispatches secure 15-minute tokenized reset links via Nodemailer.
- **Form Auto-Clear & Autofill Lock**: Prevents cached credential auto-population on auth forms.

### ⚡ 5. Real-Time Cart, Wishlist & Order Processing
- **RTK Query Cache Tags**: Automatic cache invalidation (`invalidatesTags: ["Cart", "Wishlist", "Order"]`) updates badges instantly without page refreshes.
- **Checkout Engine**: Address validation, COD / simulated online payment, and automatic stock deduction.

### 📊 6. Master Store Owner (Admin/Seller) Hub
- **Analytics Dashboard**: Real-time total revenue, order count, and active product metrics.
- **Catalog Management**: Instant product updates, stock control, and Cloudinary multi-image uploads.
- **Fulfillment Management**: Track customer orders and update shipping states (*Placed → Processing → Shipped → Delivered*).

### ☀️/🌙 7. Day & Night Monochrome Theming Engine
- **Context API Architecture**: Seamless switching between **Deep Obsidian Night** and **Crisp Luxe Day** modes with localStorage persistence.

---

## 🛠️ Tech Stack & Dependencies

### **Frontend**
- **Core**: React 19, ReactDOM (`createPortal`), Vite 6
- **Routing**: React Router DOM v7
- **State Management**: Redux Toolkit & RTK Query
- **Styling**: Tailwind CSS, PostCSS, Pure Vanilla CSS
- **Icons & UI Feedback**: React Icons (Heroicons), React Hot Toast

### **Backend**
- **Runtime & Framework**: Node.js (ES Modules), Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT), Bcrypt password hashing
- **Media CDN**: Cloudinary SDK & Multer (Memory Storage)
- **Email Service**: Nodemailer (SMTP)
- **Validation**: Joi schema validation
- **AI Intelligence**: Google Gemini 3.6 Flash REST API

---

## 📁 Project Directory Structure

```
nuvora-fs/
├── Frontend/                        # React 19 Client
│   ├── public/                      # Static assets & SVG icons
│   ├── src/
│   │   ├── Components/              # Reusable UI components
│   │   │   ├── Cart/                # CartItem, OrderSummary
│   │   │   ├── Common/              # Navbar, Footer, Loader, Route Guards, ThemeToggle
│   │   │   ├── Product/             # ProductCard, ProductFilter, ReviewSection
│   │   │   └── Seller/              # SellerSidebar
│   │   ├── context/                 # ThemeContext (Day/Night state)
│   │   ├── Pages/                   # Application views
│   │   │   ├── Auth/                # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── Customer/            # Cart, WishList, CheckOut, MyOrders, Profile
│   │   │   ├── Public/              # Home, Shop, ProductDetails, VerifyMail
│   │   │   ├── Seller/              # SellerDashboard, AddProduct, SellerOrders
│   │   │   └── Error/               # NotFound (404)
│   │   ├── redux/                   # RTK Query apiSlice, authSlice, store
│   │   ├── App.jsx                  # Route definitions
│   │   ├── index.css                # Tailwind directives
│   │   └── main.jsx                 # Redux Provider & DOM entrypoint
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                         # Express REST API Server
│   ├── src/
│   │   ├── config/                  # MongoDB & Cloudinary configurations
│   │   ├── controllers/             # Product, User, Cart, Wishlist, Order, Review
│   │   ├── email/                   # Nodemailer verification & reset templates
│   │   ├── middlewares/             # JWT auth (hashToken, verifyToken), Multer, Role guards
│   │   ├── models/                  # Mongoose schemas (User, Product, Cart, Order, Review)
│   │   ├── routers/                 # Express API routes
│   │   └── validator/               # Joi request validation schemas
│   ├── .env.example                 # Safe environment variables template
│   ├── server.js                    # Express app entrypoint
│   └── package.json
│
├── .gitignore                       # Root git ignore (Excludes all .env & secrets)
├── README.md                        # Documentation
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
| `/user/profile/picture` | `PUT` | Buyer | Upload avatar directly to Cloudinary (face crop) |
| `/user/forgot-password` | `POST` | Public | Send 15-minute password reset link |
| `/user/reset-password` | `POST` | Public | Verify token and update password |
| `/product/paginate` | `GET` | Public | Unified multi-filter catalog query |
| `/product/:id` | `GET` | Public | Fetch single product specs |
| `/product/:id/ai-summary` | `GET` | Public | Google Gemini AI summary generated from database reviews |
| `/product/add` | `POST` | Seller | Upload new product with Cloudinary images |
| `/cart` | `GET` / `POST` | Buyer | Get cart items / Add item to bag |
| `/cart/remove/:productId` | `DELETE` | Buyer | Remove product from bag |
| `/wishlist` | `GET` / `POST` | Buyer | Get wishlist / Save product |
| `/order/place` | `POST` | Buyer | Convert bag to order & deduct inventory stock |
| `/order/my-orders` | `GET` | Buyer | Customer order history & timeline tracking |
| `/order/seller-orders` | `GET` | Seller | Store owner order management |
| `/order/status/:orderId` | `PUT` | Seller | Update order shipping status |
| `/review/product/:id` | `GET` | Public | Fetch customer reviews and star ratings |
| `/review/add` | `POST` | Buyer | Post review & recalculate average product rating |

---

## 📄 Documentation & PDF Report
A comprehensive, publication-quality technical report and interview preparation guide is available in the repository root:
- 📑 **`NUVORA_TECHNICAL_ARCHITECTURE_REPORT.pdf`**

---

## 📜 License
This project is licensed under the **MIT License** — open and free for personal and commercial development.
