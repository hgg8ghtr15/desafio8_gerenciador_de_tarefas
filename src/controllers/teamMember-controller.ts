import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { AppError } from "../utils/AppError";
import { z } from "zod";

// Dica 1: Extrair a validação (Zod) para o escopo do arquivo poupa recriação
// desse objeto cada vez que a rota é chamada. Como a criação e a remoção
// precisam exatamente dos mesmos campos no seu cenário atual, reaproveitamos!
const bodySchema = z.object({
    teamId: z.string().min(1, "Team ID inválido"),
    userId: z.string().min(1, "User ID inválido"),
});

class TeamMemberController {
    async create(req: Request, res: Response) {
        const { teamId, userId } = bodySchema.parse(req.body);

        // Dica 2: "Promise.all" executa essas 3 buscar no banco ao mesmo tempo (em paralelo).
        // Isso deixa sua API muito mais rápida do que validar 1 por 1 sequencialmente.
        const [teamExists, userExists, userAlreadyInTeam] = await Promise.all([
            prisma.team.findUnique({ where: { id: teamId } }),
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.teamMember.findFirst({ where: { userId, teamId } })
        ]);

        if (!teamExists) throw new AppError("Team não encontrado", 404);
        if (!userExists) throw new AppError("User não encontrado", 404);
        if (userAlreadyInTeam) throw new AppError("User já é membro deste time", 400);

        const teamMember = await prisma.teamMember.create({
            data: { teamId, userId },
        });

        // Dica 3: Sempre retorne '201 Created' em rotas POST que criam recursos.
        return res.status(201).json({ message: "Team Member criado com sucesso!", teamMember });
    }

    async index(req: Request, res: Response) {
        const teamMembers = await prisma.teamMember.findMany();
        return res.json({ message: "Team Member listado com sucesso!", teamMembers });
    }

    async delete(req: Request, res: Response) {
        // Como você optou por deletar recebendo teamId e userId (Opção 2 anterior),
        // nós pegamos ele do body. E ignoramos o :id da URL.
        const { teamId, userId } = bodySchema.parse(req.body);

        // Dica 4: Limpeza do Lixo Mágico! Se eu quero remover um vínculo entre 
        // User e Team, não preciso verificar se o Time existe e se o User existe.
        // Basta eu procurar SE a conexão deles existe. Se sim, eu deleto!
        const membership = await prisma.teamMember.findFirst({
            where: { teamId, userId }
        });

        if (!membership) {
            throw new AppError("O usuário informado não é membro deste time.", 404);
        }

        // Como achamos a relação (membership), agora só deletamos passando a PK (id) dela:
        const teamMember = await prisma.teamMember.delete({
            where: { id: membership.id }
        });

        return res.json({ message: "Membro removido com sucesso!", teamMember });
    }
}

export { TeamMemberController }