import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    // login method with JWT and passport
    public async login(user: RequestUserDTO ) {
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
