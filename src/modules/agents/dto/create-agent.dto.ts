import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAgentDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;
}
