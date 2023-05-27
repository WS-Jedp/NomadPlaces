import { Body, Controller, Get, HttpStatus, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { RegisterUserDTO } from 'src/auth/dto/user/registerUser.dto';
import { RequestUserDTO } from 'src/auth/dto/user/requestUser.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt';
import { LocalAuthGuard } from 'src/auth/guards/local';
import { UserDTOHelper } from 'src/auth/helpers/userDTO.helper';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { UserService } from 'src/auth/services/user/user.service';
import Response from 'src/global/models/response';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {}

    @UseGuards( LocalAuthGuard )
    @Post('login')
    async login(@Request() req) {
        return new Response({
            content: await this.authService.login(req.user as RequestUserDTO),
            status: HttpStatus.OK,
        })
    }

    @UseGuards( JwtAuthGuard )
    @Get('profile')
    async getProfile(@Request() req) {
        const userWithPerson = await this.userService.getUserWithPerson(req.user.id);
        return new Response({
            content: UserDTOHelper.fromEntityToDTO(userWithPerson, userWithPerson.person),
            status: HttpStatus.OK,
        })
    }

    @Post('register')
    async register(@Body() body: RegisterUserDTO) {
        const registeredUser = await this.userService.registerUser(body.userData, body.personData);
        const loginData = await this.authService.login({
            id: registeredUser.user.id,
            username: registeredUser.user.username,
            email: registeredUser.user.email,
            personID: registeredUser.person.id,
            firstName: registeredUser.person.firstName
        });
        return new Response({
            content: loginData,
            status: HttpStatus.CREATED,
        })
    }

    @Get('profile/confirm')
    async confirmProfile(@Query('usernameOrEmail') usernameOrEmail: string ) {
        const user = await this.userService.findUserByEmailOrUsername(usernameOrEmail);
        if (user) {
            return new Response({
                content: {
                    byUsername: user.username === usernameOrEmail ? true : false,
                    byEmail: user.email === usernameOrEmail ? true : false,
                    exists: true,
                },
                status: HttpStatus.OK,
                })
        }

        return new Response({
            content: {
                byUsername: null,
                byEmail: null,
                exists: false,
            },
            status: HttpStatus.NOT_FOUND,
        });
    }
}
