import { Injectable } from '@nestjs/common';
import { Multimedia, PlaceConfirmationStatus, Places } from '@prisma/client';
import { PlaceMongoEntity } from 'src/global/entities/place';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { Coordinates } from 'src/global/types';
import { getUTCCurrentDate } from 'src/global/utils/dates';
import { CreatePlaceDTO } from '../dto/CreatePlace.dto';
import { DiscoveredSpotDTO } from '../dto/DiscoveredSpot.dto';
import { UpdatePlaceDTO } from '../dto/UpdatePlace.dto';

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

  // Update actions
  update(placeID: string, placeDTO: UpdatePlaceDTO) {
    return this.prisma.places.update({
      where: { id: placeID },
      data: {
        name: placeDTO.name,
        description: placeDTO.description,
        knownFor: placeDTO.knownFor,
        // multimedia: placeDTO.multimedia,
        type: placeDTO.type,
        location: {
          update: {
            zone: placeDTO.location.zone,
            city: placeDTO.location.city,
            country: placeDTO.location.country,
          },
        },
        commodities: placeDTO.commodities,
        rules: placeDTO.rules,
      },
    });
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
        approvedDate: getUTCCurrentDate(),
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

  getDiscoveredPlacesByUser(userID: string) {
    return this.prisma.user.findFirst({
      where: {
        id: userID,
      },
      include: {
        discoveredPlaces: true,
      },
    });
  }

  getUserPlacesConfirmed(userID: string) {
    return this.prisma.user.findFirst({
      where: {
        id: userID,
      },
      include: {
        confirmedPlaces: true,
      },
    });
  }
}
