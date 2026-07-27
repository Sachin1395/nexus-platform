import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
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