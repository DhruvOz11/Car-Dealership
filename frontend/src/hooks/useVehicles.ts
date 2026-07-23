import { useCallback, useState } from "react";
import { api, extractErrorMessage } from "../utils/api";
import type { CreateVehiclePayload, SearchParams, UpdateVehiclePayload, Vehicle } from "../types";

// Prisma's Decimal type serializes as a string over JSON — normalize on the way in.
const normalizeVehicle = (v: Record<string, unknown>): Vehicle => ({
  id: v.id as string,
  make: v.make as string,
  model: v.model as string,
  category: v.category as string,
  price: Number(v.price),
  quantity: Number(v.quantity),
  createdAt: v.createdAt as string | undefined,
  updatedAt: v.updatedAt as string | undefined,
});

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Record<string, unknown>[]>("/vehicles");
      setVehicles(res.data.map(normalizeVehicle));
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to load vehicles."));
    } finally {
      setLoading(false);
    }
  }, []);

  const searchVehicles = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Record<string, unknown>[]>("/vehicles/search", { params });
      setVehicles(res.data.map(normalizeVehicle));
    } catch (err) {
      setError(extractErrorMessage(err, "Search failed."));
    } finally {
      setLoading(false);
    }
  }, []);

  const purchaseVehicle = useCallback(async (id: string) => {
    setPurchaseLoading(id);
    setError(null);
    try {
      const res = await api.post<Record<string, unknown>>(`/vehicles/${id}/purchase`);
      setVehicles((curr) => curr.map((v) => (v.id === id ? normalizeVehicle(res.data) : v)));
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "Purchase failed."));
      return false;
    } finally {
      setPurchaseLoading(null);
    }
  }, []);

  const createVehicle = useCallback(async (payload: CreateVehiclePayload) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.post<Record<string, unknown>>("/vehicles", payload);
      setVehicles((curr) => [normalizeVehicle(res.data), ...curr]);
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to create vehicle."));
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const updateVehicle = useCallback(async (id: string, payload: UpdateVehiclePayload) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.put<Record<string, unknown>>(`/vehicles/${id}`, payload);
      setVehicles((curr) => curr.map((v) => (v.id === id ? normalizeVehicle(res.data) : v)));
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to update vehicle."));
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const deleteVehicle = useCallback(async (id: string) => {
    setActionLoading(true);
    setError(null);
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles((curr) => curr.filter((v) => v.id !== id));
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to delete vehicle."));
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const restockVehicle = useCallback(async (id: string, amount: number) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.post<Record<string, unknown>>(`/vehicles/${id}/restock`, { amount });
      setVehicles((curr) => curr.map((v) => (v.id === id ? normalizeVehicle(res.data) : v)));
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to restock vehicle."));
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
    vehicles,
    loading,
    actionLoading,
    purchaseLoading,
    error,
    setError,
    fetchVehicles,
    searchVehicles,
    purchaseVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    restockVehicle,
  };
};
