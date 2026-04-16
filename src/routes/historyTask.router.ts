import { Router } from "express";
import { HistoryTaskController } from "../controllers/historyTask-controller";

const historyTaskRouter = Router();
const controller = new HistoryTaskController();

historyTaskRouter.get("/historytask/:id", controller.history);

export { historyTaskRouter };