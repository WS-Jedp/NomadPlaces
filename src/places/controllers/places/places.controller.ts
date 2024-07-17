import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Req,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt';
import { PlaceMongoEntity } from 'src/global/entities/place';
import Response from 'src/global/models/response';
import { PlaceSessionService } from 'src/place-sessions/services/place-session/place-session.service';
import { CreatePlaceDTO } from 'src/places/dto/CreatePlace.dto';
import { DiscoveredSpotDTO } from 'src/places/dto/DiscoveredSpot.dto';
import { PlaceConfirmationSpotDTO } from 'src/places/dto/PlaceConfirmation.dto';
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

  /**
   * DISCOVERD AND CONFIRMATION ACTIONS
   * All the actions that involve the discovering and confirmations of new places into the app by the community
   */
  @UseGuards( JwtAuthGuard )
  @Post('discover/new')
  @UseInterceptors( FilesInterceptor('files', 15), FileSizeValidationPipe)
  async newSpotDiscovered(@Body() data: { spotDiscovered: string }, @UploadedFiles() multimedia: Express.Multer.File[]) {
    const discoverdSpotDTO = JSON.parse(data.spotDiscovered) as unknown as DiscoveredSpotDTO;
    const discoveredPlace = await this.placesService.saveDiscoveredPlace(discoverdSpotDTO, multimedia);
    return new Response({
      content: discoveredPlace,
      status: HttpStatus.CREATED,
    });
  }

  @UseGuards( JwtAuthGuard )
  @Post('discover/confirm')
  async confirmSpot(@Request() req, @Body() data: PlaceConfirmationSpotDTO) {
    const authUserID = req.user.id;
    const confirmedSpot = await this.placesService.confirmDiscoveredPlace({
      confirmedBy: authUserID,
      placeID: data.spotID,
      placeReview: data.discoveredSpotReview,
    });
    return new Response({
      content: confirmedSpot,
      status: HttpStatus.OK,
    });

  }

  @UseGuards( JwtAuthGuard )
  @Post('discover/reject')
  async rejectSpot(@Request() req, @Body() data: PlaceConfirmationSpotDTO) {
    const authUserID = req.user.id;
    const rejectedSpot = await this.placesService.rejectDiscoveredPlace({
      rejectedBy: authUserID,
      placeID: data.spotID,
      placeReview: data.discoveredSpotReview,
    });
    return new Response({
      content: rejectedSpot,
      status: HttpStatus.OK,
    });
  }

  @UseGuards( JwtAuthGuard )
  @Get('discover/reviews/:spotID')
  async spotReviews(@Param('spotID') spotID: string) {
    const data = await this.placesService.getAllSpotReviews(spotID);
    return new Response({
      content: {
        spotReviews: data.spotReviews,
      },
      status: HttpStatus.OK,
    });
  }

  @UseGuards( JwtAuthGuard )
  @Get('discovered/me')
  async getDiscoveredPlacesByAuthUser(@Request() req) {
    const authUserID = req.user.id;
    return new Response({
      content: await this.placesService.getDiscoveredPlacesByUser(authUserID),
      status: HttpStatus.OK,
    });
  }

  @UseGuards( JwtAuthGuard )
  @Get('visited/me')
  async getVisitedPlacesByAuthUser(@Request() req) {
    const authUserID = req.user.id;
    return new Response({
      content: await this.placesService.getUserPlacesVisited(authUserID),
      status: HttpStatus.OK,
    });
  }

  @UseGuards( JwtAuthGuard )
  @Get('visited/by/:userID')
  async getVisitedPlacesByUser(@Param('userID') userID: string) {
    return new Response({
      content: await this.placesService.getUserPlacesVisited(userID),
      status: HttpStatus.OK,
    });
  }

  @UseGuards( JwtAuthGuard )
  @Get('confirmed/me')
  async getDiscoveredPlacesConfirmByAuthUser(@Request() req) {
    const authUserID = req.user.id;
    return new Response({
      content: await this.placesService.getUserPlacesConfirmed(authUserID),
      status: HttpStatus.OK,
    });
  }

  @Get('discovered/by/:userID')
  async getDiscoveredPlacesByUser(@Request() req, @Param('userID') userID: string) {
    return new Response({
      content: await this.placesService.getDiscoveredPlacesByUser(userID),
      status: HttpStatus.OK,
    });
  }

  @Get('confirmmed/by/:userID')
  async getDiscoveredPlacesConfirmmedByUser(@Request() req, @Param('userID') userID: string) {
    return new Response({
      content: await this.placesService.getUserPlacesConfirmed(userID),
      status: HttpStatus.OK,
    });
  }
}
