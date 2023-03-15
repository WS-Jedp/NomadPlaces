import { Multimedia, PlaceSessionActions, User } from '@prisma/client';
import { IsArray, IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

class PlaceSessionCachedDataDTO {
  @IsDate()
  @IsNotEmpty()
  lastUpdate: Date;

  @IsNumber()
  amountOfPeople: Number;

  @IsString()
  @IsNotEmpty()
  bestMindsetTo: string;

  @IsString()
  @IsNotEmpty()
  placeStatus: string;

  @IsArray()
  lastActions: PlaceSessionActions[]

  @IsArray()
  lastRecentlyActivities: Multimedia[]

  @IsArray()
  usersInSession: User[]
  
  public constructor(properties: PlaceSessionCachedDataDTO) {
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
