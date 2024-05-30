import { HttpException, Injectable } from '@nestjs/common';
import {
  Commodities,
  DiscoveredPlaceConfirmation,
  MULTIMEDIA_TYPE_ENUM,
  PlaceConfirmationStatus,
  PlaceRules,
  Places,
  PlaceTypes,
} from '@prisma/client';
import { UserRepository } from 'src/auth/repositories/user';
import { GamificationService } from 'src/gamification/services/gamification/gamification.service';
import { StorageService } from 'src/global/services/gcp/storage/storage.service';
import { Coordinates } from 'src/global/types';
import { getColombianCurrentDate } from 'src/global/utils/dates';
import { isImage } from 'src/global/utils/media/isImage';
import { CreatePlaceDTO } from 'src/places/dto/CreatePlace.dto';
import { DiscoveredSpotDTO } from 'src/places/dto/DiscoveredSpot.dto';
import { UpdatePlaceDTO } from 'src/places/dto/UpdatePlace.dto';
import { PlaceEntityHelper } from 'src/places/helpers/PlaceHelper.dto';
import { PlaceConfirmationRepository } from 'src/places/repository/place-confirmation-discovered.repository';
import { PlaceRepository } from 'src/places/repository/place.repository';

@Injectable()
export class PlacesService {
  constructor(
    private placeRepository: PlaceRepository,
    private placeConfirmationRepository: PlaceConfirmationRepository,
    private userRepository: UserRepository,
    private storageService: StorageService,
    private gamificationService: GamificationService,
  ) {}

  private readonly DISCOVERED_PLACE_MAX_CONFIRMATIONS = 2;
  private readonly DISCOVERED_PLACE_MAX_REJECTIONS = 2;

  // Create actions
  async create(
    placeDTO: CreatePlaceDTO,
    multimedia: Array<Express.Multer.File> = [],
  ) {
    const newPlace = await this.placeRepository.create(placeDTO);

    if (multimedia.length) {
      multimedia.forEach(async (file) => {
        const fileSaved = await this.storageService.save({
          path: `/places/${newPlace.id}/`,
          contentType: file.mimetype,
          media: file.buffer,
          metadata: [],
        });

        await this.placeRepository.addMultimediaToPlace(newPlace.id, {
          createdDate: new Date(),
          type: isImage(file.mimetype)
            ? MULTIMEDIA_TYPE_ENUM.IMAGE
            : MULTIMEDIA_TYPE_ENUM.VIDEO,
          url: fileSaved.publicUrl(),
        });
      });
    }

    return await this.placeRepository.findOne(newPlace.id);
  }

  // Read actions
  async getAll() {
    const places = await this.placeRepository.getAll();
    return {
      places,
    };
  }

  async getPlace(id: string) {
    const place = await this.placeRepository.findOne(id);
    return {
      place,
    };
  }

  async getNearestPlacesToLocation(
    maxDistance: number,
    minDistance: number,
    currentLocation: Coordinates,
  ) {
    if (!maxDistance) maxDistance = 500;
    if (!minDistance) maxDistance = 0;

    const nearestPlaces = await this.placeRepository.findNearestToLocation(
      maxDistance,
      minDistance,
      currentLocation,
    );
    return {
      places: nearestPlaces.map((place) =>
        PlaceEntityHelper.MongoEntityToDTO(place),
      ),
    };
  }

  // Recommendations
  async saveDiscoveredPlace(spotDiscovered: DiscoveredSpotDTO) {
    if (!spotDiscovered.discoveredByID) {
      throw new HttpException('User ID not provided', 400);
    }

    const user = await this.userRepository.findOne(
      spotDiscovered.discoveredByID,
    );
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const discoveredPlace = await this.placeRepository.addDiscoveredPlace({
      name: spotDiscovered.name,
      knownFor: spotDiscovered.knownFor,
      description: spotDiscovered.description,
      location: spotDiscovered.location,
      commodities: spotDiscovered.commodities,
      rules: spotDiscovered.rules,
      multimedia: spotDiscovered.multimedia,
      type: spotDiscovered.type,
      discoveredDate: getColombianCurrentDate(new Date()),
      confirmationStatus: PlaceConfirmationStatus.RECOMMENDED,
      discoveredByID: spotDiscovered.discoveredByID,
      approvedDate: null,
      confirmedByIDs: [],
      rejectedDate: null,
    });

    const earnedPoints = this.gamificationService.getDiscoverSpotPointsAmount();
    const updatedUser = await this.userRepository.addDiscoveredPlace(
      user,
      discoveredPlace.id,
    );
    const userGamification = await this.gamificationService.addPointsToUser(
      user.id,
      earnedPoints,
    );

    // TODO: Send email to followers of the user about the new place discovered

    return {
      discoveredPlace,
      userDiscoveredPlacesIDs: updatedUser.discoveredPlacesIDs,
      userGamification: {
        ...userGamification,
        earnedPoints,
      },
    };
  }

  async getOnlyPlaceInConfirmationStatus() {
    const places =
      await this.placeRepository.getDiscoveredPlacesInRecommendation();
    return places;
  }

  async confirmDiscoveredPlace(payload: {
    placeID: string;
    confirmedBy: string;
    placeReview: DiscoveredSpotDTO;
  }) {
    const { placeID, confirmedBy, placeReview } = payload;
    const place = await this.placeRepository.findOne(placeID, true, true, true);
    if (!place) {
      throw new HttpException('Place not found', 404);
    }

    if (place.discoveredByID === confirmedBy) {
      throw new HttpException('User cannot confirm his own place', 400);
    }

    if (
      place.confirmationStatus === PlaceConfirmationStatus.APPROVED ||
      place.confirmationStatus === PlaceConfirmationStatus.REJECTED
    ) {
      throw new HttpException('Place already confirmed or rejected', 400);
    }

    const user = await this.userRepository.findOne(confirmedBy);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (place.confirmedByIDs.includes(confirmedBy)) {
      throw new HttpException('User already confirmed this place', 400);
    }

    const discoveredPlaceConfirmations = place.confirmedByIDs.length;

    if (
      discoveredPlaceConfirmations >= this.DISCOVERED_PLACE_MAX_CONFIRMATIONS
    ) {
      throw new HttpException(
        'Place already has the maximum confirmations',
        400,
      );
    }

    const placeConfirmation = await this.placeConfirmationRepository.create({
      placeID,
      name: placeReview.name,
      confirmedByID: confirmedBy,
      commodities: placeReview.commodities,
      description: placeReview.description,
      knownFor: placeReview.knownFor,
      rules: placeReview.rules,
      multimedia: placeReview.multimedia,
      type: placeReview.type,
      location: placeReview.location,
      confirmationStatus: PlaceConfirmationStatus.APPROVED,
    });

    const userUpdated = await this.userRepository.addConfirmationPlace(
      user,
      placeID,
    );
    const placeUpdated = await this.placeRepository.addConfirmationBy(
      placeID,
      confirmedBy,
    );

    let placeApproved = false;
    let placeApprovedUpdated: Places | null = null;
    if (
      placeUpdated.confirmedByIDs.length ===
      this.DISCOVERED_PLACE_MAX_CONFIRMATIONS
    ) {
      placeApproved = (await this.placeRepository.setDiscoveredPlaceApproved(
        placeID,
      ))
        ? true
        : false;

      const allPlaceConfirmations =
        await this.placeConfirmationRepository.getAllPlaceConfirmations(
          placeID,
        );

      const placeUpdatedInfo = this.getSpotMostSelectedOptions(
        allPlaceConfirmations,
      );

      placeApprovedUpdated = await this.placeRepository.update(
        placeID,
        placeUpdatedInfo,
      );

      const earnedPoints =
        this.gamificationService.getDiscoverSpotApprovedPointsAmount();
      await this.gamificationService.addPointsToUser(
        place.discoveredByID,
        earnedPoints,
      );

      const EarnedPointsForconfirmationnUsers =
        this.gamificationService.getDiscoverSpotConfirmedApprovedPointsAmount();
      placeUpdated.confirmedByIDs.forEach(async (userID) => {
        if (userID === place.discoveredByID) return;
        if (userID === user.id) return;
        await this.gamificationService.addPointsToUser(
          userID,
          EarnedPointsForconfirmationnUsers,
        );
      });

      // TODO: Send email to the user that discovered the place and the users that confirm it that the place was approved, also how many points he earned

      // TODO: Send email to the users who confirmed the place that the place was approved and how many points they earned
    }

    const earnedPoints =
      this.gamificationService.getDiscoverSpotConfirmationPointsAmount(
        placeUpdated.confirmedByIDs.length === 0,
      );
    const userGamification = await this.gamificationService.addPointsToUser(
      user.id,
      earnedPoints,
    );

    return {
      placeConfirmation,
      placeApproved,
      userConfirmations: userUpdated.confirmedPlacesIDs,
      placeConfirmations: placeUpdated.confirmedByIDs,
      place: placeApprovedUpdated,
      userGamification: {
        ...userGamification,
        earnedPoints,
      },
    };
  }

  async rejectDiscoveredPlace(payload: {
    placeID: string;
    rejectedBy: string;
    placeReview: DiscoveredSpotDTO;
  }) {
    const { placeID, rejectedBy, placeReview } = payload;
    const place = await this.placeRepository.findOne(placeID, true, true, true);
    if (!place) {
      throw new HttpException('Place not found', 404);
    }

    if (place.discoveredByID === rejectedBy) {
      throw new HttpException('User cannot reject his own place', 400);
    }

    if (
      place.confirmationStatus === PlaceConfirmationStatus.APPROVED ||
      place.confirmationStatus === PlaceConfirmationStatus.REJECTED
    ) {
      throw new HttpException('Place already confirmed or rejected', 400);
    }

    const user = await this.userRepository.findOne(rejectedBy);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (place.confirmedByIDs.includes(rejectedBy)) {
      throw new HttpException('User already confirmed this place', 400);
    }

    const discoveredPlaceRejections =
      await this.placeConfirmationRepository.getAllPlaceRejectedConfirmations(
        place.id,
      );

    if (
      discoveredPlaceRejections.length >= this.DISCOVERED_PLACE_MAX_REJECTIONS
    ) {
      throw new HttpException('Place already has the maximum rejections', 400);
    }

    const alreadyRejected = discoveredPlaceRejections.find(
      (rejection) => rejection.confirmedByID === rejectedBy,
    );
    if (alreadyRejected) {
      throw new HttpException('User already rejected this place', 400);
    }

    const placeConfirmation = await this.placeConfirmationRepository.create({
      placeID,
      name: placeReview.name,
      confirmedByID: rejectedBy,
      commodities: placeReview.commodities,
      description: placeReview.description,
      knownFor: placeReview.knownFor,
      rules: placeReview.rules,
      multimedia: placeReview.multimedia,
      type: placeReview.type,
      location: placeReview.location,
      confirmationStatus: PlaceConfirmationStatus.REJECTED,
    });

    if (
      discoveredPlaceRejections.length + 1 ===
      this.DISCOVERED_PLACE_MAX_REJECTIONS
    ) {
      const discoveredPlaceUpdated =
        await this.placeRepository.setDiscoveredPlaceRejected(placeID);
      // TODO: Send email to the user that discovered the place and the users that confirm that the place was rejected
      return {
        discoveredPlace: discoveredPlaceUpdated,
        placeConfirmation,
        placeRejected: true,
      };
    }

    return {
      discoveredPlace: place,
      placeConfirmation,
      placeRejected: false,
    };
  }

  async getAllSpotReviews(spotID: string) {
    const place = await this.placeRepository.findOne(spotID, true, true, true);
    if (!place) {
      throw new HttpException('Place not found', 404);
    }

    const spotReviews =
      await this.placeConfirmationRepository.getAllPlaceReviews(spotID);
    return {
      spotReviews,
    };
  }

  async getDiscoveredPlacesByUser(userID: string) {
    const user = await this.userRepository.findOne(userID);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const userDiscoveredPlaces = await (
      await this.placeRepository.getDiscoveredPlacesByUser(userID)
    ).discoveredPlaces;
    return {
      discoveredPlaces: userDiscoveredPlaces,
    };
  }

  async getUserPlacesConfirmed(userID: string) {
    const user = await this.userRepository.findOne(userID);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const userConfirmedPlaces = await (
      await this.placeRepository.getUserPlacesConfirmed(userID)
    ).confirmedPlaces;
    return {
      confirmedPlaces: userConfirmedPlaces,
    };
  }

  // ================
  // UTILS METHODS

  private getSpotMostSelectedOptions(
    confirmations: DiscoveredPlaceConfirmation[],
  ): UpdatePlaceDTO {
    const countNameOptions = confirmations
      .map((place) => place.name)
      .reduce((acc, name) => {
        acc[name] = acc[name] ? acc[name] + 1 : 1;
        return acc;
      }, {});
    const nameSelected = Object.keys(countNameOptions).sort(
      (a, b) => countNameOptions[b] - countNameOptions[a],
    )[0];

    const countDescriptionOptions = confirmations
      .map((place) => place.description)
      .reduce((acc, description) => {
        acc[description] = acc[description] ? acc[description] + 1 : 1;
        return acc;
      }, {});
    const descriptionSelected = Object.keys(countDescriptionOptions).sort(
      (a, b) => countDescriptionOptions[b] - countDescriptionOptions[a],
    )[0];

    const countZonenOptions = confirmations
      .map((place) => place.location.zone)
      .reduce((acc, zone) => {
        acc[zone] = acc[zone] ? acc[zone] + 1 : 1;
        return acc;
      }, {});
    const zoneSelected = Object.keys(countZonenOptions).sort(
      (a, b) => countZonenOptions[b] - countZonenOptions[a],
    )[0];

    const countCityOptions = confirmations
      .map((place) => place.location.city)
      .reduce((acc, city) => {
        acc[city] = acc[city] ? acc[city] + 1 : 1;
        return acc;
      }, {});
    const citySelected = Object.keys(countCityOptions).sort(
      (a, b) => countCityOptions[b] - countCityOptions[a],
    )[0];

    // NOTE: Right now, in spite of the fact that the type is an array, we are only taking the first element, in the frontend we will have to take the first element of the array
    const countSpotTypeOptions = confirmations
      .map((place) => place.type)
      .reduce((acc, type) => {
        acc[type[0]] = acc[type[0]] ? acc[type[0]] + 1 : 1;
        return acc;
      }, {});
    const spotTypeSelected = Object.keys(countSpotTypeOptions).sort(
      (a, b) => countSpotTypeOptions[b] - countSpotTypeOptions[a],
    )[0] as PlaceTypes;

    const countKnownForOptions = confirmations
      .map((place) => place.knownFor)
      .reduce((acc, knownFor) => {
        acc[knownFor] = acc[knownFor] ? acc[knownFor] + 1 : 1;
        return acc;
      }, {});
    const knownForSelected = Object.keys(countKnownForOptions).sort(
      (a, b) => countKnownForOptions[b] - countKnownForOptions[a],
    )[0];

    const commoditiesSelected = this.findMostCommonCommodities(confirmations);
    const spotRulesSelected = this.findMostCommonRules(confirmations);

    return {
      name: nameSelected,
      description: descriptionSelected,
      location: {
        zone: zoneSelected,
        city: citySelected,
        country: 'Colombia',
        latitude: confirmations[0].location.latitude,
        longitude: confirmations[0].location.longitude,
      },
      type: [spotTypeSelected],
      knownFor: knownForSelected,
      commodities: {
        ...commoditiesSelected,
        wifiSpeed:
          isNaN(commoditiesSelected.wifiSpeed) ||
          commoditiesSelected.wifiSpeed === undefined
            ? null
            : commoditiesSelected.wifiSpeed,
        plugsAmount:
          isNaN(commoditiesSelected.plugsAmount) ||
          commoditiesSelected.plugsAmount === undefined
            ? null
            : commoditiesSelected.plugsAmount,
      },
      rules: spotRulesSelected,
    };
  }

  private findMostCommonCommodities(
    confirmations: DiscoveredPlaceConfirmation[],
  ): Commodities {
    const counts: { [key: string]: { [key: string]: number } } = {};

    // Initialize counting objects for each property
    for (const property in confirmations[0].commodities) {
      counts[property] = {};
    }

    // Count occurrences of each value for each property
    confirmations.forEach((confirmation) => {
      for (const property in confirmation.commodities) {
        const value = confirmation.commodities[property];
        if (counts[property][value] === undefined) {
          counts[property][value] = 1;
        } else {
          counts[property][value]++;
        }
      }
    });

    // Determine the most common value for each property
    const mostCommonCommodities: Commodities = {} as Commodities;
    for (const property in counts) {
      let maxCount = 0;
      let mostCommonValue = null;

      for (const value in counts[property]) {
        if (counts[property][value] > maxCount) {
          maxCount = counts[property][value];
          mostCommonValue = value;
        }
      }

      // Convert property back to correct type
      if (typeof confirmations[0].commodities[property] === 'boolean') {
        mostCommonCommodities[property] = mostCommonValue === 'true';
      } else {
        mostCommonCommodities[property] = mostCommonValue
          ? Number(mostCommonValue)
          : null || null;
      }
    }
    return mostCommonCommodities;
  }

  private findMostCommonRules(
    places: DiscoveredPlaceConfirmation[],
  ): PlaceRules {
    const counts: { [key: string]: { [key: string]: number } } = {};

    // Initialize counting objects for each property
    for (const property in places[0].rules) {
      counts[property] = {};
    }

    // Count occurrences of each value for each property
    places.forEach((place) => {
      for (const property in place.rules) {
        const value = place.rules[property];
        if (value !== undefined) {
          // Ensure we only count defined values
          if (counts[property][value] === undefined) {
            counts[property][value] = 1;
          } else {
            counts[property][value]++;
          }
        }
      }
    });

    // Determine the most common value for each property
    const mostCommonRules: PlaceRules = {} as PlaceRules;
    for (const property in counts) {
      let maxCount = 0;
      let mostCommonValue: string | null = null;

      for (const value in counts[property]) {
        if (counts[property][value] > maxCount) {
          maxCount = counts[property][value];
          mostCommonValue = value;
        }
      }

      // Convert property back to correct type if necessary
      if (['petFriendly', 'smoking', 'underAge'].includes(property)) {
        mostCommonRules[property] = mostCommonValue === 'true';
      } else {
        mostCommonRules[property] = mostCommonValue; // for strings no conversion is needed
      }
    }

    return mostCommonRules;
  }
}
