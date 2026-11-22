import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config({ path : '../../../../.env' });

async function authMiddleware(req, res, next) {
    // Toma del header la parte que dice "Authorization" y si esta parte no existe el valor sera ""
    const header = req.header("Authorization") || "";
    // Divide el header "Authorization" que viene de la siguiente manera: "Bearer ejvmvsdfsdn"
    const token = header.split(" ")[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied" })
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.id = payload.id;
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({ message: "Token not valid" })
    }
}

export default authMiddleware;