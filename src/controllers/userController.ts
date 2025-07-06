import { NextFunction, Response } from "express";
import { Request } from "../types/user";
import { AppError } from "../middleware/error.middleware";
import { StatusCode } from "../utils/statusCode";
import { userRepository } from "../utils/repository";

export class UserController {
  constructor(){}

  async userProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findOne({
        where: {
          id: req.user.id
        }
      });

      if (!user) return next(new AppError("User not found", StatusCode.NOT_FOUND));
      res.json(user);
    } catch (error) {
      throw error;
    }
  }
}