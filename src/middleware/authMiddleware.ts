import { StatusCode } from "../utils/statusCode";
import catchAsync from "./catchAsync.middleware";
import { AppError } from "./error.middleware";
import { Response, NextFunction } from "express";
import { Request } from "../types/user";
import { verifyToken } from "../services/token";

export const userAuth = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return next(new AppError('Unauthorized: Missing Authorization header', StatusCode.UNAUTHORIZED));
  }

  const tokenParts = authHeader.split(' ');

  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return next(new AppError('Unauthorized: Invalid Authorization header format', StatusCode.UNAUTHORIZED));
  }

  const token = tokenParts[1];

  if (!token) {
    return next(new AppError('Unauthorized: Token is missing', StatusCode.UNAUTHORIZED));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    return next(new AppError('Unauthorized: Invalid Token', StatusCode.UNAUTHORIZED));
  }
});