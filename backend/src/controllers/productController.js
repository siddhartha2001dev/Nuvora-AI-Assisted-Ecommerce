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

        const newProduct = await productSchema.create({
            sellerId: req.userId,
            title,
            description,
            price: Number(price),
            discountPrice: Number(discountPrice) || 0,
            category,
            images: uploadedImages,
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

// 3. Paginate Products (with Category, Search, Price Range & Sorting filters)
export const paginateProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        const filter = { isAvailable: true };

        // Category Filter
        if (req.query.category && req.query.category !== "All") {
            filter.category = new RegExp(`^${req.query.category.trim()}$`, "i");
        }

        // Search Query Filter (Title, Description, Brand, Category)
        if (req.query.search && req.query.search.trim()) {
            const regex = new RegExp(req.query.search.trim(), "i");
            filter.$or = [
                { title: regex },
                { description: regex },
                { brand: regex },
                { category: regex }
            ];
        }

        // Price Filter (Max Price: checks discountPrice if present, else base price)
        if (req.query.maxPrice) {
            const max = Number(req.query.maxPrice);
            if (!isNaN(max) && max > 0) {
                const priceFilter = [
                    { discountPrice: { $gt: 0, $lte: max } },
                    {
                        $and: [
                            { $or: [{ discountPrice: 0 }, { discountPrice: { $exists: false } }] },
                            { price: { $lte: max } }
                        ]
                    }
                ];

                if (filter.$or) {
                    filter.$and = [{ $or: filter.$or }, { $or: priceFilter }];
                    delete filter.$or;
                } else {
                    filter.$or = priceFilter;
                }
            }
        }

        // Sorting Option
        let sortOption = { createdAt: -1 };
        if (req.query.sortBy === "Price: Low to High") {
            sortOption = { price: 1 };
        } else if (req.query.sortBy === "Price: High to Low") {
            sortOption = { price: -1 };
        } else if (req.query.sortBy === "Top Rated") {
            sortOption = { rating: -1, numReviews: -1 };
        }

        const totalProducts = await productSchema.countDocuments(filter);

        const products = await productSchema.find(filter)
            .populate("sellerId", "userName shopName email avatarUrl")
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            message: "Products fetched as per query",
            data: products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit) || 1,
            totalProducts: totalProducts
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

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Summary unavailable.";

        return res.status(200).json({ success: true, data: summary });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
