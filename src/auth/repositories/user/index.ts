import { Injectable } from '@nestjs/common';
import {
  People,
  SUBSCRIPTION_PLAN_ENUM,
  SUBSCRIPTION_STATUS_ENUM,
  User,
} from '@prisma/client';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { getUTCCurrentDate } from 'src/global/utils/dates';

@Injectable()
export class UserRepository {
  constructor(private prismaService: PrismaService) {}

  // ID Methods
  public async findOne(id: string, withPerson: boolean = false) {
    return await this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        person: withPerson,
      },
    });
  }

  // Find by username
  public async findByUsername(username: string) {
    return await this.prismaService.user.findFirst({
      where: {
        username,
      },
    });
  }

  // Find by email
  public async findByEmail(email: string) {
    return await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
  }

  public async findByEmailOrUsername(emailOrUsername: string) {
    return await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            email: emailOrUsername,
          },
          {
            username: emailOrUsername,
          },
        ],
      },
    });
  }

  public findAllUsersIDIn(ids: string[]) {
    return this.prismaService.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
      },
    });
  }

  // Register user
  public async registerUser(data: Omit<User, 'id'>) {
    return await this.prismaService.user.create({
      data,
    });
  }

  public async updateProfilePicture(user: User, profilePicture: string) {
    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        profilePicture,
      },
    });
  }

  // Update reset password token
  public async updateResetPasswordToken(
    user: User,
    token: string,
    expireDate: Date,
  ) {
    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: expireDate,
      },
    });
  }

  public async updatePassword(user: User, password: string) {
    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        password,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });
  }

  // Social methods
  public async addFollower(user: User, followerID: string) {
    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        followers: {
          push: followerID,
        },
      },
    });
  }

  public async removeFollower(user: User, followerID: string) {
    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        followers: {
          set: user.followers.filter((follower) => follower !== followerID),
        },
      },
    });
  }

  public async addFollowing(user: User, followingID: string) {
    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        following: {
          push: followingID,
        },
      },
    });
  }

  public async removeFollowing(user: User, followingID: string) {
    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        following: {
          set: user.following.filter((following) => following !== followingID),
        },
      },
    });
  }

  // Discover and confirmation places methods
  public async addDiscoveredPlace(user: User, placeID: string) {
    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        discoveredPlacesIDs: {
          push: placeID,
        },
      },
    });
  }

  public async removeDiscoverPlace(user: User, placeID: string) {
    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        discoveredPlacesIDs: {
          set: user.discoveredPlacesIDs.filter((place) => place !== placeID),
        },
      },
    });
  }

  public async addConfirmationPlace(user: User, placeID: string) {
    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        confirmedPlacesIDs: {
          push: placeID,
        },
      },
    });
  }

  public async removeConfirmationPlace(user: User, placeID: string) {
    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        confirmedPlacesIDs: {
          set: user.confirmedPlacesIDs.filter((place) => place !== placeID),
        },
      },
    });
  }

  // Visited places methods
  addVisitedPlaceToUser(user: User, placeID: string) {
    return this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        visitedPlacesIDs: {
          push: placeID,
        },
      },
    });
  }

  // Gamification methods
  public async addGamificationPoints(user: User, points: number) {
    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        gamification: {
          upsert: {
            set: {
              points: user.gamification.points + points,
            },
            update: {
              points: {
                increment: points,
              },
            },
          },
        },
      },
    });
  }

  // Session methods
  public async getLastUserSession(user: User) {
    return await this.prismaService.placeSession.findFirst({
      where: {
        id: {
          in: user.sessionsIDs,
        },
      },
      orderBy: {
        createdDate: 'desc',
      },
    });
  }

  public async addSessionToUser(userID: string, sessionID: string) {
    return await this.prismaService.user.update({
      where: {
        id: userID,
      },
      data: {
        sessionsIDs: {
          push: sessionID,
        },
      },
    });
  }

  //   ========================
  //   Subscription methods
  //   ========================

  public async getUserSubscription(id: string) {
    return await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        subscription: true,
      },
    });
  }

  public async createUserSubscription(
    userID: string,
    plan: SUBSCRIPTION_PLAN_ENUM,
  ) {
    return await this.prismaService.user.update({
      where: {
        id: userID,
      },
      data: {
        subscription: {
          update: {
            type: plan,
            status: SUBSCRIPTION_STATUS_ENUM.APPROVED,
            createdDate: getUTCCurrentDate(),
            updatedDate: getUTCCurrentDate(),
          },
        },
      },
    });
  }

  public async updateSubscriptionToStatus(
    id: string,
    status: SUBSCRIPTION_STATUS_ENUM,
  ) {
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        subscription: {
          update: {
            status,
            updatedDate: getUTCCurrentDate(),
          },
        },
      },
    });
  }
}
