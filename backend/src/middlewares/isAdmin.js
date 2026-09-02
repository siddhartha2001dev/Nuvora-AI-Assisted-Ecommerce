export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || (req.user.role !== "Admin" && req.user.role !== "Seller")) {
            return res.status(403).json({
                success: false,
                message: "Access denied: Only admins can perform this action"
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
