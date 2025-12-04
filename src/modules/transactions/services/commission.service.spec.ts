import { CommissionService } from './commission.service';
import { Types } from 'mongoose';

describe('CommissionService', () => {
    let service: CommissionService;

    beforeEach(() => {
        service = new CommissionService();
    });

    describe('calculate', () => {
        it('should split 50/50 when same agent handles both sides', () => {
            const agentId = new Types.ObjectId();
            const result = service.calculate({
                totalServiceFee: 10000,
                listingAgentId: agentId,
                sellingAgentId: agentId,
            });

            expect(result.agencyAmount).toBe(5000);
            expect(result.agentShares).toHaveLength(1);
            expect(result.agentShares[0].agentId.toString()).toBe(agentId.toString());
            expect(result.agentShares[0].amount).toBe(5000);
        });

        it('should split 50/25/25 when different agents handle each side', () => {
            const listingAgentId = new Types.ObjectId();
            const sellingAgentId = new Types.ObjectId();
            const result = service.calculate({
                totalServiceFee: 10000,
                listingAgentId,
                sellingAgentId,
            });

            expect(result.agencyAmount).toBe(5000);
            expect(result.agentShares).toHaveLength(2);

            const listingShare = result.agentShares.find(
                share => share.agentId.toString() === listingAgentId.toString(),
            );
            const sellingShare = result.agentShares.find(
                share => share.agentId.toString() === sellingAgentId.toString(),
            );

            expect(listingShare?.amount).toBe(2500);
            expect(sellingShare?.amount).toBe(2500);
        });

        it('should handle zero fee correctly', () => {
            const agentId = new Types.ObjectId();
            const result = service.calculate({
                totalServiceFee: 0,
                listingAgentId: agentId,
                sellingAgentId: agentId,
            });

            expect(result.agencyAmount).toBe(0);
            expect(result.agentShares[0].amount).toBe(0);
        });

        it('should handle decimal amounts correctly', () => {
            const listingAgentId = new Types.ObjectId();
            const sellingAgentId = new Types.ObjectId();
            const result = service.calculate({
                totalServiceFee: 1000.75,
                listingAgentId,
                sellingAgentId,
            });

            expect(result.agencyAmount).toBe(500.375);
            expect(result.agentShares[0].amount).toBe(250.1875);
            expect(result.agentShares[1].amount).toBe(250.1875);
        });

        it('should maintain total sum integrity', () => {
            const listingAgentId = new Types.ObjectId();
            const sellingAgentId = new Types.ObjectId();
            const totalFee = 15000;

            const result = service.calculate({
                totalServiceFee: totalFee,
                listingAgentId,
                sellingAgentId,
            });

            const agentTotal = result.agentShares.reduce((sum, share) => sum + share.amount, 0);
            const calculatedTotal = result.agencyAmount + agentTotal;

            expect(calculatedTotal).toBe(totalFee);
        });
    });
});
