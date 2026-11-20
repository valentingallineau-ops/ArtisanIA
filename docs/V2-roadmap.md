# ArtisanIA — feuille d'amélioration V2 et suivantes

> Liste vivante : chaque nouvelle idée, recherche, retour d'artisan et test utilisateur sera ajouté ici. Priorité à la simplicité, aux gains de temps concrets, à la fiabilité et à la validation avant d'ajouter des fonctions.

## V2 — Interface réellement responsive (en cours)
- [ ] Une seule interface adaptative ordinateur/tablette/téléphone, sans deux versions distinctes.
- [ ] Desktop : mieux exploiter l'espace, largeur de travail plus confortable, navigation claire, formulaires et listes moins étroits.
- [ ] Mobile : commandes faciles à toucher, champs sans zoom automatique, navigation et contenus confortables, éviter débordements.
- [ ] Repenser progressivement l'accueil comme tableau de bord utile : priorités, tâches à faire, échéances, raccourcis et activité récente.
- [ ] Audit page par page des menus, actions, doublons et étapes superflues; tester chaque flux sur petits et grands écrans.
- [ ] Préserver les fonctionnalités, données, import/export, fonctionnement hors ligne et compatibilité des sauvegardes.
- [ ] Tester la compréhension sans tutoriel : libellés évidents, actions visibles, retours de confirmation et erreurs explicites.

## Assistant et capture d'information (vision différenciante, progressivement)
- [ ] Capture rapide d'une note / idée / information en langage naturel.
- [ ] Identifier le client, chantier, document ou contexte correspondant et proposer un classement.
- [ ] Transformer l'information en actions (tâche, rappel, relance, vérification) avec validation utilisateur.
- [ ] Mémoire partagée client–chantier–activité, historique central et recherche par question.
- [ ] Priorités et alertes proactives, sans notifications inutiles; contrôle et validation des actions importantes.

## Connexions envisagées — à étudier, pas encore implémentées
- [ ] Catalogues fournisseurs : recherche produits/prix, références, mises à jour et association aux chantiers/devis; vérifier disponibilité des API et conditions d'accès.
- [ ] Compte bancaire professionnel : synchronisation sécurisée, rapprochement de paiements, visibilité trésorerie; étudier conformité, coûts et prestataires avant toute connexion.
- [ ] Messagerie téléphone : intégration limitée aux conversations clients, avec choix explicite des contacts, permissions minimales et respect de la vie privée.
- [ ] Boîte e-mail : relier les échanges à clients/chantiers, détecter devis, demandes, échéances et actions; proposer avant d'envoyer ou modifier.
- [ ] Aucune connexion ni coût externe ne sera activé sans décision explicite; privilégier les solutions gratuites/locales pour les prototypes.

## Documents et rangement intelligent
- [ ] Classement assisté des devis, factures, justificatifs, achats et documents par client, chantier, fournisseur et type.
- [ ] Organisation en dossiers/collections claire, recherche rapide et détection des documents mal classés.
- [ ] Détection de doublons et documents inutiles/candidats à l'archivage; ne jamais supprimer automatiquement un document important. Prévoir corbeille, confirmation, historique et règles de conservation.
- [ ] OCR/lecture de documents à évaluer (tickets, factures, devis, courriers) et extraction de champs avec contrôle humain.
- [ ] Rappels des justificatifs manquants et préparation simple pour l'expert-comptable.

## Comptabilité / gestion — irritants à résoudre
- [ ] Réduire la paperasse après la journée de terrain et les tâches administratives non facturables.
- [ ] Rassembler les justificatifs et tickets, prévenir leur perte et faciliter leur saisie/classification.
- [ ] Suivi des dépenses, achats et temps non facturable; relier au bon chantier/client.
- [ ] Aider à suivre les échéances, paiements, TVA et obligations sans se substituer à un expert-comptable ni afficher des règles non vérifiées.
- [ ] Simplifier le suivi régulier plutôt que laisser s'accumuler les tâches en fin de mois/trimestre.
- [ ] Préparer inventaire/stock et suivi du matériel si cela répond à un besoin fréquent.
- [ ] Accompagner la facturation électronique et les changements réglementaires avec sources officielles et mises à jour vérifiées.

## Autres pistes à garder en observation
- [ ] Planification chantiers / équipes / matériel et suivi de progression.
- [ ] Achats fournisseurs, coûts chantier, marge et alertes de dépassement.
- [ ] Relances client, suivi commercial et prospects.
- [ ] Connexion expert-comptable / exports fiables.
- [ ] Automatisations répétitives, configurables et annulables.

## Règles de développement
- Prioriser les problèmes fréquents, coûteux en temps ou argent, et clairement validés.
- Une amélioration à la fois, sur branche de développement; ne pas modifier la branche principale directement.
- Aucun effacement irréversible, envoi de message, paiement ou modification sensible automatisé sans accord explicite.
- Conserver les données et les fonctions existantes; sauvegarde et tests de régression à chaque étape.
- Garder une architecture prête aux API IA, mais ne déclencher aucun abonnement/coût avant validation.
- Chaque version est testée sur ordinateur et téléphone; publication seulement après validation explicite.
