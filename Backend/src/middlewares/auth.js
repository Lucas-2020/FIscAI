// src/middlewares/auth.js
const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
    const h = req.headers.authorization || "";
    const [, token] = h.split(" ");

    if (!token) return res.status(401).json({ message: "unauthorized" });

    try {
        req.auth = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        return next();
    } catch {
        return res.status(401).json({ message: "invalid_token" });
    }
};