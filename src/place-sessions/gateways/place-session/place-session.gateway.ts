import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { PLACE_SESSION_ACTIONS_ENUM } from '@prisma/client';
import { Socket, Server } from 'socket.io';
import { PlaceSessionActionDataPayload } from 'src/global/models/placeSession/placeSessionActionData.model';
import { PlaceSessionService } from 'src/place-sessions/services/place-session/place-session.service';

@WebSocketGateway(3080, {
  cors: {
    origin: '*',
  },
})
export class PlaceSessionGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(private placeSessionService: PlaceSessionService) {}

  handleConnection(client: any, ...args: any[]) {
    console.log('SOMEONE IS CONNECTED!!');
  }

  @SubscribeMessage('quick-review-place-session')
  async handleUserQuickReview(
    client: Socket,
    payload: { placeID: string; userID: string },
  ) {
    const totalListeners = this.server.listeners(
      `place-session-${payload.placeID}`,
    ).length;
  }

  @SubscribeMessage('join-place-session')
  async handleUserJoinSession(
    client: Socket,
    payload: {
      placeID: string;
      userID: string;
      username: string;
    },
  ): Promise<void> {
    client.join(`place-session-${payload.placeID}`);
    const session = await this.placeSessionService.registerUserIntoSession(
      payload.placeID,
      payload.userID,
    );
    this.server
      .to(`place-session-${payload.placeID}`)
      .emit(
        'place-session-message',
        `The user @${payload.username} is in the session`,
      );
  }

  @SubscribeMessage('leave-place-session')
  async handleUserLeaveSession(
    client: Socket,
    payload: { userID: string; sessionID: string; username: string },
  ) {
    client.leave(`place-session-${payload.sessionID}`);
    await this.placeSessionService.unregisterUserFromSession(
      payload.sessionID,
      payload.userID,
    );
    this.server
      .to(`place-session-${payload.sessionID}`)
      .emit(
        'place-session-message',
        `The user @${payload.username} has leave the session`,
      );
  }

  @SubscribeMessage('place-session-action')
  async handleSessionNewUpdate(
    client: Socket,
    payload: {
      placeID: string,
      sessionID: string;
      userID: string;
      type: PLACE_SESSION_ACTIONS_ENUM;
      data: PlaceSessionActionDataPayload;
    },
  ) {
    const lastAction = await this.placeSessionService.registerUserActionIntoSession({
      userID: payload.userID,
      actionPayload: payload.data,
      sessionID: payload.sessionID,
      actionType: payload.type,
    });
    this.server.to(`place-session-${payload.placeID}`).emit(`place-session-update`, JSON.stringify(lastAction))
  }
}
