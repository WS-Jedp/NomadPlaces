import { Module } from '@nestjs/common';
import { PeopleRepository } from 'src/auth/repositories/people';
import { UserRepository } from 'src/auth/repositories/user';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { GamificationService } from './services/gamification/gamification.service';
import { GamificationController } from './controllers/gamification/gamification.controller';
import { PlaceSessionService } from 'src/place-sessions/services/place-session/place-session.service';
import { PlaceSessionRepository } from 'src/place-sessions/repositories/place-session/place-session.repository';
import { PlaceRepository } from 'src/places/repository/place.repository';

@Module({
  exports: [GamificationService],
  providers: [
    GamificationService,
    PeopleRepository,
    UserRepository,
    PrismaService,
    PlaceSessionService,
    PlaceSessionRepository,
    PlaceRepository
  ],
  controllers: [GamificationController],
})
export class GamificationModule {}
