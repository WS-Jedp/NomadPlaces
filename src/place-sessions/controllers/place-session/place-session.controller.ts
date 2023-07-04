import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import Response from 'src/global/models/response';
import { getColombianCurrentDate } from 'src/global/utils/dates';
import { PlaceSessionService } from 'src/place-sessions/services/place-session/place-session.service';

@Controller('place-session')
export class PlaceSessionController {

    constructor(private placeSessionService: PlaceSessionService) {}

    @Get('/cache/current/:id')
    public async getPlaceSessionCachedData(@Param('id') placeID: string) {
        const sessionCachedData = await this.placeSessionService.getPlaceCurrentCachedSesssion(placeID)
        return new Response({
            content: sessionCachedData,
            status: HttpStatus.OK
        })
    }

    @Get('/current/:id')
    public async getPlaceSession(@Param('id') placeID: string) {
        const placeSession = await this.placeSessionService.getPlaceCurrentSession(placeID, getColombianCurrentDate())
        return new Response({
            content: placeSession,
            status: HttpStatus.OK
        })
    }

    @Get('/detail/:id')
    public async getPlaceSessionDetail(@Param('id') sessionID: string) {
        const placeSession = await this.placeSessionService.getPlaceSessionDetail(sessionID)
        return new Response({
            content: placeSession,
            status: HttpStatus.OK
        })
    }

    @Get('/reset-cache')
    public async resetCache() {
        await this.placeSessionService.deleteAllCacheData()
        return new Response({
            content: 'Cache reseted',
            status: HttpStatus.OK
        })
    }

}
