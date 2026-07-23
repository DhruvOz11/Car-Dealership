import 'dotenv/config';
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import cors from "cors";
import { env } from "./config/env.js";

const app: express.Application = express();

app.use(cors({ origin: ["http://localhost:5173", "https://dhruvcardealership.netlify.app"] }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);

app.listen(env.PORT, () => {
    console.log(`Server listening on http://localhost:${env.PORT}`);
});

export default app;
