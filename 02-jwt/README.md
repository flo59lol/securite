# 02 : émettre et vérifier un jeton JWT

Trois comptes existent déjà, avec leurs mots de passe hachés (les mots
de passe sont en commentaire dans `app.js`) : alice et bob ont le rôle
`user`, admin a le rôle `admin`.

Aujourd'hui, `POST /login` vérifie bien le mot de passe mais renvoie
seulement `{ message: 'Connecté' }`. Et `GET /tasks` renvoie toutes les
tâches à n'importe qui, connecté ou non.

## Ce que vous devez obtenir

- `POST /login` renvoie `{ token }` : un JWT signé en HS256 avec la
  constante `JWT_SECRET`, qui porte `sub` (l'id de l'utilisateur, en
  chaîne), `role`, et expire au bout de 15 minutes ;
- `GET /tasks` exige l'en-tête `Authorization: Bearer <jeton>`, répond
  401 si le jeton manque ou n'est pas valable, et ne renvoie que les
  tâches de l'utilisateur du jeton.

Écrivez la vérification dans un middleware, `authentifier`, qui range
l'utilisateur dans `req.user` : les exercices suivants s'en servent.

## Au départ : 8 tests rouges sur 10

- `la connexion renvoie un jeton`
- `le jeton porte sub, role, exp (15 min)`
- `sans jeton : 401`
- `jeton signé par une autre clé : 401`
- `jeton expiré : 401`
- `jeton alg none non signé : 401`
- `jeton HS512 au lieu de HS256 : 401`
- `bon jeton : 200, seulement ses tâches`

Les 2 tests de connexion passent déjà et doivent rester verts.

```bash
npx jest 02-jwt
```

Indice : regardez les options de `jwt.sign` (`algorithm`, `expiresIn`)
et de `jwt.verify` (`algorithms`).
