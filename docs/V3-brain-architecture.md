# ArtisanIA V3 — Architecture du cerveau

## Objectif
Faire d'ArtisanIA un assistant d'activité pour artisans, pas seulement un outil de devis. Le cerveau relie le contexte métier, la mémoire, la compréhension des messages, le raisonnement et les actions proposées.

## Principes non négociables
- **Local-first et gratuit au développement** : aucun abonnement, API payante, serveur, compte bancaire connecté ou service externe requis pour la V3 de base.
- **Données maîtrisées** : stockage local actuel conservé; les nouvelles structures sont versionnées et exportables.
- **Aucune action irréversible automatique** : l'assistant propose; l'artisan confirme avant de modifier, supprimer, envoyer, réserver ou engager une dépense.
- **Pas de perte de données** : migration additive, sauvegarde avant changement de format, compatibilité avec les exports existants.
- **Architecture fournisseur-neutre** : un moteur local simple maintenant, interface d'adaptateur prévue pour un modèle IA externe plus tard, sans l'activer ni le payer.
- **Contexte partagé** : client, prospect, chantier, tâche, rendez-vous, facture et notes doivent pouvoir se référencer sans recopier inutilement les mêmes informations.

## Architecture en couches
1. **Mémoire (données)** — entités et faits datés, provenance (saisie, import, déduction), confiance, liens et historique.
2. **Compréhension** — transformer une phrase en intention, éléments (personne, chantier, date, montant, fournisseur) et ambiguïtés.
3. **Raisonnement** — réunir le contexte pertinent, détecter les incohérences, échéances, oublis et opportunités; expliquer brièvement pourquoi.
4. **Actions** — créer une proposition structurée (ex. rappel, tâche, relance, note, rendez-vous), avec confirmation explicite et prévisualisation.
5. **Interface** — conversation / saisie naturelle, carte de proposition, confirmation, suivi du résultat.
6. **Adaptateurs IA (future option)** — interface abstraite, sélection de fournisseur, consentement et coûts clairement visibles; désactivés tant que non validés.

## Première tranche V3 (fondation)
- Créer une spécification documentée de la mémoire et des propositions d'action.
- Ajouter un moteur local autonome (sans connexion ni API) pour normaliser une phrase et détecter quelques intentions fréquentes avec des règles explicites.
- Tests unitaires sur phrases simples, ambiguës, dates non précisées et demandes qui ne doivent pas déclencher une action.
- Ne pas encore modifier les modules métier V2 ni intégrer de chatbot en façade : d'abord fiabiliser les fondations.

## Mémoire — schéma envisagé
Chaque élément est un objet avec : `id`, `type`, `text` ou `data`, `createdAt`, `updatedAt`, `source`, `confidence`, `links[]`, `status`.
Types de faits: client, prospect, chantier, tâche, rendez-vous, fournisseur, matériel, devis/facture, dépense, préférence métier, note/conversation.
La mémoire distingue **faits confirmés**, **hypothèses** et **suggestions**. Une déduction ne devient pas un fait confirmé sans validation.

## Format d'une proposition d'action
- `id`, `type`, `title`, `description`
- `target` (entité liée si connue)
- `dueDate` (si date claire)
- `confidence` et `reasons[]`
- `requiresConfirmation: true`
- `status: "proposed" | "accepted" | "rejected" | "completed"`

## Cas de test métier prioritaires
- « Rappelle-moi d'appeler M. Dupont demain » → proposition de tâche/rappel, date relative à résoudre par l'application.
- « Le chantier Dupont commence lundi » → proposition de mise à jour du chantier; si plusieurs Dupont, demander lequel.
- « J'ai reçu 200 € d'acompte de Dupont » → proposer un événement de paiement à vérifier; ne pas inventer une facture ou affecter le paiement sans rapprochement.
- « Le fournisseur livre les tuiles jeudi » → note/tâche ou événement associé au chantier/fournisseur si identifiable.
- « J'ai peut-être oublié de relancer le client » → question ou suggestion, pas action automatique.
- Phrase vague sans destinataire ou date → demander une précision, ne pas inventer.

## Mémoire structurée — première implémentation
- Stockage séparé et versionné : `artisania.brain.memory.v1`.
- Import non destructif depuis la structure V2 : les données sources ne sont ni supprimées ni modifiées.
- Chaque fiche mémorisée conserve son type, son identifiant source, ses données d'origine, sa provenance, son niveau de confiance, son statut et ses liens.
- Les liens client/chantier/fournisseur sont créés seulement lorsqu'une correspondance unique et exacte est trouvée; les ambiguïtés restent sans lien.
- Un nouvel import est idempotent : il n'écrase pas une mémoire déjà enrichie.
- La mémoire est actuellement un module autonome testé; elle n'est pas encore branchée à l'interface de l'application.

## Étapes suivantes
1. [x] Écrire et tester le moteur local de compréhension (règles de base, sans IA externe).
2. [x] Construire le premier magasin de mémoire structurée et l'import non destructif des données V2.
3. Concevoir une interface conversationnelle qui affiche le contexte utilisé et les actions proposées.
4. Valider sur un panel de scénarios réels d'artisans avant de brancher un modèle IA externe.
5. Après validation de l'utilité et de la demande, seulement alors étudier coût et intégration d'API IA.

## Statut
- [x] V2 responsive et fiabilisation des modules — développement terminé, validation manuelle PC/mobile à faire.
- [x] Branche V3 isolée, basée sur la branche V2 de travail.
- [x] Architecture et garde-fous documentés.
- [x] Moteur local de compréhension + tests.
- [x] Première mémoire structurée autonome + import V2 non destructif.
- [ ] Branchement progressif de la mémoire au contexte de l'application.
- [ ] Interface cerveau et tests utilisateurs.
