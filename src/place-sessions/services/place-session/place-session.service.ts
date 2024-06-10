import {
  Injectable,
  CACHE_MANAGER,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  DAY_TIME_SECTION_ENUM,
  Multimedia,
  PlaceSession,
  PlaceSessionActions,
  PLACE_SESSION_ACTIONS_ENUM,
  User,
} from '@prisma/client';
import { CreatePlaceSessionDTO } from 'src/place-sessions/dto/createPlaceSession.dto';
import { PlaceSessionHelper } from 'src/place-sessions/dto/helpers/placeSession.helper';
import { RegisterPlaceSessionActionDTO } from 'src/place-sessions/dto/registerAction.dto';
import { PlaceSessionRepository } from 'src/place-sessions/repositories/place-session/place-session.repository';
import { PlaceSessionCachedDataDTO } from 'src/place-sessions/dto/placeSessionCachedData.dto';
import { PlaceSessionActionDataPayload } from 'src/global/models/placeSession/placeSessionActionData.model';
import { PlaceRecentActivity } from 'src/global/models/recentActivity';
import {
  getCurrentDay,
  getCurrentMonth,
  getUTCCurrentDate,
} from 'src/global/utils/dates';
import { PLACE_MINDSET_ENUM } from 'src/global/models/mindset/mindset.model';
import {
  UpdateActionData,
  UPDATE_ACTIONS,
} from 'src/global/models/placeSession/updateAction.model';
import { UserRepository } from 'src/auth/repositories/user';
import { GamificationService } from 'src/gamification/services/gamification/gamification.service';

@Injectable()
export class PlaceSessionService {
  constructor(
    private placeSessionRepository: PlaceSessionRepository,
    private userRepository: UserRepository,
    private gamificationService: GamificationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   ************************************************************
   * --------- PLACE SESSION ACTIONS METHODS
   ************************************************************
   */
  public async registerUserActionIntoSession(payload: {
    sessionID: string;
    userID: string;
    username: string;
    actionType: PLACE_SESSION_ACTIONS_ENUM;
    actionPayload: object;
  }) {
    const currentDate = getUTCCurrentDate();
    const actionPayloadData =
      payload.actionPayload as PlaceSessionActionDataPayload[typeof payload.actionType];

    const sessionActions = await this.placeSessionRepository.findAllActions(
      payload.sessionID,
    );

    let currentSession: PlaceSessionCachedDataDTO =
      await this.getSessionCacheData(payload.sessionID);

    if (!currentSession) {
      currentSession = (await this.getSessionData(payload.sessionID)) as any;
    }

    // Check if user is able to register action by time and type
    if (payload.actionType === PLACE_SESSION_ACTIONS_ENUM.UPDATE) {
      const dataFromActionPayload = actionPayloadData as any;

      const actionsByUser = sessionActions.filter(
        (action) => action.userID === payload.userID,
      );
      if (actionsByUser.length > 0) {
        const actionsByUserInLast20Minutes = actionsByUser.filter(
          (action) =>
            action.createdDate > new Date(currentDate.getTime() - 20 * 60000),
        );

        if (actionsByUserInLast20Minutes.length > 0) {
          const actionsByUserInLast20MinutesWithSameType =
            actionsByUserInLast20Minutes.find(
              (action) =>
                JSON.parse(String(action.payload)).type ==
                dataFromActionPayload.type,
            );
          if (actionsByUserInLast20MinutesWithSameType) {
            return {
              error: {
                type: 'UPDATE_ACTION_LIMIT',
                message:
                  'The user already made an action of this type in the last 20 minutes',
              },
            };
          }
        }
      }
    }

    const action = await this.placeSessionRepository.registerAction({
      createdDate: currentDate,
      username: payload.username,
      dayTimeSection: this.getDayTimeSection(currentDate.getHours()),
      placeSessionID: payload.sessionID,
      type: payload.actionType,
      userID: payload.userID,
      payload: actionPayloadData,
    });

    // Cache actions
    this.addActionIntoSessionCache(currentSession.placeID, action);

    if (payload.actionType == 'RECENT_ACTIVITY') {
      this.addRecentActivityFromSessionCache(currentSession.placeID, action);
    }
    // Gamification part
    const earnedPoints = this.gamificationService.getPointsPerUpdateAction();
    const gamification = await this.gamificationService.addPointsToUser(
      payload.userID,
      earnedPoints,
    );

    return {
      ...action,
      userGamification: {
        ...gamification,
        earnedPoints,
      },
    };
  }

  public async registerUserIntoSession(
    placeID: string,
    userID: string,
    username: string,
  ): Promise<{
    session: PlaceSession;
    action: PlaceSessionActions & {
      userGamification?: { points: number; earnedPoints: number };
    };
  }> {
    const createdDate = getUTCCurrentDate();
    const currentSession = await this.getPlaceCurrentSession(
      placeID,
      createdDate,
    );

    const sessionJoinActions =
      await this.placeSessionRepository.findAllJoinActionsFromSession(
        currentSession.id,
      );
    // const cachedSession = await this.getPlaceCurrentCachedSesssion(placeID)

    const userIDOpt = currentSession.usersIDs.find((id) => id === userID);
    if (userIDOpt) {
      const lastLeaveAction =
        await this.placeSessionRepository.findLastLeaveActionFromUser(
          currentSession.id,
          userIDOpt,
        );

      if (lastLeaveAction) {
        const leaveActionDate = lastLeaveAction.createdDate;
        const tryJoinDate = getUTCCurrentDate();

        // If the user left the session before the current date, then he can join again
        if (leaveActionDate < tryJoinDate) {
          const action = await this.registerJoinActionIntoSession(
            currentSession,
            userID,
            username,
            createdDate,
          );

          // -- Gamification part
          // Check if the user is joining the session before, if he was, it should not win points
          if (!lastLeaveAction) {
            const earnedPoints =
              this.gamificationService.getJoinSessionPointsAmount(
                sessionJoinActions.length === 0,
              );
            const gamification = await this.gamificationService.addPointsToUser(
              userID,
              earnedPoints,
            );
            return {
              session: currentSession,
              action: {
                ...action,
                userGamification: { ...gamification, earnedPoints },
              },
            };
          }

          return { session: currentSession, action };
        }
      }

      return { session: currentSession, action: null };
    }

    const action = await this.registerJoinActionIntoSession(
      currentSession,
      userID,
      username,
      createdDate,
    );

    const earnedPoints = this.gamificationService.getJoinSessionPointsAmount(
      sessionJoinActions.length === 0,
    );
    const gamification = await this.gamificationService.addPointsToUser(
      userID,
      earnedPoints,
    );

    return {
      session: currentSession,
      action: {
        ...action,
        userGamification: {
          ...gamification,
          earnedPoints,
        },
      },
    };
  }

  private async registerJoinActionIntoSession(
    currentSession: PlaceSession,
    userID: string,
    username: string,
    createdDate: Date,
  ) {
    await this.placeSessionRepository.registerUserIntoSession(
      currentSession.id,
      userID,
    );

    const currentDate = getUTCCurrentDate();

    const action = await this.registerActionIntoSession({
      createdDate: currentDate,
      dayTimeSection: this.getDayTimeSection(currentDate.getHours()),
      placeSessionID: currentSession.id,
      type: 'JOIN',
      userID: userID,
      username: username,
      payload: {
        data: {
          username,
        },
      },
    });

    // Cache actions
    await this.addActionIntoSessionCache(currentSession.placeID, action);

    return action;
  }

  public async unregisterUserFromSession(
    placeSessionID: string,
    userID: string,
    username: string,
    placeID: string,
  ) {
    const cachedSession = await this.getPlaceCurrentCachedSesssion(placeID);
    if (
      cachedSession &&
      !cachedSession.usersInSession.find((user) => user.id === userID)
    ) {
      new HttpException('User is not in session', HttpStatus.BAD_REQUEST);
    }

    const lastLeaveAction =
      await this.placeSessionRepository.findLastLeaveActionFromUser(
        placeSessionID,
        userID,
      );
    const lastJoinAction =
      await this.placeSessionRepository.findLastJoinActionFromUser(
        placeSessionID,
        userID,
      );
    const currentDate = getUTCCurrentDate();

    if (!lastLeaveAction) {
      const currentAction = await this.registerActionIntoSession({
        createdDate: currentDate,
        dayTimeSection: this.getDayTimeSection(currentDate.getHours()),
        placeSessionID: placeSessionID,
        type: 'LEAVE',
        userID: userID,
        username: username,
        payload: {
          data: {
            username,
          },
        },
      });

      const currentSession = await this.getSessionData(placeSessionID);
      this.addActionIntoSessionCache(currentSession.placeID, currentAction);

      return currentAction;
    }

    if (
      lastLeaveAction &&
      lastJoinAction.createdDate > lastLeaveAction.createdDate &&
      currentDate > lastJoinAction.createdDate
    ) {
      // TODO: Here should be the Redis function to remove the user from the session
      if (cachedSession) {
        this.removeUserFromSessionCache(placeID, userID);
      }

      const currentAction = await this.registerActionIntoSession({
        createdDate: currentDate,
        dayTimeSection: this.getDayTimeSection(currentDate.getHours()),
        placeSessionID: placeSessionID,
        type: 'LEAVE',
        userID: userID,
        username: username,
        payload: {
          data: {
            username,
          },
        },
      });
      const currentSession = await this.getSessionData(placeSessionID);
      this.addActionIntoSessionCache(currentSession.placeID, currentAction);
      return currentAction;
    }

    return null;
  }

  public async registerActionIntoSession(
    placeSessionActionDTO: RegisterPlaceSessionActionDTO,
  ) {
    const actions = this.placeSessionRepository.registerAction(
      placeSessionActionDTO,
    );
    return actions;
  }

  public async regsiterMultipleActionsIntoSession(payload: {
    placeID: string;
    sessionID: string;
    userID: string;
    username: string;
    actions: {
      type: UPDATE_ACTIONS;
      data: UpdateActionData;
    }[];
  }) {
    const savedActions: PlaceSessionActions[] = [];
    const errors: any[] = [];

    await Promise.all(
      payload.actions.map(async (action) => {
        const data =
          action.data as unknown as UpdateActionData[typeof action.type];
        const lastAction = (await this.registerUserActionIntoSession({
          sessionID: payload.sessionID,
          userID: payload.userID,
          username: payload.username,
          actionType: PLACE_SESSION_ACTIONS_ENUM.UPDATE,
          actionPayload: {
            type: action.type,
            data: {
              data,
            },
          },
        })) as any;
        if (errors.length > 0) return null;

        if (lastAction.error) {
          errors.push(lastAction);
          return lastAction;
        }

        this.addActionIntoSessionCache(payload.placeID, lastAction);
        savedActions.push(lastAction);
      }),
    );

    return errors.length > 0 ? errors[0] : savedActions;
  }

  /**
   ************************************************************
   * --------- PLACE SESSION DATA METHODS
   ************************************************************
   */
  public async getSessionData(sessionID: string) {
    const session = await this.placeSessionRepository.find(sessionID);
    return session;
  }

  public async getPlaceCurrentSession(
    placeID: string,
    currentDate: Date,
  ): Promise<PlaceSession> {
    const sessionEndDate = this.getSessionEndDate(currentDate);
    const session = await this.placeSessionRepository.findPlaceCurrentSession(
      placeID,
      currentDate,
      sessionEndDate,
    );
    if (!session) {
      return this.handleCreateDefaultNewSession(
        placeID,
        currentDate,
        sessionEndDate,
      );
    }
    return session;
  }

  public async getPlaceSessionDetail(sessionID: string) {
    const session = await this.placeSessionRepository.find(
      sessionID,
      false,
      false,
      true,
    );
    return session;
  }

  public async getPlaceCurrentCachedSesssion(placeID: string) {
    const cachedSession = await this.getSessionCacheData(placeID);
    if (!cachedSession) {
      const colombianDate = getUTCCurrentDate();
      const session = await this.getPlaceCurrentSession(placeID, colombianDate);
      const cachedData = await this.setSessionCacheData(
        placeID,
        await this.getPlaceSessionCachedData(session),
      );
      return cachedData;
    }
    return cachedSession;
  }

  public async getPlaceSessionCachedData(
    session: PlaceSession,
  ): Promise<PlaceSessionCachedDataDTO> {
    const MAX_ACTIONS_PER_CACHED_SESSION = 21;
    const actions = await this.placeSessionRepository.findAllActions(
      session.id,
    );

    const users = await this.userRepository.findAllUsersIDIn(session.usersIDs);
    const allMindsetActions = this.getOnlyMindsetActions(actions);
    const allSessionAmountofPeopleActions =
      this.getOnlyAmountOfPeopleActions(actions);
    const allPlaceStatusActions = this.getOnlyPlaceStatusActions(actions);

    return {
      sessionID: session.id,
      bestMindsetTo: this.getMindsetActionsPerMindset(allMindsetActions),
      lastActions: actions.slice(0, MAX_ACTIONS_PER_CACHED_SESSION),
      lastRecentlyActivities: [],
      lastUpdate:
        actions.length > 0
          ? actions.filter(
              (action) => action.type === PLACE_SESSION_ACTIONS_ENUM.UPDATE,
            )[0]?.createdDate
          : null,
      placeID: session.placeID,
      usersInSession: this.getUsersInSession(
        users,
        actions.filter(
          (action) =>
            action.type === PLACE_SESSION_ACTIONS_ENUM.JOIN ||
            action.type === PLACE_SESSION_ACTIONS_ENUM.LEAVE,
        ),
      ),
      amountOfPeople: this.getAmountOfPeoplePerAmount(
        allSessionAmountofPeopleActions,
      ),
      placeStatus: this.getPlaceStatusPerStatus(allPlaceStatusActions), // TODO
    };
  }

  private getOnlyMindsetActions(actions: PlaceSessionActions[]) {
    return actions.filter(
      (action) =>
        action.type === PLACE_SESSION_ACTIONS_ENUM.UPDATE &&
        JSON.parse(action.payload.toString()).type ===
          UPDATE_ACTIONS.PLACE_MINDSET,
    );
  }

  private getOnlyPlaceStatusActions(actions: PlaceSessionActions[]) {
    return actions.filter(
      (action) =>
        action.type === PLACE_SESSION_ACTIONS_ENUM.UPDATE &&
        JSON.parse(action.payload.toString()).type ===
          UPDATE_ACTIONS.PLACE_STATUS,
    );
  }

  private getOnlyAmountOfPeopleActions(actions: PlaceSessionActions[]) {
    return actions.filter(
      (action) =>
        action.type === PLACE_SESSION_ACTIONS_ENUM.UPDATE &&
        JSON.parse(action.payload.toString()).type ===
          UPDATE_ACTIONS.PLACE_AMOUNT_OF_PEOPLE,
    );
  }

  private getMindsetActionsPerMindset(actions: PlaceSessionActions[]) {
    const AVAILABLE_MINDSETS = [
      PLACE_MINDSET_ENUM.ROMANTIC,
      PLACE_MINDSET_ENUM.WORK,
      PLACE_MINDSET_ENUM.STUDY,
      PLACE_MINDSET_ENUM.VIBE,
    ];
    const mindsetActionsPerMindset = AVAILABLE_MINDSETS.map((mindset) => {
      return {
        mindset,
        actions: actions.filter(
          (action) => this.getMindsetActionPerMindsetType(action) === mindset,
        ),
      };
    });

    return mindsetActionsPerMindset;
  }

  private getMindsetActionPerMindsetType(
    action: PlaceSessionActions,
  ): PLACE_MINDSET_ENUM {
    const payload = JSON.parse(action.payload.toString()).data
      .data as UpdateActionData['PLACE_MINDSET'];
    return payload;
  }

  private getUsersInSession(
    users: Partial<User>[],
    actions: PlaceSessionActions[],
  ) {
    const usersInSession = [];
    users.forEach((user) => {
      const lastUserJoinAction = actions
        .filter(
          (action) =>
            action.userID === user.id &&
            action.type === PLACE_SESSION_ACTIONS_ENUM.JOIN,
        )
        .reduce(
          (prev, next) => (prev?.createdDate > next?.createdDate ? prev : next),
          undefined,
        );
      const lastUserLeaveAction = actions
        .filter(
          (action) =>
            action.userID === user.id &&
            action.type === PLACE_SESSION_ACTIONS_ENUM.LEAVE,
        )
        .reduce(
          (prev, next) => (prev?.createdDate > next?.createdDate ? prev : next),
          undefined,
        );

      if (!lastUserJoinAction) return;
      if (
        !lastUserLeaveAction ||
        lastUserJoinAction.createdDate > lastUserLeaveAction.createdDate
      ) {
        usersInSession.push(user);
      }
    });
    return usersInSession;
  }

  private getAmountOfPeoplePerAmount(actions: PlaceSessionActions[]) {
    const AMOUNT_OPTIONS = ['0-5', '5-10', '10-15', '15-20', '20-25', '+25'];
    const amountOfPeoplePerAmount = AMOUNT_OPTIONS.map((option) => {
      return {
        amount: option,
        actions: actions.filter((action) => {
          const payload = JSON.parse(action.payload.toString()).data
            .data as UpdateActionData['PLACE_AMOUNT_OF_PEOPLE'];
          return payload.amount === option;
        }),
      };
    });
    return amountOfPeoplePerAmount;
  }

  private getPlaceStatusPerStatus(actions: PlaceSessionActions[]) {
    const PLACE_STATUS_OPTIONS = ['OPEN', 'CLOSED'];
    const placeStatusPerStatus = PLACE_STATUS_OPTIONS.map((option) => {
      return {
        name: option,
        type: option,
        value: option === 'OPEN' ? true : false,
        actions: actions.filter((action) => {
          const payload = JSON.parse(action.payload.toString()).data
            .data as UpdateActionData['PLACE_STATUS'];
          return payload.type === option;
        }),
      };
    });
    return placeStatusPerStatus;
  }

  /**
   ************************************************************
   * --------- CACHE DATA METHODS
   ************************************************************
   */

  public async deleteAllCacheData() {
    await this.cacheManager.reset();
  }

  public async getSessionCacheData(
    placeID: string,
  ): Promise<PlaceSessionCachedDataDTO> {
    let cachedData = await this.cacheManager.get<PlaceSessionCachedDataDTO>(
      `place-session-${placeID}`,
    );
    if (!cachedData) {
      const currentUTCDate = getUTCCurrentDate();
      const session = await this.getPlaceCurrentSession(
        placeID,
        currentUTCDate,
      );
      cachedData = await this.getPlaceSessionCachedData(session);
    }
    return cachedData;
  }

  public async setSessionCacheData(
    placeID: string,
    cachedData: PlaceSessionCachedDataDTO | Partial<PlaceSessionCachedDataDTO>,
  ) {
    try {
      await this.cacheManager.set(`place-session-${placeID}`, cachedData);
      const cached = await this.cacheManager.get<PlaceSessionCachedDataDTO>(
        `place-session-${placeID}`,
      );
      return cached;
    } catch (error) {
      return false;
    }
  }

  public async updateSessionCacheData(
    placeID: string,
    newData: Partial<PlaceSessionCachedDataDTO>,
  ) {
    const cachedData = await this.getSessionCacheData(placeID);
    if (!cachedData) return this.setSessionCacheData(placeID, newData);

    for (const key of Object.keys(newData)) {
      if (!cachedData[key] || cachedData[key] !== newData[key]) {
        cachedData[key] = newData[key];
      }
    }

    return await this.setSessionCacheData(placeID, cachedData);
  }

  // Place session actions methods
  public async addUserIntoSessionCache(placeID: string, user: User) {
    const cachedData = await this.getSessionCacheData(placeID);
    const users = cachedData.usersInSession;

    if (users.some((u) => u.id === user.id)) return cachedData.usersInSession;

    cachedData.usersInSession.push(user);
    await this.updateSessionCacheData(placeID, {
      usersInSession: cachedData.usersInSession,
    });
    return cachedData.usersInSession;
  }

  public async removeUserFromSessionCache(placeID: string, userID: string) {
    const cachedData = await this.getSessionCacheData(placeID);
    const users = cachedData.usersInSession;

    if (users.some((u) => u.id !== userID)) return cachedData.usersInSession;

    cachedData.usersInSession = cachedData.usersInSession.filter(
      (u) => u.id !== userID,
    );
    await this.updateSessionCacheData(placeID, {
      usersInSession: cachedData.usersInSession,
    });
    return cachedData.usersInSession;
  }

  // Place session actions methods
  public async addActionIntoSessionCache(
    placeID: string,
    action: PlaceSessionActions,
  ) {
    let cachedData = await this.getSessionCacheData(placeID);
    const MAX_ACTIONS_AMOUNT = 21;

    if (cachedData && cachedData.lastActions) {
      if (
        cachedData.lastActions &&
        cachedData.lastActions?.length >= MAX_ACTIONS_AMOUNT
      )
        cachedData.lastActions.pop();
    } else {
      if (!cachedData) {
        const newCachedData = await this.setSessionCacheData(placeID, {
          lastActions: [],
          amountOfPeople: null,
          usersInSession: [],
          bestMindsetTo: null,
          lastRecentlyActivities: [],
          lastUpdate: null,
          placeID: placeID,
          placeStatus: null,
        });
        if (newCachedData) {
          cachedData = newCachedData;
        }
      }
      cachedData.lastActions = [];
    }

    cachedData.lastActions.unshift(action);
    await this.updateSessionCacheData(placeID, {
      lastActions: cachedData.lastActions,
    });
    return cachedData.lastActions;
  }

  public async removeActionFromSessionCache(placeID: string, actionID: string) {
    const cachedData = await this.getSessionCacheData(placeID);
    cachedData.lastActions = cachedData.lastActions.filter(
      (u) => u.id !== actionID,
    );
    await this.updateSessionCacheData(placeID, {
      lastActions: cachedData.lastActions,
    });
    return cachedData.lastActions;
  }

  // Place session recent activity methods
  public async addRecentActivityFromSessionCache(
    placeID: string,
    recentActivityAction: PlaceSessionActions & {
      user: User;
    },
  ) {
    const cachedData = await this.getSessionCacheData(placeID);
    const MAX_LAST_RECENT_ACTIVITY_AMOUNT = 9;

    if (cachedData.lastActions.length >= MAX_LAST_RECENT_ACTIVITY_AMOUNT)
      cachedData.lastRecentlyActivities.pop();
    const actionPayloadData =
      recentActivityAction.payload as PlaceSessionActionDataPayload[typeof recentActivityAction.type];

    const recentActivity: PlaceRecentActivity = {
      userID: recentActivityAction.userID,
      username: recentActivityAction.user.username,
      userPhotoURL: recentActivityAction.user.profilePicture,
      ...(actionPayloadData.data as Multimedia),
    };
    cachedData.lastRecentlyActivities.unshift(recentActivity);
    await this.updateSessionCacheData(placeID, {
      lastRecentlyActivities: cachedData.lastRecentlyActivities,
    });
    return cachedData.lastRecentlyActivities;
  }

  public async removeRecentActivityFromSessionCache(
    placeID: string,
    recentActivityAction: PlaceSessionActions & { user: User },
  ) {
    const cachedData = await this.getSessionCacheData(placeID);
    const MAX_LAST_RECENT_ACTIVITY_AMOUNT = 9;

    if (cachedData.lastActions.length >= MAX_LAST_RECENT_ACTIVITY_AMOUNT)
      cachedData.lastRecentlyActivities.pop();

    const actionPayloadData =
      recentActivityAction.payload as PlaceSessionActionDataPayload[typeof recentActivityAction.type];
    const recentActivityPayload = actionPayloadData.data as Multimedia;

    cachedData.lastRecentlyActivities =
      cachedData.lastRecentlyActivities.filter(
        (recentActivity) => recentActivity.url !== recentActivityPayload.url,
      );
    await this.updateSessionCacheData(placeID, {
      lastRecentlyActivities: cachedData.lastRecentlyActivities,
    });
    return cachedData.lastRecentlyActivities;
  }

  /**
   ************************************************************
   * --------- HELPERS METHODS
   ************************************************************
   */
  public async handleCreateDefaultNewSession(
    placeID: string,
    currentDate: Date,
    sessionEndDate: Date,
  ) {
    // Handle default creation of a session
    const COLOMBIA_ZERO_TIME = '.350Z';
    const startDateOfSession = getUTCCurrentDate();

    const placeSessionDTO = new CreatePlaceSessionDTO({
      createDate: startDateOfSession,
      endDate: sessionEndDate,
      placeSessionID: placeID,
    });

    const placeSessionEntity = await this.placeSessionRepository.create(
      PlaceSessionHelper.dtoToEntity(placeSessionDTO),
    );

    this.setSessionCacheData(placeID, {
      usersInSession: [],
      lastActions: [],
      lastRecentlyActivities: [],
      lastUpdate: startDateOfSession,
    });
    return placeSessionEntity;
  }

  protected getDayTimeSection(currentHours: number) {
    if (currentHours >= 0 && currentHours < 3)
      return DAY_TIME_SECTION_ENUM.EARLY_MORNING;
    if (currentHours >= 3 && currentHours < 6)
      return DAY_TIME_SECTION_ENUM.BEFORE_SUNRISE;
    if (currentHours >= 6 && currentHours < 9)
      return DAY_TIME_SECTION_ENUM.SUNRISE;
    if (currentHours >= 9 && currentHours < 12)
      return DAY_TIME_SECTION_ENUM.MORNING;
    if (currentHours >= 12 && currentHours < 15)
      return DAY_TIME_SECTION_ENUM.MIDDAY;
    if (currentHours >= 15 && currentHours < 18)
      return DAY_TIME_SECTION_ENUM.AFTERNOON;
    if (currentHours >= 18 && currentHours < 21)
      return DAY_TIME_SECTION_ENUM.NIGHT;
    if (currentHours >= 21 && currentHours <= 24)
      return DAY_TIME_SECTION_ENUM.LATE_NIGHT;

    return DAY_TIME_SECTION_ENUM.EARLY_MORNING;
  }

  // Get current date end of the day date
  protected getSessionEndDate(currentDate: Date) {
    const newDate = new Date(currentDate);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }
}
