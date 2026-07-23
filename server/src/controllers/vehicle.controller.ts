import type { Request, Response } from "express";
import type { CreateVehicleInput, RestockVehicleInput, SearchVehicleParams, UpdateVehicleInput, VehicleIdParams } from "../validators/vehicle.validator.js";
import { createVehicle, deleteVehicle, getVehicleById, getVehicles, purchaseVehicle, restockVehicle, searchVehicles, updateVehicle } from "../services/vehicle.service.js";
import { createVehicleSchema, restockVehicleSchema, searchVehicleSchema, updateVehicleSchema, vehicleIdSchema } from "../validators/vehicle.validator.js";

export const create = async (req: Request, res: Response) => {
    const parseResult = createVehicleSchema.safeParse(req.body);

    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
    }

    try {
        const vehicle = await createVehicle(parseResult.data as CreateVehicleInput);
        return res.status(201).json(vehicle);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const list = async (_req: Request, res: Response) => {
    try {
        const vehicles = await getVehicles();
        return res.status(200).json(vehicles);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const search = async (req: Request, res: Response) => {
    const parseResult = searchVehicleSchema.safeParse(req.query);

    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
    }

    try {
        const vehicles = await searchVehicles(parseResult.data as SearchVehicleParams);
        return res.status(200).json(vehicles);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getById = async (req: Request, res: Response) => {
    const parseResult = vehicleIdSchema.safeParse(req.params);

    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
    }

    try {
        const vehicle = await getVehicleById(parseResult.data.id);

        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }

        return res.status(200).json(vehicle);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const update = async (req: Request, res: Response) => {
    const paramsResult = vehicleIdSchema.safeParse(req.params);
    const bodyResult = updateVehicleSchema.safeParse(req.body);

    if (!paramsResult.success) {
        return res.status(400).json({ error: paramsResult.error.flatten() });
    }

    if (!bodyResult.success) {
        return res.status(400).json({ error: bodyResult.error.flatten() });
    }

    try {
        const vehicle = await getVehicleById(paramsResult.data.id);

        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }

        const updated = await updateVehicle(paramsResult.data.id, bodyResult.data as UpdateVehicleInput);
        return res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const purchase = async (req: Request, res: Response) => {
    const parseResult = vehicleIdSchema.safeParse(req.params);

    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
    }

    try {
        const updated = await purchaseVehicle(parseResult.data.id);
        return res.status(200).json(updated);
    } catch (error) {
        if (error instanceof Error && error.message === "VEHICLE_NOT_FOUND") {
            return res.status(404).json({ error: "Vehicle not found" });
        }

        if (error instanceof Error && error.message === "OUT_OF_STOCK") {
            return res.status(409).json({ error: "Vehicle is out of stock" });
        }

        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const restock = async (req: Request, res: Response) => {
    const paramsResult = vehicleIdSchema.safeParse(req.params);
    const bodyResult = restockVehicleSchema.safeParse(req.body);

    if (!paramsResult.success) {
        return res.status(400).json({ error: paramsResult.error.flatten() });
    }

    if (!bodyResult.success) {
        return res.status(400).json({ error: bodyResult.error.flatten() });
    }

    try {
        const updated = await restockVehicle(paramsResult.data.id, bodyResult.data as RestockVehicleInput);
        return res.status(200).json(updated);
    } catch (error) {
        if (error instanceof Error && error.message === "VEHICLE_NOT_FOUND") {
            return res.status(404).json({ error: "Vehicle not found" });
        }

        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const remove = async (req: Request, res: Response) => {
    const parseResult = vehicleIdSchema.safeParse(req.params);

    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
    }

    try {
        const vehicle = await getVehicleById(parseResult.data.id);

        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" });
        }

        await deleteVehicle(parseResult.data.id);
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
