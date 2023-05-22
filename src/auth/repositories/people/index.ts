import { Injectable } from "@nestjs/common";
import { People, User } from "@prisma/client";
import { PrismaService } from "src/global/prisma-service/prisma-service.service";

@Injectable()
export class PeopleRepository {
    constructor(
        private prismaService: PrismaService
    ) {}


    // ID Methods
    public async findOne(id: string) {
        return await this.prismaService.people.findUnique({
            where: {
                id,
            }
        });
    }

    // Create person
    public async createPerson(data: Omit<People, 'id'>) {
        return await this.prismaService.people.create({
            data,
        });
    }
}