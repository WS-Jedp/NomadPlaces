import { Module } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { PlacesController } from './controllers/places/places.controller';


@Module({
  controllers: [PlacesController],
  providers: [PrismaService]
})
export class PlacesModule {}
