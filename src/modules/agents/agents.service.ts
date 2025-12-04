import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Agent, AgentDocument } from './schemas/agent.schema';
import { CreateAgentDto } from './dto/create-agent.dto';
import { QueryAgentsDto } from './dto/query-agents.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

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

    async findAll(query: QueryAgentsDto): Promise<PaginatedResponseDto<AgentDocument>> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.agentModel.find().skip(skip).limit(limit).exec(),
            this.agentModel.countDocuments().exec(),
        ]);

        return new PaginatedResponseDto(data, total, page, limit);
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
