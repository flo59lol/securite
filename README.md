# Sécurité applicative avancée : session 1

Quatre exercices sur une même API de tâches, écrite avec Express et
gardée en mémoire : hachage des mots de passe, jeton JWT, rôles, accès
aux objets des autres (IDOR). Chaque exercice repart d'une application
où les failles de l'exercice précédent sont déjà corrigées.

## Installer

Il vous faut Node 18 ou plus récent. Dans ce dossier :

```bash
npm install
```

`npm audit` signale une alerte sur `deepmerge`, une dépendance de Jest :
elle ne concerne que l'outil de test, pas l'application. Ne lancez pas
`npm audit fix --force`, qui rétrograderait Jest.

## Lancer un exercice

```bash
npx jest 01-hachage
npx jest 02-jwt
npx jest 03-roles
npx jest 04-idor
```

`npm test` lance les quatre d'un coup.

## Le principe

Chaque dossier contient deux fichiers de code :

- `app.js` : l'application, volontairement vulnérable ou incomplète ;
- `app.test.js` : ses tests, déjà écrits.

Au départ, les tests fonctionnels passent et les tests de sécurité
échouent : ils sont rouges. Votre travail est de modifier `app.js`, et
seulement `app.js`, jusqu'à ce que tous les tests passent au vert. Ne
touchez pas aux tests : ils sont le cahier des charges.

Le `README.md` de chaque exercice dit ce qui est attendu et quels tests
échouent au départ. Lisez le message d'erreur de chaque test rouge : il
dit ce que l'application renvoie et ce qui était attendu.

| Exercice | Tests | Rouges au départ |
|---|---|---|
| `01-hachage` | 8 | 4 |
| `02-jwt` | 10 | 8 |
| `03-roles` | 8 | 3 |
| `04-idor` | 7 | 2 |
