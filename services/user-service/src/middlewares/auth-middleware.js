import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config({ path : '../../../../.env' });

async function authMiddleware(req, res, next) {
    const header = req.header("Authorization") || "";
    const token = header.split(" ")[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied" })
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.username = payload.username;
        next();
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "Token not valid" })
    }
}

export default authMiddleware;