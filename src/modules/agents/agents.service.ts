import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Agent, AgentDocument } from './schemas/agent.schema';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService {
    constructor(
        @InjectModel(Agent.name)
        private agentModel: Model<AgentDocument>,
    ) {}

    async create(createAgentDto: CreateAgentDto): Promise<AgentDocument> {
        const agent = new this.agentModel(createAgentDto);
        return agent.save();
    }

    async findAll(): Promise<AgentDocument[]> {
        return this.agentModel.find().exec();
    }

    async findOne(id: string): Promise<AgentDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid agent ID');
        }

        const agent = await this.agentModel.findById(id).exec();

        if (!agent) {
            throw new NotFoundException(`Agent with ID ${id} not found`);
        }

        return agent;
    }
}
