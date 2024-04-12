import { HttpException, Injectable } from '@nestjs/common';
import { FOLLOW_REQUEST_STATUS_ENUM } from '@prisma/client';
import { UserRepository } from 'src/auth/repositories/user';
import { SocialRequestRepository } from '../../repositories/socialRequest';

@Injectable()
export class SocialService {
  constructor(
    private userRepository: UserRepository,
    private socialRequestRepository: SocialRequestRepository,
  ) {}

  async getUserSocialRequestsPending(userID: string) {
    const user = await this.userRepository.findOne(userID);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const socialRequests =
      await this.socialRequestRepository.getUserSocialRequestsPending(userID);

    return {
      followRequests: socialRequests.filter(req => req.receiverID === userID),
      toFollowRequests: socialRequests.filter(req => req.senderID === userID),
    };
  }

  async userFollowRequest(userID: string, userToFollowID: string) {
    const user = await this.userRepository.findOne(userID);
    const userToFollow = await this.userRepository.findOne(userToFollowID);

    if (!user || !userToFollow) {
      throw new HttpException('User not found', 404);
    }

    // Check if the user is already following the user
    const isFollowing =
      (await (
        await this.socialRequestRepository.findByUserAndUserToFollow(
          userID,
          userToFollowID,
        )
      )?.status) === FOLLOW_REQUEST_STATUS_ENUM.ACCEPTED;
    if (isFollowing) {
      throw new HttpException('User already followed', 409);
    }

    // Create social request
    const socialRequest = await this.socialRequestRepository.createRequest({
      senderID: userID,
      receiverID: userToFollowID,
      status: FOLLOW_REQUEST_STATUS_ENUM.PENDING,
    });

    return socialRequest;
  }

  async acceptFollowRequest(userID: string, requestID: string) {
    const user = await this.userRepository.findOne(userID);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const socialRequest = await this.socialRequestRepository.findOne(requestID);
    if (!socialRequest) {
      throw new HttpException('Request not found', 404);
    }

    if (socialRequest.receiverID !== userID) {
      throw new HttpException('User not authorized', 401);
    }

    if (socialRequest.status === FOLLOW_REQUEST_STATUS_ENUM.ACCEPTED) {
      throw new HttpException('Request already accepted', 409);
    }

    // Accept request
    const acceptedRequest = await this.socialRequestRepository.acceptRequest(
      requestID,
    );

    // Add follower to user
    await this.userRepository.addFollower(user, socialRequest.senderID);
    // Add following to the sender
    await this.userRepository.addFollowing(
      await this.userRepository.findOne(socialRequest.senderID),
      userID,
    );
    return acceptedRequest;
  }

  async rejectFollowRequest(userID: string, requestID: string) {
    const user = await this.userRepository.findOne(userID);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const socialRequest = await this.socialRequestRepository.findOne(requestID);
    if (!socialRequest) {
      throw new HttpException('Request not found', 404);
    }

    if (socialRequest.receiverID !== userID) {
      throw new HttpException('User not authorized', 401);
    }

    if (socialRequest.status === FOLLOW_REQUEST_STATUS_ENUM.REJECTED) {
      throw new HttpException('Request already rejected', 409);
    }

    // Reject request
    const rejectedRequest = await this.socialRequestRepository.rejectRequest(
      requestID,
    );

    return rejectedRequest;
  }
}
