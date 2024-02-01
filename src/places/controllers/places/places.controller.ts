import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipe,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PlaceMongoEntity } from 'src/global/entities/place';
import Response from 'src/global/models/response';
import { PlaceSessionService } from 'src/place-sessions/services/place-session/place-session.service';
import { CreatePlaceDTO } from 'src/places/dto/CreatePlace.dto';
import { PlaceEntityHelper } from 'src/places/helpers/PlaceHelper.dto';
import { FileSizeValidationPipe } from 'src/places/pipes/file-size-validation/file-size-validation.pipe';
import { PlacesService } from 'src/places/services/places/places.service';
@Controller('places')
export class PlacesController {
  constructor(
    private placesService: PlacesService,
    private placeSessionService: PlaceSessionService,
  ) {}

  /**
   * CREATE ACTIONS
   * All the actions that involve the action of reading
   */
  @Post('add')
  async addNewPlace(
    @Body() body: CreatePlaceDTO,
    @UploadedFiles() multimediaFiles: Array<Express.Multer.File>,
  ) {
    const newPlace = await this.placesService.create(body, multimediaFiles);
    return new Response({
      content: newPlace,
      status: HttpStatus.CREATED,
    });
  }

  /**
   * READ ACTIONS
   * All the actions that involve the action of reading
   */

  @Get('near')
  async getNearToMe(
    @Query()
    searchData: {
      latitude: number;
      longitude: number;
      maxDistance?: number;
      minDistance?: number;
    },
  ) {
    const {
      latitude,
      longitude,
      maxDistance = 500,
      minDistance = 10,
    } = searchData;
    const places = await (
      await this.placesService.getNearestPlacesToLocation(
        maxDistance,
        minDistance,
        { latitude, longitude },
      )
    ).places;
    const placesWithQuickSessionData = await Promise.all(
      places.map(async (place) => {
        const sessionData = await this.placeSessionService.getSessionCacheData(
          place.id,
        );
        return {
          place,
          quickSessionData: sessionData ? sessionData : null,
        };
      }),
    );

    return new Response({
      content: {
        placesWithQuickSessionData,
      },
      status: HttpStatus.OK,
    });
  }

  @Get('detail/:id')
  async getDetail(@Param('id') id: string) {
    // Get the detail information about the place
    // Place Session
    // Place main reviews
    // Place guides
    const currentPlace = await this.placesService.getPlace(id);
    return new Response({
      content: currentPlace,
      status: HttpStatus.OK,
    });
  }

  @Get()
  async getAll() {
    return new Response({
      content: await this.placesService.getAll(),
      status: HttpStatus.OK,
    });
  }

  @Get('all')
  async getAllWithCachedSession() {
    const places = await (await this.placesService.getAll()).places;
    const placesWithQuickSessionData = await Promise.all(
      places.map(async (place) => {
        const sessionData = await this.placeSessionService.getSessionCacheData(
          place.id,
        );
        return {
          place,
          quickSessionData: sessionData ? sessionData : null,
        };
      }),
    );

    return new Response({
      content: {
        placesWithQuickSessionData
      },
      status: HttpStatus.OK,
    });
  }

  /**
   * UPDATE ACTIONS
   * All the actions that involve the action of updating
   */

  @Post('/update/:id')
  async updatePlace(@Param('id') id: string) {
    // Handling updating a place from the database
  }

  @Post('/hide/:id')
  async hidePlace(@Param('id') id: string) {
    // Hide a place to not be shown to the public
  }

  /**
   * DELETE ACTIONS
   * All the actions that involve the action of updating
   */

  @Post('/delete/:id')
  async delete(@Param('id') id: string) {
    // Handling deleting a place from the database
  }
}
