import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';

import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { JwtOrApiKeyGuard } from './guards/jwt-or-api-key.guard';

@Module({
  imports: [
    PrismaModule,

    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,

    RolesGuard,
    JwtAuthGuard,
    ApiKeyGuard,
    JwtOrApiKeyGuard, // ← add
  ],

  exports: [
    JwtStrategy,
    RolesGuard,
    JwtAuthGuard,
    ApiKeyGuard,
    JwtOrApiKeyGuard, // ← add
  ],
})
export class AuthModule {}