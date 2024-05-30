import { Body, Controller, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt';
import { SessionUpdateActionsDTO } from '../../dto/SessionUpdateActionsDTO.dto';
import { GamificationService } from 'src/gamification/services/gamification/gamification.service';
import Response from 'src/global/models/response';
import { PlaceSessionService } from 'src/place-sessions/services/place-session/place-session.service';

@UseGuards(JwtAuthGuard)
@Controller('gamification')
export class GamificationController {

    constructor(
        private gamificationService: GamificationService,
        private placeSessionService: PlaceSessionService
    ) {}

    // PLACE SESSION GAMIFICATION
    @Post('session/actions/update')
    async sessionActions(@Req() req, @Body() body: SessionUpdateActionsDTO) {
        const authuserID = req.user.id;
        const earnedPoints = await this.gamificationService.getActionsPointsAmount(body.actions)
        const userGamification = await this.gamificationService.addPointsToUser(authuserID, earnedPoints);
        return new Response({
            content: {
                userGamification,
                earnedPoints,
            },
            status: HttpStatus.OK,
        })
    }

    @Post('session/actions/join')
    async joinSession(@Req() req, @Body() body: { sessionID: string }) {
        const authuserID = req.user.id;
        const session = await this.placeSessionService.getSessionData(body.sessionID)
        const earnedPoints = await this.gamificationService.getJoinSessionPointsAmount( session.actions.length === 1 )
        const userGamification = await this.gamificationService.addPointsToUser(authuserID, earnedPoints);
        return new Response({
            content: {
                userGamification,
                earnedPoints,
            },
            status: HttpStatus.OK,
        })
    }
}
