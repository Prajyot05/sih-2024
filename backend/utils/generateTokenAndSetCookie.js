import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });

    res.cookie("jwtToken", token, {
        httpOnly: true, // Cannot be accessed via javascript. This prevents an attack called XSS
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // Prevents an attack called CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return token;
}