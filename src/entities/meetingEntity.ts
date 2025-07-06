import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./userEntity";

@Entity("meeting")
export class Meeting {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ unique: true })
  meetingId: string;

  @ManyToOne(() => User, (user) => user.meetings)
  createBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updated: Date;
}