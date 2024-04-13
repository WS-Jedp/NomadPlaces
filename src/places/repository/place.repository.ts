import { Injectable } from '@nestjs/common';
import { Multimedia, PlaceConfirmationStatus, Places } from '@prisma/client';
import { PlaceMongoEntity } from 'src/global/entities/place';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { Coordinates } from 'src/global/types';
import { CreatePlaceDTO } from '../dto/CreatePlace.dto';
import { DiscoveredSpotDTO } from '../dto/DiscoveredSpot.dto';

@Injectable()
export class PlaceRepository {
  constructor(private prisma: PrismaService) {}

  // Create actions
  create(placeDTO: CreatePlaceDTO) {
    return this.prisma.places.create({
      data: placeDTO,
    });
  }

  addMultimediaToPlace(placeID: string, multimedia: Multimedia) {
    return this.prisma.places.update({
      where: { id: placeID },
      data: {
        multimedia: {
          push: multimedia,
        },
      },
    });
  }

  // Read actions
  getAll() {
    return this.prisma.places.findMany();
  }

  findOne(id: string, withSessions = true, withConfirmations = false, withDiscoveredBy = false) {
    return this.prisma.places.findUnique({
      where: {
        id: id,
      },
      include: {
        sessions: withSessions,
        confirmedBy: withConfirmations,
        discoveredBy: withDiscoveredBy,
      },
    });
  }

  findNearestToLocation(
    maxDistance: number,
    minDistance: number,
    currentLocation: Coordinates,
  ): Array<PlaceMongoEntity> {
    return this.prisma.places.findRaw({
      filter: {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [
                Number(currentLocation.latitude),
                Number(currentLocation.longitude),
              ],
            },
            $maxDistance: Number(maxDistance), // In meters
            $minDistance: Number(minDistance), // In meters
          },
        },
      },
    }) as any as Array<PlaceMongoEntity>;
  }

  // Discover actions
  addDiscoveredPlace(place: Omit<Places, 'id'>) {
    return this.prisma.places.create({
      data: place,
    });
  }

  getDiscoveredPlacesInRecommendation() {
    return this.prisma.places.findMany({
      where: {
        confirmationStatus: PlaceConfirmationStatus.RECOMMENDED,
      },
    });
  }

  setDiscoveredPlaceApproved(placeID: string) {
    return this.prisma.places.update({
      where: {
        id: placeID,
      },
      data: {
        confirmationStatus: PlaceConfirmationStatus.APPROVED,
      },
    });
  }

  setDiscoveredPlaceRejected(placeID: string) {
    return this.prisma.places.update({
      where: {
        id: placeID,
      },
      data: {
        confirmationStatus: PlaceConfirmationStatus.REJECTED,
      },
      include: {
        confirmedBy: true,
        discoveredBy: true,
      }
    });
  }

  addConfirmationBy(placeID: string, confirmedBy: string) {
    return this.prisma.places.update({
      where: {
        id: placeID,
      },
      data: {
        confirmedByIDs: {
          push: confirmedBy,
        },
      },
    });
  }
}
