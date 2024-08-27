import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.jwtToken;
    if(!token) return res.status(201).json({success: false, message: "Unauthorized - No Token provided"});
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) return res.status(201).json({success: false, message: "Unauthorized - Invalid Token"});

        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log(`Error in verifyToken: ${error}`);
        return res.status(200).json({success: false, message: "Server Error"});
    }
}