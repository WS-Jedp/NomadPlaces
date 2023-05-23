import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { TokenPayloadDTO } from 'src/auth/dto/auth/tokenPayload.dto';
import { CreatePersonDTO } from 'src/auth/dto/person/createPerson.dto';
import { CreateUserDTO } from 'src/auth/dto/user/createUser.dto';
import { RequestUserDTO } from 'src/auth/dto/user/requestUser.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt';
import { LocalAuthGuard } from 'src/auth/guards/local';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { UserService } from 'src/auth/services/user/user.service';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {}

    @UseGuards( LocalAuthGuard )
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user as RequestUserDTO)
    }

    @UseGuards( JwtAuthGuard )
    @Get('profile')
    getProfile(@Request() req) {
        return req.user as RequestUserDTO;
    }

    @Get('register')
    async register(@Body() body: CreatePersonDTO & CreateUserDTO) {
        const user = await this.userService.registerUser(body, body);
        return this.authService.login({ id: user.id, username: user.username, email: user.email, personID: user.personID })
    }
}
