import { Module } from '@nestjs/common';
import { PeopleRepository } from 'src/auth/repositories/people';
import { UserRepository } from 'src/auth/repositories/user';
import { UserService } from 'src/auth/services/user/user.service';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { StorageService } from 'src/global/services/aws/storage/storage.service';
import { SocialController } from './controllers/social/social.controller';
import { SocialRequestRepository } from './repositories/socialRequest';
import { SocialService } from './services/social/social.service';
import { PlaceSessionService } from 'src/place-sessions/services/place-session/place-session.service';
import { PlaceSessionRepository } from 'src/place-sessions/repositories/place-session/place-session.repository';
import { GamificationService } from 'src/gamification/services/gamification/gamification.service';
import { PlaceRepository } from 'src/places/repository/place.repository';

@Module({
  controllers: [SocialController],
  providers: [SocialService, UserService, PeopleRepository, UserRepository, PrismaService, SocialRequestRepository, StorageService, PlaceSessionRepository, PlaceSessionService, GamificationService, PlaceRepository],
  exports: [SocialRequestRepository]
})
export class SocialModule {}
