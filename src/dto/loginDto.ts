import { IsNotEmpty, IsString } from "class-validator";

export class loginDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}