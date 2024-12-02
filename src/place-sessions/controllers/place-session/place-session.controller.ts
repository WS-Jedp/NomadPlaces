import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt';
import { UserService } from 'src/auth/services/user/user.service';
import Response from 'src/global/models/response';
import { getUTCCurrentDate } from 'src/global/utils/dates';
import { PlaceSessionService } from 'src/place-sessions/services/place-session/place-session.service';

@Controller('place-session')
export class PlaceSessionController {
  constructor(
    private placeSessionService: PlaceSessionService,
    private userService: UserService,
  ) {}

  @Get('/cache/current/:id')
  public async getPlaceSessionCachedData(@Param('id') placeID: string) {
    const sessionCachedData =
      await this.placeSessionService.getPlaceCurrentCachedSesssion(placeID);
    return new Response({
      content: sessionCachedData,
      status: HttpStatus.OK,
    });
  }

  @Get('/current/:id')
  public async getPlaceSession(@Param('id') placeID: string) {
    const placeSession = await this.placeSessionService.getPlaceCurrentSession(
      placeID,
      getUTCCurrentDate(),
    );
    return new Response({
      content: placeSession,
      status: HttpStatus.OK,
    });
  }

  @Get('/detail/:id')
  public async getPlaceSessionDetail(@Param('id') sessionID: string) {
    const placeSession = await this.placeSessionService.getPlaceSessionDetail(
      sessionID,
    );
    return new Response({
      content: placeSession,
      status: HttpStatus.OK,
    });
  }

  @Get('/reset-cache')
  public async resetCache() {
    await this.placeSessionService.deleteAllCacheData();
    return new Response({
      content: 'Cache reseted',
      status: HttpStatus.OK,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/share/recent-activity')
  @UseInterceptors(FilesInterceptor('files'))
  public async shareRecentActivity(
    @Req() req,
    @Body() body: { spotID: string; sessionID: string },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const authUserID = req.user.id;
    const recentActivityAction =
      await this.placeSessionService.shareRecentActivity(
        { spotID: body.spotID, sessionID: body.sessionID, userID: authUserID },
        files,
      );

    return new Response({
      content: recentActivityAction,
      status: HttpStatus.OK,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/current')
  public async getUserCurrentSession(@Req() req) {
    const authUserID = req.user.id;
    const userLastSession = await this.userService.getUserLastSessionState(
      authUserID,
    );
    return new Response({
      content: userLastSession,
      status: HttpStatus.OK,
    });
  }
}
