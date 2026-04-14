import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { verify } from "jsonwebtoken";
import { authConfig } from "../config/auth";

// Define o formato dos dados (payload) que estão dentro do JWT
interface TokenPayload {
    sub: string;
    role: string;
}

//ensureAuthenticated = garantirAutenticado
export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    // Tenta pegar o cabeçalho de autorização da requisição
    const authHeader = req.headers.authorization;

    // Se o cabeçalho não existir (nenhum token enviado), bloqueia e lança erro 401
    if (!authHeader) {
        throw new AppError("Token não fornecido", 401);
    }

    // O header vem no formato "Bearer [token]". Ignoramos o "Bearer" e pegamos apenas a segunda parte (o token).
    const [, token] = authHeader.split(" ");

    try {
        // Tenta decodificar e verificar o token. 
        // ATENÇÃO: a string vazia "" no segundo parâmetro deve ser substituída pelo seu JWT Secret (ex: authConfig.jwt.secret)
        const { sub, role } = verify(token, authConfig.jwt.secret) as TokenPayload;

        // Se deu certo, extraímos o id (sub = subject) e a role, e injetamos dentro da requisição (req.user)
        req.user = {
            id: sub,
            role
        }

        // Tudo certo com a autenticação. Permite que o Express continue e vá para a rota/controller.
        return next();
    } catch {
        // Se o token for inválido, adulterado ou expirado, o block catch é acionado.
        throw new AppError("Token inválido", 401);
    }
}