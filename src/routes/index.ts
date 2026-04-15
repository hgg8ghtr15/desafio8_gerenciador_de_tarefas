import { Router } from "express";

import { userRoutes } from "./user-routes";
import { sessionRouter } from "./session-router";
import { teamRouter } from "./team-router";
import { teamMemberRouter } from "./teamMember-router";
import { taskRouter } from "./task-router";


const router = Router();

router.use(userRoutes);
router.use(sessionRouter);
router.use(teamRouter);
router.use(teamMemberRouter);
router.use(taskRouter);


export { router };