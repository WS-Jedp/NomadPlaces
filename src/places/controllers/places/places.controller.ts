import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../../global/prisma-service/prisma-service.service';

@Controller('places')
export class PlacesController {

    constructor(private prisma: PrismaService) {}

    @Get()
    async getAll() {
        const place = await this.prisma.places.findMany()
        
        return {
            places: place
        }
    }
}
