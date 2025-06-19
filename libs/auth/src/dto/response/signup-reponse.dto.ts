import { ApiProperty } from '@nestjs/swagger';
import { User } from '@app/user/domain/user';

export class SignUpResponseDto {
  @ApiProperty({ example: 1, description: '사용자 ID' })
  id: number;

  @ApiProperty({ example: 'test@example.com', description: '사용자 이메일' })
  email: string;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
  }
}
