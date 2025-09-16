import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

export const createToken = (id: string, email: string) => {
  const token = jwt.sign({ id, email }, "mysecureverysecuresecret", { expiresIn: "7d" });
  return token;
}

export const verifyToken = (token: string) => {
  try {
    const verified = jwt.verify(token, "mysecureverysecuresecret");
    return verified;
  } catch (error) {
    throw error;
  }
};