import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type Role = "USER" | "ADMIN";

export interface JwtPayload {
    userId: string;
    role: Role;
    iat?: number;
    exp?: number;
}

export const signJwt = (payload: Omit<JwtPayload, "iat" | "exp">) => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

export const verifyJwt = (token: string): JwtPayload => {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (typeof decoded !== "object" || decoded === null || !("userId" in decoded) || !("role" in decoded)) {
        throw new Error("Invalid token payload");
    }

    return decoded as JwtPayload;
};
