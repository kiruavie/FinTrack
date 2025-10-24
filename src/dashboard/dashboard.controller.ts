import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Tableau de bord principal',
    description:
      "Retourne toutes les données du tableau de bord : vue d'ensemble, comptes, transactions récentes, statistiques mensuelles et annuelles.",
  })
  @ApiResponse({
    status: 200,
    description: 'Données du tableau de bord récupérées',
    schema: {
      example: {
        overview: {
          total_balance: 5420.75,
          total_accounts: 3,
          positive_balance: 5420.75,
          negative_balance: 0,
          net_worth: 5420.75,
        },
        accounts: [],
        recent_transactions: [],
        monthly_stats: {
          income: 3000,
          expenses: 1200,
          net: 1800,
        },
        yearly_stats: {},
        trends: {},
      },
    },
  })
  getDashboard(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getDashboardData(user.sub);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Catégories les plus utilisées',
    description: 'Retourne les catégories de transactions les plus fréquentes.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Nombre maximum de catégories à retourner (défaut: 5)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Top des catégories récupéré',
    schema: {
      example: [
        {
          category: 'Alimentation',
          type: 'EXPENSE',
          total_amount: 450.25,
          transactions_count: 12,
          average_amount: 37.52,
        },
      ],
    },
  })
  getTopCategories(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getTopCategories(user.sub, limitNumber);
  }
}
