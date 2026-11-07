import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ThrottlerBehindApiKeyGuard } from './guards/throttler-behind-api-key.guard';
import { GetUser } from './decorators/get-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(ThrottlerBehindApiKeyGuard)
  @Throttle({
    strict: {
      limit: 5,
      ttl: 60000,
    },
  })
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account.',
  })
  @ApiBody({
    type: RegisterDto,
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed.',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered.',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(ThrottlerBehindApiKeyGuard)
  @Throttle({
    strict: {
      limit: 10,
      ttl: 60000,
    },
  })
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates the user and returns a JWT access token.',
  })
  @ApiBody({
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials.',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user',
    description: 'Returns the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user returned successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  getMe(@GetUser() user) {
    return this.authService.me(user);
  }
}