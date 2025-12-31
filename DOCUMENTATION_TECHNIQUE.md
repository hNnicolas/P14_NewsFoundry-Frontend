# Documentation technique – NewsFoundry

## 1. Présentation générale du projet

NewsFoundry est une application web permettant aux utilisateurs de :

- discuter avec un assistant intelligent spécialisé dans l’actualité ;
- récupérer des articles récents via des APIs externes ;
- générer automatiquement des revues de presse.

L’application repose sur une architecture **frontend / backend découplée**, avec un backend FastAPI intégrant des **agents LLM** via PydanticAI.

---

## 2. Structure du projet

### 2.1 Backend

Principaux composants :

- `main.py`  
  Point d’entrée de l’API FastAPI.  
  Contient :

  - la configuration CORS ;
  - l’authentification JWT ;
  - les routes HTTP ;
  - la configuration des agents IA.

- `src/models.py`  
  Définit les modèles SQLModel et Pydantic :

  - `User`
  - `Chat`
  - `SystemPrompt`
  - modèles de sortie des revues de presse.

- `src/database.py`  
  Initialisation de la base de données et de la session SQLModel.

- Agents IA :
  - `agent` : assistant conversationnel principal
  - `press_review_agent` : génération de revues de presse
  - outils (`search_news_tool`) pour appeler l’API World News.

---

### 2.2 Frontend

- Application Next.js (React)
- Pages principales :
  - Chat
  - Revue de presse
  - Authentification
- Communication avec le backend via API REST sécurisée par JWT.

---

## 3. Justification des choix techniques

### 3.1 FastAPI

- Performances élevées
- Support natif des dépendances (`Depends`)
- Documentation automatique (OpenAPI)
- Très adapté aux APIs IA

### 3.2 SQLModel

- Combine SQLAlchemy et Pydantic
- Simplifie la validation et la persistance des données
- Cohérence entre modèles DB et API

### 3.3 JWT pour l’authentification

- Stateless
- Facile à intégrer avec le frontend
- Compatible avec des déploiements cloud (Railway, Vercel)

### 3.4 PydanticAI pour les agents LLM

- Typage fort des entrées / sorties
- Meilleure fiabilité des réponses IA
- Facilité d’intégration avec des outils (tools)

### 3.5 API World News

- Source externe fiable d’actualités
- Permet d’enrichir les réponses IA avec des données réelles

---

## 4. Erreurs retournées par l’API backend

### 4.1 Erreurs d’authentification

- `401 Token manquant ou invalide`
- `401 Token expiré`
- `401 Utilisateur introuvable`

### 4.2 Erreurs fonctionnelles

- `400 Email et mot de passe requis`
- `400 Message requis`
- `400 Un thème est requis pour générer la revue de presse`
- `404 Chat introuvable`
- `404 Revue introuvable`

### 4.3 Erreurs externes

- `502 Erreur World News API`
- `500 Erreur lors de la sauvegarde en base`
- Erreurs LLM (rate limit, timeout)

Ces erreurs sont capturées et retournées sous forme de messages explicites afin d’améliorer la robustesse de l’application.

---

## 5. Justification des choix de prompts

### 5.1 Prompt système principal

Objectifs :

- Comprendre des demandes formulées naturellement
- Détecter automatiquement une intention de revue de presse
- Déclencher l’appel aux outils de recherche d’actualités

Choix clés :

- Prompt flexible et non rigide
- Instructions explicites sur la structure attendue
- Obligation d’utiliser les articles retournés par les tools

### 5.2 Prompt de génération de revue de presse

Objectifs :

- Production d’un contenu journalistique structuré
- Neutralité et clarté
- Limitation du nombre d’articles (lisibilité)

Structure imposée :

- Titre
- Synthèse globale
- Liste d’articles synthétisés

Ce choix garantit une sortie homogène et exploitable côté frontend.

---

## 6. Conclusion

Les choix techniques réalisés permettent une application :

- modulaire ;
- extensible ;
- adaptée à des cas d’usage IA réels.

L’architecture actuelle constitue une base solide pour des évolutions futures comme le streaming, l’analyse de performance ou l’interaction entre utilisateurs.
