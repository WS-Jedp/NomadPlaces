import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadDTO } from 'src/auth/dto/auth/tokenPayload.dto';
import { CreateUserDTO } from 'src/auth/dto/user/createUser.dto';
import { RequestUserDTO } from 'src/auth/dto/user/requestUser.dto';
import { UserDTO } from 'src/auth/dto/user/user.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    public async validateUser(emailOrUsername: string, password: string) {
        const user = await this.userService.findUserByEmailOrUsername(emailOrUsername);
        if (user && user.password === password) {
            const { password, ...rest } = user
            return rest;
        }
        return null;
    }

    // login method with JWT and passport
    public async login(user: RequestUserDTO) {
        // TODO: Add roles here when needed
        const payload = { username: user.username, id: user.id, email: user.email, personID: user.personID };
        return {
            user: payload,
            access_token: this.jwtService.sign(payload),
        };
    }
}
