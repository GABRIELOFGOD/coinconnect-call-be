import { NextFunction, Response } from "express";
import { Request } from "../types/user";
import { plainToInstance } from "class-transformer";
import { environmentDto } from "../dto/environmentDto";
import { validate } from "class-validator";
import { AppError } from "../middleware/error.middleware";
import { StatusCode } from "../utils/statusCode";
import { environmentRepository, userRepository } from "../utils/repository";

export class EnvironmentController {

  async createEnvironment(req: Request, res: Response, next: NextFunction) {
    try {
      const variables = plainToInstance(environmentDto, req.body);

      const errors = await validate(variables);
      if (errors.length > 0) return next(new AppError(errors.map(err => Object.values(err.constraints || {})).join(", "), StatusCode.BAD_REQUEST));

      const user = await userRepository.findOne({
        where: {
          id: req.user.id
        }
      });
      if (!user) return next(new AppError("User not found", StatusCode.NOT_FOUND));

      await environmentRepository.save(variables);

      res.status(StatusCode.CREATED).json({
        message: "Environment Variables created"
      });

    } catch (error) {
      throw error;
    }
  }

  async setEnvironment(req: Request, res: Response, next: NextFunction) {
    try {
      const variables = plainToInstance(environmentDto, req.body);

      const errors = await validate(variables);
      if (errors.length > 0) return next(new AppError(errors.map(err => Object.values(err.constraints || {})).join(", "), StatusCode.BAD_REQUEST));

      const { id } = req.params;

      if (!id) return next(new AppError("Environment ID not found", StatusCode.BAD_REQUEST));

      const environment = await environmentRepository.findOne({
        where: { id }
      });

      if (!environment) return next(new AppError("Environment ID not found", StatusCode.BAD_REQUEST));

      const user = await userRepository.findOne({
        where: {
          id: req.user.id
        }
      });
      if (!user) return next(new AppError("User not found", StatusCode.NOT_FOUND));

      environmentRepository.merge(environment, variables);
      await environmentRepository.save(environment);

      res.json({
        message: "Update successful"
      })

    } catch (error) {
      throw error;
    }
  }

  async getEnvironment(req: Request, res: Response, next: NextFunction) {
    try {
      const environments = await environmentRepository.find();
      if (!environments || environments.length < 1) return next(new AppError("Variables not set yet", StatusCode.NOT_FOUND));

      res.json(environments[0]);
    } catch (error) {
      throw error;
    }
  }
  
}