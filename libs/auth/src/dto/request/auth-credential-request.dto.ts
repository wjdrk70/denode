import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthCredentialRequestDto {
  @ApiProperty({ example: 'test@example.com', description: '사용자 이메일' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '1234', description: '사용자 비밀번호 (8자 이상)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
