import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('FinTrack API')
    .setDescription(
      'API de gestion financière personnelle - FinTrack permet de gérer vos comptes, transactions et suivre vos finances',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentification et gestion des utilisateurs')
    .addTag('accounts', 'Gestion des comptes bancaires')
    .addTag('transactions', 'Gestion des transactions financières')
    .addTag('dashboard', 'Tableau de bord et statistiques')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez le token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Serveur de développement')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'FinTrack API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `🚀 Application démarrée sur : http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `📚 Documentation Swagger : http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}
bootstrap();
