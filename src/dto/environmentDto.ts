import { IsNotEmpty, IsString } from "class-validator";

export class environmentDto {
  @IsString()
  @IsNotEmpty()
  api_key: string;

  @IsString()
  @IsNotEmpty()
  app_id: string;

  @IsString()
  @IsNotEmpty()
  api_secret: string;
}