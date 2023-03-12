import { Injectable } from '@nestjs/common';
import { PlaceMongoEntity } from 'src/global/entities/place';
import { Coordinates } from 'src/global/types';
import { PlaceEntityHelper } from 'src/places/helpers/PlaceHelper.dto';
import { PlaceRepository } from 'src/places/repository/place.repository';

@Injectable()
export class PlacesService {
  constructor(
    private placeRepository: PlaceRepository
    ) {}

  // Create actions

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
      place
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
}
