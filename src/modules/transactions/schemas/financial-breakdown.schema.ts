import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class AgentShare {
    @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
    agentId: Types.ObjectId;

    @Prop({ required: true, enum: ['listing_agent', 'selling_agent'] })
    role: string;

    @Prop({ required: true })
    amount: number;
}

export const AgentShareSchema = SchemaFactory.createForClass(AgentShare);

@Schema({ _id: false })
export class FinancialBreakdown {
    @Prop({ required: true })
    agencyAmount: number;

    @Prop({ type: [AgentShareSchema], required: true })
    agentShares: AgentShare[];
}

export const FinancialBreakdownSchema = SchemaFactory.createForClass(FinancialBreakdown);
