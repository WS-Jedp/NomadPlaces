import { IsEmail, IsString } from "class-validator";

export class RecoverPasswordDTO {
    @IsString()
    @IsEmail()
    readonly email: string;

    @IsString()
    readonly language: 'es' | 'en' = 'es';
    
}