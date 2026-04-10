import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../database/prisma";
import { AppError } from "../utils/AppError";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authConfig } from "../config/auth";

class SessionController {
    async create(req: Request, res: Response) {

        const bodySchema = z.object({
            email: z.email("Deve ser um email valido"),
            password: z.string().min(6, "A senha deve ter no Minimo 6 caracteres.").max(255),
        })

        const { email, password } = bodySchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        })

        if (!user) {
            throw new AppError("E-mail ou senha invalidos", 401);
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw new AppError("E-mail ou senha invalidos", 401);
        }

        const { secret, expiresIn } = authConfig.jwt;

        const token = jwt.sign({ role: user.role ?? "MEMBER" }, secret, {
            subject: user.id,
            expiresIn: expiresIn as any
        })

        const { password: _, ...userWithoutPassword } = user;

        return res.json({ message: "Login realizado com sucesso", user: userWithoutPassword, token })
    }
}

export { SessionController }