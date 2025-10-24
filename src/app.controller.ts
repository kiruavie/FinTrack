import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: "Page d'accueil de l'API",
    description: "Retourne les informations de base sur l'API FinTrack",
  })
  @ApiResponse({
    status: 200,
    description: "Informations sur l'API",
    schema: {
      example: {
        message: 'Bienvenue sur FinTrack API',
        version: '1.0.0',
        documentation: '/api',
        endpoints: {
          auth: '/auth',
          accounts: '/accounts',
          transactions: '/transactions',
          dashboard: '/dashboard',
        },
      },
    },
  })
  getHello(): object {
    return this.appService.getApiInfo();
  }
}
