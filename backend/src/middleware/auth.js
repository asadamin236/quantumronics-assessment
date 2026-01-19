import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    const bearer = req.headers.authorization?.split(" ")[1];
    const token = bearer || req.cookies?.access_token || null;

    if (!token) return res.status(401).json({ message: "Not authorized, no token" });

    try {
        const secret = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET;
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token failed" });
    }
};

// Check if user has required role
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role ${req.user.role} is not authorized` });
        }
        next();
    };
};
