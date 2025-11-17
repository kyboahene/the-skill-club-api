import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtGuard } from './guard';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto, RegisterCompanyDto, ForgotPaswordDto } from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/talent')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new talent' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async registerTalent(@Body() registerDto: RegisterDto) {
    return this.authService.registerTalent(registerDto);
  }

  // Talent-specific routes (aliases for clarity)
  @Post('talent/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Talent signup' })
  @ApiResponse({ status: 201, description: 'Talent registered' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async talentSignup(@Body() registerDto: RegisterDto) {
    return this.authService.registerTalent(registerDto);
  }
  
  @Post('register/company-user')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new company user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async registerCompany(@Body() registerDto: RegisterCompanyDto) {
    return this.authService.registerCompany(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('talent/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Talent login' })
  @ApiResponse({ status: 200, description: 'Talent logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async talentLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('talent/forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Talent password reset link' })
  @ApiResponse({ status: 200, description: 'Reset link sent' })
  async talentForgotPassword(@Body() dto: ForgotPaswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Post('send-verification-email')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already verified' })
  async sendVerificationEmail(@Body() body: { email: string }) {
    return this.authService.sendVerificationEmail(body.email);
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  @ApiResponse({ status: 409, description: 'Email already verified' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
