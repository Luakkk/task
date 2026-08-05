import { IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  email!: string;

  @MinLength(8, { message: 'password must be at least 8 characters long' })
  password!: string;
}
