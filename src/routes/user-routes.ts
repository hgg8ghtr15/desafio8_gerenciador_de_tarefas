import { Router } from "express";
import { UserController } from "../controllers/user-controllers";

const userRoutes = Router();

const userController = new UserController();

userRoutes.post("/users", userController.create);

export { userRoutes };
