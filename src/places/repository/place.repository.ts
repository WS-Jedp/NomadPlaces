import { Injectable } from '@nestjs/common';
import { PlaceMongoEntity } from 'src/global/entities/place';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { Coordinates } from 'src/global/types';

@Injectable()
export class PlaceRepository {
    constructor(private prisma: PrismaService) {}

  // Create actions

  // Read actions
  getAll() {
    return this.prisma.places.findMany();
  }

  findOne(id: string) {
    return this.prisma.places.findUnique({
      where: {
        id: id,
      }
    });
  }

  findNearestToLocation(maxDistance:number, minDistance: number, currentLocation: Coordinates): Array<PlaceMongoEntity> {
    return this.prisma.places.findRaw({
        filter: {
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [Number(currentLocation.latitude), Number(currentLocation.longitude)],
              },
              $maxDistance: Number(maxDistance), // In meters
              $minDistance: Number(minDistance), // In meters
            },
          },
        },
      }) as any as Array<PlaceMongoEntity>;
  }
}
