import { IsOptional, IsString } from "class-validator";

export class BusinessTypeUpdateDto {
    @IsOptional()
    @IsString()
    businessTypeName: string;

    @IsOptional()
    @IsString()
    description: string;
}