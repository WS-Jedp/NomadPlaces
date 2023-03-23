import { Injectable } from '@nestjs/common';
import { MULTIMEDIA_TYPE_ENUM } from '@prisma/client';
import { StorageService } from 'src/global/services/gcp/storage/storage.service';
import { Coordinates } from 'src/global/types';
import { isImage } from 'src/global/utils/media/isImage';
import { CreatePlaceDTO } from 'src/places/dto/CreatePlace.dto';
import { PlaceEntityHelper } from 'src/places/helpers/PlaceHelper.dto';
import { PlaceRepository } from 'src/places/repository/place.repository';

@Injectable()
export class PlacesService {
  constructor(
    private placeRepository: PlaceRepository,
    private storageService: StorageService,
    ) {}

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
}
