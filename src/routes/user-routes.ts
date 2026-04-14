import { Router } from "express";
import { UserController } from "../controllers/user-controllers";
import { ensureAuthenticated } from "../middlewares/VerifyAuthenticated";
import { VerifyAuthenticated } from "../middlewares/verifyUserAuthorization";

const userRoutes = Router();

const userController = new UserController();

userRoutes.post("/users", userController.create);
userRoutes.get("/users", ensureAuthenticated, VerifyAuthenticated(["ADMIN"]), userController.index);
userRoutes.put("/users/perfil", ensureAuthenticated, VerifyAuthenticated(["ADMIN"]), userController.updatePerfil);

export { userRoutes };
