import { IsNotEmpty, IsNumber, IsString, IsMongoId, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    totalServiceFee: number;

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsMongoId()
    @IsNotEmpty()
    listingAgentId: string;

    @IsMongoId()
    @IsNotEmpty()
    sellingAgentId: string;
}
