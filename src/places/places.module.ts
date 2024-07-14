import { Module } from '@nestjs/common';
import { DistanceService } from 'src/global/distance/distance.service';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { PlacesController } from './controllers/places/places.controller';
import { PlacesService } from './services/places/places.service';
import { PlaceRepository } from './repository/place.repository';
import { PlaceSessionsModule } from 'src/place-sessions/place-sessions.module';
import { StorageService } from 'src/global/services/aws/storage/storage.service';
import { PlaceConfirmationRepository } from './repository/place-confirmation-discovered.repository';
import { UserRepository } from 'src/auth/repositories/user';
import { GamificationService } from 'src/gamification/services/gamification/gamification.service';
import { PeopleRepository } from 'src/auth/repositories/people';


@Module({
  imports: [PlaceSessionsModule],
  controllers: [PlacesController],
  providers: [PrismaService, PlacesService, DistanceService, PlaceRepository, UserRepository, PlaceConfirmationRepository, StorageService, GamificationService, PeopleRepository],
})
export class PlacesModule {}
