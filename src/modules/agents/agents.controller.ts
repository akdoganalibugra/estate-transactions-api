import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { QueryAgentsDto } from './dto/query-agents.dto';
import { Agent } from './schemas/agent.schema';

@ApiTags('agents')
@Controller('agents')
export class AgentsController {
    constructor(private readonly agentsService: AgentsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new agent' })
    @ApiResponse({ status: 201, description: 'Agent created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async create(@Body() createAgentDto: CreateAgentDto): Promise<Agent> {
        return this.agentsService.create(createAgentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all agents with pagination' })
    @ApiResponse({ status: 200, description: 'Paginated list of agents' })
    async findAll(@Query() query: QueryAgentsDto) {
        return this.agentsService.findAll(query);
    }
    @Get(':id')
    @ApiOperation({ summary: 'Get agent by ID' })
    @ApiParam({ name: 'id', description: 'Agent ID' })
    @ApiResponse({ status: 200, description: 'Agent details' })
    @ApiResponse({ status: 404, description: 'Agent not found' })
    async findOne(@Param('id') id: string): Promise<Agent> {
        return this.agentsService.findOne(id);
    }
}
