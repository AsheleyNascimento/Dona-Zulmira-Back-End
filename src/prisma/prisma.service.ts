import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    const rawUrl = process.env.DATABASE_URL;
    if (rawUrl) {
      try {
        const parsed = new URL(rawUrl);
        const dbName = parsed.pathname?.replace('/', '') || '<unknown>';
        console.log(`Prisma: attempting to connect to database host=${parsed.hostname} port=${parsed.port || '3306'} database=${dbName}`);
      } catch (err) {
        // ignore parsing errors
      }
    } else {
      console.warn('Prisma: no DATABASE_URL environment variable found');
    }

    try {
      await this.$connect();
      console.log('Prisma: connected to database successfully');
    } catch (error) {
      console.error('Prisma: failed to connect to database:', error);
      throw error;
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
  enableShutdownHooks(app: INestApplication) {
    (this as any).$on('beforeExit', async () => {
      await app.close();
    });
  }
}
