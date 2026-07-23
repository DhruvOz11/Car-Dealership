import { z } from "zod";

const parseNumberQuery = z.preprocess((value) => {
    if (typeof value === "string" && value.trim() !== "") {
        const result = Number(value);
        return Number.isNaN(result) ? value : result;
    }
    return value;
}, z.number().nonnegative());

export const createVehicleSchema = z.object({
    make: z.string().trim().min(1, "Make is required"),
    model: z.string().trim().min(1, "Model is required"),
    category: z.string().trim().min(1, "Category is required"),
    price: z.number().positive("Price must be greater than 0"),
    quantity: z.number().int("Quantity must be an integer").min(0, "Quantity cannot be negative"),
});

export const updateVehicleSchema = createVehicleSchema.partial().refine((data) => {
    return Object.values(data).some((value) => value !== undefined);
}, {
    message: "At least one field is required",
});

export const vehicleIdSchema = z.object({
    id: z.string().uuid("Invalid vehicle id"),
});

export const searchVehicleSchema = z.object({
    make: z.string().trim().min(1).optional(),
    model: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    minPrice: parseNumberQuery.optional(),
    maxPrice: parseNumberQuery.optional(),
}).refine((data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
    }
    return true;
}, {
    message: "minPrice must be less than or equal to maxPrice",
    path: ["maxPrice"],
});

export const restockVehicleSchema = z.object({
    amount: z.number().int("Amount must be an integer").positive("Amount must be greater than 0"),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleIdParams = z.infer<typeof vehicleIdSchema>;
export type SearchVehicleParams = z.infer<typeof searchVehicleSchema>;
export type RestockVehicleInput = z.infer<typeof restockVehicleSchema>;
