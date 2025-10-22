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
    const accounts = await this.prisma.account.findMany({ where: { userId } });

    return { accounts_list: accounts };
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
}
