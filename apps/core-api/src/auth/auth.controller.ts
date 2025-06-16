import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '@api/auth/auth.service';
import { CreateUserDto } from '@api/auth/dto/create-user.dto';
import { SignUpResponseDto } from '@api/auth/dto/signup-reponse.dto';

@ApiTags('auth 인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입', description: '새로운 사용자를 등록합니다.' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일' })
  async signUp(@Body() dto: CreateUserDto): Promise<SignUpResponseDto> {
    const user = await this.authService.signUp(dto);

    return new SignUpResponseDto(user.email, '회원가입 완료');
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인', description: '액세스 토큰을 발급받습니다.' })
  @ApiResponse({ status: 200, description: '로그인 성공 및 토큰 발급' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  signIn(@Body() dto: CreateUserDto) {
    return this.authService.signIn(dto);
  }
}
