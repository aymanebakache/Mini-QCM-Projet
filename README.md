## Fonctionnalités
- Partie 1: QCM statique (HTML/CSS/JS), minuterie par question, calcul du score, défilement vers le haut à l'affichage du score.
- Partie 2: QCM dynamique via Open Trivia Database (`https://opentdb.com`): formulaire de configuration (nombre, catégorie, difficulté, type), génération du quiz, calcul du score.

## Démarrage
- Ouvrez simplement `index.html` dans un navigateur moderne.

## Structure
- `index.html`: structure HTML des deux parties
- `styles.css`: styles et mise en forme
- `app.js`: logique (sélection, score, minuterie, API OpenTDB)

## Notes
- La minuterie désactive les options d'une question à expiration; le bouton Réinitialiser relance les minuteries.
- Les entités HTML renvoyées par OpenTDB sont décodées avant affichage.
- Le score s'affiche dans la bannière en haut et la page défile automatiquement vers le haut.

## Développeurs
-Aymane BAKACHE @aymanebakache
-Marouane BAKRIM 

## Encadrement
-Prof : M.BENTAJER
