import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionStage } from '../enums/transaction-stage.enum';

export class UpdateStageDto {
    @ApiProperty({
        description:
            'Hedef aşama (sadece ileriye doğru geçiş yapılabilir: agreement → earnest_money → title_deed → completed)',
        enum: TransactionStage,
        example: TransactionStage.EARNEST_MONEY,
        examples: {
            Kapora: {
                value: TransactionStage.EARNEST_MONEY,
                description: 'Sözleşmeden kapora aşamasına',
            },
            Tapu: { value: TransactionStage.TITLE_DEED, description: 'Kaporadan tapu aşamasına' },
            Tamamlandı: {
                value: TransactionStage.COMPLETED,
                description: 'Tapudan tamamlanma aşamasına',
            },
        },
    })
    @IsEnum(TransactionStage)
    @IsNotEmpty()
    toStage: TransactionStage;
}
