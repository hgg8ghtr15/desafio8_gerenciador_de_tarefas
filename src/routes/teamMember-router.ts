import { Router } from "express";
import { TeamMemberController } from "../controllers/teamMember-controller";
import { VerifyAuthenticated } from "../middlewares/VerifyAuthenticated";
import { VerifyUserAuthorization } from "../middlewares/verifyUserAuthorization";

const teamMemberRouter = Router();

const teamMemberController = new TeamMemberController();

teamMemberRouter.use(VerifyAuthenticated, VerifyUserAuthorization(["ADMIN"]));

teamMemberRouter.post("/teammember", teamMemberController.create);
teamMemberRouter.get("/teammember", teamMemberController.index);
teamMemberRouter.delete("/teammember/:id", teamMemberController.delete);

export { teamMemberRouter };
