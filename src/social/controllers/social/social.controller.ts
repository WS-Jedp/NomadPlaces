import { Controller, Get, HttpStatus, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt';
import { UserService } from 'src/auth/services/user/user.service';
import Response from 'src/global/models/response';
import { SocialService } from 'src/social/services/social/social.service';

@UseGuards( JwtAuthGuard )
@Controller('social')
export class SocialController {

    public constructor(
        private socialService: SocialService,
        private userService: UserService
    ) {}


    @Get('external-profile/:userID')
    async getExternalProfile(@Param('userID') userID: string) {
        return new Response({
            content: {
                user: await this.userService.getUserWithPerson(userID),
            },
            status: HttpStatus.OK
        })
    }

    @Get('me/followers')
    async getFollowers(@Request() req) {
        const authUserID = req.user.id;
        return new Response({
            content: {
                followers: await this.userService.getFollowers(authUserID),
            },
            status: HttpStatus.OK
        })
    }

    @Get('me/following')
    async getFollowing(@Request() req) {
        const authUserID = req.user.id;
        return new Response({
            content: {
                following: await this.userService.getFollowing(authUserID),
            },
            status: HttpStatus.OK
        })
    }

    @Get('me/follow/requests')
    async getFollowRequests(@Request() req) {
        const authUserID = req.user.id;
        return new Response({
            content: {
                requests: await this.socialService.getUserFollowRequestsPending(authUserID),
            },
            status: HttpStatus.OK
        })
    }

    @Post('follow/request/:userID')
    async follow(@Request() req, @Param('userID') userID: string) {
        const authUserID = req.user.id;
        return new Response({
            content: {
                socialRequest: await this.socialService.userFollowRequest(authUserID, userID),
            },
            status: HttpStatus.CREATED 
        })
    }

    @Post('follow/request/accept/:requestID')
    async acceptFollowRequest(@Request() req, @Param('requestID') requestID: string) {
        const authUserID = req.user.id;
        return new Response({
            content: {
                socialRequest: await this.socialService.acceptFollowRequest(authUserID, requestID),
            },
            status: HttpStatus.OK
        })
    }

    @Post('follow/request/reject/:requestID')
    async rejectFollowRequest(@Request() req, @Param('requestID') requestID: string) {
        const authUserID = req.user.id;
        return new Response({
            content: {
                socialRequest: await this.socialService.rejectFollowRequest(authUserID, requestID),
            },
            status: HttpStatus.OK
        })
    }

    @Post('followers/remove/:userID')
    async removeFollower(@Request() req, @Param('userID') userID: string) {
        const authUserID = req.user.id;
        return new Response({
            content: {
                followers: await this.userService.removeFollower(authUserID, userID),
            },
            status: HttpStatus.OK
        })
    }

    @Post("following/remove/:userID")
    async removeFollowing(@Request() req, @Param('userID') userID: string) {
        const authUserID = req.user.id;
        return new Response({
            content: {
                following: await this.userService.removeFollowing(authUserID, userID),
            },
            status: HttpStatus.OK
        })
    }


}
