import { Router } from "express";

import { userRoutes } from "./user-routes";
import { sessionRouter } from "./session-router";

const router = Router();

router.use(userRoutes);
router.use(sessionRouter);


export { router };