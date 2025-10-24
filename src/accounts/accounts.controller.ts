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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('accounts')
@ApiBearerAuth('JWT-auth')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private accountService: AccountsService) {}

  @Get()
  @ApiOperation({
    summary: 'Récupérer tous les comptes',
    description:
      "Retourne la liste de tous les comptes de l'utilisateur avec la balance totale.",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des comptes récupérée avec succès',
    schema: {
      example: {
        accounts_list: [
          {
            id: 'acc_123',
            name: 'Compte courant',
            balance: 2500.5,
            userId: 'user_123',
          },
        ],
        total_balance: 2500.5,
        accounts_count: 1,
      },
    },
  })
  getAccounts(@CurrentUser() user: JwtPayload) {
    return this.accountService.getAccounts(user.sub);
  }

  @Get('balance/total')
  @ApiOperation({
    summary: 'Obtenir la balance totale',
    description:
      "Retourne la somme de toutes les balances des comptes de l'utilisateur.",
  })
  @ApiResponse({
    status: 200,
    description: 'Balance totale calculée',
    schema: {
      example: {
        total_balance: 5420.75,
        accounts_count: 3,
      },
    },
  })
  getTotalBalance(@CurrentUser() user: JwtPayload) {
    return this.accountService.getTotalBalance(user.sub);
  }

  @Get('summary/financial')
  getFinancialSummary(@CurrentUser() user: JwtPayload) {
    return this.accountService.getFinancialSummary(user.sub);
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
