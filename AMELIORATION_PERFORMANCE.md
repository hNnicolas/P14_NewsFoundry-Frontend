# Analyse de performance et pistes d’amélioration – NewsFoundry

## 1. Constat général

L’application NewsFoundry fournit des résultats pertinents, mais certaines limites de performance ont été observées, notamment lors :

- de la génération des revues de presse ;
- de l’utilisation prolongée avec des chats longs ;
- des appels répétés au modèle LLM.

---

## 2. Piste d’amélioration n°1 : Streaming des réponses IA

### Problème observé

La réponse de l’agent est affichée uniquement lorsqu’elle est entièrement générée, ce qui entraîne une attente perceptible pour l’utilisateur.

### Métrique / Exemple

- Temps moyen de génération d’une revue de presse : **4 à 8 secondes**
- Temps perçu par l’utilisateur : **bloquant**

### Suggestion d’implémentation

- Utiliser le streaming de tokens proposé par OpenAI / PydanticAI
- Exposer une route SSE ou WebSocket
- Afficher la réponse progressivement côté frontend

### Objectif mesurable

- Temps de feedback initial < **500 ms**
- Amélioration de la satisfaction utilisateur perçue

---

## 3. Piste d’amélioration n°2 : Réduction du contexte envoyé au modèle

### Problème observé

Les chats longs augmentent :

- le nombre de tokens ;
- le temps de génération ;
- les erreurs de type _rate limit_ (observées en production).

### Métrique / Exemple

- Erreur `429 Rate limit exceeded`
- Prompt dépassant plusieurs milliers de tokens

### Suggestion d’implémentation

- Générer un résumé intermédiaire du chat
- N’envoyer au modèle que :
  - le résumé
  - les derniers messages

### Objectif mesurable

- Réduction du nombre de tokens envoyés de **30 à 50 %**
- Diminution des erreurs LLM

---

## 4. Piste d’amélioration n°3 : Suivi des performances avec MLflow

### Problème observé

Peu de visibilité sur :

- les temps de réponse ;
- les échecs IA ;
- la variabilité des performances.

### Suggestion d’implémentation

- Intégrer MLflow Tracing avec PydanticAI
- Logger :
  - durée des appels LLM ;
  - taille des prompts ;
  - succès / échec.

### Objectif mesurable

- Identifier les points de latence
- Optimiser les prompts sur données réelles

---

## 5. Conclusion

Les améliorations proposées sont :

- réalistes ;
- directement applicables à l’architecture actuelle ;
- mesurables à court terme.

Elles permettent d’augmenter à la fois :

- la performance technique ;
- la qualité perçue par l’utilisateur ;
- la robustesse globale de l’application.
