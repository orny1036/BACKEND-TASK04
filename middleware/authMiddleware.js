import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no token"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const query = "SELECT id, username, email, role FROM users WHERE id = ?";
        const [result] = await db.execute(query, [decoded.id]);

        if (result.length === 0) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        req.user = result[0];

        next();
        
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, token failed"
        });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: insufficient permissions"
            });
        }
        next();
    }
}