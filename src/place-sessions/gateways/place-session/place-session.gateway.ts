import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { PLACE_SESSION_ACTIONS_ENUM } from '@prisma/client';
import { Socket, Server } from 'socket.io';
import { PLACE_MINDSET_ENUM } from 'src/global/models/mindset/mindset.model';
import { PlaceSessionActionDataPayload } from 'src/global/models/placeSession/placeSessionActionData.model';
import { UpdateActionData, UPDATE_ACTIONS } from 'src/global/models/placeSession/updateAction.model';
import { getColombianCurrentDate } from 'src/global/utils/dates';
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
    const { action, session } = await this.placeSessionService.registerUserIntoSession(
      payload.placeID,
      payload.userID,
      payload.username,
      getColombianCurrentDate().toISOString()
    );

    const message = {
      type: PLACE_SESSION_ACTIONS_ENUM.JOIN,
      username: payload.username,
      createdDateISO: action.createdDate,
      userID: payload.userID,
      sessionID: session.id,
      action,
    }

    this.server
      .to(`place-session-${payload.placeID}`)
      .emit(
        'place-session-message',
        JSON.stringify(message),
      );
  }

  @SubscribeMessage('quick-join-place-session')
  async handleQuickUserJoinSession(
    client: Socket, 
    payload: {
      placeID: string;
    }
  ): Promise<void> {
    // TODO: Validate if user is already in session or already leave the session
    // If the user leaved the session, should not be able to quick join
    client.join(`place-session-${payload.placeID}`);
  }

  @SubscribeMessage('leave-place-session')
  async handleUserLeaveSession(
    client: Socket,
    payload: { userID: string; placeID: string; username: string, sessionID: string },
  ) {
    const action = await this.placeSessionService.unregisterUserFromSession(
      payload.sessionID,
      payload.userID,
      payload.username,
      payload.placeID
    );

    const message = {
      type: PLACE_SESSION_ACTIONS_ENUM.LEAVE,
      username: payload.username,
      createdDateISO: action.createdDate,
      userID: payload.userID,
      sessionID: payload.sessionID,
      action,
    }

    this.server
      .to(`place-session-${payload.placeID}`)
      .emit(
        'place-session-message',
        JSON.stringify(message),
      );
      client.leave(`place-session-${payload.placeID}`);
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
      username: string,
      type: PLACE_SESSION_ACTIONS_ENUM;
      data: PlaceSessionActionDataPayload;
      createdDateISO: string;
    },
  ) {
    const lastAction = await this.placeSessionService.registerUserActionIntoSession({
      userID: payload.userID,
      username: payload.username,
      actionPayload: payload.data,
      sessionID: payload.sessionID,
      actionType: payload.type,
      createdDateISO: getColombianCurrentDate().toISOString(),
    });

    this.server.to(`place-session-${payload.placeID}`)
      .emit(`place-session-update`, JSON.stringify([lastAction]))
  }
  

  @SubscribeMessage('place-session-multiple-actions')
  async handleSessionMultipleActions(
    client: Socket,
    payload: {
      placeID: string,
      sessionID: string,
      userID: string,
      username: string,
      actions: {
        type: UPDATE_ACTIONS,
        data: UpdateActionData
      }[],
      createdDateISO: string
    }) {
      const lastActions = await this.placeSessionService.regsiterMultipleActionsIntoSession({
        userID: payload.userID,
        username: payload.username,
        actions: payload.actions,
        sessionID: payload.sessionID,
        createdDateISO: payload.createdDateISO,
        placeID: payload.placeID
      });

      this.server.to(`place-session-${payload.placeID}`)
      .emit(`place-session-update`, JSON.stringify(lastActions))
    }
}
