import { HttpException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { genSalt, hash } from 'bcrypt';
import { CreatePersonDTO } from 'src/auth/dto/person/createPerson.dto';
import { CreateUserDTO } from 'src/auth/dto/user/createUser.dto';
import { UserDTO } from 'src/auth/dto/user/user.dto';
import { UserDTOHelper } from 'src/auth/helpers/userDTO.helper';
import { PeopleRepository } from 'src/auth/repositories/people';
import { UserRepository } from 'src/auth/repositories/user';
import { getColombianCurrentDate } from 'src/global/utils/dates';
import { PersonDTOHelper } from '../../helpers/personDTO.helper';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private peopleRepository: PeopleRepository,
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

    const person = await this.registerPerson(personData);

    const salt = await genSalt()
    const hashedPassword = await hash(userData.password, salt)

    const currentDate = getColombianCurrentDate(new Date())

    const userToCreate: Omit<User, 'id'> = {
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      profilePicture: null,
      personID: person.id,
      sessionActionsIDs: [],
      sessionsIDs: [],
      createdDate: currentDate
    };

    const user = await this.userRepository.registerUser(userToCreate);
    return {
      user: UserDTOHelper.fromEntityToDTO(user),
      person,
    };
  }

  public async findUserByEmailOrUsername(emailOrUsername: string) {
    const user = await this.userRepository.findByEmailOrUsername(
      emailOrUsername,
    );

    return user;
  }
}
