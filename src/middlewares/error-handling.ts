import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { ZodError } from "zod";

export function errorHandling(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {

    console.log(err)

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    if (err instanceof ZodError) {
        return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: "Erro Interno do servidor" });
}