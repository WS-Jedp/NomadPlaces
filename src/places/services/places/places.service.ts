import { HttpException, Injectable } from '@nestjs/common';
import { MULTIMEDIA_TYPE_ENUM, PlaceConfirmationStatus } from '@prisma/client';
import { UserRepository } from 'src/auth/repositories/user';
import { StorageService } from 'src/global/services/gcp/storage/storage.service';
import { Coordinates } from 'src/global/types';
import { getColombianCurrentDate } from 'src/global/utils/dates';
import { isImage } from 'src/global/utils/media/isImage';
import { CreatePlaceDTO } from 'src/places/dto/CreatePlace.dto';
import { DiscoveredSpotDTO } from 'src/places/dto/DiscoveredSpot.dto';
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
    ) {}

    private readonly DISCOVERED_PLACE_MAX_CONFIRMATIONS = 6
    private readonly DISCOVERED_PLACE_MAX_REJECTIONS = 6

  // Create actions
  async create(placeDTO: CreatePlaceDTO, multimedia: Array<Express.Multer.File> = []) {
    const newPlace = await this.placeRepository.create(placeDTO)

    if(multimedia.length) {
      multimedia.forEach(async (file) => {
        const fileSaved = await this.storageService.save({
          path: `/places/${newPlace.id}/`,
          contentType: file.mimetype,
          media: file.buffer,
          metadata: []
        })

        await this.placeRepository.addMultimediaToPlace(newPlace.id, {
          createdDate: new Date(),
          type: isImage(file.mimetype) ? MULTIMEDIA_TYPE_ENUM.IMAGE : MULTIMEDIA_TYPE_ENUM.VIDEO,
          url: fileSaved.publicUrl()
        })
      })
    }

    return await this.placeRepository.findOne(newPlace.id)

  }

  // Read actions
  async getAll() {
    const places = await this.placeRepository.getAll();
    return {
      places
    }
  }

  async getPlace(id: string) {
    const place = await this.placeRepository.findOne(id)
    return {
      place,
    }
  }

  async getNearestPlacesToLocation(maxDistance:number, minDistance: number, currentLocation: Coordinates) {
    if(!maxDistance) maxDistance = 500
    if(!minDistance) maxDistance = 0

    const nearestPlaces = await this.placeRepository.findNearestToLocation(maxDistance, minDistance, currentLocation)
    return {
      places: nearestPlaces.map(place => PlaceEntityHelper.MongoEntityToDTO(place))
    }
  }

  // Recommendations
  async saveDiscoveredPlace(spotDiscovered: DiscoveredSpotDTO) {

    const user = await this.userRepository.findOne(spotDiscovered.discoveredByID)
    if(!user) {
      throw new HttpException('User not found', 404)
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
      rejectedDate: null
    })

    const updatedUser = await this.userRepository.addDiscoveredPlace(user, discoveredPlace.id)

    // TODO: Send email to followers of the user about the new place discovered

    return {
      discoveredPlace,
      userDiscoveredPlacesIDs: updatedUser.discoveredPlacesIDs
    }
  }

  async getOnlyPlaceInConfirmationStatus() {
    const places = await this.placeRepository.getDiscoveredPlacesInRecommendation()
    return places
  }

  async confirmDiscoveredPlace(payload: { placeID: string, confirmedBy: string, placeReview: DiscoveredSpotDTO }) {
    const { placeID, confirmedBy, placeReview } = payload
    const place = await this.placeRepository.findOne(placeID, true, true, true)
    if(!place) {
      throw new HttpException('Place not found', 404)
    }

    if(place.discoveredByID === confirmedBy) {
      throw new HttpException('User cannot confirm his own place', 400)
    }

    if(place.confirmationStatus === PlaceConfirmationStatus.APPROVED || place.confirmationStatus === PlaceConfirmationStatus.REJECTED) {
      throw new HttpException('Place already confirmed or rejected', 400)
    }

    const user = await this.userRepository.findOne(confirmedBy)
    if(!user) {
      throw new HttpException('User not found', 404)
    }

    if(place.confirmedByIDs.includes(confirmedBy)) {
      throw new HttpException('User already confirmed this place', 400)
    }

    const discoveredPlaceConfirmations = place.confirmedByIDs.length

    if(discoveredPlaceConfirmations >= this.DISCOVERED_PLACE_MAX_CONFIRMATIONS) {
      throw new HttpException('Place already has the maximum confirmations', 400)
    }

    const placeConfirmation = await this.placeConfirmationRepository.create({
      placeID,
      confirmedByID: confirmedBy,
      commodities: placeReview.commodities,
      description: placeReview.description,
      knownFor: placeReview.knownFor,
      rules: placeReview.rules,
      multimedia: placeReview.multimedia,
      type: placeReview.type,
      location: placeReview.location,
      confirmationStatus: PlaceConfirmationStatus.RECOMMENDED,
    })

    const userUpdated = await this.userRepository.addConfirmationPlace(user, placeID)
    const placeUpdated = await this.placeRepository.addConfirmationBy(placeID, confirmedBy)

    let placeApproved = false
    if(placeUpdated.confirmedByIDs.length === this.DISCOVERED_PLACE_MAX_CONFIRMATIONS) {
      placeApproved = await this.placeRepository.setDiscoveredPlaceApproved(placeID) ? true : false
      // TODO: Update place according to the confirmations by users
      // TODO: Send email to the user that discovered the place and the users that confirm it that the place was approved

    }

    return {
      placeConfirmation,
      placeApproved,
      userConfirmations: userUpdated.confirmedPlacesIDs,
      placeConfirmations: placeUpdated.confirmedByIDs
    }
  }

  async rejectDiscoveredPlace(payload: { placeID: string, rejectedBy: string, placeReview: DiscoveredSpotDTO }) {
    const { placeID, rejectedBy, placeReview } = payload
    const place = await this.placeRepository.findOne(placeID, true, true, true)
    if(!place) {
      throw new HttpException('Place not found', 404)
    }

    if(place.discoveredByID === rejectedBy) {
      throw new HttpException('User cannot reject his own place', 400)
    }

    if(place.confirmationStatus === PlaceConfirmationStatus.APPROVED || place.confirmationStatus === PlaceConfirmationStatus.REJECTED) {
      throw new HttpException('Place already confirmed or rejected', 400)
    }

    const user = await this.userRepository.findOne(rejectedBy)
    if(!user) {
      throw new HttpException('User not found', 404)
    }

    if(place.confirmedByIDs.includes(rejectedBy)) {
      throw new HttpException('User already confirmed this place', 400)
    }

    const discoveredPlaceRejections = await this.placeConfirmationRepository.getAllPlaceRejectedConfirmations(place.id)

    if(discoveredPlaceRejections.length >= this.DISCOVERED_PLACE_MAX_REJECTIONS) {
      throw new HttpException('Place already has the maximum rejections', 400)
    }

    const alreadyRejected = discoveredPlaceRejections.find(rejection => rejection.confirmedByID === rejectedBy)
    if(alreadyRejected) {
      throw new HttpException('User already rejected this place', 400)
    }

    const placeConfirmation = await this.placeConfirmationRepository.create({
      placeID,
      confirmedByID: rejectedBy,
      commodities: placeReview.commodities,
      description: placeReview.description,
      knownFor: placeReview.knownFor,
      rules: placeReview.rules,
      multimedia: placeReview.multimedia,
      type: placeReview.type,
      location: placeReview.location,
      confirmationStatus: PlaceConfirmationStatus.REJECTED,
    })

    if(discoveredPlaceRejections.length + 1 === this.DISCOVERED_PLACE_MAX_REJECTIONS) {
      const discoveredPlaceUpdated = await this.placeRepository.setDiscoveredPlaceRejected(placeID)
      // TODO: Send email to the user that discovered the place and the users that confirm that the place was rejected
      return {
        discoveredPlace: discoveredPlaceUpdated,
        placeConfirmation,
        placeRejected: true
      }
    }

    return {
      discoveredPlace: place,
      placeConfirmation,
      placeRejected: false
    }
  }
}
