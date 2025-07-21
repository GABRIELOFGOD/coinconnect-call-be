import { Repository } from "typeorm";
import { User } from "../entities/userEntity";
import { AppDataSource } from "../config/dataSource";
import { Meeting } from "../entities/meetingEntity";
import { Environment } from "../entities/environmentEntity";

export const userRepository: Repository<User> = AppDataSource.getRepository(User);

export const meetRepository: Repository<Meeting> = AppDataSource.getRepository(Meeting);

export const environmentRepository: Repository<Environment> = AppDataSource.getRepository(Environment);