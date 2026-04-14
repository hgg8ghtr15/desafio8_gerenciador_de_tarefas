import { Router } from "express";

import { userRoutes } from "./user-routes";
import { sessionRouter } from "./session-router";
import { teamRouter } from "./team-router";


const router = Router();

router.use(userRoutes);
router.use(sessionRouter);
router.use(teamRouter);


export { router };