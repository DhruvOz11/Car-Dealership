import type { Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

export const register = async (req: Request, res: Response) => {
    const parseResult = registerSchema.safeParse(req.body);

    console.log(parseResult);

    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
    }

    try {
        const result = await registerUser(parseResult.data);
        return res.status(201).json(result);
    } catch (error) {
        if (error instanceof Error && error.message === "EMAIL_EXISTS") {
            return res.status(409).json({ error: "Email already exists" });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    const parseResult = loginSchema.safeParse(req.body);

    console.log(parseResult);


    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
    }

    try {
        const result = await loginUser(parseResult.data);
        console.log("result", result);
        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
};
