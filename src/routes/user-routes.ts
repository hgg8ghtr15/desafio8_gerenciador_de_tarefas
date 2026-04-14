import { Router } from "express";
import { UserController } from "../controllers/user-controllers";
import { VerifyAuthenticated } from "../middlewares/VerifyAuthenticated";
import { VerifyUserAuthorization } from "../middlewares/verifyUserAuthorization";

const userRoutes = Router();

const userController = new UserController();

userRoutes.post("/users", userController.create);
userRoutes.get("/users", VerifyAuthenticated, VerifyUserAuthorization(["ADMIN"]), userController.index);
userRoutes.put("/users/perfil", VerifyAuthenticated, VerifyUserAuthorization(["ADMIN"]), userController.updatePerfil);

export { userRoutes };
