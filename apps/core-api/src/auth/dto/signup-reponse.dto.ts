import { ApiProperty } from '@nestjs/swagger';

export class SignUpResponseDto {
  @ApiProperty({
    example: 'test@example.com',
    description: '가입된 사용자의 이메일',
  })
  email: string;

  @ApiProperty({
    example: '회원가입이 성공적으로 완료되었습니다.',
    description: '성공 메시지',
  })
  message: string;

  constructor(email: string, message: string) {
    this.email = email;
    this.message = message;
  }
}
