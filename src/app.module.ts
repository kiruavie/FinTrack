import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AccountsController } from './accounts/accounts.controller';
import { AccountsService } from './accounts/accounts.service';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, AccountsModule, TransactionsModule, UsersModule],
  controllers: [AppController, AccountsController, UsersController],
  providers: [AppService, AccountsService],
})
export class AppModule {}
