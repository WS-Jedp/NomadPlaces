import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import Response from 'src/global/models/response';
import { PlaceSessionService } from 'src/place-sessions/services/place-session/place-session.service';

@Controller('place-session')
export class PlaceSessionController {

    constructor(private placeSessionService: PlaceSessionService) {}

    @Get('/quick-review/:id')
    public async getPlaceSessionCachedData(@Param('id') placeID: string) {
        const sessionCachedData = await this.placeSessionService.getSessionCacheData(placeID)
        return new Response({
            content: sessionCachedData,
            status: HttpStatus.OK
        })
    }

    @Get('/detail/:id')
    public async getPlaceSessionDetail(@Param('id') placeID: string) {
        const placeSession = await this.placeSessionService.getPlaceCurrentSession(placeID, new Date())
        return new Response({
            content: placeSession,
            status: HttpStatus.OK
        })
    }

}
