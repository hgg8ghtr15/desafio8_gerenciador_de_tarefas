import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../database/prisma";
import { AppError } from "../utils/AppError";
import bcrypt from "bcrypt";

/*
  id       String @id @default (uuid())
  name     String @db.VarChar(100)
  email    String @unique @db.VarChar(150)
  password String @db.VarChar(255)
  role     Role @default (MEMBER)
  createdAt DateTime @default (now()) @map("created_at")
  updatedAt DateTime ? @updatedAt @map("updated_at")
  teamMembers   TeamMember[]
  tasks         Task[]
  taskHistories TaskHistory[]
*/

async function userExists(email: string) {
    const userExists = await prisma.user.findUnique({
        where: {
            email,
        },
    })

    if (userExists) {
        throw new AppError("Email já cadastrado", 400);
    }
}


class UserController {
    async create(req: Request, res: Response) {

        const bodySchema = z.object({
            name: z.string().min(3, "O nome deve ter no Minimo 3 caracteres.").max(100),
            email: z.email("Deve ser um email valido"),
            password: z.string().min(6, "A senha deve ter no Minimo 6 caracteres.").max(255),
            role: z.enum(["ADMIN", "MEMBER"]),
        })

        const { name, email, password, role } = bodySchema.parse(req.body)

        await userExists(email);

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        })

        const { password: _, ...userWithoutPassword } = user;

        return res.json({ message: "Usuário inserido com Sucesso", user: userWithoutPassword });
    }


}

export { UserController, userExists };