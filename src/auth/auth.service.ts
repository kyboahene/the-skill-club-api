import {
  Injectable,
  ForbiddenException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { LoginDto, RegisterCompanyDto, RegisterDto } from './dto';
import { UsersService } from '@/users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordResetDto } from './dto/password-reset.dto';
import { ForgotPaswordDto } from './dto/forgot-password.dto';
import { RolesService } from '@/roles/roles.service';
import { CompaniesService } from '@/companies/companies.service';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
    private usersService: UsersService,
    private rolesService: RolesService,
    private companiesService: CompaniesService,
  ) {}

  async registerTalent(dto: RegisterDto) {
    try {
      await this.usersService.findByEmail(dto.email);

      if (dto.password === dto.confirmPassword) {
        throw new BadRequestException('Passwords are not the same.');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = await this.usersService.createUser({
        email: dto.email,
        fullName: dto.firstName + ' ' + dto.lastName,
        password: hashedPassword,
        status: UserStatus.PENDING,
      });

      // Create talent profile
      await this.prisma.talent.create({
        data: { userId: user.id },
      });

      // ASSIGN TALENT ROLE
      await this.rolesService.assignTalentRole(user.id, 'talent');

      // Send verification email
      await this.sendVerificationEmail(user.email);
    } catch (error) {
      throw error;
    }
  }

  async registerCompany(dto: RegisterCompanyDto) {
    try {
      // Validate email doesn't exist (outside transaction)
      await this.usersService.findByEmail(dto.email);

      // Validate password match
      if (dto.password !== dto.confirmPassword) {
        throw new BadRequestException('Passwords are not the same.');
      }
      
      // Validate company email
      if (!dto.email.includes(dto.companyName.toLowerCase())) {
        throw new BadRequestException('Please use company email');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Execute all database operations in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: dto.email,
            name: dto.firstName + ' ' + dto.lastName,
            password: hashedPassword,
            status: UserStatus.PENDING,
          },
        });

        // Create company
        const company = await tx.company.create({
          data: {
            name: dto.companyName,
            slug: dto.companyName.toLowerCase().replace(/\s+/g, '-'),
            isActive: true,
          },
        });

        // Find company admin role template
        const companyAdminTemplate = await tx.role.findFirst({
          where: {
            name: 'company_admin',
            context: 'COMPANY',
            contextId: null,
            isSystem: true
          },
          include: { permissions: true }
        });

        if (!companyAdminTemplate) {
          throw new BadRequestException('Company admin role template not found');
        }

        // Assign company admin role to user
        await tx.user.update({
          where: { id: user.id },
          data: {
            companyId: company.id,
            roles: {
              connect: { id: companyAdminTemplate.id }
            }
          }
        });

        return { user, company };
      });

      // Send verification email (outside transaction)
      await this.sendVerificationEmail(result.user.email);

      return {
        message: 'Company registration successful. Please check your email to verify your account.',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          emailVerified: false,
        },
        company: {
          id: result.company.id,
          name: result.company.name,
          slug: result.company.slug,
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async login(dto: LoginDto) {

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        roles: {
          include: {
            permissions: true 
          }
        },

      },
    });

    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Check password
    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Check if user is active
    if (user.status === 'INACTIVE') {
      throw new ForbiddenException('Account is deactivated');
    }
    
    console.log(user.emailVerified);
    // Check if email is verified
    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email address before logging in',
      );
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    const { password, refreshToken, ...userWithoutSensitive } = user;

    return {
      user: userWithoutSensitive,
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async sendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);

    const verificationToken = await this.generateTokens(
      user.id,
      user.email,
      'email_verification',
    );

    // Create verification URL
    const verificationUrl = `${this.config.get(
      'FRONTEND_URL',
    )}/auth/verify-email?token=${verificationToken.accessToken}`;

    const eventData = {
      to: user.email,
      name: user.name || 'User',
      subject: 'Verify Your Email Address - The Skill Club',
      template: 'email-verification',
      verificationLink: verificationUrl,
    };

    this.eventEmitter.emit('email.verification', eventData);
  }

  async verifyEmail(token: string) {
    try {
      // Verify the token
      const payload = await this.verifyToken(token);

      // Check if it's an email verification token
      if (payload.type !== 'email_verification') {
        throw new UnauthorizedException('Invalid verification token');
      }

      // Find the user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.emailVerified) {
        throw new ConflictException('Email is already verified');
      }

      // Update user as verified
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          status: UserStatus.ACTIVE,
        },
      });

      return user;
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException(
          'Invalid or expired verification token',
        );
      }
      throw error;
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
    type: string = 'access',
  ) {
    const payload = { sub: userId, email, type };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: this.config.get('JWT_EXPIRES_IN') || '1h',
        secret: this.config.get('JWT_SECRET'),
      }),
      this.jwt.signAsync(payload, {
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
        secret: this.config.get('JWT_REFRESH_SECRET'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async forgotPassword(data: ForgotPaswordDto) {
    const user = await this.usersService.findByEmail(data.email);

    const token = await this.generateTokens(user.id, '10mins');
    const resetPasswordUrl = `${this.config.get(
      'FRONTEND_URL',
    )}/auth/resetPassword?token=${token.accessToken}`;

    const eventData = {
      to: user.email,
      name: user.name,
      subject: 'Password Reset',
      template: 'password-reset',
      resetLink: resetPasswordUrl,
    };

    this.eventEmitter.emit('password.reset', eventData);
    return {
      url: resetPasswordUrl,
    };
  }

  verifyToken(token: string) {
    return this.jwt.verifyAsync(token, {
      secret: this.config.get('JWT_SECRET'),
    });
  }

  async resetPassword(token: string, passwordResetDto: PasswordResetDto) {
    if (passwordResetDto.password !== passwordResetDto.confirmPassword)
      throw new BadRequestException('Passwords are not the same.');

    const data = await this.verifyToken(token);

    if (!data) throw new ForbiddenException('Incorrect token');

    const hashedPassword = await bcrypt.hash(passwordResetDto.password, 10);

    await this.prisma.user.update({
      where: { id: data.id },
      data: { password: hashedPassword },
    });

    return {
      message: 'Password reset successfully',
    };
  }
}
