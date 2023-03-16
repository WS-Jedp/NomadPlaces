import { Module } from '@nestjs/common';
import { DistanceService } from 'src/global/distance/distance.service';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { PlacesController } from './controllers/places/places.controller';
import { PlacesService } from './services/places/places.service';
import { PlaceRepository } from './repository/place.repository';
import { PlaceSessionsModule } from 'src/place-sessions/place-sessions.module';


@Module({
  imports: [PlaceSessionsModule],
  controllers: [PlacesController],
  providers: [PrismaService, PlacesService, DistanceService, PlaceRepository],
})
export class PlacesModule {}
