import { PlaceSessionActions, User } from '@prisma/client';
import { IsArray, IsDate, IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PLACE_MINDSET_ENUM } from 'src/global/models/mindset/mindset.model';
import { PlaceRecentActivity } from 'src/global/models/recentActivity';

class PlaceSessionCachedDataDTO {
  @IsString()
  @IsMongoId()
  placeID: string;

  @IsDate()
  @IsNotEmpty()
  lastUpdate: Date;

  @IsNumber()
  amountOfPeople: Number;

  @IsString()
  @IsNotEmpty()
  bestMindsetTo: PLACE_MINDSET_ENUM;

  @IsString()
  @IsNotEmpty()
  placeStatus: string;

  @IsArray()
  lastActions: PlaceSessionActions[]

  @IsArray()
  lastRecentlyActivities: PlaceRecentActivity[]

  @IsArray()
  usersInSession: User[]
  
  public constructor(properties: PlaceSessionCachedDataDTO) {
    this.placeID = properties.placeID
    this.lastUpdate = properties.lastUpdate;
    this.amountOfPeople = properties.amountOfPeople;
    this.bestMindsetTo = properties.bestMindsetTo;
    this.placeStatus = properties.placeStatus;
    this.lastActions = properties.lastActions;
    this.lastRecentlyActivities = properties.lastRecentlyActivities;
    this.usersInSession = properties.usersInSession;
  }
}

export { PlaceSessionCachedDataDTO };
