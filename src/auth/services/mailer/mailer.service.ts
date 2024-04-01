import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthEmailService {
  constructor(private readonly mailerService: MailerService) {}

  async welcomeEmail(to: string, user: { firstName: string }, lang: 'es' | 'en' = 'es' ) {
    await this.mailerService.sendMail({
      to,
      subject: lang === 'en' ? 'Welcome to Spots!' : '¡Bienvenido a Spots!',
      template: `./auth/welcome-${lang}`,
      context: {
        firstName: user.firstName,
      },
    });
  }

  async resetPassword(to: string, resetPasswordLink: string, lang: 'es' | 'en' = 'es') {
    await this.mailerService.sendMail({
      to,
      subject: lang === 'en' ? 'Reset your password' : 'Restablece tu contraseña',
      template: `./auth/reset-password-${lang}`,
      context: {
        resetLink: resetPasswordLink,
      },
    });
  }
}
