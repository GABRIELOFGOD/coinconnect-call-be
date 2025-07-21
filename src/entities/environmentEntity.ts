import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("environment")
export class Environment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  api_key: string;

  @Column()
  app_id: string;

  @Column()
  api_secret: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}