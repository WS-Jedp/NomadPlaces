import { Injectable } from '@nestjs/common';
import {
    Subscription,
  SUBSCRIPTION_PLAN_ENUM,
  SUBSCRIPTION_STATUS_ENUM,
} from '@prisma/client';
import { UserRepository } from 'src/auth/repositories/user';
import { getUTCCurrentDate } from 'src/global/utils/dates';

@Injectable()
export class SubscriptionService {
  constructor(private userRepository: UserRepository) {}

  //   ========================================
  //   Get subscriptions
  //   ========================================

  public async findSubscription(userID: string) {
    return await this.userRepository.getUserSubscription(userID);
  }

  public createDefaultSubscription(): Subscription {
    const date = getUTCCurrentDate();
    return {
      type: SUBSCRIPTION_PLAN_ENUM.EXPLORER_PLAN,
      status: SUBSCRIPTION_STATUS_ENUM.APPROVED,
      createdDate: date,
      updatedDate: date,
    };
  }

  public createSubscription(plan: SUBSCRIPTION_PLAN_ENUM, status: SUBSCRIPTION_STATUS_ENUM): Subscription {
    const date = getUTCCurrentDate();
    return {
      type: plan,
      status,
      createdDate: date,
      updatedDate: date,
    };
  }

  //   ========================================
  //   Create subscriptions
  //   ========================================
  public async addSubscriptionToUser(
    userID: string,
    plan: SUBSCRIPTION_PLAN_ENUM,
  ) {
    return await this.userRepository.createUserSubscription(userID, plan);
  }

  public async addExplorerSubscription(userID: string) {
    return await this.userRepository.createUserSubscription(
      userID,
      SUBSCRIPTION_PLAN_ENUM.EXPLORER_PLAN,
    );
  }

  public async createWanderlustSubscription(userID: string) {
    return await this.userRepository.createUserSubscription(
      userID,
      SUBSCRIPTION_PLAN_ENUM.WANDERLUST_PLAN,
    );
  }

  public async addNomadSubscription(userID: string) {
    return await this.userRepository.createUserSubscription(
      userID,
      SUBSCRIPTION_PLAN_ENUM.NOMAD_PLAN,
    );
  }

  //   ========================================
  //   Update subscriptions
  //   ========================================

  public async updateSubscriptionToStatus(
    id: string,
    status: SUBSCRIPTION_STATUS_ENUM,
  ) {
    return await this.userRepository.updateSubscriptionToStatus(id, status);
  }

  public async terminateSubscription(id: string) {
    return await this.updateSubscriptionToStatus(
      id,
      SUBSCRIPTION_STATUS_ENUM.CANCELLED,
    );
  }

  public async approvedSubscription(id: string) {
    return await this.updateSubscriptionToStatus(
      id,
      SUBSCRIPTION_STATUS_ENUM.APPROVED,
    );
  }

  public async pendingSubscription(id: string) {
    return await this.updateSubscriptionToStatus(
      id,
      SUBSCRIPTION_STATUS_ENUM.PENDING,
    );
  }

  public async rejectedSubscription(id: string) {
    return await this.updateSubscriptionToStatus(
      id,
      SUBSCRIPTION_STATUS_ENUM.REJECTEED,
    );
  }
}
