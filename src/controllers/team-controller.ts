import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { AppError } from "../utils/AppError";
import { z } from "zod";

async function teamExists(id: string) {
    const teamExists = await prisma.team.findUnique({
        where: {
            id
        },
    })

    if (!teamExists) {
        throw new AppError("Team não encontrado", 404);
    }
}

class TeamController {

    //   id          String @id @default(uuid())
    //   name        String
    //   description String

    //   createdAt   DateTime @default (now()) @map("created_at")
    //   updatedAt   DateTime ? @updatedAt @map("updated_at")
    //   teamMembers TeamMember[]
    //   tasks       Task[]


    async create(req: Request, res: Response) {
        const bodySchema = z.object({
            name: z.string().min(3, "O nome deve ter no Minimo 3 caracteres.").max(100),
            description: z.string().min(3, "A descrição deve ter no Minimo 3 caracteres.").max(255),
        })

        const { name, description } = bodySchema.parse(req.body);

        const team = await prisma.team.create({
            data: {
                name,
                description,
            },
        })

        return res.json({ message: "Team criado com sucesso!" });
    }

    async index(req: Request, res: Response) {
        const teams = await prisma.team.findMany(
            // {
            //     include: {
            //         teamMembers: {
            //             include: {
            //                 user: true,
            //             }
            //         },
            //         tasks: {
            //             include: {
            //                 taskHistories: true,
            //             }
            //         }
            //     }
            // }
        );

        return res.json({ message: "Team listado com sucesso!", teams });
    }

    async update(req: Request, res: Response) {
        const paramsSchema = z.object({
            id: z.string(),
        })

        const { id } = paramsSchema.parse(req.params);

        const bodySchema = z.object({
            name: z.string().min(3, "O nome deve ter no Minimo 3 caracteres.").max(100),
            description: z.string().min(3, "A descrição deve ter no Minimo 3 caracteres.").max(255),
        })

        const { name, description } = bodySchema.parse(req.body);

        await teamExists(id);

        const team = await prisma.team.update({
            where: {
                id
            },
            data: {
                name,
                description,
            },
        })

        return res.json({ message: "Team atualizado com sucesso!" });
    }

    async delete(req: Request, res: Response) {
        const paramsSchema = z.object({
            id: z.string(),
        })

        const { id } = paramsSchema.parse(req.params);

        await teamExists(id);

        const team = await prisma.team.delete({
            where: {
                id
            },
        })

        return res.json({ message: "Team deletado com sucesso!" });
    }
}

export { TeamController };