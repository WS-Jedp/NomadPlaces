import { Injectable } from '@nestjs/common';
import { PlaceSessionActions } from '@prisma/client';
import { PeopleRepository } from 'src/auth/repositories/people';
import { UserRepository } from 'src/auth/repositories/user';
import { UpdateAction } from 'src/place-sessions/types/updateAction';

@Injectable()
export class GamificationService {

    constructor(
        private peopleRepository: PeopleRepository,
        private userRepository: UserRepository,
    ) {}

    private POINTS_PER_FIRST_IN_SESSION = 90;
    private POINTS_PER_JOIN_SESSION = 60;
    private POINTS_PER_FIRST_UPDATE_ACTION = 60;
    private POINTS_PER_UPDATE_ACTION = 30;

    private POINTS_PER_DISCOVER_SPOT = 120;
    private POINTS_PER_DISCOVER_SPOT_CONFIRMATION = 90;
    private POINTS_PER_DISCOVER_SPOT_FIRST_CONFIRMATION = 300;
    private POINTS_PER_DISCOVER_SPOT_APPROVED = 300;
    private POINTS_PER_DISCOVER_SPOT_CONFIRMED_APPROVED = 90;


    private async getGamificationData(userID: string) {
        const user = await this.userRepository.findOne(userID);
        if(!user) return null;

        return user.gamification;
    }

    public async addPointsToUser(userID: string, points: number) {
        const user = await this.userRepository.findOne(userID);
        if(!user) return null;

        const updatedUser = await this.userRepository.addGamificationPoints(user, points);
        return updatedUser.gamification;
    }

    public getActionsPointsAmount(userActions: UpdateAction[]) {
        let points = 0
        points += this.POINTS_PER_UPDATE_ACTION * userActions.length;
        return points;
        
    }
    public getJoinSessionPointsAmount(isFirstJoin: boolean) {
        if(isFirstJoin) return this.POINTS_PER_FIRST_IN_SESSION;
        return this.POINTS_PER_JOIN_SESSION;
    }

    public getDiscoverSpotPointsAmount() {
        return this.POINTS_PER_DISCOVER_SPOT;
    }
    public getDiscoverSpotApprovedPointsAmount() {
        return this.POINTS_PER_DISCOVER_SPOT_APPROVED;
    }
    public getDiscoverSpotConfirmationPointsAmount(isFirstConfirmation: boolean) {
        if(isFirstConfirmation) return this.POINTS_PER_DISCOVER_SPOT_FIRST_CONFIRMATION;
        return this.POINTS_PER_DISCOVER_SPOT_CONFIRMATION;
    }
    public getDiscoverSpotConfirmedApprovedPointsAmount() {
        return this.POINTS_PER_DISCOVER_SPOT_CONFIRMED_APPROVED;
    }
    

}
