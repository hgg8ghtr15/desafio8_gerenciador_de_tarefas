import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { AppError } from "../utils/AppError";
import { z } from "zod";

const paramSchema = z.object({
    id: z.string().min(1, "ID inválido"),
})

class HistoryTaskController {
    async history(req: Request, res: Response) {
        const { id } = paramSchema.parse(req.params);

        const taskExists = await prisma.task.findUnique({
            where: { id }
        });

        if (!taskExists) {
            throw new AppError("Tarefa não encontrada", 404);
        }

        const history = await prisma.taskHistory.findMany({
            where: { taskId: id },
            include: {
                changedBy: {
                    select: {
                        name: true,
                        role: true
                    }
                }
            },
            orderBy: { changedAt: "desc" }
        });

        return res.json({ message: "Histórico da tarefa recuperado!", history });
    }
}

export { HistoryTaskController };