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


  /**
   * =============================================
   * ============== QUICK REVIEW =================
   * =============================================
   */
  @SubscribeMessage('quick-review-place-session')
  async handleUserQuickReview(
    client: Socket,
    payload: { placeID: string; userID: string },
  ) {
    client.join(`place-session-${payload.placeID}-quick-review`);

    const totalListeners = await this.server.listeners(
      `place-session-${payload.placeID}`,
    ).length;

    this.server
      .to(`place-session-${payload.placeID}-quick-review`)
      .emit('quick-review-place-session', totalListeners);
  }

  /**
   * =============================================
   * ============= JOIN AND LEAVE ================
   * =============================================
   */
  @SubscribeMessage('join-place-session')
  async handleUserJoinSession(
    client: Socket,
    payload: {
      placeID: string;
      userID: string;
      username: string;
      currentDateISO: string;
    },
  ): Promise<void> {
    client.join(`place-session-${payload.placeID}`);
    const session = await this.placeSessionService.registerUserIntoSession(
      payload.placeID,
      payload.userID,
      payload.currentDateISO
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
    payload: { userID: string; placeID: string; username: string, sesionID: string },
  ) {
    client.leave(`place-session-${payload.placeID}`);
    await this.placeSessionService.unregisterUserFromSession(
      payload.sesionID,
      payload.userID,
    );
    this.server
      .to(`place-session-${payload.placeID}`)
      .emit(
        'place-session-message',
        `The user @${payload.username} has leave the session`,
      );
  }

  /**
   * =============================================
   * ============ SESSION ACTIONS ================
   * =============================================
   */
  @SubscribeMessage('place-session-action')
  async handleSessionNewUpdate(
    client: Socket,
    payload: {
      placeID: string,
      sessionID: string;
      userID: string;
      type: PLACE_SESSION_ACTIONS_ENUM;
      data: PlaceSessionActionDataPayload;
      createdDateISO: string;
    },
  ) {
    const lastAction = await this.placeSessionService.registerUserActionIntoSession({
      userID: payload.userID,
      actionPayload: payload.data,
      sessionID: payload.sessionID,
      actionType: payload.type,
      createdDateISO: payload.createdDateISO
    });
    this.server.to(`place-session-${payload.placeID}`).emit(`place-session-update`, JSON.stringify(lastAction))
  }
}
