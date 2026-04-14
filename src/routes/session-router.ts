import { Router } from "express";
import { SessionController } from "../controllers/sessions-controller";
import { ensureAuthenticated } from "../middlewares/VerifyAuthenticated";

const sessionRouter = Router();

const sessionController = new SessionController();

sessionRouter.post("/login", sessionController.create);

export { sessionRouter };
