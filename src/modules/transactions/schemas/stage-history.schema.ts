import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class StageHistory {
    @Prop({ required: true })
    fromStage: string;

    @Prop({ required: true })
    toStage: string;

    @Prop({ required: true, default: Date.now })
    changedAt: Date;
}

export const StageHistorySchema = SchemaFactory.createForClass(StageHistory);
