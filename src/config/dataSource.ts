import "reflect-metadata";
import { DataSource } from "typeorm";
import { Meeting } from "../entities/meetingEntity";
import { User } from "../entities/userEntity";
import { Environment } from "../entities/environmentEntity";

// Initialize your data source
export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  username: "root",
  password: "Opeyemi1",
  database: "videocall",
  entities: [Meeting, User, Environment],
  synchronize: true,
  driver: require("mysql2"),
});

