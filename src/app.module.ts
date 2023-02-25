import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import * as joi from 'joi'

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { environments } from './config/environmets'
import { PlacesModule } from './places/places.module';
import config from './config'

const DEFAULT_ENV_FILE_PATH = '.env'

@Global()
@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: environments[process.env.NODE_ENV] || DEFAULT_ENV_FILE_PATH,
    isGlobal: true,
    load: [config],
    validationSchema: {
      MONGO_DATABASE_NAME: joi.string().required(),
      MONGO_DATABASE_PORT: joi.number().required(),
    }
  }), PlacesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
