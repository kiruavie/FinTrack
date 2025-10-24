import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createTransactDto } from './dto/create_transact';
import { UpdateTransactDto } from './dto/update_transact';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async createTransact(dto: createTransactDto, userId: string) {
    // Vérifier que le compte appartient à l'utilisateur
    const account = await this.prisma.account.findFirst({
      where: { id: dto.accountId, userId },
    });

    if (!account) {
      throw new UnauthorizedException('Compte introuvable');
    }

    // Utiliser une transaction Prisma pour assurer la cohérence
    const result = await this.prisma.$transaction(async (prisma) => {
      // Créer la transaction
      const transaction = await prisma.transaction.create({
        data: {
          type: dto.type,
          amount: dto.amount,
          category: dto.category || 'Général',
          description: dto.description || '',
          date: dto.date ? new Date(dto.date) : new Date(),
          accountId: dto.accountId,
          userId: userId,
        },
      });

      // Calculer le changement de balance selon le type
      const balanceChange =
        dto.type === TransactionType.INCOME ? dto.amount : -dto.amount;

      // Mettre à jour le solde du compte
      const updatedAccount = await prisma.account.update({
        where: { id: dto.accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      return { transaction, updatedAccount };
    });

    return {
      success: true,
      message: 'Transaction créée et solde mis à jour',
      data: result.transaction,
      newBalance: result.updatedAccount.balance,
    };
  }

  async updateTransact(dto: UpdateTransactDto, userId: string, id: string) {
    const existingTransact = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: { account: true },
    });

    if (!existingTransact) {
      throw new UnauthorizedException('Transaction introuvable');
    }

    // Utiliser une transaction Prisma pour assurer la cohérence
    const result = await this.prisma.$transaction(async (prisma) => {
      // Annuler l'effet de l'ancienne transaction sur le solde
      const oldBalanceChange =
        existingTransact.type === TransactionType.INCOME
          ? -existingTransact.amount
          : existingTransact.amount;

      // Calculer l'effet de la nouvelle transaction
      const newType = dto.type || existingTransact.type;
      const newAmount = dto.amount || existingTransact.amount;
      const newBalanceChange =
        newType === TransactionType.INCOME ? newAmount : -newAmount;

      // Calculer le changement net
      const netBalanceChange = oldBalanceChange + newBalanceChange;

      // Mettre à jour la transaction
      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: {
          type: dto.type,
          amount: dto.amount,
          category: dto.category,
          description: dto.description,
          date: dto.date ? new Date(dto.date) : undefined,
          accountId: dto.accountId,
        },
      });

      // Mettre à jour le solde du compte concerné
      const updatedAccount = await prisma.account.update({
        where: { id: existingTransact.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return { transaction: updatedTransaction, updatedAccount };
    });

    return {
      success: true,
      message: 'Transaction mise à jour et solde ajusté',
      data: result.transaction,
      newBalance: result.updatedAccount.balance,
    };
  }

  async getAllTransacts(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: {
        account: {
          select: { name: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getTransactById(id: string, userId: string) {
    const existingTransact = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        account: {
          select: { name: true },
        },
      },
    });

    if (!existingTransact) {
      throw new UnauthorizedException('Transaction introuvable');
    }

    return existingTransact;
  }

  async deleteTransactById(id: string, userId: string) {
    const existingTransact = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: { account: true },
    });

    if (!existingTransact) {
      throw new UnauthorizedException('Transaction introuvable');
    }

    // Utiliser une transaction Prisma pour assurer la cohérence
    const result = await this.prisma.$transaction(async (prisma) => {
      // Calculer l'inverse de l'effet de la transaction sur le solde
      const balanceChange =
        existingTransact.type === 'INCOME'
          ? -existingTransact.amount
          : existingTransact.amount;

      // Supprimer la transaction
      await prisma.transaction.delete({
        where: { id },
      });

      // Restaurer le solde du compte
      const updatedAccount = await prisma.account.update({
        where: { id: existingTransact.accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      return { updatedAccount };
    });

    return {
      message: 'Transaction supprimée et solde restauré',
      success: true,
      newBalance: result.updatedAccount.balance,
    };
  }
}
