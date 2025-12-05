import { IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStage } from '../enums/transaction-stage.enum';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryTransactionsDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Aşamaya göre filtreleme',
        enum: TransactionStage,
        example: TransactionStage.EARNEST_MONEY,
    })
    @IsOptional()
    @IsEnum(TransactionStage)
    stage?: TransactionStage;

    @ApiPropertyOptional({
        description: 'Belirli bir ajana göre filtreleme (listing veya selling agent)',
        example: '507f1f77bcf86cd799439011',
        type: String,
    })
    @IsOptional()
    @IsMongoId()
    agentId?: string;

    @ApiPropertyOptional({
        description: 'Başlangıç tarihi (ISO 8601 formatında)',
        example: '2024-01-01T00:00:00.000Z',
        type: Date,
    })
    @IsOptional()
    @Type(() => Date)
    fromDate?: Date;

    @ApiPropertyOptional({
        description: 'Bitiş tarihi (ISO 8601 formatında)',
        example: '2024-12-31T23:59:59.999Z',
        type: Date,
    })
    @IsOptional()
    @Type(() => Date)
    toDate?: Date;
}
