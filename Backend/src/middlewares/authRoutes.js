// src/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

function signAccess(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
}
function signRefresh(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });
}

router.post("/refresh", (req, res) => {
    const rt = req.cookies?.refresh_token;
    if (!rt) return res.status(401).json({ message: "no_refresh" });

    try {
        const payload = jwt.verify(rt, process.env.JWT_REFRESH_SECRET);
        const accessToken = signAccess({ id_usuario: payload.id_usuario });
        return res.json({ accessToken });
    } catch {
        return res.status(401).json({ message: "invalid_refresh" });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("refresh_token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });
    return res.json({ ok: true });
});

module.exports = router;