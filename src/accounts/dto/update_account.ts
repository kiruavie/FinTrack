import { PartialType } from '@nestjs/mapped-types';
import { createAccountDto } from './create_account.dto';

export class UpdateAccountDto extends PartialType(createAccountDto) {}
