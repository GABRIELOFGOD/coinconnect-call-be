import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class MeetDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  meetingId: string;
}