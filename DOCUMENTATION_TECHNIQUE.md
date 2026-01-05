# Documentation technique – NewsFoundry

## 1. Présentation générale du projet

**NewsFoundry** est une application web basée sur l’intelligence artificielle permettant aux utilisateurs de :

- dialoguer avec un assistant intelligent spécialisé dans l’actualité ;
- rechercher des articles récents via des APIs externes ;
- générer automatiquement des **revues de presse structurées et synthétiques**.

L’application repose sur une architecture **frontend / backend découplée**, avec un backend développé en **FastAPI** intégrant des **agents LLM** via **PydanticAI**.  
Cette architecture vise la **modularité**, la **maintenabilité** et la **scalabilité**.

---

## 2. Structure du projet

### 2.1 Backend

Le backend est structuré de manière modulaire afin de séparer clairement les responsabilités.

#### `main.py`

Point d’entrée de l’application FastAPI.  
Il contient :

- la configuration CORS ;
- la gestion de l’authentification JWT ;
- les routes HTTP principales ;
- l’initialisation et l’orchestration des agents IA.

Ce choix permet :

- une lecture claire du flux applicatif ;
- une maintenance facilitée ;
- une évolution maîtrisée de l’API.

---

#### `src/models.py`

Définit les modèles **SQLModel** et **Pydantic** :

- `User` : utilisateurs authentifiés ;
- `Chat` : discussions et historique ;
- `SystemPrompt` : prompts configurables ;
- modèles de sortie pour les revues de presse.

L’utilisation de SQLModel garantit :

- une cohérence entre base de données et API ;
- une validation automatique des données ;
- une réduction des erreurs de sérialisation.

---

#### `src/database.py`

Responsable de :

- l’initialisation du moteur de base de données ;
- la gestion des sessions SQL ;
- l’injection des dépendances via `Depends`.

Ce découplage isole totalement la logique de persistance.

---

### 2.2 Agents IA

Le backend intègre plusieurs agents IA basés sur **PydanticAI** :

- **agent principal** : assistant conversationnel ;
- **press_review_agent** : génération de revues de presse ;
- **tools** :
  - `search_news_tool` pour interroger l’API World News.

Les tools permettent au modèle de :

- accéder à des données réelles ;
- sans accès direct à Internet ;
- avec un contrôle total côté backend.

---

### 3. Frontend

- Application **Next.js (React)** ;
- Pages principales :
  - Chat ;
  - Revue de presse ;
  - Authentification.
- Communication avec le backend via **API REST sécurisée par JWT**.

Le frontend se concentre uniquement sur :

- l’expérience utilisateur ;
- l’accessibilité ;
- l’affichage progressif des données.

---

## 4. Justification des choix techniques

### 4.1 FastAPI

FastAPI a été choisi pour :

- ses performances élevées (ASGI) ;
- son typage fort avec Pydantic ;
- son système de dépendances (`Depends`) ;
- sa documentation automatique OpenAPI.

Il est particulièrement adapté aux **APIs IA** nécessitant robustesse et clarté.

---

### 4.2 SQLModel

SQLModel combine :

- SQLAlchemy (ORM robuste) ;
- Pydantic (validation des données).

Avantages :

- un seul modèle pour la base et l’API ;
- moins de duplication de code ;
- meilleure fiabilité des données.

---

### 4.3 Authentification JWT

Le choix du JWT repose sur :

- une architecture **stateless** ;
- une compatibilité cloud native (Vercel, Railway) ;
- une intégration simple côté frontend.

Chaque requête protégée inclut un token dans le header :

```bash
Authorization: Bearer <token>
```

---

### 4.4 PydanticAI pour les agents LLM

PydanticAI permet :

- un typage strict des entrées et sorties ;
- une réduction des hallucinations ;
- une intégration native des tools ;
- une meilleure maintenabilité des prompts.

Ce choix renforce la **fiabilité des réponses IA**.

---

### 4.5 API World News

L’API World News est utilisée comme source externe :

- fiable ;
- structurée ;
- orientée actualités internationales.

Elle permet d’enrichir les réponses IA avec des données factuelles.

---

## 5. Fonctionnement backend détaillé

### 5.1 Flux de génération d’une revue de presse

Utilisateur
<br> ↓ <br>
POST /generate-press-review
<br> ↓ <br>
Recherche d’articles (World News API) 
<br> ↓ <br>
Génération IA (PydanticAI)
<br> ↓ <br>
Validation du format 
<br> ↓ <br>
Sauvegarde en base 
<br> ↓ <br>
GET /press-review 

Chaque étape est contrôlée afin d’éviter :

- les incohérences ;
- les réponses non structurées ;
- les erreurs silencieuses.

---

## 6. Erreurs retournées par l’API backend

### 6.1 Erreurs d’authentification

- `401 Token manquant ou invalide`
- `401 Token expiré`
- `401 Utilisateur introuvable`

---

### 6.2 Erreurs fonctionnelles

- `400 Email et mot de passe requis`
- `400 Message requis`
- `400 Un thème est requis pour générer la revue de presse`
- `404 Chat introuvable`
- `404 Revue introuvable`

---

### 6.3 Erreurs externes et techniques

- `502 Erreur World News API`
- `500 Erreur lors de la sauvegarde en base`
- Erreurs LLM :
  - rate limit ;
  - timeout ;
  - indisponibilité temporaire.

---

## 7. Justification des choix de prompts

### 7.1 Prompt système principal

Objectifs :

- compréhension de requêtes formulées naturellement ;
- détection automatique d’une intention de revue de presse ;
- déclenchement conditionnel des tools.

Choix clés :

- prompt flexible mais cadré ;
- instructions claires sur la structure attendue ;
- obligation d’utiliser les articles fournis par les tools.

---

### 7.2 Prompt de génération de revue de presse

Objectifs :

- production d’un contenu journalistique structuré ;
- neutralité et clarté ;
- lisibilité pour l’utilisateur final.

Structure imposée :

- Titre ;
- Synthèse globale ;
- Liste d’articles synthétisés.

Ce choix garantit une sortie homogène et directement exploitable côté frontend.

---

## 8. Conclusion

Les choix techniques réalisés permettent à **NewsFoundry** d’être :

- modulaire ;
- extensible ;
- robuste face aux erreurs IA ;
- adaptée à des cas d’usage réels.

L’architecture actuelle constitue une base solide pour des évolutions futures telles que :

- le streaming des réponses IA ;
- l’analyse avancée des performances ;
- l’amélioration continue des prompts ;
- des fonctionnalités collaboratives.

---
