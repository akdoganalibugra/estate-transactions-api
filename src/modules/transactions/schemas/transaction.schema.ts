import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FinancialBreakdown, FinancialBreakdownSchema } from './financial-breakdown.schema';
import { StageHistory, StageHistorySchema } from './stage-history.schema';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
    @Prop({
        required: true,
        enum: ['agreement', 'earnest_money', 'title_deed', 'completed', 'canceled'],
        default: 'agreement',
    })
    stage: string;

    @Prop({ required: true })
    totalServiceFee: number;

    @Prop({ required: true, default: 'GBP' })
    currency: string;

    @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
    listingAgentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
    sellingAgentId: Types.ObjectId;

    @Prop({ type: FinancialBreakdownSchema, required: false })
    financialBreakdown?: FinancialBreakdown;

    @Prop({ type: [StageHistorySchema], default: [] })
    stageHistory: StageHistory[];
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
