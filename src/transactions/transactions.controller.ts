import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { createTransactDto } from './dto/create_transact';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateTransactDto } from './dto/update_transact';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private transactService: TransactionsService) {}
  @Post()
  createAccount(
    @Body() dto: createTransactDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.transactService.createTransact(dto, user.sub);
  }

  @Get(':id')
  async getTransactById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.transactService.getTransactById(id, user.sub);
  }

  @Get()
  async getAllTransacts(@CurrentUser() user: JwtPayload) {
    return this.transactService.getAllTransacts(user.sub);
  }

  @Patch(':id')
  async updateTransact(
    @Param('id') id: string,
    @Body() dto: UpdateTransactDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.transactService.updateTransact(dto, user.sub, id);
  }

  @Delete(':id')
  async deleteTransact(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.transactService.deleteTransactById(user.sub, id);
  }
}
