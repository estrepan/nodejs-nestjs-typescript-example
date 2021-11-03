import { Controller, HttpCode, HttpStatus, Post, Body, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOkResponse, ApiUnauthorizedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AuthService } from '../services';
import {
  LoginDto,
  SignupDto,
  LoginResponse,
  SignupResponse,
  ForgotPasswordResponse,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../dto';
import { AuthGuard } from '../../../auth';
import { IsGuest } from '../../../decorators';
import { Response, responseResolve } from '../../../common';
import { Login, User } from '../../../interfaces';

@Controller(process.env.LOCAL_RUNNING ? 'auth' : '')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AuthController {
  constructor(
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
  ) { }

  @Post('login')
  @IsGuest()
  @HttpCode(HttpStatus.OK)
  @ApiTags('auth')
  @ApiOkResponse({
    type: LoginResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid user email or password.',
  })
  public async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    const data: Login = await this.authService.login(dto);

    return responseResolve(data);
  }

  @Post('signup')
  @IsGuest()
  @HttpCode(HttpStatus.OK)
  @ApiTags('auth')
  @ApiOkResponse({
    type: SignupResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @ApiUnauthorizedResponse({
    description: 'The email address is already in use by another account.',
  })
  public async signUp(@Body() dto: SignupDto): Promise<Response> {
    const data: User = await this.authService.signup(dto);

    return responseResolve(data);
  }

  @Post('forgot-password')
  @IsGuest()
  @HttpCode(HttpStatus.OK)
  @ApiTags('auth')
  @ApiOkResponse({
    type: ForgotPasswordResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  public async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<Response> {
    const data: string = await this.authService.forgotPassword(dto);

    return responseResolve(data);
  }

  @Post('reset-password')
  @IsGuest()
  @HttpCode(HttpStatus.OK)
  @ApiTags('auth')
  @ApiOkResponse({
    type: ForgotPasswordResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  public async resetPassword(@Body() dto: ResetPasswordDto): Promise<Response> {
    const data: string = await this.authService.resetPassword(dto);

    return responseResolve(data);
  }
}
