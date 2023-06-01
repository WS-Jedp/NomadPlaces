import { Module } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { UserService } from './services/user/user.service';
import { AuthController } from './controllers/auth/auth.controller';
import { UserRepository } from './repositories/user';
import { PeopleRepository } from './repositories/people';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [ 
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '5d' },
    }),
  ],
  providers: [AuthService, UserService, UserRepository, PeopleRepository, PrismaService,
    LocalStrategy, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
