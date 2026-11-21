# ArtisanIA — feuille de route officielle V1 à V6+

Cette feuille de route est la référence produit. Les versions sont développées dans l'ordre, sans mélanger les objectifs. Une idée nouvelle est rangée dans la version qui lui correspond au lieu d'être ajoutée prématurément.

## V1 — Terminée et publiée

**Base existante**
- [x] Modules de gestion existants.
- [x] Clients et prospects.
- [x] Chantiers.
- [x] Devis, factures et dépenses.
- [x] Sauvegarde et restauration.
- [x] Première version fonctionnelle publiée.

La V1 publiée reste stable pendant les développements suivants.

## V2 — Simplicité et expérience utilisateur

**Objectif : rendre l'application évidente et agréable avant d'ajouter de la complexité.**

- [x] Refonte initiale de l'accueil et tableau de bord utile.
- [x] Navigation adaptative ordinateur / tablette / téléphone.
- [x] Actions rapides et raccourcis.
- [x] Formulaires et listes adaptés aux écrans, champs et actions simplifiés.
- [x] Réduction des clics et des ressaisies sur les parcours travaillés.
- [x] Amélioration des liens entre les modules et des suggestions de données liées.
- [x] Audit technique et fonctionnel initial : menus, recherches, statuts, formulaires, suppressions, messages et états vides.
- [x] Préservation des fonctions existantes, des données, de l'import/export et du mode hors ligne, vérifiée par des contrôles automatisés.
- [ ] Audit final d'usage réel et validation manuelle sur ordinateur et téléphone.
- [ ] Corriger les derniers problèmes remontés lors de cette validation.
- [ ] Publication de la V2 après validation explicite.

**État :** implémentation principale terminée sur la branche de développement. La validation manuelle finale reste obligatoire avant fusion/publication.

## V3 — Assistant et automatisations

**Objectif : permettre à l'artisan de parler naturellement à ArtisanIA, qui comprend le contexte de son entreprise et lui propose des actions utiles.**

- [x] Première compréhension locale de formulations fréquentes, sans API externe.
- [x] Première mémoire métier structurée, locale et versionnée.
- [x] Import non destructif des données V2 dans l'espace mémoire séparé.
- [x] Liens prudents entre fiches et détection des homonymes/ambiguïtés.
- [x] Résolution locale du contexte et tests automatisés de la fondation.
- [x] Premier orchestrateur réunissant compréhension, mémoire et proposition d'action sans exécution automatique.
- [ ] Capture d'informations en langage naturel depuis l'application.
- [ ] Consultation de la mémoire et affichage des éléments de contexte retrouvés.
- [ ] Propositions de création de tâches et rappels, avec dates clarifiées.
- [ ] Détection des oublis et échéances, avec explication et contrôle de l'artisan.
- [ ] Résumés d'activité utiles.
- [ ] Recherche intelligente en langage naturel.
- [ ] Validation sur des scénarios réels et retours d'artisans.

**État :** fondations techniques et orchestrateur local en place, avec 23 tests réussis sur le dernier contrôle. Ils ne sont pas encore intégrés à l'interface métier. Les règles locales actuelles ne constituent pas encore une IA générative.

## V4 — Documents et administration automatisés

**Objectif : réduire le temps passé à ranger, vérifier et préparer les documents administratifs.**

- [ ] Classement intelligent des documents par type, client, chantier et fournisseur.
- [ ] Organisation des factures et justificatifs.
- [ ] Reconnaissance/lecture de documents et extraction de champs, avec vérification humaine.
- [ ] Détection des doublons.
- [ ] Nettoyage sécurisé : proposition, aperçu, sauvegarde, corbeille et confirmation; aucune suppression irréversible automatique.
- [ ] Préparation comptable et exports structurés pour l'expert-comptable.
- [ ] Vérification des règles et obligations à partir de sources officielles avant toute fonctionnalité réglementaire.

## V5 — Connexions externes

**Objectif : relier ArtisanIA aux outils réellement utilisés, seulement après validation du besoin, de la sécurité, des coûts et des conditions d'accès.**

- [ ] Catalogues fournisseurs.
- [ ] Messagerie clients.
- [ ] Boîte mail professionnelle.
- [ ] Compte bancaire.
- [ ] Logiciels comptables.
- [ ] Synchronisation des informations entre services.

Aucune connexion externe, aucun abonnement ni aucune API payante ne sont activés par anticipation. Chaque intégration nécessitera une décision explicite, des permissions minimales, une gestion des erreurs et une possibilité de désactivation.

## V6 et suivantes — Assistant métier avancé

**Objectif : faire évoluer ArtisanIA vers un assistant qui comprend de mieux en mieux l'entreprise et aide à l'organiser.**

- [ ] Anticipation des besoins et alertes contextualisées.
- [ ] Gestion plus avancée des chantiers.
- [ ] Analyse de rentabilité.
- [ ] Préparation des achats.
- [ ] Organisation et optimisation du planning.
- [ ] Actions assistées ou automatisées, configurables, traçables et annulables.
- [ ] Compréhension progressive des habitudes, contraintes et objectifs de l'entreprise.

## Règles de développement et de publication

1. Respecter l'ordre V1 → V2 → V3 → V4 → V5 → V6+; ne pas lancer les connexions V5 pendant la construction du cœur V3.
2. Partir des problèmes fréquents et coûteux en temps ou en argent, puis vérifier leur utilité auprès d'artisans.
3. Préserver les fonctions et les données existantes; toute migration est additive, sauvegardée et testée.
4. Aucun effacement irréversible, envoi, paiement ou changement sensible sans confirmation explicite.
5. Favoriser le local et le gratuit pendant le développement; ne pas engager de dépenses récurrentes avant validation commerciale.
6. Tester chaque évolution automatiquement et manuellement sur ordinateur et téléphone lorsque l'interface est concernée.
7. Travailler sur des branches dédiées. La branche publiée n'est pas modifiée directement.
8. Une version reste en brouillon tant que ses tests, sa validation utilisateur et son contrôle de non-régression ne sont pas terminés.
9. Ne jamais présenter un prototype à règles déterministes comme une IA générative déjà opérationnelle.
