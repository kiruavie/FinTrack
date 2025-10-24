import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo(): object {
    return {
      message: 'Bienvenue sur FinTrack API 🚀',
      description: 'API de gestion financière personnelle',
      version: '1.0.0',
      documentation: '/api',
      endpoints: {
        auth: '/auth - Authentification et gestion des utilisateurs',
        accounts: '/accounts - Gestion des comptes bancaires',
        transactions: '/transactions - Gestion des transactions financières',
        dashboard: '/dashboard - Tableau de bord et statistiques',
      },
      features: [
        '🔐 Authentification JWT',
        '💰 Gestion multi-comptes',
        '💸 Suivi des transactions',
        '📊 Statistiques financières',
        '📈 Tableau de bord en temps réel',
      ],
      getting_started: {
        '1': 'Créer un compte : POST /auth/register',
        '2': 'Se connecter : POST /auth/login',
        '3': 'Utiliser le token JWT dans Authorization: Bearer <token>',
        '4': 'Explorer la documentation complète : /api',
      },
    };
  }
}
