import multer from "multer";

// Store file in memory as buffer (best for direct Cloudinary upload)
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB max file size
    }
});
