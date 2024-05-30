import { CacheModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { environments } from './config/environmets';
import { PlacesModule } from './places/places.module';
import { PrismaService } from './global/prisma-service/prisma-service.service';
import { DistanceService } from './global/distance/distance.service';
import { PlaceSessionsModule } from './place-sessions/place-sessions.module';
import { StorageService } from './global/services/gcp/storage/storage.service';
import { AuthModule } from './auth/auth.module';
import { SocialModule } from './social/social.module';
import { GamificationModule } from './gamification/gamification.module';
import config from './config';

const DEFAULT_ENV_FILE_PATH = '.env';

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
        FRONTEND_URL: Joi.string().required(),
        MONGO_DATABASE_NAME: Joi.string().required(),
        MONGO_DATABASE_PORT: Joi.number().required(),
        MONGO_INIT_USERNAME: Joi.string().required(),
        MONGO_INIT_PASSWORD: Joi.string().required(),
        GCP_PROJECT_ID: Joi.string().required(),
        GCP_PRIVATE_KEY_ID: Joi.string().required(),
        GCP_PRIVATE_KEY: Joi.string().required(),
        GCP_CLIENT_EMAIL: Joi.string().required(),
        GCP_MULTIMEDIA_BUCKET: Joi.string().required(),
        GCP_JSON_FILE: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        SMPT_HOST: Joi.string().required(),
        SMPT_PORT: Joi.number().required(),
        MAILER_USER: Joi.string().required(),
        MAILER_PASSWORD: Joi.string().required(),
      }),
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      },
      defaults: {
        from: "'No Reply' <no-reply@spots.com>",
      },
      template: {
        dir: process.cwd() + '/src/global/mailer/templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    PlacesModule,
    PlaceSessionsModule,
    AuthModule,
    SocialModule,
    GamificationModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, DistanceService, StorageService],
})
export class AppModule {}
