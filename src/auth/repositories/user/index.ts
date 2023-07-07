import { Injectable } from "@nestjs/common";
import { People, User } from "@prisma/client";
import { PrismaService } from "src/global/prisma-service/prisma-service.service";

@Injectable()
export class UserRepository {
    constructor(
        private prismaService: PrismaService
    ) {}


    // ID Methods
    public async findOne(id: string, withPerson: boolean = false) {
        return await this.prismaService.user.findUnique({
            where: {
                id,
            },
            include: {
                person: withPerson,
            }
        });
    }

    // Find by username
    public async findByUsername(username: string) {
        return await this.prismaService.user.findFirst({
            where: {
                username
            }
        });
    }

    // Find by email
    public async findByEmail(email: string) {
        return await this.prismaService.user.findFirst({
            where: {
                email
            },
        });
    }


    public async findByEmailOrUsername(emailOrUsername: string) {
        return await this.prismaService.user.findFirst({
            where: {
                OR: [
                    {
                        email: emailOrUsername,
                    },
                    {
                        username: emailOrUsername,
                    }
                ]
            }
        });
    }

    public findAllUsersIDIn(ids: string[]) {
        return this.prismaService.user.findMany({
            where: {
                id: {
                    in: ids,
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
                profilePicture: true
            }
        });
    }

    // Register user
    public async registerUser(data: Omit<User, 'id'>) {
        return await this.prismaService.user.create({
            data,
        });
    }
}