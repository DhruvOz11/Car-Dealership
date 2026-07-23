import * as bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { signJwt } from "../utils/jwt.js";
import type { LoginInput, RegisterInput } from "../validators/auth.validator.js";

const SALT_ROUNDS = 10;

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
