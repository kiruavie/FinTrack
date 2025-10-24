import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class createAccountDto {
  @ApiProperty({
    description: 'Nom du compte',
    example: 'Compte courant',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Balance initiale du compte (optionnelle, défaut: 0)',
    example: 1500.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  balance?: number;
}
