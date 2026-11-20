# ArtisanIA — version de travail V2

## Lancer l'application
- Ouvrir `index.html` dans un navigateur récent pour un premier essai.
- Pour installer la PWA et utiliser le mode hors ligne, publier le dossier sur un hébergement HTTPS (GitHub Pages convient).
- Sur téléphone, ouvrir l'adresse du site puis utiliser « Ajouter à l'écran d'accueil » ou « Installer ».

## Données et sauvegardes
- Les devis et tarifs de l'application d'origine restent dans son espace de stockage local.
- Les nouveaux modules utilisent un espace séparé `artisania.business.v2`.
- Chaque navigateur/appareil possède ses propres données : il n'y a pas encore de synchronisation entre appareils.
- Utiliser régulièrement Exporter dans l'espace entreprise et conserver le fichier JSON en lieu sûr.
- Ne pas effacer les données du navigateur sans avoir exporté les deux espaces de données.

## Modules ajoutés
Vue d'ensemble, assistant local, clients, prospects, chantiers, tâches, fournisseurs, matériaux, planning, notes, suivi des factures et dépenses.
Les données des modules sont enregistrées dans le navigateur. L'assistant comprend uniquement quelques formulations simples ; il n'utilise pas encore de modèle d'IA distant.

## Limites connues de cette version
- Le suivi des factures et dépenses est un registre simple : il ne génère pas encore de facture PDF conforme et ne remplace pas un logiciel comptable.
- Pas de compte utilisateur ni de synchronisation cloud.
- Pas de connexion automatique aux fournisseurs.
- Pas d'envoi automatique de mails/SMS ni de notifications garanties lorsque le navigateur est fermé.
- L'assistant local n'est pas un agent conversationnel avancé.
- Les prix indicatifs et informations métier doivent être vérifiés par l'artisan.

## Protection des données
Les informations saisies peuvent être personnelles ou commerciales. Tester d'abord avec des données fictives, protéger l'accès à l'appareil et conserver des sauvegardes. Ne pas partager les exports JSON publiquement.
