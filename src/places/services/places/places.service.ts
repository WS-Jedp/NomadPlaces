import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { Coordinates } from 'src/global/types';

@Injectable()
export class PlacesService {
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

  findNearestToLocation(maxDistance:number, minDistance: number, currentLocation: Coordinates) {
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
      });
  }
}
