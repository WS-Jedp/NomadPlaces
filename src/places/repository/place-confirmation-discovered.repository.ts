import { Injectable } from '@nestjs/common';
import { DiscoveredPlaceConfirmation, PlaceConfirmationStatus } from '@prisma/client';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';

@Injectable()
export class PlaceConfirmationRepository {
  constructor(private prisma: PrismaService) {}

  // Create actions
  create(placeConfirmation: Omit<DiscoveredPlaceConfirmation, 'id'>)  {
    return this.prisma.discoveredPlaceConfirmation.create({
      data: placeConfirmation,
    });
  }

  getAllPlaceRejectedConfirmations(placeID: string) {
    return this.prisma.discoveredPlaceConfirmation.findMany({
      where: {
        placeID,
        confirmationStatus: PlaceConfirmationStatus.REJECTED,
      },
    });
  }

  getAllPlaceConfirmations(placeID: string) {
    return this.prisma.discoveredPlaceConfirmation.findMany({
      where: {
        placeID,
        AND: {
          confirmationStatus: PlaceConfirmationStatus.APPROVED,
        }
      },
    });
  }

  getAllPlaceReviews(placeID: string) {
    return this.prisma.discoveredPlaceConfirmation.findMany({
      where: {
        placeID,
      },
    });
  }
}
