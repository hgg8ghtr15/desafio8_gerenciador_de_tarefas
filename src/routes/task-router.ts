import { Router } from "express";

import { TaskController } from "../controllers/task-controller";
import { VerifyAuthenticated } from "../middlewares/VerifyAuthenticated";
import { VerifyUserAuthorization } from "../middlewares/verifyUserAuthorization";

const taskController = new TaskController();

const taskRouter = Router();
taskRouter.use(VerifyAuthenticated, VerifyUserAuthorization(["ADMIN", "MEMBER"]))

taskRouter.post("/task", taskController.create);
taskRouter.get("/task", taskController.index);
taskRouter.put("/task/:id", taskController.update);
taskRouter.delete("/task/:id", taskController.delete);
taskRouter.patch("/task/:id/assign", taskController.assign)

export { taskRouter };