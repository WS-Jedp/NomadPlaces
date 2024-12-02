import { Module } from '@nestjs/common';
import { PlaceSessionGateway } from './gateways/place-session/place-session.gateway';
import { PlaceSessionService } from './services/place-session/place-session.service';
import { PlaceSessionRepository } from './repositories/place-session/place-session.repository';
import { PlaceSessionController } from './controllers/place-session/place-session.controller';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { UserRepository } from 'src/auth/repositories/user';
import { GamificationService } from 'src/gamification/services/gamification/gamification.service';
import { PeopleRepository } from 'src/auth/repositories/people';
import { StorageService } from 'src/global/services/aws/storage/storage.service';
import { PlaceRepository } from 'src/places/repository/place.repository';
import { UserService } from 'src/auth/services/user/user.service';

@Module({
  providers: [
    PlaceSessionGateway,
    PlaceSessionService,
    PlaceSessionRepository,
    PrismaService,
    UserRepository,
    PeopleRepository,
    StorageService,
    PlaceRepository,
    GamificationService,
    UserService,
  ],
  controllers: [PlaceSessionController],
  exports: [PlaceSessionService],
})
export class PlaceSessionsModule {}
