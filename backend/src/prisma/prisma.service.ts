import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ PostgreSQL Database connection established successfully.');
    } catch (err: any) {
      this.logger.warn(`⚠️ PostgreSQL database server unavailable at startup: ${err.message}. Please start PostgreSQL or Docker container on localhost:5432.`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (err: any) {
      // Ignore disconnect errors on shutdown
    }
  }
}
