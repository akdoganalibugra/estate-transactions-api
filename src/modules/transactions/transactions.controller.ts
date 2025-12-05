import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { Transaction } from './schemas/transaction.schema';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new transaction' })
    @ApiResponse({ status: 201, description: 'Transaction created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        return this.transactionsService.create(createTransactionDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all transactions with optional filters and pagination' })
    @ApiResponse({ status: 200, description: 'List of transactions' })
    async findAll(@Query() query: QueryTransactionsDto) {
        return this.transactionsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get transaction by ID with estimated breakdown' })
    @ApiParam({ name: 'id', description: 'Transaction ID' })
    @ApiResponse({ status: 200, description: 'Transaction details' })
    @ApiResponse({ status: 404, description: 'Transaction not found' })
    async findOne(@Param('id') id: string) {
        return this.transactionsService.findOneWithEstimatedBreakdown(id);
    }

    @Patch(':id/stage')
    @ApiOperation({ summary: 'Update transaction stage' })
    @ApiParam({ name: 'id', description: 'Transaction ID' })
    @ApiResponse({ status: 200, description: 'Transaction stage updated' })
    @ApiResponse({ status: 400, description: 'Invalid stage transition' })
    @ApiResponse({ status: 404, description: 'Transaction not found' })
    async updateStage(
        @Param('id') id: string,
        @Body() updateStageDto: UpdateStageDto,
    ): Promise<Transaction> {
        return this.transactionsService.updateStage(id, updateStageDto);
    }

    @Patch(':id/cancel')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cancel a transaction' })
    @ApiParam({ name: 'id', description: 'Transaction ID' })
    @ApiResponse({ status: 200, description: 'Transaction canceled' })
    @ApiResponse({ status: 400, description: 'Cannot cancel transaction' })
    @ApiResponse({ status: 404, description: 'Transaction not found' })
    async cancel(@Param('id') id: string): Promise<Transaction> {
        return this.transactionsService.cancel(id);
    }

    @Patch(':id/fast-complete')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Fast-complete a transaction (skip intermediate stages)' })
    @ApiParam({ name: 'id', description: 'Transaction ID' })
    @ApiResponse({ status: 200, description: 'Transaction fast-completed successfully' })
    @ApiResponse({ status: 400, description: 'Cannot fast-complete transaction' })
    @ApiResponse({ status: 404, description: 'Transaction not found' })
    async fastComplete(@Param('id') id: string): Promise<Transaction> {
        return this.transactionsService.fastComplete(id);
    }
}
