import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
    @ApiPropertyOptional({
        description: "Sayfa numarası (1'den başlar)",
        example: 1,
        minimum: 1,
        default: 1,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Sayfa başına kayıt sayısı (maksimum 100)',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;
}
