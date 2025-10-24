import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtient toutes les données nécessaires pour le dashboard principal
   */
  async getDashboardData(userId: string) {
    // Exécuter toutes les requêtes en parallèle pour optimiser les performances
    const [accounts, recentTransactions, monthlyStats, yearlyStats] =
      await Promise.all([
        // Tous les comptes avec leurs balances
        this.prisma.account.findMany({
          where: { userId },
          include: {
            _count: {
              select: { transactions: true },
            },
          },
          orderBy: { balance: 'desc' },
        }),

        // 10 dernières transactions
        this.prisma.transaction.findMany({
          where: { userId },
          include: {
            account: {
              select: { name: true },
            },
          },
          orderBy: { date: 'desc' },
          take: 10,
        }),

        // Statistiques du mois en cours
        this.getMonthlyStats(userId),

        // Statistiques de l'année en cours
        this.getYearlyStats(userId),
      ]);

    // Calculs de base
    const totalBalance = accounts.reduce(
      (sum, account) => sum + account.balance,
      0,
    );
    const totalAccounts = accounts.length;
    const positiveBalance = accounts
      .filter((acc) => acc.balance > 0)
      .reduce((sum, acc) => sum + acc.balance, 0);
    const negativeBalance = accounts
      .filter((acc) => acc.balance < 0)
      .reduce((sum, acc) => sum + acc.balance, 0);

    return {
      // Vue d'ensemble
      overview: {
        total_balance: totalBalance,
        total_accounts: totalAccounts,
        positive_balance: positiveBalance,
        negative_balance: Math.abs(negativeBalance),
        net_worth: totalBalance,
      },

      // Comptes avec détails
      accounts: accounts.map((account) => ({
        id: account.id,
        name: account.name,
        balance: account.balance,
        transactions_count: account._count.transactions,
        percentage:
          totalBalance !== 0
            ? Math.round((account.balance / totalBalance) * 100)
            : 0,
        status: account.balance >= 0 ? 'positive' : 'negative',
      })),

      // Transactions récentes
      recent_transactions: recentTransactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        category: tx.category || 'Non catégorisé',
        description: tx.description || '',
        date: tx.date,
        account_name: tx.account.name,
        formatted_amount:
          tx.type === 'INCOME' ? `+${tx.amount}€` : `-${tx.amount}€`,
      })),

      // Statistiques mensuelles
      monthly_stats: monthlyStats,

      // Statistiques annuelles
      yearly_stats: yearlyStats,

      // Tendances
      trends: {
        balance_trend: totalBalance >= 0 ? 'positive' : 'negative',
        monthly_trend: monthlyStats.net >= 0 ? 'positive' : 'negative',
        savings_rate:
          monthlyStats.income > 0
            ? Math.round(
                ((monthlyStats.income - monthlyStats.expenses) /
                  monthlyStats.income) *
                  100,
              )
            : 0,
      },
    };
  }

  /**
   * Statistiques du mois en cours
   */
  private async getMonthlyStats(userId: string) {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const monthlyTransactions = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const income =
      monthlyTransactions.find((stat) => stat.type === 'INCOME')?._sum.amount ||
      0;
    const expenses =
      monthlyTransactions.find((stat) => stat.type === 'EXPENSE')?._sum
        .amount || 0;
    const incomeCount =
      monthlyTransactions.find((stat) => stat.type === 'INCOME')?._count.id ||
      0;
    const expenseCount =
      monthlyTransactions.find((stat) => stat.type === 'EXPENSE')?._count.id ||
      0;

    return {
      income,
      expenses,
      net: income - expenses,
      transactions_count: incomeCount + expenseCount,
      income_transactions: incomeCount,
      expense_transactions: expenseCount,
      average_income: incomeCount > 0 ? income / incomeCount : 0,
      average_expense: expenseCount > 0 ? expenses / expenseCount : 0,
    };
  }

  /**
   * Statistiques de l'année en cours
   */
  private async getYearlyStats(userId: string) {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const yearlyTransactions = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: {
          gte: startOfYear,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const income =
      yearlyTransactions.find((stat) => stat.type === 'INCOME')?._sum.amount ||
      0;
    const expenses =
      yearlyTransactions.find((stat) => stat.type === 'EXPENSE')?._sum.amount ||
      0;
    const totalTransactions = yearlyTransactions.reduce(
      (sum, stat) => sum + stat._count.id,
      0,
    );

    return {
      income,
      expenses,
      net: income - expenses,
      transactions_count: totalTransactions,
      monthly_average_income: income / (new Date().getMonth() + 1),
      monthly_average_expenses: expenses / (new Date().getMonth() + 1),
    };
  }

  /**
   * Obtient les catégories les plus utilisées
   */
  async getTopCategories(userId: string, limit: number = 5) {
    const categories = await this.prisma.transaction.groupBy({
      by: ['category', 'type'],
      where: {
        userId,
        category: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: limit,
    });

    return categories.map((cat) => ({
      category: cat.category,
      type: cat.type,
      total_amount: cat._sum.amount,
      transactions_count: cat._count.id,
      average_amount: cat._count.id > 0 ? cat._sum.amount! / cat._count.id : 0,
    }));
  }
}
