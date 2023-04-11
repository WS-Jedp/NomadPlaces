import { Injectable, CACHE_MANAGER, Inject  } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { DAY_TIME_SECTION_ENUM, Multimedia, PlaceSession, PlaceSessionActions, PLACE_SESSION_ACTIONS_ENUM, User } from '@prisma/client';
import { CreatePlaceSessionDTO } from 'src/place-sessions/dto/createPlaceSession.dto';
import { PlaceSessionHelper } from 'src/place-sessions/dto/helpers/placeSession.helper';
import { RegisterPlaceSessionActionDTO } from 'src/place-sessions/dto/registerAction.dto';
import { PlaceSessionRepository } from 'src/place-sessions/repositories/place-session/place-session.repository';
import { PlaceSessionCachedDataDTO } from 'src/place-sessions/dto/placeSessionCachedData.dto';
import { PlaceSessionActionDataPayload } from 'src/global/models/placeSession/placeSessionActionData.model';
import { PlaceRecentActivity } from 'src/global/models/recentActivity';
import { getCurrentDay, getCurrentMonth } from 'src/global/utils/dates';
import { PLACE_MINDSET_ENUM } from 'src/global/models/mindset/mindset.model';

@Injectable()
export class PlaceSessionService {

    constructor(private placeSessionRepository: PlaceSessionRepository, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}


    /**
     ************************************************************
     * --------- PLACE SESSION ACTIONS METHODS
     ************************************************************
     */
    public async registerUserActionIntoSession(payload: {
        sessionID: string, userID: string, actionType: PLACE_SESSION_ACTIONS_ENUM, actionPayload: Object, createdDateISO: string
    }) {
        const currentDate = new Date(payload.createdDateISO)
        const actionPayloadData = payload.actionPayload as PlaceSessionActionDataPayload[typeof payload.actionType]

        const currentSession = await this.getSessionCacheData(payload.sessionID)

        if(!currentSession) await this.setSessionCacheData(payload.sessionID, await this.getSessionData(payload.sessionID))

        const action = await this.placeSessionRepository.registerAction({
            createdDate: currentDate,
            dayTimeSection: this.getDayTimeSection(currentDate.getHours()),
            placeSessionID: payload.sessionID,
            type: payload.actionType,
            userID: payload.userID,
            payload: actionPayloadData
        })

        // Cache actions
        this.addActionIntoSessionCache(currentSession.placeID, action)

        if(payload.actionType == 'RECENT_ACTIVITY') {
            this.addRecentActivityFromSessionCache(currentSession.placeID, action)
        }

        return action
    }


    public async registerUserIntoSession(placeID: string, userID: string, createdDateISO: string) {
        const createdDate = new Date(createdDateISO)
        const currentSession = await this.getPlaceCurrentSession(placeID, createdDate)
        const isUserInSession = currentSession.usersIDs.some(id => id === userID)
        if(isUserInSession) return currentSession

        await this.placeSessionRepository.registerUserIntoSession(currentSession.id, userID)

        const action = await this.registerActionIntoSession({
            createdDate,
            dayTimeSection: this.getDayTimeSection(createdDate.getHours()),
            placeSessionID: currentSession.id,
            type: 'JOIN',
            userID: userID,
            payload: null
        })

        // Cache actions
        await this.addActionIntoSessionCache(placeID, action)

        return currentSession
    }

    public async unregisterUserFromSession(placeSessionID: string, userID: string) {
        const isUserInSession = await this.placeSessionRepository.findUserInSession(placeSessionID, userID)
        if(!isUserInSession) return false

        // TODO: Here should be the Redis function to remove the user from the session
        const currentDate = new Date()
        const currentAction = await this.registerActionIntoSession({
            createdDate: currentDate,
            dayTimeSection: this.getDayTimeSection(currentDate.getHours()),
            placeSessionID: placeSessionID,
            type: 'LEAVE',
            userID: userID,
        })

        const currentSession = await this.getSessionData(placeSessionID)
        this.addActionIntoSessionCache(currentSession.placeID, currentAction)

        return currentAction
    }

    public async registerActionIntoSession(placeSessionActionDTO: RegisterPlaceSessionActionDTO) {
        const actions = this.placeSessionRepository.registerAction(placeSessionActionDTO)
        return actions
    }


    /**
     ************************************************************
     * --------- PLACE SESSION DATA METHODS
     ************************************************************
     */
    public async getSessionData(sessionID: string) {
        const session = await this.placeSessionRepository.find(sessionID)
        return session
    }

    public async getPlaceCurrentSession(placeID: string, currentDate: Date): Promise<PlaceSession> {
        const sessionEndDate = this.getSessionEndDate(currentDate)
        const session = await this.placeSessionRepository.findPlaceCurrentSession(placeID, currentDate, sessionEndDate)

        if(!session) return this.handleCreateDefaultNewSession(placeID, currentDate, sessionEndDate)
        return session
    }


    /**
     ************************************************************
     * --------- CACHE DATA METHODS
     ************************************************************
     */
    public async getSessionCacheData(placeID: string): Promise<PlaceSessionCachedDataDTO> {
        const cachedData = await this.cacheManager.get<PlaceSessionCachedDataDTO>(`place-session-${placeID}`)
        return cachedData
    }

    public async setSessionCacheData(placeID: string, cachedData: PlaceSessionCachedDataDTO | Partial<PlaceSessionCachedDataDTO>) {
        try {
            await this.cacheManager.set(`place-session-${placeID}`, cachedData)
            return true
        } catch (error) {
            return false
        }
    }

    public async updateSessionCacheData(placeID: string, newData: Partial<PlaceSessionCachedDataDTO>) {
        const cachedData = await this.getSessionCacheData(placeID)
        if(!cachedData) return this.setSessionCacheData(placeID, newData)

        for (const key of Object.keys(newData)) {
            if(!cachedData[key] || cachedData[key] !== newData[key]) {
                cachedData[key] = newData[key]
            }
        }

        return await this.setSessionCacheData(placeID, cachedData)
    }

    // Place session actions methods
    public async addUserIntoSessionCache(placeID: string, user: User) {
        const cachedData = await this.getSessionCacheData(placeID)
        const users = cachedData.usersInSession

        if(users.some(u => u.id === user.id)) return cachedData.usersInSession

        cachedData.usersInSession.push(user)
        await this.updateSessionCacheData(placeID, { usersInSession: cachedData.usersInSession })
        return cachedData.usersInSession
    }

    public async removeUserFromSessionCache(placeID: string, user: User) {
        const cachedData = await this.getSessionCacheData(placeID)
        const users = cachedData.usersInSession

        if(users.some(u => u.id !== user.id)) return cachedData.usersInSession

        cachedData.usersInSession = cachedData.usersInSession.filter(u => u.id !== user.id)
        await this.updateSessionCacheData(placeID, { usersInSession: cachedData.usersInSession })
        return cachedData.usersInSession
    }

    // Place session actions methods
    public async addActionIntoSessionCache(placeID: string, action: PlaceSessionActions) {
        const cachedData = await this.getSessionCacheData(placeID)
        const MAX_ACTIONS_AMOUNT = 21

        if(cachedData.lastActions)

        if(cachedData.lastActions && cachedData.lastActions?.length >= MAX_ACTIONS_AMOUNT) cachedData.lastActions.pop()

        cachedData.lastActions.unshift(action)
        await this.updateSessionCacheData(placeID, { lastActions: cachedData.lastActions })
        return cachedData.lastActions
    }

    public async removeActionFromSessionCache(placeID: string, actionID: string) {
        const cachedData = await this.getSessionCacheData(placeID)
        cachedData.lastActions = cachedData.lastActions.filter(u => u.id !== actionID)
        await this.updateSessionCacheData(placeID, { lastActions: cachedData.lastActions })
        return cachedData.lastActions
    }

    // Place session recent activity methods
    public async addRecentActivityFromSessionCache(placeID: string, recentActivityAction: PlaceSessionActions & {
        user: User;
    }) {
        const cachedData = await this.getSessionCacheData(placeID)
        const MAX_LAST_RECENT_ACTIVITY_AMOUNT = 9

        if(cachedData.lastActions.length >= MAX_LAST_RECENT_ACTIVITY_AMOUNT) cachedData.lastRecentlyActivities.pop()
        const actionPayloadData = recentActivityAction.payload as PlaceSessionActionDataPayload[typeof recentActivityAction.type]

        const recentActivity: PlaceRecentActivity = {
            userID: recentActivityAction.userID,
            username: recentActivityAction.user.name,
            userPhotoURL: recentActivityAction.user.name,
            ...actionPayloadData.data as Multimedia
        }
        cachedData.lastRecentlyActivities.unshift(recentActivity)
        await this.updateSessionCacheData(placeID, { lastRecentlyActivities: cachedData.lastRecentlyActivities })
        return cachedData.lastRecentlyActivities
    }

    public async removeRecentActivityFromSessionCache(placeID: string, recentActivityAction: PlaceSessionActions & { user: User }) {
        const cachedData = await this.getSessionCacheData(placeID)
        const MAX_LAST_RECENT_ACTIVITY_AMOUNT = 9

        if(cachedData.lastActions.length >= MAX_LAST_RECENT_ACTIVITY_AMOUNT) cachedData.lastRecentlyActivities.pop()

        const actionPayloadData = recentActivityAction.payload as PlaceSessionActionDataPayload[typeof recentActivityAction.type]
        const recentActivityPayload = actionPayloadData.data as Multimedia

        cachedData.lastRecentlyActivities = cachedData.lastRecentlyActivities.filter(recentActivity => recentActivity.url !== recentActivityPayload.url)
        await this.updateSessionCacheData(placeID, { lastRecentlyActivities: cachedData.lastRecentlyActivities })
        return cachedData.lastRecentlyActivities
    }



    /**
     ************************************************************
     * --------- HELPERS METHODS
     ************************************************************
     */
    public async handleCreateDefaultNewSession(placeID: string, currentDate: Date, sessionEndDate: Date) {
        // Handle default creation of a session
        const COLOMBIA_ZERO_TIME = '.350Z'
        const startDateOfSession = new Date(`${currentDate.getFullYear()}-${getCurrentMonth(currentDate)}-${getCurrentDay(currentDate)}T00:00:00${COLOMBIA_ZERO_TIME}`)

        const placeSessionDTO = new CreatePlaceSessionDTO({
            createDate: startDateOfSession,
            endDate: sessionEndDate,
            placeSessionID: placeID,
        })

        const placeSessionEntity = await this.placeSessionRepository.create( PlaceSessionHelper.dtoToEntity(placeSessionDTO) )

        this.setSessionCacheData(placeID, {
            usersInSession: [],
            lastActions: [],
            lastRecentlyActivities: [],
            lastUpdate: startDateOfSession,
        })
        return placeSessionEntity
    }

    protected getDayTimeSection(currentHours: number) {

        if(currentHours >= 0 && currentHours < 3 ) return DAY_TIME_SECTION_ENUM.EARLY_MORNING
        if(currentHours >= 3 && currentHours < 6 ) return DAY_TIME_SECTION_ENUM.BEFORE_SUNRISE
        if(currentHours >= 6 && currentHours < 9 ) return DAY_TIME_SECTION_ENUM.SUNRISE
        if(currentHours >= 9 && currentHours < 12 ) return DAY_TIME_SECTION_ENUM.MORNING
        if(currentHours >= 12 && currentHours < 15 ) return DAY_TIME_SECTION_ENUM.MIDDAY
        if(currentHours >= 15 && currentHours < 18 ) return DAY_TIME_SECTION_ENUM.AFTERNOON
        if(currentHours >= 18 && currentHours < 21 ) return DAY_TIME_SECTION_ENUM.NIGHT
        if(currentHours >= 21 && currentHours <= 24 ) return DAY_TIME_SECTION_ENUM.LATE_NIGHT

        return DAY_TIME_SECTION_ENUM.EARLY_MORNING
    }

    protected getSessionEndDate(currentDate: Date) {
        const COLOMBIA_ZERO_TIME = '.350Z'
        const END_HOUR_TIME_FOR_SESSION = '23:59:59'+COLOMBIA_ZERO_TIME

        const dayOfSession: string = getCurrentDay(currentDate)
        const monthOfSession: string = getCurrentMonth(currentDate)
        const yearOfSession: number = currentDate.getFullYear()

        const newDate = `${yearOfSession}-${monthOfSession}-${dayOfSession}T${END_HOUR_TIME_FOR_SESSION}`
        return new Date(newDate)
    }
}
