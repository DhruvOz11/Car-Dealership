import { prisma } from "../lib/prisma.js";
import type { CreateVehicleInput, RestockVehicleInput, SearchVehicleParams, UpdateVehicleInput } from "../validators/vehicle.validator.js";

export const createVehicle = async (input: CreateVehicleInput) => {
    return prisma.vehicle.create({
        data: {
            make: input.make,
            model: input.model,
            category: input.category,
            price: input.price,
            quantity: input.quantity,
        },
    });
};

export const getVehicles = async () => {
    return prisma.vehicle.findMany({
        orderBy: [{ createdAt: "desc" }],
    });
};

export const searchVehicles = async (params: SearchVehicleParams) => {
    const filters: Record<string, unknown> = {};

    if (params.make) {
        filters.make = { contains: params.make, mode: "insensitive" };
    }

    if (params.model) {
        filters.model = { contains: params.model, mode: "insensitive" };
    }

    if (params.category) {
        filters.category = { contains: params.category, mode: "insensitive" };
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
        filters.price = {
            ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
            ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
        };
    }

    return prisma.vehicle.findMany({
        where: filters,
        orderBy: [{ createdAt: "desc" }],
    });
};

export const getVehicleById = async (id: string) => {
    return prisma.vehicle.findUnique({
        where: { id },
    });
};

export const updateVehicle = async (id: string, input: UpdateVehicleInput) => {
    const data = {
        ...(input.make !== undefined ? { make: input.make } : {}),
        ...(input.model !== undefined ? { model: input.model } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
    };

    return prisma.vehicle.update({
        where: { id },
        data,
    });
};

export const deleteVehicle = async (id: string) => {
    return prisma.vehicle.delete({
        where: { id },
    });
};

export const purchaseVehicle = async (id: string) => {
    return prisma.$transaction(async (tx) => {
        const updateResult = await tx.vehicle.updateMany({
            where: {
                id,
                quantity: { gt: 0 },
            },
            data: {
                quantity: { decrement: 1 },
            },
        });

        if (updateResult.count === 0) {
            const existingVehicle = await tx.vehicle.findUnique({
                where: { id },
            });

            if (!existingVehicle) {
                throw new Error("VEHICLE_NOT_FOUND");
            }

            throw new Error("OUT_OF_STOCK");
        }

        const updatedVehicle = await tx.vehicle.findUnique({
            where: { id },
        });

        if (!updatedVehicle) {
            throw new Error("VEHICLE_NOT_FOUND");
        }

        return updatedVehicle;
    });
};

export const restockVehicle = async (id: string, input: RestockVehicleInput) => {
    return prisma.$transaction(async (tx) => {
        const updateResult = await tx.vehicle.updateMany({
            where: { id },
            data: {
                quantity: { increment: input.amount },
            },
        });

        if (updateResult.count === 0) {
            throw new Error("VEHICLE_NOT_FOUND");
        }

        const updatedVehicle = await tx.vehicle.findUnique({
            where: { id },
        });

        if (!updatedVehicle) {
            throw new Error("VEHICLE_NOT_FOUND");
        }

        return updatedVehicle;
    });
};
