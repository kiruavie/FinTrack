import { PartialType } from '@nestjs/mapped-types';
import { createTransactDto } from './create_transact';

export class UpdateTransactDto extends PartialType(createTransactDto) {}
