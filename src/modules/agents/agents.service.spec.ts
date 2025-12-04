import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { AgentsService } from './agents.service';
import { Agent } from './schemas/agent.schema';
import { CreateAgentDto } from './dto/create-agent.dto';

describe('AgentsService', () => {
    let service: AgentsService;
    let model: Model<Agent>;

    const mockAgent = {
        _id: new Types.ObjectId(),
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+905551234567',
        save: jest.fn().mockResolvedValue(this),
    };

    const mockAgentModel = jest.fn().mockImplementation(dto => ({
        ...dto,
        save: jest.fn().mockResolvedValue({ ...dto, _id: new Types.ObjectId() }),
    }));

    mockAgentModel.find = jest.fn();
    mockAgentModel.findById = jest.fn();
    mockAgentModel.countDocuments = jest.fn();
    mockAgentModel.exec = jest.fn();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AgentsService,
                {
                    provide: getModelToken(Agent.name),
                    useValue: mockAgentModel,
                },
            ],
        }).compile();

        service = module.get<AgentsService>(AgentsService);
        model = module.get<Model<Agent>>(getModelToken(Agent.name));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new agent', async () => {
            const createDto: CreateAgentDto = {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+905551234567',
            };

            const savedAgent = {
                ...createDto,
                _id: new Types.ObjectId(),
            };

            const saveMock = jest.fn().mockResolvedValue(savedAgent);
            mockAgentModel.mockReturnValueOnce({ save: saveMock });

            const result = await service.create(createDto);

            expect(saveMock).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return paginated agents', async () => {
            const mockAgents = [mockAgent, mockAgent];

            mockAgentModel.find = jest.fn().mockReturnValue({
                skip: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(mockAgents),
                    }),
                }),
            });

            mockAgentModel.countDocuments = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(15),
            });

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('total');
            expect(result).toHaveProperty('page');
            expect(result).toHaveProperty('limit');
            expect(result).toHaveProperty('totalPages');
            expect(result.data).toEqual(mockAgents);
            expect(result.total).toBe(15);
            expect(result.totalPages).toBe(2);
        });
    });

    describe('findOne', () => {
        it('should throw BadRequestException for invalid ObjectId', async () => {
            await expect(service.findOne('invalid-id')).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when agent not found', async () => {
            const validId = new Types.ObjectId().toString();
            mockAgentModel.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(service.findOne(validId)).rejects.toThrow(NotFoundException);
        });

        it('should return agent when found', async () => {
            const validId = new Types.ObjectId().toString();
            mockAgentModel.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockAgent),
            });

            const result = await service.findOne(validId);

            expect(result).toEqual(mockAgent);
        });
    });
});
