import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt.js";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication token missing" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Authentication token missing" });
    }

    try {
        const payload = verifyJwt(token);
        req.user = {
            id: payload.userId,
            role: payload.role,
        };
        return next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
