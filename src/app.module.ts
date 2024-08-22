import { Global, Module } from '@nestjs/common';
import type { RedisClientOptions } from 'redis'
import { redisStore } from 'cache-manager-redis-store'
import { CacheModule } from '@nestjs/cache-manager'
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
import { StorageService } from './global/services/aws/storage/storage.service';
import { AuthModule } from './auth/auth.module';
import { SocialModule } from './social/social.module';
import { GamificationModule } from './gamification/gamification.module';
import config from './config';
import { RedisOptions } from './config/redis.config';

const DEFAULT_ENV_FILE_PATH = '.env';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: environments[process.env.NODE_ENV] || DEFAULT_ENV_FILE_PATH,
      isGlobal: true,
      load: [config],
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        FRONTEND_URL: Joi.string().required(),
        MONGO_DATABASE_NAME: Joi.string().required(),
        MONGO_DATABASE_PORT: Joi.number().required(),
        MONGO_INIT_USERNAME: Joi.string().required(),
        MONGO_INIT_PASSWORD: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        AWS_SES_USER: Joi.string().required(),
        AWS_SES_PASSWORD: Joi.string().required(),
        AWS_S3_BUCKET_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required()
      }),
    }),
    CacheModule.registerAsync(RedisOptions),
    MailerModule.forRoot({
      transport: {
        host: 'email-smtp.us-east-2.amazonaws.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.AWS_SES_USER,
          pass: process.env.AWS_SES_PASSWORD,
        },
      },
      defaults: {
        from: "'No Reply' <spots.community.app@gmail.com>",
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
