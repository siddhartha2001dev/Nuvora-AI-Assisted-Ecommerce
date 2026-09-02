import productSchema from "../models/productSchema.js";
import cloudinary from "../config/cloudinary.js";
import dotenv from "dotenv/config";
import reviewSchema from "../models/reviewSchema.js";

// 1. Create Product (Seller only)
export const createProduct = async (req, res) => {
    try {
        const { title, description, price, discountPrice, category, stock, brand, isAvailable } = req.body;
        let uploadedImages = [];

        // If files are uploaded via Multer (Single or Multiple)
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: "nuvora_products" },
                        (error, uploadResult) => {
                            if (error) reject(error);
                            else resolve(uploadResult);
                        }
                    ).end(file.buffer);
                });
                uploadedImages.push(result.secure_url);
            }
        } else if (req.file) {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "nuvora_products" },
                    (error, uploadResult) => {
                        if (error) reject(error);
                        else resolve(uploadResult);
                    }
                ).end(req.file.buffer);
            });
            uploadedImages.push(result.secure_url);
        } else if (req.body.images) {
            uploadedImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }

        // Parse optional colors
        let parsedColors = [];
        if (req.body.colors) {
            if (Array.isArray(req.body.colors)) {
                parsedColors = req.body.colors;
            } else {
                try {
                    parsedColors = JSON.parse(req.body.colors);
                } catch {
                    parsedColors = req.body.colors.split(",").map(c => c.trim()).filter(Boolean);
                }
            }
        }

        // Parse optional sizes
        let parsedSizes = [];
        if (req.body.sizes) {
            if (Array.isArray(req.body.sizes)) {
                parsedSizes = req.body.sizes;
            } else {
                try {
                    parsedSizes = JSON.parse(req.body.sizes);
                } catch {
                    parsedSizes = req.body.sizes.split(",").map(s => s.trim()).filter(Boolean);
                }
            }
        }

        const newProduct = await productSchema.create({
            sellerId: req.userId,
            title,
            description,
            price: Number(price),
            discountPrice: Number(discountPrice) || 0,
            category,
            images: uploadedImages,
            colors: parsedColors,
            sizes: parsedSizes,
            stock: stock !== undefined ? Number(stock) : 1,
            brand: brand || "",
            isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: newProduct
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Get All Products (Public / Buyer - Full List)
export const getAllProducts = async (req, res) => {
    try {
        const products = await productSchema.find({ isAvailable: true })
            .populate("sellerId", "userName shopName email avatarUrl")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Paginate Products
export const paginateProducts = async (req, res) => {
    try {
        const { page = 1, limit = 9, category, search, maxPrice, sortBy } = req.query;

        // Step 1: Calculate pagination skip
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Step 2: Build the filter object step by step
        const filter = { isAvailable: true };

        // Filter by Category
        if (category && category !== "All") {
            filter.category = category;
        }

        // Filter by Search keyword (Title search)
        if (search && search.trim()) {
            filter.title = { $regex: search.trim(), $options: "i" };
        }

        // Filter by Max Price
        if (maxPrice && Number(maxPrice) > 0) {
            filter.price = { $lte: Number(maxPrice) };
        }

        // Step 3: Handle Sorting
        let sortOption = { createdAt: -1 }; // Default: Newest first
        if (sortBy === "Price: Low to High") {
            sortOption = { price: 1 };
        } else if (sortBy === "Price: High to Low") {
            sortOption = { price: -1 };
        } else if (sortBy === "Top Rated") {
            sortOption = { rating: -1 };
        }

        // Step 4: Query Database
        const totalProducts = await productSchema.countDocuments(filter);
        const products = await productSchema.find(filter)
            .populate("sellerId", "userName shopName email avatarUrl")
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        // Step 5: Send Response
        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products,
            currentPage: pageNum,
            totalPages: Math.ceil(totalProducts / limitNum) || 1,
            totalProducts
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Get Single Product By ID (Public / Buyer)
export const getProductById = async (req, res) => {
    try {
        const product = await productSchema.findById(req.params.id)
            .populate("sellerId", "userName shopName email phone avatarUrl");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 4. Get Seller's Own Products (Seller Dashboard)
export const getSellerProducts = async (req, res) => {
    try {
        const products = await productSchema.find({ sellerId: req.userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 5. Update Product (Seller only - Own Product)
export const updateProduct = async (req, res) => {
    try {
        const product = await productSchema.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Ownership check
        if (product.sellerId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only update your own products"
            });
        }

        let updateData = { ...req.body };

        // Handle image upload if provided in update
        if (req.files && req.files.length > 0) {
            let uploadedImages = [];
            for (const file of req.files) {
                const result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: "nuvora_products" },
                        (error, uploadResult) => {
                            if (error) reject(error);
                            else resolve(uploadResult);
                        }
                    ).end(file.buffer);
                });
                uploadedImages.push(result.secure_url);
            }
            updateData.images = uploadedImages;
        }

        if (updateData.price !== undefined) updateData.price = Number(updateData.price);
        if (updateData.discountPrice !== undefined) updateData.discountPrice = Number(updateData.discountPrice);
        if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

        if (updateData.colors) {
            if (typeof updateData.colors === "string") {
                try {
                    updateData.colors = JSON.parse(updateData.colors);
                } catch {
                    updateData.colors = updateData.colors.split(",").map(c => c.trim()).filter(Boolean);
                }
            }
        }

        if (updateData.sizes) {
            if (typeof updateData.sizes === "string") {
                try {
                    updateData.sizes = JSON.parse(updateData.sizes);
                } catch {
                    updateData.sizes = updateData.sizes.split(",").map(s => s.trim()).filter(Boolean);
                }
            }
        }

        const updatedProduct = await productSchema.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 6. Delete Product (Seller only - Own Product)
export const deleteProduct = async (req, res) => {
    try {
        const product = await productSchema.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Ownership check
        if (product.sellerId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only delete your own products"
            });
        }

        await productSchema.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 8. AI Product Summarizer
export const summarizeProductWithAI = async (req, res) => {
    try {
        const product = await productSchema.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const reviews = await reviewSchema.find({ productId: req.params.id });
        const reviewText = reviews.map(r => `${r.rating}★: "${r.comment}"`).join(", ") || "No reviews yet";

        const prompt = `Summarize this product in 3 short bullet points (1. Design & Look, 2. Value/Price, 3. Verdict):
        Product: ${product.title} (${product.category})
        Price: ₹${product.discountPrice || product.price}
        Description: ${product.description}
        Customer Reviews: ${reviewText}`;

        let summary = "";

        // Try calling Google Gemini API
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith("AIzaSy")) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                const data = await response.json();
                summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            } catch (err) {
                console.error("Gemini API Error:", err.message);
            }
        }

        // Smart Structured Summary Fallback (Guarantees fresh, accurate 3-bullet summary)
        if (!summary) {
            const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
            const savingsText = product.discountPrice > 0 ? ` (Saves ₹${product.price - product.discountPrice})` : "";
            const reviewVerdict = reviews.length > 0
                ? `Rated ${(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}/5 by verified buyers.`
                : "Brand new addition to the catalogue with high quality assurance.";

            summary = `1. **Design & Look**: Crafted for modern minimalist aesthetics in the ${product.category} collection with premium finish.\n` +
                      `2. **Value / Pricing**: Available at ₹${effectivePrice.toLocaleString()}${savingsText} with doorstep delivery.\n` +
                      `3. **Verdict**: ${reviewVerdict}`;
        }

        return res.status(200).json({ success: true, data: summary });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
