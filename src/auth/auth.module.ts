import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy';
import { UsersModule } from '@/users/users.module';
import { RolesModule } from '@/roles/roles.module';
import { CompaniesModule } from '@/companies/companies.module';

@Module({
  imports: [JwtModule.register({}), UsersModule, RolesModule, CompaniesModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
