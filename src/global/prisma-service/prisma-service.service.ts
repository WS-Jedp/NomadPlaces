import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        console.log("CONNECTION TO MONGO DB WITH PRISMA")
        await this.$connect()
        console.log("CONNECTED TO MONGO DB WITH PRISMA")
    }

    async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
          await app.close();
        });
      }
}
