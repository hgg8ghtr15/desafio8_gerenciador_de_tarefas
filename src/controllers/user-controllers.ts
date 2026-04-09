import { Request, Response } from "express";

class UserController {
    async create(req: Request, res: Response) {
        return res.json({ message: "User created" });
    }
}

export { UserController };