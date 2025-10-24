# Documentation API FinTrack

## 🚀 Démarrage

1. Démarrez l'application :
   ```bash
   npm run start:dev
   ```

2. Accédez à la documentation Swagger :
   ```
   http://localhost:3000/api
   ```

## 📚 Endpoints documentés

### 🔐 Authentification (`/auth`)
- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter

### 💰 Comptes (`/accounts`) 
- `GET /accounts` - Liste des comptes avec balance totale
- `GET /accounts/balance/total` - Balance générale
- `GET /accounts/summary/financial` - Résumé financier complet
- `POST /accounts` - Créer un compte
- `GET /accounts/:id` - Détails d'un compte
- `PATCH /accounts/:id` - Modifier un compte
- `DELETE /accounts/:id` - Supprimer un compte

### 💸 Transactions (`/transactions`)
- `GET /transactions` - Liste des transactions
- `POST /transactions` - Créer une transaction
- `GET /transactions/:id` - Détails d'une transaction
- `PATCH /transactions/:id` - Modifier une transaction
- `DELETE /transactions/:id` - Supprimer une transaction

### 📊 Dashboard (`/dashboard`)
- `GET /dashboard` - Tableau de bord complet
- `GET /dashboard/categories` - Top des catégories

## 🔑 Authentification

L'API utilise JWT Bearer Token. 

1. Créez un compte avec `/auth/register`
2. Connectez-vous avec `/auth/login` pour obtenir le token
3. Utilisez le token dans l'en-tête `Authorization: Bearer <token>`

## 📝 Exemples d'utilisation

### Créer un compte utilisateur
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "motdepasse123",
    "name": "Jean Dupont"
  }'
```

### Se connecter
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "motdepasse123"
  }'
```

### Créer un compte bancaire
```bash
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Compte courant",
    "balance": 2500.50
  }'
```

### Voir le dashboard
```bash
curl -X GET http://localhost:3000/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```