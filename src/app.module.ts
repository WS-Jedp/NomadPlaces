import { CacheModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { environments } from './config/environmets'
import { PlacesModule } from './places/places.module';
import { PrismaService } from './global/prisma-service/prisma-service.service';
import { DistanceService } from './global/distance/distance.service';
import { PlaceSessionsModule } from './place-sessions/place-sessions.module';
import config from './config'

const DEFAULT_ENV_FILE_PATH = '.env'

@Global()
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
    envFilePath: environments[process.env.NODE_ENV] || DEFAULT_ENV_FILE_PATH,
    isGlobal: true,
    load: [config],
    validationSchema: Joi.object({
      MONGO_DATABASE_NAME: Joi.string().required(),
      MONGO_DATABASE_PORT: Joi.number().required(),
      MONGO_INIT_USERNAME: Joi.string().required(),
      MONGO_INIT_PASSWORD: Joi.string().required(),
    })
  }), PlacesModule, PlaceSessionsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, DistanceService],
})
export class AppModule {}
