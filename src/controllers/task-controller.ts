import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { z } from "zod";
import { AppError } from "../utils/AppError";
import { TaskStatus, Priority } from "../generated/prisma";

//   Task
//   id          String @id @default(uuid())
//   title       String
//   description String

//   status   TaskStatus @default(PENDING)
//   priority Priority   @default(MEDIUM)

//   assignedUserId String
//   assignedUser   User   @relation(fields: [assignedUserId], references: [id])

//   teamId String
//   team   Team   @relation(fields: [teamId], references: [id])

//   createdAt     DateTime      @default(now()) @map("created_at")
//   updatedAt     DateTime?     @updatedAt @map("updated_at")
//   taskHistories TaskHistory[]

//   TaskHistory
//   id String @id @default(uuid())

//   changedById String
//   changedBy   User   @relation(fields: [changedById], references: [id])

//   taskId String
//   task   Task   @relation(fields: [taskId], references: [id])

//   oldStatus TaskStatus
//   newStatus TaskStatus

//   changedAt DateTime @default(now()) @map("changed_at")

//   @@map("task_histories")

// Dica 1: Extrair a validação (Zod) para o escopo do arquivo poupa recriação
// desse objeto cada vez que a rota é chamada.
const bodySchema = z.object({
    title: z.string().min(1, "Título inválido"),
    description: z.string().min(1, "Descrição inválida"),
    status: z.enum(["CREATED", "PENDING", "IN_PROGRESS", "COMPLETED"]).optional().default("CREATED"),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional().default("HIGH"),
    assignedUserId: z.string().min(1, "User ID inválido"),
    teamId: z.string().min(1, "Team ID inválido"),
});

const updateSchema = z.object({
    title: z.string().min(1, "Título inválido").optional(),
    description: z.string().min(1, "Descrição inválida").optional(),
    status: z.enum(["CREATED", "PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
    assignedUserId: z.string().min(1, "User ID inválido").optional(),
    teamId: z.string().min(1, "Team ID inválido").optional(),
});

const assignSchema = z.object({
    userId: z.string("User ID inválido"),
});

const paramSchema = z.object({
    id: z.string().min(1, "ID inválido"),
})

const querySchema = z.object({
    status: z.enum(["CREATED", "PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
});

class TaskController {
    async create(req: Request, res: Response) {
        const { title, description, status, priority, assignedUserId, teamId } = bodySchema.parse(req.body);
        console.log(status)

        // Dica 2: "Promise.all" executa buscas no banco ao mesmo tempo (em paralelo).
        const [teamExists, userExists] = await Promise.all([
            prisma.team.findUnique({ where: { id: teamId } }),
            prisma.user.findUnique({ where: { id: assignedUserId } })
        ]);

        if (!teamExists) throw new AppError("Team não encontrado", 404);
        if (!userExists) throw new AppError("Usuário não encontrado", 404);

        const task = await prisma.task.create({
            data: {
                title,
                description,
                status: status as TaskStatus,
                priority: priority as Priority,
                assignedUserId,
                teamId
            },
        });

        await prisma.taskHistory.create({
            data: {
                taskId: task.id,
                changedById: req.user!.id, // ID de quem fez a requisição (o autor)
                oldStatus: task.status,
                newStatus: task.status,
            }
        })
        // Dica 3: Sempre retorne '201 Created' em rotas POST que criam recursos.
        return res.status(201).json({ message: "Task criada com sucesso!", task });
    }

    async index(req: Request, res: Response) {
        const { status, priority } = querySchema.parse(req.query);

        const tasks = await prisma.task.findMany({
            where: {
                status: status as TaskStatus,
                priority: priority as Priority
            }
        });

        return res.json({ message: "Tarefas listadas com sucesso!", tasks });
    }

    async update(req: Request, res: Response) {

        const { id } = paramSchema.parse(req.params);
        const data = updateSchema.parse(req.body);

        const taskExists = await prisma.task.findUnique({
            where: { id }
        });

        if (!taskExists) {
            throw new AppError("Tarefa não encontrada", 404);
        }

        // Se houver tentativa de atualizar time ou usuário, validar se o novo registro existe
        if (data.teamId || data.assignedUserId) {
            const checks = [];
            if (data.teamId) {
                checks.push(
                    prisma.team.findUnique({ where: { id: data.teamId } }).then(team => {
                        if (!team) throw new AppError("Team não encontrado", 404);
                    })
                );
            }
            if (data.assignedUserId) {
                checks.push(
                    prisma.user.findUnique({ where: { id: data.assignedUserId } }).then(user => {
                        if (!user) throw new AppError("Assigned User não encontrado", 404);
                    })
                );
            }
            await Promise.all(checks);
        }



        const task = await prisma.task.update({
            where: { id },
            data: data as any // O Prisma tem um tipo estrito (XOR) que as vezes conflita com objetos opcionais do Zod. O cast resolve isso.
        });

        // Registrar o log de status apenas se o status estiver sendo alterado
        if (data.status && data.status !== taskExists.status) {
            await prisma.taskHistory.create({
                data: {
                    taskId: task.id,
                    changedById: req.user!.id,
                    oldStatus: taskExists.status,
                    newStatus: data.status, // Esse campo é obrigatório no seu schema!
                }
            });
        }

        return res.json({ message: "Tarefa atualizada com sucesso!", task });
    }

    async delete(req: Request, res: Response) {
        const { id } = paramSchema.parse(req.params);

        const taskExists = await prisma.task.findUnique({
            where: { id }
        });

        if (!taskExists) {
            throw new AppError("Tarefa não encontrada", 404);
        }

        const task = await prisma.task.delete({
            where: { id }
        });

        return res.json({ message: "Tarefa deletada com sucesso!", task });
    }


    async assign(req: Request, res: Response) {
        const { id } = paramSchema.parse(req.params);
        const { userId } = assignSchema.parse(req.body);

        // 1. Verifica se a tarefa existe
        const taskExists = await prisma.task.findUnique({ where: { id } });
        if (!taskExists) throw new AppError("Tarefa não encontrada", 404);

        // 2. Verifica se o usuário destino existe
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) throw new AppError("Usuário não encontrado", 404);

        // 3. Verifica se o usuário destino já está atribuído a essa tarefa
        if (taskExists.assignedUserId === userId) {
            throw new AppError("Usuário já atribuído a essa tarefa", 400);
        }

        // 4. Verifica se quem está fazendo a requisição pertence ao time da tarefa
        const requestingUserInTeam = await prisma.teamMember.findFirst({
            where: {
                teamId: taskExists.teamId,
                userId: userId
            },
        });
        if (!requestingUserInTeam) {
            throw new AppError("Você não pertence ao time desta tarefa", 403);
        }

        // 5. Verifica se o usuário destino também é membro do mesmo time
        const targetUserInTeam = await prisma.teamMember.findFirst({
            where: {
                teamId: taskExists.teamId,
                userId,
            },
        });
        if (!targetUserInTeam) {
            throw new AppError("O usuário não pertence ao time desta tarefa", 403);
        }

        // 6. Atribui a tarefa
        const task = await prisma.task.update({
            where: { id },
            data: { assignedUserId: userId },
        });

        return res.json({ message: "Tarefa atribuída com sucesso!", task });
    }

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

export { TaskController };