import { compare } from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestUserDTO } from 'src/auth/dto/user/requestUser.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    public async validateUser(emailOrUsername: string, password: string) {
        const user = await this.userService.findUserByEmailOrUsername(emailOrUsername);
        if(!user) return null;

        const isPasswordValid = await compare(password, user.password)
        if (isPasswordValid) {
            const person = await this.userService.getPerson(user.personID);
            const { password, ...rest } = user
            return {...rest, firstName: person.firstName};
        }
        return null;
    }

    // login method with JWT and passport
    public async login(user: RequestUserDTO) {
        // TODO: Add roles here when needed
        const payload = { username: user.username, id: user.id, email: user.email, personID: user.personID, firstName: user.firstName };
        return {
            user: payload,
            access_token: this.jwtService.sign(payload),
        };
    }

}
