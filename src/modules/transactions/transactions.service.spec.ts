import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { TransactionsService } from './transactions.service';
import { Transaction } from './schemas/transaction.schema';
import { CommissionService } from './services/commission.service';
import { TransactionStage } from './enums/transaction-stage.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';

describe('TransactionsService', () => {
    let service: TransactionsService;
    let model: Model<Transaction>;
    let commissionService: CommissionService;

    const mockTransaction = {
        _id: new Types.ObjectId(),
        totalServiceFee: 10000,
        currency: 'TRY',
        stage: TransactionStage.AGREEMENT,
        listingAgentId: new Types.ObjectId(),
        sellingAgentId: new Types.ObjectId(),
        stageHistory: [],
        save: jest.fn().mockResolvedValue(this),
    };

    const mockTransactionModel = jest.fn().mockImplementation(dto => ({
        ...dto,
        save: jest.fn().mockResolvedValue({ ...dto, _id: new Types.ObjectId() }),
    }));

    mockTransactionModel.find = jest.fn();
    mockTransactionModel.findById = jest.fn();
    mockTransactionModel.countDocuments = jest.fn();
    mockTransactionModel.exec = jest.fn();

    const mockCommissionService = {
        calculate: jest.fn().mockReturnValue({
            agencyShare: 5000,
            agentShares: [
                { agentId: new Types.ObjectId(), amount: 2500 },
                { agentId: new Types.ObjectId(), amount: 2500 },
            ],
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionsService,
                {
                    provide: getModelToken(Transaction.name),
                    useValue: mockTransactionModel,
                },
                {
                    provide: CommissionService,
                    useValue: mockCommissionService,
                },
            ],
        }).compile();

        service = module.get<TransactionsService>(TransactionsService);
        model = module.get<Model<Transaction>>(getModelToken(Transaction.name));
        commissionService = module.get<CommissionService>(CommissionService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new transaction with AGREEMENT stage', async () => {
            const createDto: CreateTransactionDto = {
                totalServiceFee: 10000,
                currency: 'TRY',
                listingAgentId: new Types.ObjectId().toString(),
                sellingAgentId: new Types.ObjectId().toString(),
            };

            const savedTransaction = {
                ...createDto,
                _id: new Types.ObjectId(),
                stage: TransactionStage.AGREEMENT,
                stageHistory: [],
            };

            const saveMock = jest.fn().mockResolvedValue(savedTransaction);
            mockTransactionModel.mockReturnValueOnce({ save: saveMock });

            const result = await service.create(createDto);

            expect(saveMock).toHaveBeenCalled();
        });
    });

    describe('validateStageTransition', () => {
        it('should allow valid stage transitions', () => {
            expect(() => {
                service['validateStageTransition'](
                    TransactionStage.AGREEMENT,
                    TransactionStage.EARNEST_MONEY,
                );
            }).not.toThrow();

            expect(() => {
                service['validateStageTransition'](
                    TransactionStage.EARNEST_MONEY,
                    TransactionStage.TITLE_DEED,
                );
            }).not.toThrow();

            expect(() => {
                service['validateStageTransition'](
                    TransactionStage.TITLE_DEED,
                    TransactionStage.COMPLETED,
                );
            }).not.toThrow();
        });

        it('should throw error for invalid stage transitions', () => {
            expect(() => {
                service['validateStageTransition'](
                    TransactionStage.COMPLETED,
                    TransactionStage.AGREEMENT,
                );
            }).toThrow(BadRequestException);

            expect(() => {
                service['validateStageTransition'](
                    TransactionStage.AGREEMENT,
                    TransactionStage.TITLE_DEED,
                );
            }).toThrow(BadRequestException);
        });

        it('should allow cancellation from early stages', () => {
            expect(() => {
                service['validateStageTransition'](
                    TransactionStage.AGREEMENT,
                    TransactionStage.CANCELED,
                );
            }).not.toThrow();

            expect(() => {
                service['validateStageTransition'](
                    TransactionStage.EARNEST_MONEY,
                    TransactionStage.CANCELED,
                );
            }).not.toThrow();

            expect(() => {
                service['validateStageTransition'](
                    TransactionStage.TITLE_DEED,
                    TransactionStage.CANCELED,
                );
            }).not.toThrow();
        });

        it('should not allow any transition from terminal states', () => {
            expect(() => {
                service['validateStageTransition'](
                    TransactionStage.COMPLETED,
                    TransactionStage.CANCELED,
                );
            }).toThrow(BadRequestException);

            expect(() => {
                service['validateStageTransition'](
                    TransactionStage.CANCELED,
                    TransactionStage.AGREEMENT,
                );
            }).toThrow(BadRequestException);
        });
    });

    describe('findOne', () => {
        it('should throw BadRequestException for invalid ObjectId', async () => {
            await expect(service.findOne('invalid-id')).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when transaction not found', async () => {
            const validId = new Types.ObjectId().toString();
            mockTransactionModel.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(service.findOne(validId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll with pagination', () => {
        it('should return paginated results with correct structure', async () => {
            const mockTransactions = [mockTransaction, mockTransaction];

            mockTransactionModel.find = jest.fn().mockReturnValue({
                skip: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(mockTransactions),
                    }),
                }),
            });

            mockTransactionModel.countDocuments = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(25),
            });

            const result = await service.findAll({ page: 2, limit: 10 });

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('total');
            expect(result).toHaveProperty('page');
            expect(result).toHaveProperty('limit');
            expect(result).toHaveProperty('totalPages');
            expect(result.page).toBe(2);
            expect(result.limit).toBe(10);
            expect(result.totalPages).toBe(3);
        });
    });

    describe('fastComplete', () => {
        it('should fast-complete transaction from agreement stage', async () => {
            const transactionId = new Types.ObjectId().toString();
            const mockTx = {
                _id: transactionId,
                stage: TransactionStage.AGREEMENT,
                totalServiceFee: 10000,
                listingAgentId: new Types.ObjectId(),
                sellingAgentId: new Types.ObjectId(),
                stageHistory: [],
                save: jest.fn().mockResolvedValue(this),
            };

            mockTransactionModel.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockTx),
            });

            await service.fastComplete(transactionId);

            expect(mockTx.stage).toBe(TransactionStage.COMPLETED);
            expect(mockTx.stageHistory.length).toBeGreaterThan(0);
            expect(commissionService.calculate).toHaveBeenCalled();
            expect(mockTx.save).toHaveBeenCalled();
        });

        it('should fast-complete transaction from earnest_money stage', async () => {
            const transactionId = new Types.ObjectId().toString();
            const mockTx = {
                _id: transactionId,
                stage: TransactionStage.EARNEST_MONEY,
                totalServiceFee: 10000,
                listingAgentId: new Types.ObjectId(),
                sellingAgentId: new Types.ObjectId(),
                stageHistory: [],
                save: jest.fn().mockResolvedValue(this),
            };

            mockTransactionModel.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockTx),
            });

            await service.fastComplete(transactionId);

            expect(mockTx.stage).toBe(TransactionStage.COMPLETED);
            expect(mockTx.save).toHaveBeenCalled();
        });

        it('should throw error when trying to fast-complete already completed transaction', async () => {
            const transactionId = new Types.ObjectId().toString();
            const mockTx = {
                _id: transactionId,
                stage: TransactionStage.COMPLETED,
                totalServiceFee: 10000,
                listingAgentId: new Types.ObjectId(),
                sellingAgentId: new Types.ObjectId(),
                stageHistory: [],
            };

            mockTransactionModel.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockTx),
            });

            await expect(service.fastComplete(transactionId)).rejects.toThrow(
                'Transaction is already completed',
            );
        });

        it('should throw error when trying to fast-complete canceled transaction', async () => {
            const transactionId = new Types.ObjectId().toString();
            const mockTx = {
                _id: transactionId,
                stage: TransactionStage.CANCELED,
                totalServiceFee: 10000,
                listingAgentId: new Types.ObjectId(),
                sellingAgentId: new Types.ObjectId(),
                stageHistory: [],
            };

            mockTransactionModel.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockTx),
            });

            await expect(service.fastComplete(transactionId)).rejects.toThrow(
                'Cannot complete a canceled transaction',
            );
        });
    });
});
