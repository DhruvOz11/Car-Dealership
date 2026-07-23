import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().nonempty(),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Environment validation failed", parsed.error.format());
    throw new Error("Invalid environment variables");
}

export const env = {
    ...parsed.data,
    PORT: parsed.data.PORT ? Number(parsed.data.PORT) : 3000,
};
