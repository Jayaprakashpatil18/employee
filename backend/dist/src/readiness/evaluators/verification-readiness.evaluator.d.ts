import { BackgroundVerification } from '@prisma/client';
import { EvaluatedRequirement } from '../status-resolver';
export declare class VerificationReadinessEvaluator {
    static evaluate(verifications: BackgroundVerification[]): EvaluatedRequirement[];
}
