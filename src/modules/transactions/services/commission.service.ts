import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { FinancialBreakdown } from '../schemas/financial-breakdown.schema';

interface CommissionInput {
    totalServiceFee: number;
    listingAgentId: string | Types.ObjectId;
    sellingAgentId: string | Types.ObjectId;
}

@Injectable()
export class CommissionService {
    private readonly AGENCY_SHARE = 0.5;
    private readonly TOTAL_AGENT_SHARE = 0.5;

    calculate(input: CommissionInput): FinancialBreakdown {
        const { totalServiceFee, listingAgentId, sellingAgentId } = input;

        if (totalServiceFee < 0) {
            throw new Error('Total service fee cannot be negative');
        }

        const agencyAmount = totalServiceFee * this.AGENCY_SHARE;
        const totalAgentAmount = totalServiceFee * this.TOTAL_AGENT_SHARE;

        const listingAgentIdStr =
            listingAgentId instanceof Types.ObjectId ? listingAgentId.toString() : listingAgentId;
        const sellingAgentIdStr =
            sellingAgentId instanceof Types.ObjectId ? sellingAgentId.toString() : sellingAgentId;

        const isSameAgent = listingAgentIdStr === sellingAgentIdStr;

        if (isSameAgent) {
            return {
                agencyAmount,
                agentShares: [
                    {
                        agentId: new Types.ObjectId(listingAgentIdStr),
                        role: 'listing_agent',
                        amount: totalAgentAmount,
                    },
                ],
            };
        }

        const amountPerAgent = totalAgentAmount / 2;

        return {
            agencyAmount,
            agentShares: [
                {
                    agentId: new Types.ObjectId(listingAgentIdStr),
                    role: 'listing_agent',
                    amount: amountPerAgent,
                },
                {
                    agentId: new Types.ObjectId(sellingAgentIdStr),
                    role: 'selling_agent',
                    amount: amountPerAgent,
                },
            ],
        };
    }
}
