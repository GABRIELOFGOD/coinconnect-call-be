import { NextFunction, Response } from "express";
import { Request } from "../types/user";
import { plainToInstance } from "class-transformer";
import { loginDto } from "../dto/loginDto";
import { validate } from "class-validator";
import { StatusCode } from "../utils/statusCode";
import { AppError } from "../middleware/error.middleware";
import { userRepository } from "../utils/repository";
import { createToken } from "../services/token";
import { comparePassword, encryptPassword } from "../services/password";
import catchAsync from "../middleware/catchAsync.middleware";
import { UserRegisterDto } from "../dto/userRegister.dto";

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const userLogin = plainToInstance(loginDto, req.body);

      const errors = await validate(userLogin);
      if (errors.length > 0) return next(new AppError(errors.map(err => Object.values(err.constraints || {})).join(", "), StatusCode.BAD_REQUEST)); 

      const user = await userRepository.findOne({
        where: {
          email: userLogin.email
        }
      });

      if (!user) return next(new AppError("Invalid credentials", StatusCode.BAD_REQUEST));

      const correctPassword = await comparePassword(userLogin.password, user.password);

      if (!correctPassword) return next(new AppError("Invalid credentials", StatusCode.BAD_REQUEST));

      const token = createToken(user.id, user.email);

      // const { password, ...otherData } = user;

      res.json({
        message: "Login successful",
        token
      })
    } catch (error) {
      throw error;
    }
  }

  registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Convert request body to UserRegisterDto instance
    const userRegisterDto = plainToInstance(UserRegisterDto, req.body);

    // Validate the DTO
    const errors = await validate(userRegisterDto);
    if (errors.length > 0) return next(new AppError(errors.map(err => Object.values(err.constraints || {})).join(", "), StatusCode.BAD_REQUEST));

    const userExists = await userRepository.findOne({
      where: { email: userRegisterDto.email }
    });

    if (userExists) return next(new AppError("User Exists, use another email account", StatusCode.CONFLICT));

    const hashedPassword = await encryptPassword(userRegisterDto.password);
    userRegisterDto.password = hashedPassword;

    const newUser = userRepository.create(userRegisterDto);
    await userRepository.save(newUser);

    // const { password, role, ...otherData } = newUser;

    res.status(StatusCode.CREATED).json({
      message: "User registered successfully"
    });
  });
}