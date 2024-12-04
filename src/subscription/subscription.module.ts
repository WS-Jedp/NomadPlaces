import { Module } from '@nestjs/common';
import { SubscriptionController } from './controllers/subscription/subscription.controller';
import { SubscriptionService } from './services/subscription/subscription.service';
import { PrismaService } from 'src/global/prisma-service/prisma-service.service';
import { UserRepository } from 'src/auth/repositories/user';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, UserRepository, PrismaService],
})
export class SubscriptionModule {}
