import { Module } from '@nestjs/common';
import { PlaceSessionGateway } from './gateways/place-session/place-session.gateway';
import { PlaceSessionService } from './services/place-session/place-session.service';
import { PlaceSessionRepository } from './repositories/place-session/place-session.repository';

@Module({
  providers: [PlaceSessionGateway, PlaceSessionService, PlaceSessionRepository]
})
export class PlaceSessionsModule {}
