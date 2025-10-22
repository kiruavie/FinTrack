#!/bin/bash

echo "🚀 Test de l'API FinTrack avec authentification"
echo "================================================"

echo ""
echo "📝 1. Création d'un utilisateur..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@fintrack.com",
    "password": "demo123",
    "name": "Demo User"
  }')

echo "Réponse: $REGISTER_RESPONSE"

echo ""
echo "🔐 2. Connexion de l'utilisateur..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@fintrack.com",
    "password": "demo123"
  }')

echo "Réponse: $LOGIN_RESPONSE"

# Extraire le token (simple extraction pour bash)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"\([^"]*\)"/\1/')

if [ -z "$TOKEN" ]; then
    echo "❌ Erreur: Impossible de récupérer le token"
    exit 1
fi

echo "✅ Token récupéré: ${TOKEN:0:50}..."

echo ""
echo "💰 3. Création d'un compte (avec authentification)..."
ACCOUNT_RESPONSE=$(curl -s -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Compte Démo",
    "balance": 1500.50
  }')

echo "Réponse: $ACCOUNT_RESPONSE"

echo ""
echo "🚫 4. Test sans authentification (doit échouer)..."
NO_AUTH_RESPONSE=$(curl -s -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Compte Non Autorisé",
    "balance": 1000
  }')

echo "Réponse: $NO_AUTH_RESPONSE"

echo ""
echo "✅ Tests terminés !"