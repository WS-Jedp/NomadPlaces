import { Module } from '@nestjs/common';
import { PeopleRepository } from 'src/auth/repositories/people';
import { UserRepository } from 'src/auth/repositories/user';
import { UserService } from 'src/auth/services/user/user.service';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { StorageService } from 'src/global/services/aws/storage/storage.service';
import { SocialController } from './controllers/social/social.controller';
import { SocialRequestRepository } from './repositories/socialRequest';
import { SocialService } from './services/social/social.service';

@Module({
  controllers: [SocialController],
  providers: [SocialService, UserService, PeopleRepository, UserRepository, PrismaService, SocialRequestRepository, StorageService],
  exports: [SocialRequestRepository]
})
export class SocialModule {}
