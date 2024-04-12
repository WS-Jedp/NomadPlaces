import { Injectable } from "@nestjs/common";
import { FOLLOW_REQUEST_STATUS_ENUM, People, User, UserFollowRequest } from "@prisma/client";
import { PrismaService } from "src/global/prisma-service/prisma-service.service";

@Injectable()
export class SocialRequestRepository {
    constructor(
        private prismaService: PrismaService
    ) {}


    public async findOne(id: string) {
        return await this.prismaService.userFollowRequest.findUnique({
            where: {
                id,
            }
        });
    }

    public async getUserSocialRequestsPending(userID: string) {
        return await this.prismaService.userFollowRequest.findMany({
            where: {
                OR: [
                    {
                        receiverID: userID,
                        status: FOLLOW_REQUEST_STATUS_ENUM.PENDING,
                    },
                    {
                        senderID: userID,
                        status: FOLLOW_REQUEST_STATUS_ENUM.PENDING,
                    }
                ]
            },
            include: {
                sender: true,
                receiver: true,
            }
        });
    }

    public async getUserFollowRequests(userID: string) {
        return await this.prismaService.userFollowRequest.findMany({
            where: {
                receiverID: userID,
                status: FOLLOW_REQUEST_STATUS_ENUM.PENDING,
            }
        });
    }

    public async findByUserAndUserToFollow(userID: string, userToFollowID: string) {
        return await this.prismaService.userFollowRequest.findFirst({
            where: {
                senderID: userID,
                receiverID: userToFollowID,
            }
        });
    }

   public async createRequest(data: Omit<UserFollowRequest, 'id'>) {
        return await this.prismaService.userFollowRequest.create({
            data,
        });
    }

    public async deleteRequest(id: string) {
        return await this.prismaService.userFollowRequest.delete({
            where: {
                id,
            }
        });
    }

    public async acceptRequest(id: string) {
        return await this.prismaService.userFollowRequest.update({
            where: {
                id,
            },
            data: {
                status: FOLLOW_REQUEST_STATUS_ENUM.ACCEPTED,
            }
        });
    }

    public async rejectRequest(id: string) {
        return await this.prismaService.userFollowRequest.update({
            where: {
                id,
            },
            data: {
                status: FOLLOW_REQUEST_STATUS_ENUM.REJECTED,
            }
        });
    }
}