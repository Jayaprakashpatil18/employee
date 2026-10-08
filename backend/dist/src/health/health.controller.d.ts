import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
export declare class HealthController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    check(res: Response): Promise<Response<any, Record<string, any>>>;
}
