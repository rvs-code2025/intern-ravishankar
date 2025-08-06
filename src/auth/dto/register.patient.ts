import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterPatinetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(9)
  password: string;
}
