import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#71717A"))
        
        # Header (pages after title)
        if self._pageNumber > 1:
            self.drawString(54, 11 * 72 - 36, "NUVORA E-Commerce — Technical Architecture & Full-Stack Guide")
            self.setStrokeColor(colors.HexColor("#E4E4E7"))
            self.setLineWidth(0.5)
            self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)
        
        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 54, 36, page_str)
        self.drawString(54, 36, "Confidential — For Internal Project & Interview Preparation")
        self.setStrokeColor(colors.HexColor("#E4E4E7"))
        self.setLineWidth(0.5)
        self.line(54, 48, 8.5 * 72 - 54, 48)
        
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#09090B"),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#52525B"),
        spaceAfter=15
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#09090B"),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#18181B"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#27272A"),
        spaceAfter=6
    )
    
    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#0F172A")
    )
    
    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )
    
    td_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#18181B")
    )
    
    td_bold_style = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#09090B")
    )
    
    q_style = ParagraphStyle(
        'Question_Style',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#09090B"),
        spaceBefore=8,
        spaceAfter=2,
        keepWithNext=True
    )
    
    a_style = ParagraphStyle(
        'Answer_Style',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#3F3F46"),
        spaceAfter=6
    )

    story = []

    # --- TITLE BANNER ---
    story.append(Paragraph("NUVORA E-COMMERCE", title_style))
    story.append(Paragraph("Full-Stack Technical Architecture, Component-API Mapping & Interview Guide", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#18181B"), spaceAfter=12))

    # --- SECTION 1: EXECUTIVE SUMMARY & ARCHITECTURE ---
    story.append(Paragraph("1. Executive Summary & System Overview", h1_style))
    story.append(Paragraph(
        "<b>NUVORA</b> is a modern Direct-to-Consumer (D2C) luxury monochrome e-commerce web application. "
        "Built on a resilient <b>Single-Vendor, Multi-Buyer</b> architecture, all products are branded and fulfilled "
        "by the master store owner (Admin/Seller) while public customers register as Buyers. "
        "The application integrates an AI-powered Product Summarizer leveraging Google Gemini 3.6 Flash, real-time "
        "JWT session control, Cloudinary multi-image CDN pipelines, and a Redux Toolkit Query cache layer.",
        body_style
    ))

    # Key Architectural Highlights
    arch_data = [
        [Paragraph("Layer", th_style), Paragraph("Technology / Framework", th_style), Paragraph("Role & Core Responsibility", th_style)],
        [Paragraph("Frontend Client", td_bold_style), Paragraph("React 19 + Vite + Tailwind CSS", td_style), Paragraph("SPA client, glassmorphic UI, day/night theming, inline filters & responsive layouts", td_style)],
        [Paragraph("State & Cache", td_bold_style), Paragraph("Redux Toolkit + RTK Query", td_style), Paragraph("Centralized state, automatic tag invalidation, optimistic UI & async API hooks", td_style)],
        [Paragraph("Backend Server", td_bold_style), Paragraph("Node.js + Express.js (ES Modules)", td_style), Paragraph("RESTful API architecture, JWT token hashing, role authorization & route handlers", td_style)],
        [Paragraph("Database", td_bold_style), Paragraph("MongoDB Atlas + Mongoose ODM", td_style), Paragraph("Document store with relational ObjectId references, indexes & aggregation", td_style)],
        [Paragraph("AI Intelligence", td_bold_style), Paragraph("Google Gemini 3.6 Flash REST API", td_style), Paragraph("Real-time LLM summarizer synthesizing product attributes and buyer reviews", td_style)],
        [Paragraph("Media & Storage", td_bold_style), Paragraph("Cloudinary CDN + Multer Buffer", td_style), Paragraph("Direct memory-stream image uploading, compression & face-crop avatar rendering", td_style)],
        [Paragraph("Mailing Engine", td_bold_style), Paragraph("Nodemailer + Gmail SMTP", td_style), Paragraph("Asynchronous verification emails & password reset tokens with HTML templates", td_style)]
    ]
    t_arch = Table(arch_data, colWidths=[90, 160, 254])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#18181B")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E4E4E7")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#FAFAFA"), colors.white]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 14))

    # --- SECTION 2: COMPLETE DEPENDENCY & NPM MODULES DICTIONARY ---
    story.append(Paragraph("2. Complete Dependency & NPM Modules Dictionary", h1_style))
    story.append(Paragraph(
        "Below is a structured breakdown of all packages installed in the backend and frontend, "
        "detailing why each was chosen and its technical implementation purpose:",
        body_style
    ))

    # Backend Dependencies Table
    story.append(Paragraph("Backend Dependencies (backend/package.json)", h2_style))
    backend_deps = [
        [Paragraph("Package", th_style), Paragraph("Version", th_style), Paragraph("Technical Purpose & Role", th_style)],
        [Paragraph("express", td_bold_style), Paragraph("^4.21.2", td_style), Paragraph("Core HTTP web framework providing routing, middleware chaining, and REST API handling.", td_style)],
        [Paragraph("mongoose", td_bold_style), Paragraph("^8.8.4", td_style), Paragraph("ODM (Object Data Modeling) library managing schemas, model validation, and MongoDB indexing.", td_style)],
        [Paragraph("jsonwebtoken", td_bold_style), Paragraph("^9.0.2", td_style), Paragraph("Generates and verifies cryptographic JSON Web Tokens (JWT) for stateless user authentication.", td_style)],
        [Paragraph("bcrypt", td_bold_style), Paragraph("^5.1.1", td_style), Paragraph("Salts and hashes passwords before database insertion, protecting user credentials against leaks.", td_style)],
        [Paragraph("cloudinary", td_bold_style), Paragraph("^2.5.1", td_style), Paragraph("Cloud media management SDK allowing direct streaming of product photos and buyer avatars.", td_style)],
        [Paragraph("multer", td_bold_style), Paragraph("^1.4.5-lts.1", td_style), Paragraph("Multipart/form-data middleware reading uploaded binary files into memory buffers for Cloudinary.", td_style)],
        [Paragraph("nodemailer", td_bold_style), Paragraph("^6.9.16", td_style), Paragraph("Transports transactional emails (welcome verification links and password recovery tokens).", td_style)],
        [Paragraph("dotenv", td_bold_style), Paragraph("^16.4.7", td_style), Paragraph("Loads environment variables from hidden .env files into Node's process.env global object.", td_style)],
        [Paragraph("cors", td_bold_style), Paragraph("^2.8.5", td_style), Paragraph("Enables Cross-Origin Resource Sharing, allowing frontend requests from http://localhost:5173.", td_style)],
        [Paragraph("joi", td_bold_style), Paragraph("^17.13.3", td_style), Paragraph("Schema description language and data validator enforcing request payload contracts on register/login.", td_style)],
        [Paragraph("crypto", td_bold_style), Paragraph("Native Node", td_style), Paragraph("Generates secure SHA-256 tokens for session identification and email verification hashes.", td_style)]
    ]
    t_back = Table(backend_deps, colWidths=[90, 60, 354])
    t_back.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#27272A")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E4E4E7")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#FAFAFA"), colors.white]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_back)
    story.append(Spacer(1, 10))

    # Frontend Dependencies Table
    story.append(Paragraph("Frontend Dependencies (Frontend/package.json)", h2_style))
    frontend_deps = [
        [Paragraph("Package", th_style), Paragraph("Version", th_style), Paragraph("Technical Purpose & Role", th_style)],
        [Paragraph("react", td_bold_style), Paragraph("^19.0.0", td_style), Paragraph("Component-based UI library powering virtual DOM rendering and dynamic state management.", td_style)],
        [Paragraph("react-dom", td_bold_style), Paragraph("^19.0.0", td_style), Paragraph("DOM renderer; powers createPortal for full-screen modals overlaying the entire document body.", td_style)],
        [Paragraph("react-router-dom", td_bold_style), Paragraph("^7.1.5", td_style), Paragraph("Declarative client-side routing, URL search params synchronization, and route guards.", td_style)],
        [Paragraph("@reduxjs/toolkit", td_bold_style), Paragraph("^2.5.1", td_style), Paragraph("Standard Redux toolset with createApi, createSlice, and normalized global store setup.", td_style)],
        [Paragraph("react-redux", td_bold_style), Paragraph("^9.2.0", td_style), Paragraph("React bindings providing useSelector and useDispatch hooks for store subscription.", td_style)],
        [Paragraph("react-icons", td_bold_style), Paragraph("^5.4.0", td_style), Paragraph("Optimized SVG icon library (Heroicons v1/v2) with zero unnecessary bundle bloat.", td_style)],
        [Paragraph("react-hot-toast", td_bold_style), Paragraph("^2.5.2", td_style), Paragraph("Lightweight, accessible toast notification system for instant user feedback.", td_style)],
        [Paragraph("tailwindcss", td_bold_style), Paragraph("^3.4.17", td_style), Paragraph("Utility-first CSS framework delivering responsive, glassmorphic, and dark-mode styling.", td_style)],
        [Paragraph("vite", td_bold_style), Paragraph("^6.1.0", td_style), Paragraph("Next-generation frontend tooling providing lightning-fast HMR and optimized Rollup production builds.", td_style)]
    ]
    t_front = Table(frontend_deps, colWidths=[110, 60, 334])
    t_front.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#27272A")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E4E4E7")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#FAFAFA"), colors.white]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_front)
    story.append(PageBreak())

    # --- SECTION 3: DATABASE SCHEMA & DATA MODELS ---
    story.append(Paragraph("3. Database Schema & Data Models", h1_style))
    story.append(Paragraph(
        "The backend utilizes MongoDB with Mongoose ODM models designed around single-vendor integrity, "
        "referential consistency, and high-performance querying:",
        body_style
    ))

    schema_data = [
        [Paragraph("Model", th_style), Paragraph("Collection", th_style), Paragraph("Key Fields & Types", th_style), Paragraph("Business Constraints & Relationships", th_style)],
        [Paragraph("User", td_bold_style), Paragraph("users", td_style), Paragraph("userName (Str), email (Str, unique), password (Hash), phone, role (Buyer/Seller), avatarUrl, isVerified (Bool)", td_style), Paragraph("All public signups default to 'Buyer'. 1 Admin account is designated 'Seller'.", td_style)],
        [Paragraph("Product", td_bold_style), Paragraph("products", td_style), Paragraph("sellerId (Ref User), title, description, price, discountPrice, category, images [Str], stock, rating, numReviews, isAvailable", td_style), Paragraph("Stores catalog items. Indexed by category, price, and text fields for search.", td_style)],
        [Paragraph("Cart", td_bold_style), Paragraph("carts", td_style), Paragraph("userId (Ref User), productId (Ref Product), quantity (Num, min:1)", td_style), Paragraph("Isolated per buyer. Quantity updates & removals automatically trigger price recalculations.", td_style)],
        [Paragraph("Wishlist", td_bold_style), Paragraph("wishlists", td_style), Paragraph("userId (Ref User), productId (Ref Product)", td_style), Paragraph("Unique compound index on (userId + productId) prevents duplicate saves.", td_style)],
        [Paragraph("Order", td_bold_style), Paragraph("orders", td_style), Paragraph("buyerId (Ref User), sellerId (Ref User), items [{productId, quantity, price}], totalAmount, shippingAddress, paymentMethod, paymentStatus, orderStatus", td_style), Paragraph("Statuses: Placed → Processing → Shipped → Delivered / Cancelled. Supports COD & Razorpay.", td_style)],
        [Paragraph("Review", td_bold_style), Paragraph("reviews", td_style), Paragraph("productId (Ref Product), userId (Ref User), rating (1-5), comment (Str)", td_style), Paragraph("Real buyer feedback. Dynamically recalculates product rating average & numReviews.", td_style)],
        [Paragraph("Session", td_bold_style), Paragraph("sessions", td_style), Paragraph("userId (Ref User), token (Str), expiresAt (Date)", td_style), Paragraph("Active user session management supporting single/multi-device logout & token invalidation.", td_style)]
    ]
    t_schema = Table(schema_data, colWidths=[65, 60, 190, 189])
    t_schema.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#18181B")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E4E4E7")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#FAFAFA"), colors.white]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_schema)
    story.append(Spacer(1, 14))

    # --- SECTION 4: BACKEND REST API ENDPOINTS DIRECTORY ---
    story.append(Paragraph("4. Backend REST API Endpoints Directory", h1_style))
    
    api_data = [
        [Paragraph("Method & Route", th_style), Paragraph("Auth Guard", th_style), Paragraph("Controller Action & Responsibility", th_style)],
        [Paragraph("POST /user/register", td_bold_style), Paragraph("Public", td_style), Paragraph("Validates Joi schema, hashes password, saves Buyer account, dispatches verification email.", td_style)],
        [Paragraph("POST /user/login", td_bold_style), Paragraph("Public", td_style), Paragraph("Verifies credentials, checks isVerified status, generates signed JWT token.", td_style)],
        [Paragraph("DELETE /user/logout", td_bold_style), Paragraph("JWT Auth", td_style), Paragraph("Invalidates active session token and clears user state.", td_style)],
        [Paragraph("GET /user/profile", td_bold_style), Paragraph("JWT Auth", td_style), Paragraph("Fetches logged-in user profile with populated avatar and role data.", td_style)],
        [Paragraph("PUT /user/profile", td_bold_style), Paragraph("JWT Auth", td_style), Paragraph("Updates user personal info (name, phone, address, email uniqueness check).", td_style)],
        [Paragraph("PUT /user/profile/picture", td_bold_style), Paragraph("JWT (Buyer)", td_style), Paragraph("Uploads profile avatar buffer to Cloudinary with face crop transformation (Buyer-only).", td_style)],
        [Paragraph("PUT /user/change-password", td_bold_style), Paragraph("JWT Auth", td_style), Paragraph("Verifies current password hash and replaces with new bcrypt hashed password.", td_style)],
        [Paragraph("POST /user/forgot-password", td_bold_style), Paragraph("Public", td_style), Paragraph("Generates 15-minute reset token and sends HTML email via Nodemailer.", td_style)],
        [Paragraph("POST /user/reset-password", td_bold_style), Paragraph("Public", td_style), Paragraph("Validates reset token and sets new password in MongoDB.", td_style)],
        [Paragraph("GET /product/paginate", td_bold_style), Paragraph("Public", td_style), Paragraph("Unified catalogue filter (category, maxPrice, search regex, sortBy, page & limit).", td_style)],
        [Paragraph("GET /product/:id", td_bold_style), Paragraph("Public", td_style), Paragraph("Returns single product details populated with seller info.", td_style)],
        [Paragraph("GET /product/:id/ai-summary", td_bold_style), Paragraph("Public", td_style), Paragraph("Google Gemini 3.6 Flash AI engine synthesizes product specs & customer reviews.", td_style)],
        [Paragraph("POST /product/add", td_bold_style), Paragraph("JWT (Seller)", td_style), Paragraph("Uploads product images to Cloudinary and creates new product in database.", td_style)],
        [Paragraph("PUT /product/:id", td_bold_style), Paragraph("JWT (Seller)", td_style), Paragraph("Updates product details, stock, pricing, and availability.", td_style)],
        [Paragraph("DELETE /product/:id", td_bold_style), Paragraph("JWT (Seller)", td_style), Paragraph("Deletes store product by ID.", td_style)],
        [Paragraph("GET /cart", td_bold_style), Paragraph("JWT (Buyer)", td_style), Paragraph("Returns buyer cart items populated with product details.", td_style)],
        [Paragraph("POST /cart/add", td_bold_style), Paragraph("JWT (Buyer)", td_style), Paragraph("Adds item or increments quantity in buyer shopping bag.", td_style)],
        [Paragraph("DELETE /cart/remove/:productId", td_bold_style), Paragraph("JWT (Buyer)", td_style), Paragraph("Removes product from buyer cart.", td_style)],
        [Paragraph("GET /wishlist", td_bold_style), Paragraph("JWT (Buyer)", td_style), Paragraph("Returns buyer saved wishlist items.", td_style)],
        [Paragraph("POST /wishlist/add", td_bold_style), Paragraph("JWT (Buyer)", td_style), Paragraph("Saves product to buyer wishlist.", td_style)],
        [Paragraph("DELETE /wishlist/remove/:productId", td_bold_style), Paragraph("JWT (Buyer)", td_style), Paragraph("Removes item from wishlist.", td_style)],
        [Paragraph("POST /order/place", td_bold_style), Paragraph("JWT (Buyer)", td_style), Paragraph("Converts cart into confirmed order, reduces stock, and clears buyer cart.", td_style)],
        [Paragraph("GET /order/my-orders", td_bold_style), Paragraph("JWT (Buyer)", td_style), Paragraph("Returns customer order history with item status and tracking info.", td_style)],
        [Paragraph("GET /order/seller-orders", td_bold_style), Paragraph("JWT (Seller)", td_style), Paragraph("Returns all store customer orders for store owner fulfillment.", td_style)],
        [Paragraph("PUT /order/status/:orderId", td_bold_style), Paragraph("JWT (Seller)", td_style), Paragraph("Updates order status (Placed → Processing → Shipped → Delivered).", td_style)],
        [Paragraph("GET /review/product/:productId", td_bold_style), Paragraph("Public", td_style), Paragraph("Fetches all reviews for a specific product populated with user avatars.", td_style)],
        [Paragraph("POST /review/add", td_bold_style), Paragraph("JWT (Buyer)", td_style), Paragraph("Submits 1-5 star review and recalculates product overall rating.", td_style)]
    ]
    t_api = Table(api_data, colWidths=[150, 70, 284])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#18181B")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E4E4E7")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#FAFAFA"), colors.white]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(t_api)
    story.append(PageBreak())

    # --- SECTION 5: FRONTEND COMPONENTS & API INTEGRATION MAPPING ---
    story.append(Paragraph("5. Frontend Components & API Integration Mapping", h1_style))
    story.append(Paragraph(
        "Every page and component in NUVORA connects directly to Redux RTK Query hooks. "
        "Here is the comprehensive mapping of which component executes which API:",
        body_style
    ))

    comp_data = [
        [Paragraph("Component / Page", th_style), Paragraph("File Path", th_style), Paragraph("RTK Query Hook(s)", th_style), Paragraph("How & When It Is Implemented", th_style)],
        [
            Paragraph("Home", td_bold_style),
            Paragraph("Pages/Public/Home.jsx", td_style),
            Paragraph("useGetPaginatedProductsQuery", td_bold_style),
            Paragraph("Fetches catalog products on mount; passes live category, price slider, search, and sort params to backend.", td_style)
        ],
        [
            Paragraph("Shop", td_bold_style),
            Paragraph("Pages/Public/Shop.jsx", td_style),
            Paragraph("useGetPaginatedProductsQuery", td_bold_style),
            Paragraph("Full catalogue browser; passes URL params & filter states; renders inline mobile accordion and numbered pagination.", td_style)
        ],
        [
            Paragraph("ProductDetails", td_bold_style),
            Paragraph("Pages/Public/ProductDetails.jsx", td_style),
            Paragraph("useGetProductDetailsQuery\nuseGetProductReviewsQuery\nuseLazyGetProductAiSummaryQuery\nuseAddToCartMutation\nuseAddToWishlistMutation", td_bold_style),
            Paragraph("Renders product gallery, price, stock, and reviews. 'Summarize with AI' triggers lazy Gemini summary inside a createPortal modal.", td_style)
        ],
        [
            Paragraph("ProductCard", td_bold_style),
            Paragraph("Components/Product/ProductCard.jsx", td_style),
            Paragraph("useAddToCartMutation\nuseAddToWishlistMutation\nuseRemoveFromWishlistMutation\nuseGetWishlistQuery", td_bold_style),
            Paragraph("Reusable card component on Home & Shop. Handles 1-click Add to Bag and Wishlist toggling with optimistic toast feedback.", td_style)
        ],
        [
            Paragraph("Navbar", td_bold_style),
            Paragraph("Components/Common/Navbar.jsx", td_style),
            Paragraph("useGetCartQuery\nuseGetWishlistQuery\nuseLogoutMutation", td_bold_style),
            Paragraph("Shows live cart item count badge, wishlist count badge, active user avatar, and manages logout session invalidation.", td_style)
        ],
        [
            Paragraph("Login & Register", td_bold_style),
            Paragraph("Pages/Auth/Login.jsx\nPages/Auth/Register.jsx", td_style),
            Paragraph("useLoginMutation\nuseRegisterMutation", td_bold_style),
            Paragraph("Authenticates users, dispatches authSlice setCredentials with token & user info, and clears form fields on mount.", td_style)
        ],
        [
            Paragraph("Forgot & Reset Pass", td_bold_style),
            Paragraph("Pages/Auth/ForgotPassword.jsx\nPages/Auth/ResetPassword.jsx", td_style),
            Paragraph("useForgotPasswordMutation\nuseResetPasswordMutation", td_bold_style),
            Paragraph("Dispatches reset link email via Nodemailer and updates new password via token authentication.", td_style)
        ],
        [
            Paragraph("Cart & OrderSummary", td_bold_style),
            Paragraph("Pages/Customer/Cart.jsx\nComponents/Cart/OrderSummary.jsx", td_style),
            Paragraph("useGetCartQuery\nuseRemoveFromCartMutation\nuseAddToCartMutation", td_bold_style),
            Paragraph("Manages shopping bag items, dynamic quantity adjustment, discount deductions, shipping calculations, and checkout routing.", td_style)
        ],
        [
            Paragraph("WishList", td_bold_style),
            Paragraph("Pages/Customer/WishList.jsx", td_style),
            Paragraph("useGetWishlistQuery\nuseRemoveFromWishlistMutation\nuseAddToCartMutation", td_bold_style),
            Paragraph("Displays customer favorite saved pieces with direct 1-click 'Move to Bag' and removal actions.", td_style)
        ],
        [
            Paragraph("CheckOut", td_bold_style),
            Paragraph("Pages/Customer/CheckOut.jsx", td_style),
            Paragraph("useGetCartQuery\nusePlaceOrderMutation", td_bold_style),
            Paragraph("Collects delivery address, phone number, and payment method (COD / Razorpay simulated) and places order.", td_style)
        ],
        [
            Paragraph("MyOrders", td_bold_style),
            Paragraph("Pages/Customer/MyOrders.jsx", td_style),
            Paragraph("useGetMyOrdersQuery\nuseCancelOrderMutation", td_bold_style),
            Paragraph("Renders customer order history, live fulfillment timeline badges (Placed/Shipped/Delivered), and order cancellation.", td_style)
        ],
        [
            Paragraph("Profile", td_bold_style),
            Paragraph("Pages/Customer/Profile.jsx", td_style),
            Paragraph("useGetProfileQuery\nuseUpdateProfileMutation\nuseUploadProfilePictureMutation\nuseChangePasswordMutation", td_bold_style),
            Paragraph("Displays user info, allows Buyer avatar photo upload to Cloudinary, profile details update, and password changes.", td_style)
        ],
        [
            Paragraph("SellerDashboard", td_bold_style),
            Paragraph("Pages/Seller/SellerDashboard.jsx", td_style),
            Paragraph("useGetSellerProductsQuery\nuseDeleteProductMutation\nuseUpdateProductMutation", td_bold_style),
            Paragraph("Store owner admin panel: calculates total catalog revenue, active stock, and enables instant inline product edits & deletions.", td_style)
        ],
        [
            Paragraph("AddProduct", td_bold_style),
            Paragraph("Pages/Seller/AddProduct.jsx", td_style),
            Paragraph("useCreateProductMutation", td_bold_style),
            Paragraph("Store owner product creator with multi-image Cloudinary upload, category tagging, pricing, and stock assignment.", td_style)
        ],
        [
            Paragraph("SellerOrders", td_bold_style),
            Paragraph("Pages/Seller/SellerOrders.jsx", td_style),
            Paragraph("useGetSellerOrdersQuery\nuseUpdateOrderStatusMutation", td_bold_style),
            Paragraph("Live order management for store owner to process, mark as Shipped or Delivered, and view customer shipping details.", td_style)
        ],
        [
            Paragraph("ReviewSection", td_bold_style),
            Paragraph("Components/Product/ReviewSection.jsx", td_style),
            Paragraph("useGetProductReviewsQuery\nuseAddReviewMutation", td_bold_style),
            Paragraph("Renders customer ratings & feedback; enables verified buyers to submit 1-5 star reviews with instant cache refresh.", td_style)
        ]
    ]
    t_comp = Table(comp_data, colWidths=[90, 110, 140, 164])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#18181B")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E4E4E7")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#FAFAFA"), colors.white]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_comp)
    story.append(PageBreak())

    # --- SECTION 6: CORE SPECIALIZED FEATURES DEEP-DIVE ---
    story.append(Paragraph("6. Core Specialized Features Deep-Dive", h1_style))

    story.append(Paragraph("A. Google Gemini 3.6 Flash AI Summarizer Architecture", h2_style))
    story.append(Paragraph(
        "Instead of sending generic descriptions to third-party scrapers, NUVORA uses Google's latest Gemini 3.6 Flash "
        "model via REST calling directly from Node.js (without heavy SDK overhead). When a user clicks <i>Summarize with AI</i>, "
        "the backend fetches the exact product data and all MongoDB customer reviews, constructing a structured prompt: "
        "<font face='Courier' size='8'>Analyze this product (Title, Specs, Price, Stock) along with all buyer reviews and output exactly 3 bullet points: 1. Design & Look, 2. Value/Price Analysis, 3. Buying Verdict.</font> "
        "The frontend renders the output in a glassmorphic modal wrapped with React <font face='Courier' size='8'>createPortal(..., document.body)</font> "
        "and <font face='Courier' size='8'>z-[99999] backdrop-blur-2xl</font> for 100% full-screen coverage.",
        body_style
    ))

    story.append(Paragraph("B. Unified Multi-Filter & Search Engine (paginateProducts)", h2_style))
    story.append(Paragraph(
        "All catalogue queries (Search, Category Filter, Price Range, and Sorting) are handled through one single unified "
        "controller. MongoDB dynamically constructs a filter object: case-insensitive category matching (<font face='Courier' size='8'>new RegExp</font>), "
        "text search across title/description/brand/category with <font face='Courier' size='8'>$or</font>, and dynamic price comparisons "
        "evaluating both base price and discounted price. This prevents scattered endpoints and allows buyers to filter by Category + Price + Search + Sort simultaneously.",
        body_style
    ))

    story.append(Paragraph("C. Cloudinary Media Pipeline & Buyer Profile Picture", h2_style))
    story.append(Paragraph(
        "Product photos and user avatars are processed through Multer's in-memory storage buffer. The memory buffer streams "
        "directly into Cloudinary's upload stream. For Buyer avatars, Cloudinary applies an automated transformation "
        "(<font face='Courier' size='8'>width: 400, height: 400, crop: 'fill', gravity: 'face'</font>) ensuring crisp, perfectly cropped avatars.",
        body_style
    ))

    story.append(Paragraph("D. Day/Night Monochrome Theming Engine", h2_style))
    story.append(Paragraph(
        "Built using React Context API (<font face='Courier' size='8'>ThemeContext.jsx</font>), the application toggles between a "
        "sleek Deep Obsidian Night Theme (#09090b) and a Crisp Luxe Day Theme (#f8f9fa). The active theme is persisted in "
        "<font face='Courier' size='8'>localStorage('nuvora_theme')</font> and applied via CSS root variables across all components.",
        body_style
    ))

    story.append(Spacer(1, 14))

    # --- SECTION 7: FULL-STACK INTERVIEW QUESTIONS & ANSWERS ---
    story.append(Paragraph("7. Comprehensive Full-Stack Interview Questions & Answers", h1_style))
    story.append(Paragraph(
        "These questions and detailed answers represent common interview scenarios specifically based on this project:",
        body_style
    ))

    qa_list = [
        (
            "Q1: Why did you choose Redux Toolkit Query (RTK Query) over standard useEffect + Axios/fetch?",
            "Ans: RTK Query eliminates hundreds of lines of boilerplate code by handling data fetching, automatic caching, loading/error states, and polling out of the box. Its tag-based invalidation system ('invalidatesTags' and 'providesTags') automatically refetches the cart and wishlist whenever a user adds or removes an item, ensuring all components stay synchronized without manual state lifting or duplicate requests."
        ),
        (
            "Q2: How is the Single-Vendor Multi-Buyer architecture secured in the backend?",
            "Ans: Security is enforced at both route middleware and database query levels. The JWT token payload contains the user's role ('Buyer' or 'Seller'). Middlewares like 'hashToken' verify the cryptographic signature, while role-guards ensure only Sellers can access '/product/add' or update order statuses. Conversely, public registration strictly hardcodes role='Buyer' to prevent privilege escalation."
        ),
        (
            "Q3: How does the Google Gemini AI Summarizer work and why is it superior to static summaries?",
            "Ans: The AI summarizer dynamically pulls real-time database context (product specifications, price, and authentic customer reviews) and prompts Gemini 3.6 Flash via REST to synthesize a 3-part shopping insight (Design, Price/Value, and Buying Verdict). Because it ingests real user reviews from MongoDB, the summary evolves as customers post new feedback."
        ),
        (
            "Q4: Why did you use React createPortal for the AI Modal instead of normal nested component rendering?",
            "Ans: In complex layouts with parent containers having 'overflow-x: hidden' or fixed z-indexes, a nested modal can be clipped or layered beneath fixed navigation headers. React's 'createPortal(modal, document.body)' mounts the modal DOM directly to <body>, guaranteeing 100% viewport coverage and seamless backdrop blurring regardless of parent CSS constraints."
        ),
        (
            "Q5: How do you prevent sensitive environment variables and API keys from leaking to GitHub?",
            "Ans: All secrets (MongoDB URI, JWT secret, Cloudinary keys, Email passwords, and Gemini API key) are stored in 'backend/.env'. Both the root '.gitignore' and 'backend/.gitignore' strictly exclude '.env' and '.env.*' from git tracking. A safe '.env.example' is committed with placeholder values to guide other developers without exposing real credentials."
        ),
        (
            "Q6: How does the Unified Search and Filtering controller optimize database performance?",
            "Ans: In 'productController.paginateProducts', MongoDB handles filtering, sorting, and pagination in a single query pipeline using '.find(filter).sort(sortOption).skip(skip).limit(limit)'. This avoids in-memory Javascript filtering and network overhead by letting the database return only the exact 8-9 items needed for the current page."
        ),
        (
            "Q7: Explain the password recovery flow and how you prevent token replay attacks.",
            "Ans: When a user requests a password reset, the backend generates a short-lived (15-minute) JWT token containing the user's ID, signed with the server's secret key. When the reset link is clicked, the token is verified and immediately invalidated upon password replacement, preventing any replay or reuse of the reset link."
        )
    ]

    for q, a in qa_list:
        story.append(KeepTogether([
            Paragraph(q, q_style),
            Paragraph(a, a_style)
        ]))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {filename}")

if __name__ == "__main__":
    output_pdf = "d:/OneDrive/Desktop/nuvora-fs/NUVORA_TECHNICAL_ARCHITECTURE_REPORT.pdf"
    build_pdf(output_pdf)
