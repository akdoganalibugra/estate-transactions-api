import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { TransactionStage } from './enums/transaction-stage.enum';
import { ALLOWED_TRANSITIONS } from './constants/stage-transitions.constant';
import { CommissionService } from './services/commission.service';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectModel(Transaction.name)
        private transactionModel: Model<TransactionDocument>,
        private commissionService: CommissionService,
    ) {}

    async create(createTransactionDto: CreateTransactionDto): Promise<TransactionDocument> {
        const transaction = new this.transactionModel({
            ...createTransactionDto,
            stage: TransactionStage.AGREEMENT,
            listingAgentId: new Types.ObjectId(createTransactionDto.listingAgentId),
            sellingAgentId: new Types.ObjectId(createTransactionDto.sellingAgentId),
            stageHistory: [],
        });

        return transaction.save();
    }

    async findAll(query: QueryTransactionsDto): Promise<TransactionDocument[]> {
        const filter: any = {};

        if (query.stage) {
            filter.stage = query.stage;
        }

        if (query.agentId) {
            const agentObjectId = new Types.ObjectId(query.agentId);
            filter.$or = [{ listingAgentId: agentObjectId }, { sellingAgentId: agentObjectId }];
        }

        if (query.fromDate || query.toDate) {
            filter.createdAt = {};
            if (query.fromDate) {
                filter.createdAt.$gte = query.fromDate;
            }
            if (query.toDate) {
                filter.createdAt.$lte = query.toDate;
            }
        }

        return this.transactionModel.find(filter).exec();
    }

    async findOne(id: string): Promise<TransactionDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid transaction ID');
        }

        const transaction = await this.transactionModel.findById(id).exec();

        if (!transaction) {
            throw new NotFoundException(`Transaction with ID ${id} not found`);
        }

        return transaction;
    }

    async findOneWithEstimatedBreakdown(id: string): Promise<any> {
        const transaction = await this.findOne(id);
        const transactionObj = transaction.toObject();

        if (
            transaction.stage !== TransactionStage.COMPLETED &&
            transaction.stage !== TransactionStage.CANCELED
        ) {
            const estimatedBreakdown = this.commissionService.calculate({
                totalServiceFee: transaction.totalServiceFee,
                listingAgentId: transaction.listingAgentId,
                sellingAgentId: transaction.sellingAgentId,
            });

            return {
                ...transactionObj,
                estimatedBreakdown,
            };
        }

        return transactionObj;
    }

    async updateStage(id: string, updateStageDto: UpdateStageDto): Promise<TransactionDocument> {
        const transaction = await this.findOne(id);

        this.validateStageTransition(transaction.stage as TransactionStage, updateStageDto.toStage);

        const previousStage = transaction.stage;
        transaction.stage = updateStageDto.toStage;

        transaction.stageHistory.push({
            fromStage: previousStage,
            toStage: updateStageDto.toStage,
            changedAt: new Date(),
        });

        if (updateStageDto.toStage === TransactionStage.COMPLETED) {
            transaction.financialBreakdown = this.commissionService.calculate({
                totalServiceFee: transaction.totalServiceFee,
                listingAgentId: transaction.listingAgentId,
                sellingAgentId: transaction.sellingAgentId,
            });
        }

        return transaction.save();
    }

    async cancel(id: string): Promise<TransactionDocument> {
        return this.updateStage(id, { toStage: TransactionStage.CANCELED });
    }

    private validateStageTransition(
        currentStage: TransactionStage,
        targetStage: TransactionStage,
    ): void {
        const allowedStages = ALLOWED_TRANSITIONS[currentStage];

        if (!allowedStages.includes(targetStage)) {
            throw new BadRequestException(
                `Invalid stage transition from ${currentStage} to ${targetStage}`,
            );
        }
    }
}
