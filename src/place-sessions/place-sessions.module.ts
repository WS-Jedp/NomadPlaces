import { Module } from '@nestjs/common';
import { PlaceSessionGateway } from './gateways/place-session/place-session.gateway';
import { PlaceSessionService } from './services/place-session/place-session.service';
import { PlaceSessionRepository } from './repositories/place-session/place-session.repository';
import { PlaceSessionController } from './controllers/place-session/place-session.controller';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { UserRepository } from 'src/auth/repositories/user';

@Module({
  providers: [PlaceSessionGateway, PlaceSessionService, PlaceSessionRepository, PrismaService, UserRepository],
  controllers: [PlaceSessionController],
  exports: [PlaceSessionService]
})
export class PlaceSessionsModule {}
