import { IsNotEmpty, IsNumber, IsString, IsMongoId, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
    @ApiProperty({
        description: 'Toplam hizmet bedeli (komisyon dahil)',
        example: 50000,
        minimum: 0,
        type: Number,
    })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    totalServiceFee: number;

    @ApiProperty({
        description:
            'Para birimi (şu an statik olarak kullanılıyor, gelecekte dinamik hale getirilebilir)',
        example: 'TRY',
        enum: ['TRY', 'USD', 'EUR', 'GBP'],
        default: 'TRY',
    })
    @IsString()
    @IsNotEmpty()
    currency: string;

    @ApiProperty({
        description: "İlanı veren ajanın MongoDB ObjectId'si",
        example: '507f1f77bcf86cd799439011',
        type: String,
    })
    @IsMongoId()
    @IsNotEmpty()
    listingAgentId: string;

    @ApiProperty({
        description: "Satışı yapan ajanın MongoDB ObjectId'si (listing agent ile aynı olabilir)",
        example: '507f191e810c19729de860ea',
        type: String,
    })
    @IsMongoId()
    @IsNotEmpty()
    sellingAgentId: string;
}
