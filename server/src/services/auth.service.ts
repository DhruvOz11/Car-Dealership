import * as bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { signJwt } from "../utils/jwt.js";
import type { LoginInput, RegisterInput } from "../validators/auth.validator.js";

const SALT_ROUNDS = 10;

import { env } from "../config/env.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const registerUser = async (input: RegisterInput) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
    });

    if (existingUser) {
        throw new Error("EMAIL_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            password: hashedPassword,
            role: "USER",
        },
    });

    const token = signJwt({ userId: user.id, role: user.role });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};

export const loginUser = async (input: LoginInput) => {
    const user = await prisma.user.findUnique({
        where: { email: input.email },
    });

    console.log(user);

    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    console.log("is password valid: ", isPasswordValid);

    if (!isPasswordValid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const token = signJwt({ userId: user.id, role: user.role });

    console.log(token)

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};

export const loginWithGoogle = async (credential: string) => {
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
        throw new Error("INVALID_CREDENTIALS");
    }

    let user = await prisma.user.findUnique({
        where: { email: payload.email },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                name: payload.name || "Google User",
                email: payload.email,
                password: "", // OAuth users don't need a local password
                role: "USER",
            },
        });
    }

    const token = signJwt({ userId: user.id, role: user.role });
    
    return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
    };
};
