import { IsNumber, IsOptional, IsString } from 'class-validator';

export class createAccountDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsOptional() // Le balance est optionnel, défaut à 0
  balance?: number;
}
