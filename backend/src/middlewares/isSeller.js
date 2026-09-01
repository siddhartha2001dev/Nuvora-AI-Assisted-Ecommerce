export const isSeller = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "Seller") {
            return res.status(403).json({
                success: false,
                message: "Access denied: Only sellers can perform this action"
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
