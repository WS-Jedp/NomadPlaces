import {
  BadRequestException,
  HttpException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { Multimedia, Places, PlaceSession, PlaceSessionActions } from '@prisma/client';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { RegisterPlaceSessionActionDTO } from 'src/place-sessions/dto/registerAction.dto';

@Injectable()
export class PlaceSessionRepository {
  constructor(private prismaService: PrismaService) {}

  //   Place session queries
  async find(
    id: string,
    withPlace = true,
    withUsers = true,
    withActions = true,
  ) {
    const session = await this.prismaService.placeSession.findFirst({
      where: { id },
      include: { place: withPlace, users: withUsers, actions: withActions },
    });

    return session;
  }

  async getAllFromDate(date: string) {
    const sessions = await this.prismaService.placeSession.findMany({
      where: { createdDate: { gte: date } },
    });
    return sessions;
  }

  async create(placeSession: Omit<PlaceSession, 'id'>) {
    const newSessionPlace = await this.prismaService.placeSession.create({
      data: placeSession,
    });
    return newSessionPlace;
  }

  async delete(sessionID: string) {
    const sessionDeleted = await this.prismaService.placeSession.delete({ where: { id: sessionID } })
    return sessionDeleted
  }

  //   Place session user queries
  async findUserInSession(sessionID: string, userID: string) {
    const session = await this.find(sessionID, false, true, false)
    if (!session) throw new NotImplementedException();

    return session.users.some(user => user.id === userID)
  }

  async registerUserIntoSession(sessionID: string, userID: string) {

    const updatedSession = await this.prismaService.placeSession.update({
      where: { id: sessionID },
      data: {
        usersIDs: {
          push: userID,
        },
      },
    });
    return updatedSession.usersIDs;
  }

  //   Recent activity queries
  async addRecentActivity(sessionID: string, recentActivity: Multimedia) {
    const session = await this.find(sessionID)
    if (!session) throw new NotImplementedException();

    const updatedSession = await this.prismaService.placeSession.update({
      where: { id: sessionID },
      data: {
        recentActivity: {
          push: recentActivity,
        },
      },
    });
    return updatedSession.recentActivity;
  }

  async removeRecentActivity(sessionID: string, recentActivity: Multimedia) {
    const session = await this.find(sessionID)
    if (!session) throw new NotImplementedException();

    const updatedSession = await this.prismaService.placeSession.update({
      where: { id: sessionID },
      data: {
        recentActivity: {
          deleteMany: {
            where: {
              url: recentActivity.url,
            },
          },
        },
      },
    });

    return updatedSession.recentActivity;
  }

  //   Sesssion actions queries
  async registerAction(action: RegisterPlaceSessionActionDTO) {
    const sessionID = action.placeSessionID
    if(!sessionID) throw new BadRequestException()

    const actionEntity = await this.prismaService.placeSessionActions.create({
        data: {
          createdDate: action.createdDate,
          dayTimeSection: action.dayTimeSection,
          payload: JSON.stringify(action.payload),
          type: action.type,
          placeSessionID: action.placeSessionID,
          userID: action.userID
        },
    })


    return actionEntity
  }

  async findPlaceCurrentSession(placeID: string, currentDate: Date, sessionEndDate: Date) {
      return this.prismaService.placeSession.findFirst({
        where: {
          place: {
            id: placeID
          },
          AND: {
            createdDate: {
              gte: currentDate,
              lte: sessionEndDate
            }
          }
        }
      })
  }
}
