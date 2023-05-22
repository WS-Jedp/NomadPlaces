import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreatePersonDTO } from 'src/auth/dto/person/createPerson.dto';
import { CreateUserDTO } from 'src/auth/dto/user/createUser.dto';
import { UserDTO } from 'src/auth/dto/user/user.dto';
import { PeopleRepository } from 'src/auth/repositories/people';
import { UserRepository } from 'src/auth/repositories/user';
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
  public async registerUser(
    userData: CreateUserDTO,
    personData: CreatePersonDTO,
  ) {
    const person = await this.registerPerson(personData);

    const userToCreate: Omit<User, 'id'> = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      profilePicture: userData.profilePicture,
      personID: person.id,
      sessionActionsIDs: [],
      sessionsIDs: [],
      createdDate: new Date(),
    };

    const user = await this.userRepository.registerUser(userToCreate);
    return user;
  }

  public async findUserByEmailOrUsername(emailOrUsername: string) {
    const user = await this.userRepository.findByEmailOrUsername(
      emailOrUsername,
    );
    return user;
  }
}
