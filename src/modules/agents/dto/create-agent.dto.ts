import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentDto {
    @ApiProperty({
        description: 'Ajanın adı',
        example: 'Ahmet',
        minLength: 1,
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        description: 'Ajanın soyadı',
        example: 'Yılmaz',
        minLength: 1,
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;
}
