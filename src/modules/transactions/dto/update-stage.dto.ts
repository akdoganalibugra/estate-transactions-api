import { IsEnum, IsNotEmpty } from 'class-validator';
import { TransactionStage } from '../enums/transaction-stage.enum';

export class UpdateStageDto {
    @IsEnum(TransactionStage)
    @IsNotEmpty()
    toStage: TransactionStage;
}
