import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterAdminDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  specialization: string;
}
