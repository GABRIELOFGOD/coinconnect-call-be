import { Repository } from "typeorm";
import { User } from "../entities/userEntity";
import { AppDataSource } from "../config/dataSource";

export const userRepository: Repository<User> = AppDataSource.getRepository(User);