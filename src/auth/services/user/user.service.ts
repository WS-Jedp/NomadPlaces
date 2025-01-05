import { HttpException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { genSalt, hash, compare } from 'bcrypt';
import { randomBytes } from 'crypto'
import { CreatePersonDTO } from 'src/auth/dto/person/createPerson.dto';
import { PersonDTO } from 'src/auth/dto/person/person.dto';
import { UpdatePersonDTO } from 'src/auth/dto/person/updatePerson.dto';
import { CreateUserDTO } from 'src/auth/dto/user/createUser.dto';
import { UpdateUserDTO } from 'src/auth/dto/user/updateUser.dto';
import { UserDTO } from 'src/auth/dto/user/user.dto';
import { UserDTOHelper } from 'src/auth/helpers/userDTO.helper';
import { PeopleRepository } from 'src/auth/repositories/people';
import { UserRepository } from 'src/auth/repositories/user';
import { StorageService } from 'src/global/services/aws/storage/storage.service';
import { getUTCCurrentDate } from 'src/global/utils/dates';
import { PersonDTOHelper } from '../../helpers/personDTO.helper';
import { PlaceSessionService } from 'src/place-sessions/services/place-session/place-session.service';
import { SubscriptionService } from 'src/subscription/services/subscription/subscription.service';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private peopleRepository: PeopleRepository,
    private storageService: StorageService,
    private placeSessionService: PlaceSessionService,
    private subscriptionService: SubscriptionService,
  ) {}

  // Person
  public async registerPerson(personDTO: CreatePersonDTO) {
    const person = await this.peopleRepository.createPerson(
      PersonDTOHelper.fromDTOtoEntity(personDTO),
    );
    return PersonDTOHelper.fromEntityToDTO(person);
  }

  public async getPerson(id: string) {
    const person = await this.peopleRepository.findOne(id);
    return person;
  }

  // User
  public async getUserWithPerson(id: string) {
    const user = await this.userRepository.findOne(id, true);
    return user;
  }

  public async registerUser(
    userData: CreateUserDTO,
    personData: CreatePersonDTO,
  ) {

    const userExists = await this.userRepository.findByUsername(userData.username) || await this.userRepository.findByEmail(userData.email);

    if (userExists) {
      throw new HttpException('User already exists', 409)
    }

    const userEmailValidated =  await this.validateAndFormatEmailFromUser(userData.email)

    const person = await this.registerPerson(personData);

    const salt = await genSalt()
    const hashedPassword = await hash(userData.password, salt)

    const currentDate = getUTCCurrentDate()

    const userToCreate: Omit<User, 'id'> = {
      username: this.formatUsernameFromUser(userData.username),
      email: userEmailValidated,
      password: hashedPassword,
      profilePicture: null,
      personID: person.id,
      sessionActionsIDs: [],
      sessionsIDs: [],
      createdDate: currentDate,
      resetPasswordToken: null,
      resetPasswordTokenExpiry: null,
      followers: [],
      following: [],
      confirmedPlacesIDs: [],
      discoveredPlacesIDs: [],
      visitedPlacesIDs: [],
      gamification: {
        points: 0,
      },
      subscription: this.subscriptionService.createDefaultSubscription(),
    };

    const user = await this.userRepository.registerUser(userToCreate);

    return {
      user: UserDTOHelper.fromEntityToDTO(user, null),
      person,
    };
  }


  private async validateAndFormatEmailFromUser(email: string): Promise<string> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpException('Invalid email', 400)
    }

    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
      throw new HttpException('Invalid email', 400)
    }

    const domainParts = emailParts[1].split('.');
    if (domainParts.length < 2) {
      throw new HttpException('Invalid email', 400)
    }

    const domain = domainParts[domainParts.length - 1];
    if (domain.length < 2) {
      throw new HttpException('Invalid email', 400)
    }
    
    const alreadyExists = await this.userRepository.findByEmail(email);
    if (alreadyExists) {
      throw new HttpException('Email already exists', 409)
    }

    return email.toLowerCase().trim();
  }

  private formatUsernameFromUser(username: string): string {
    return username.toLowerCase().trim();
  }

  public async findUserByEmailOrUsername(emailOrUsername: string) {
    const user = await this.userRepository.findByEmailOrUsername(
      emailOrUsername,
    );

    return user;
  }


  public async updateUser(updateUserDTO: UpdateUserDTO, updatePersonDTO: UpdatePersonDTO, profilePicture?: Express.Multer.File) {

    const user = await this.userRepository.findOne(updateUserDTO.userID);

    if (!user) {
      throw new HttpException('User not found', 404)
    }

    const person = await this.peopleRepository.findOne(updatePersonDTO.id);

    if (!person) {
      throw new HttpException('Person not found', 404)
    }

    // Handle correctly the profile picture
    let userUpdated: User = user
    if(profilePicture) {
      // Upload profile picture
      const fileName = `${getUTCCurrentDate().getTime()}.${profilePicture.mimetype.split('/')[1]}`

      const { path } = await this.storageService.save({
        path: `multimedia/users/${user.id}/${fileName}`,
        contentType: 'image/png',
        filename: `${fileName}`,
        media: profilePicture.buffer,
        metadata: [{ key: 'profilePicture', value: 'true' }],
      })
      userUpdated = await this.userRepository.updateProfilePicture(user, path);
    }

    const { id, ...personData } = updatePersonDTO;
    const personUpdated = await this.peopleRepository.updatePerson(person.id, personData);
    return {
      user: UserDTOHelper.fromEntityToDTO(userUpdated),
      person: PersonDTOHelper.fromEntityToDTO(personUpdated),
    };
  }


  // Generate reset password link
  public async generateResetPasswordLink(user: User) {
    if (!user) {
      throw new HttpException('User not found', 404)
    }

    const tokenExpiration = new Date();

    if(user && user.resetPasswordToken &&  tokenExpiration <= user.resetPasswordTokenExpiry ) {
      throw new HttpException('User already has a valid token to reset the password', 409)
    }

    const token = randomBytes(20).toString('hex');
    const hashedToken = await hash(token, 10);
    tokenExpiration.setHours(tokenExpiration.getHours() + 1);

    await this.userRepository.updateResetPasswordToken(user, hashedToken, tokenExpiration)

    const FRONTNED_URL = process.env.FRONTEND_URL
    return `${FRONTNED_URL}/home?recover_password=${token}?email=${user.email}`;
  }

  // Reset password (Change the password)
  public async resetPassword(user: User, token: string, newPassword: string) {
    if (!user) {
      throw new HttpException('User not found', 404)
    }

    if(user && !user.resetPasswordToken) {
      throw new HttpException('User does not have a valid token to reset the password', 409)
    }

    if(new Date() <= user.resetPasswordTokenExpiry ) {
      throw new HttpException('User already has a valid token to reset the password', 409)
    }

    const isValidToken = await compare(token, user.resetPasswordToken);

    if (!isValidToken) {
      throw new HttpException('Invalid token', 400)
    }

    const salt = await genSalt()
    const hashedPassword = await hash(newPassword, salt)

    await this.userRepository.updatePassword(user, hashedPassword)

    return user;
  }

    // =================
    // User social methods
    async getFollowers(userID: string) {
      const user = await this.userRepository.findOne(userID);
      if (!user) {
          throw new HttpException('User not found', 404);
      }

      if(user.followers.length === 0) return [];

      const followers = await this.userRepository.findAllUsersIDIn(user.followers);
      return followers;
  }

  async getFollowing(userID: string) {
      const user = await this.userRepository.findOne(userID);
      if (!user) {
          throw new HttpException('User not found', 404);
      }

      if(user.following.length === 0) return [];

      const following = await this.userRepository.findAllUsersIDIn(user.following);
      return following;
  }

  async removeFollower(userID: string, followerID: string) {
      const user = await this.userRepository.findOne(userID);
      if (!user) {
          throw new HttpException('User not found', 404);
      }

      const follower = await this.userRepository.findOne(followerID);
      if (!follower) {
          throw new HttpException('Follower not found', 404);
      }

      const updatedUser = await this.userRepository.removeFollower(user, followerID);
      await this.userRepository.removeFollowing(follower, userID);
      return updatedUser.followers;
  }

  async removeFollowing(userID: string, followingID: string) {
      const user = await this.userRepository.findOne(userID);
      if (!user) {
          throw new HttpException('User not found', 404);
      }

      const following = await this.userRepository.findOne(followingID);
      if (!following) {
          throw new HttpException('Following not found', 404);
      }

      const updatedUser = await this.userRepository.removeFollowing(user, followingID);
      await this.userRepository.removeFollower(following, userID);
      return updatedUser.following;
  }

  async getUserLastSession(userID: string) {
    const user = await this.userRepository.findOne(userID);
    if (!user) {
        throw new HttpException('User not found', 404);
    }
    if(user.sessionsIDs.length === 0) return null;
    const lastSession = await this.userRepository.getLastUserSession(user);
    return lastSession;
  }

  async getUserLastSessionState(userID: string) {
    const user = await this.userRepository.findOne(userID);
    if(!user) {
      throw new HttpException('User not found', 404);
    }

    if (!user) {
        throw new HttpException('User not found', 404);
    }
    const lastSession = await this.getUserLastSession(userID)

    if(!lastSession) {
      return {
        lastSession: null,
        inSession: false,
        expired: false
      }
    }

    const currentDate = getUTCCurrentDate()
    console.log(typeof lastSession.endDate)
    const isSessionExpired = lastSession ? lastSession.endDate ? lastSession.endDate < currentDate : false : false
    const isUserInSession = await this.placeSessionService.isUserInSessionByActions(lastSession.id, user.id)

    return {
      lastSession,
      inSession: isUserInSession,
      expired: isSessionExpired
    }
  }
}
