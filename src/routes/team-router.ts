import { Router } from "express";
import { TeamController } from "../controllers/team-controller";
import { VerifyAuthenticated } from "../middlewares/VerifyAuthenticated";
import { VerifyUserAuthorization } from "../middlewares/verifyUserAuthorization";

const teamRouter = Router();

const teamController = new TeamController();

teamRouter.use(VerifyAuthenticated, VerifyUserAuthorization(["ADMIN"]));
teamRouter.post("/team", teamController.create);
teamRouter.get("/team", teamController.index);
teamRouter.put("/team/:id", teamController.update);
teamRouter.delete("/team/:id", teamController.delete);

export { teamRouter };