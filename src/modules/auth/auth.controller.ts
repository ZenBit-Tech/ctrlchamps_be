import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { User } from 'common/entities/user.entity';
import { ApiPath } from 'common/enums/api-path.enum';
import { ErrorMessage } from 'common/enums/error-message.enum';

import { AuthService } from './auth.service';
import { AccountCheckDto } from './dto/account-check.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { AuthApiPath } from './enums';
import { Token } from './types/token.type';

@ApiTags('Authorization')
@Controller(ApiPath.Auth)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(AuthApiPath.SignUp)
  @ApiOperation({ summary: 'User Sign up' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: ErrorMessage.UserEmailAlreadyExist,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async signUp(@Body() userDto: UserCreateDto): Promise<Token> {
    return this.authService.signUp(userDto);
  }

  @ApiOperation({ summary: 'Check user email and phone number' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'No existing user found with the provided credentials',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: ErrorMessage.UserEmailAlreadyExist,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(AuthApiPath.AccountCheck)
  async accountCheck(@Body() userDto: AccountCheckDto): Promise<void> {
    await this.authService.accountCheck(userDto);
  }
}
