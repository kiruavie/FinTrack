import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createAccountDto } from './dto/create_account.dto';
import { UpdateAccountDto } from './dto/update_account';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: createAccountDto, userId: string) {
    const account = await this.prisma.account.create({
      data: {
        name: dto.name,
        userId: userId, // Plus direct que la relation connect
      },
    });

    return { message: 'account created successfully', account: account };
  }

  async getAccounts(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    // Calculer la balance générale
    const totalBalance = accounts.reduce(
      (sum, account) => sum + account.balance,
      0,
    );

    return {
      accounts_list: accounts,
      total_balance: totalBalance,
      accounts_count: accounts.length,
    };
  }

  async getAccountById(id: string, userId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id, userId },
    });

    if (!account) throw new UnauthorizedException('compte introuvable');

    return { data: account };
  }

  async update(dto: UpdateAccountDto, userId: string, id: string) {
    // Vérifier que le compte appartient à l'utilisateur
    const existingAccount = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!existingAccount) {
      throw new UnauthorizedException(
        'Compte introuvable ou accès non autorisé',
      );
    }

    const account = await this.prisma.account.update({
      where: { id },
      data: {
        name: dto.name,
        balance: dto.balance,
      },
    });

    return { message: 'account updated successfully', account: account };
  }

  async delete(id: string, userId: string) {
    // Vérifier que le compte appartient à l'utilisateur avant suppression
    const existingAccount = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!existingAccount) {
      throw new UnauthorizedException(
        'Compte introuvable ou accès non autorisé',
      );
    }

    await this.prisma.account.delete({
      where: { id },
    });

    return { message: 'account deleted successfully', account_deleted: true };
  }

  /**
   * Obtient la balance générale de tous les comptes d'un utilisateur
   */
  async getTotalBalance(userId: string) {
    const result = await this.prisma.account.aggregate({
      where: { userId },
      _sum: {
        balance: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      total_balance: result._sum.balance || 0,
      accounts_count: result._count.id,
    };
  }

  /**
   * Obtient un résumé financier complet de l'utilisateur
   */
  async getFinancialSummary(userId: string) {
    // Récupérer tous les comptes avec leurs balances
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { balance: 'desc' },
    });

    // Calculer les statistiques
    const totalBalance = accounts.reduce(
      (sum, account) => sum + account.balance,
      0,
    );
    const positiveAccounts = accounts.filter((account) => account.balance > 0);
    const negativeAccounts = accounts.filter((account) => account.balance < 0);

    // Récupérer les dernières transactions
    const recentTransactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: {
        account: {
          select: { name: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 5,
    });

    // Calculer les revenus et dépenses du mois
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    const monthlyStats = await this.prisma.transaction.groupBy({
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
    });

    const monthlyIncome =
      monthlyStats.find((stat) => stat.type === 'INCOME')?._sum.amount || 0;
    const monthlyExpenses =
      monthlyStats.find((stat) => stat.type === 'EXPENSE')?._sum.amount || 0;

    return {
      // Balance générale
      total_balance: totalBalance,

      // Statistiques des comptes
      accounts_summary: {
        total_accounts: accounts.length,
        positive_accounts: positiveAccounts.length,
        negative_accounts: negativeAccounts.length,
        average_balance:
          accounts.length > 0 ? totalBalance / accounts.length : 0,
      },

      // Comptes individuels
      accounts: accounts.map((account) => ({
        id: account.id,
        name: account.name,
        balance: account.balance,
        transactions_count: account._count.transactions,
        percentage_of_total:
          totalBalance !== 0 ? (account.balance / totalBalance) * 100 : 0,
      })),

      // Statistiques mensuelles
      monthly_stats: {
        income: monthlyIncome,
        expenses: monthlyExpenses,
        net: monthlyIncome - monthlyExpenses,
      },

      // Dernières transactions
      recent_transactions: recentTransactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        description: tx.description,
        date: tx.date,
        account_name: tx.account.name,
      })),
    };
  }
}
