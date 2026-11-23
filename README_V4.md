# ArtisanIA V4 — Documents et administration

## Objectif
Réduire le temps consacré au classement, à la recherche et à la préparation des documents administratifs, sans connexion externe ni abonnement.

## Fonctionnalités
- Coffre documentaire local séparé des données métier V2/V3, basé sur IndexedDB.
- Ajout de fichiers PDF, images, texte, CSV et documents bureautiques (conservation et téléchargement du fichier original).
- Classement suggéré par type, puis vérification et association manuelle à un client, chantier ou fournisseur existant.
- Lecture locale partielle des PDF contenant du texte et des fichiers TXT/CSV ; détection indicative du numéro de facture, de la date, du montant et du SIRET.
- Détection de doublons exacts par empreinte SHA-256, avec choix explicite de conserver ou non une seconde copie.
- Recherche, filtres, aperçu et téléchargement.
- Corbeille réversible ; suppression définitive protégée par deux confirmations.
- Export CSV du registre documentaire et préparation d'un CSV pour l'expert-comptable.
- Sauvegarde documentaire complète en JSON avec les fichiers encodés, puis restauration additive sans écraser les documents existants.
- Ajout des modules V4 au cache hors ligne de la PWA.

## Utilisation
1. Ouvrir l'espace entreprise puis l'onglet **Documents**.
2. Ajouter un document.
3. Vérifier le type et les champs proposés ; associer si nécessaire un client, un chantier ou un fournisseur.
4. Enregistrer le classement.
5. Utiliser la recherche, les filtres et les exports.
6. Effectuer régulièrement **Sauvegarder les fichiers** et conserver le JSON hors de l'appareil.

## Limites et précautions
- Tout reste dans le navigateur de l'appareil : il n'y a pas de synchronisation entre PC et téléphone.
- La lecture PDF est partielle et dépend de la structure du fichier. Les PDF scannés et les images ne sont pas soumis à un OCR dans cette version locale ; leurs champs doivent être renseignés manuellement.
- Les formats bureautiques sont conservés et téléchargeables, mais leur contenu n'est pas analysé.
- Les champs extraits sont des suggestions à contrôler, jamais des données comptables certifiées.
- Le CSV est une préparation à vérifier avec l'expert-comptable ; il ne remplace ni un logiciel comptable ni une déclaration réglementaire.
- La limite d'ajout est de 25 Mo par fichier. La capacité totale dépend du navigateur et de l'appareil.
- Une suppression définitive de la corbeille est irréversible. Sauvegardez avant tout nettoyage.

## Hors périmètre V4
Les catalogues fournisseurs connectés, la messagerie client, l'e-mail professionnel, la connexion bancaire et la synchronisation externe relèvent de la V5. Aucun service payant, compte externe ou API n'est activé.
