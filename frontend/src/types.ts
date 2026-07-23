export type Role = "ADMIN" | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type CreateVehiclePayload = Omit<Vehicle, "id" | "createdAt" | "updatedAt">;
export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

export interface SearchParams {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}
