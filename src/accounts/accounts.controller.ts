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
import { createAccountDto } from './dto/create_account.dto';
import { AccountsService } from './accounts.service';
import { UpdateAccountDto } from './dto/update_account';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private accountService: AccountsService) {}

  @Get()
  getAccounts(@CurrentUser() user: JwtPayload) {
    return this.accountService.getAccounts(user.sub);
  }

  @Post()
  createAccount(
    @Body() dto: createAccountDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.accountService.create(dto, user.sub);
  }

  @Get(':id')
  getAccountById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.accountService.getAccountById(id, user.sub);
  }

  @Patch(':id')
  updateAccount(
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.accountService.update(dto, user.sub, id);
  }

  @Delete(':id')
  deleteAccount(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.accountService.delete(id, user.sub);
  }
}
