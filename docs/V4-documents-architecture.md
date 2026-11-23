# ArtisanIA V4 — Documents et administration

## Architecture
Le gestionnaire documentaire est un module autonome ajouté à l'espace entreprise. Il ne modifie ni le schéma métier V2 ni la mémoire V3.
- `documents-v4-core.js` : classification indicative, extraction de champs par expressions régulières, génération CSV et formatage.
- `documents-v4.js` : interface, IndexedDB, ajout, aperçu, liens aux fiches métier, doublons, corbeille et sauvegardes.
- `documents` et `trash` sont deux magasins IndexedDB distincts sous `artisania.documents.v4`.
- Les documents binaires restent des Blob dans IndexedDB. Les métadonnées sont séparées des fiches client/chantier/fournisseur ; seules les références et libellés sont copiés pour rendre les recherches stables.
- Les modules sont chargés localement et ajoutés au cache du service worker.

## Garde-fous
- Les suggestions de catégorie et les champs extraits restent non fiables tant que l'utilisateur ne les a pas vérifiés.
- Un doublon exact est détecté avec SHA-256 ; l'utilisateur décide s'il garde une seconde copie.
- Le déplacement en corbeille demande confirmation ; la restauration est possible ; l'effacement définitif exige deux confirmations.
- La restauration d'une sauvegarde est additive et ignore les empreintes déjà présentes.
- Aucune analyse ne transmet les fichiers à un serveur.

## Limites connues
La lecture PDF est une extraction textuelle locale simplifiée : elle ne remplace pas un moteur OCR, ne garantit pas le décodage de toutes les polices PDF et ne reconnaît pas les scans. Les images et PDF scannés doivent être classés et renseignés manuellement. L'export comptable est un CSV préparatoire, non une conformité comptable ou fiscale.
