import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentDocument = Agent & Document;

@Schema({ timestamps: true })
export class Agent {
    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
