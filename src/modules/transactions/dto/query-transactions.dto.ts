import { IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionStage } from '../enums/transaction-stage.enum';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryTransactionsDto extends PaginationDto {
    @IsOptional()
    @IsEnum(TransactionStage)
    stage?: TransactionStage;

    @IsOptional()
    @IsMongoId()
    agentId?: string;

    @IsOptional()
    @Type(() => Date)
    fromDate?: Date;

    @IsOptional()
    @Type(() => Date)
    toDate?: Date;
}
