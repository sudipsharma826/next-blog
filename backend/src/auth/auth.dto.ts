import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @IsOptional()
  password?: string;
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  image?: string;
  @IsOptional()
  emailVerified?: boolean;
  @IsString()
  @IsNotEmpty()
  provider!: string;
  @IsString()
  @IsOptional()
  ipAddress?: string;
  @IsString()
  @IsOptional()
  userAgent?: string;
}
