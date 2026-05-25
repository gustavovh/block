import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { registerAdminRoutes } from "./admin/index.js";
import { registerGymRoutes } from "./gym/index.js";

const router: IRouter = Router();

router.use(healthRouter);

// Register admin routes
registerAdminRoutes(router).catch((err) => {
  console.error("Failed to register admin routes:", err);
});

// Register gym (athlete) routes
registerGymRoutes(router).catch((err) => {
  console.error("Failed to register gym routes:", err);
});

export default router;
