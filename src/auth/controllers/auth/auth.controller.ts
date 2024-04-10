import { Body, Controller, Get, HttpStatus, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { RecoverPasswordDTO } from 'src/auth/dto/auth/resetPassword.dto';
import { UpdatePersonDTO } from 'src/auth/dto/person/updatePerson.dto';
import { RegisterUserDTO } from 'src/auth/dto/user/registerUser.dto';
import { RequestUserDTO } from 'src/auth/dto/user/requestUser.dto';
import { UpdateUserDTO } from 'src/auth/dto/user/updateUser.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt';
import { LocalAuthGuard } from 'src/auth/guards/local';
import { UserDTOHelper } from 'src/auth/helpers/userDTO.helper';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { AuthEmailService } from 'src/auth/services/mailer/mailer.service';
import { UserService } from 'src/auth/services/user/user.service';
import Response from 'src/global/models/response';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private authMailerService: AuthEmailService
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

        await this.authMailerService.welcomeEmail(body.userData.email, {
            firstName: body.personData.firstName,
        }, body.language)

        return new Response({
            content: loginData,
            status: HttpStatus.CREATED,
        })
    }

    @Post('profile/update')
    async updateProfile(@Request() req, @Body() body: { userData: UpdateUserDTO, personData: UpdatePersonDTO }) {
        const updated = await this.userService.updateUser(body.userData, body.personData);

        return new Response({
            content: {
                message: 'Profile updated successfully',
                data: updated,
            },
            status: HttpStatus.OK,
        })
    }

    @Post('recover-password')
    async resetPassword(@Body() body: RecoverPasswordDTO) {
        const user = await this.userService.findUserByEmailOrUsername(body.email);
        if(!user) {
            return new Response({
                content: {
                    message: 'User not found',
                    data: null
                },
                status: HttpStatus.NOT_FOUND,
            })
        }
        const resetLink = await this.userService.generateResetPasswordLink(user);
        await this.authMailerService.resetPassword(body.email, resetLink, body.language)

        return new Response({
            content: true,
            status: HttpStatus.OK,
        })
    }

    @Post('reset-password')
    async resetPasswordConfirm(@Body() body: { email:string, token: string, newPassword: string }) {
        const user = await this.userService.findUserByEmailOrUsername(body.email);
        if(!user) {
            return new Response({
                content: {
                    message: 'User not found',
                    data: null
                },
                status: HttpStatus.NOT_FOUND,
            })
        }
        const updatedUser = await this.userService.resetPassword(user, body.token, body.newPassword);
        return new Response({
            content: {
                message: 'Password updated successfully',
                user: updatedUser,
            },
            status: HttpStatus.OK,
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
