import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { ConflictException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt.strategy';


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { firstName, lastName, email, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(password);

    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
      },
    });

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }


  async login(loginDto: LoginDto) {
  const user = await this.prisma.user.findUnique({
    where: {
      email: loginDto.email,
    },
  });

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const isMatch = await argon2.verify(
    user.passwordHash,
    loginDto.password,
  );

  if (!isMatch) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const payload = {
    sub: user.id,
    email: user.email,
  };

  return {
    access_token: this.jwtService.sign(payload),
  };

  
}

me(user: JwtPayload) {
  return user;
}
}



// @Injectable()
// export class AuthService {

//     constructor(
//         private readonly prisma: PrismaService,
//     ) { }

//     async register(registerDto: RegisterDto) {

        

//         const existingUser = await this.prisma.user.findUnique({
//             where: {
//                 email: registerDto.email,
//             },
//         });

//         if (existingUser) {
//             throw new ConflictException('Email already registered');
//         }

//         const hashedPassword = await argon2.hash(registerDto.password);

//         const user = await this.prisma.user.create({
//             data: {
//                 firstName: registerDto.firstName,
//                 lastName: registerDto.lastName,
//                 email: registerDto.email,
//                 passwordHash: hashedPassword,
//             },
//         });

//         return {
//             id: user.id,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             email: user.email,
//         };

//     }

// }