# 03 : réserver des routes à l'admin

L'authentification par jeton est en place : le middleware
`authentifier` vérifie le jeton et range `{ id, role }` dans
`req.user`.

Deux routes sont réservées à l'admin :

- `GET /admin/users` : la liste des comptes ;
- `DELETE /tasks/:id` : supprimer n'importe quelle tâche.

Aujourd'hui, elles vérifient qu'on est connecté, mais pas qu'on est
admin. Et `GET /admin/users` renvoie les comptes entiers, hash compris.

## Ce que vous devez obtenir

- un middleware réutilisable `exigerRole(role)`, placé après
  `authentifier`, qui répond 403 si `req.user.role` n'est pas le bon ;
- les deux routes protégées par `exigerRole('admin')` ;
- `GET /admin/users` qui ne renvoie que `id`, `email` et `role`.

## Au départ : 3 tests rouges sur 8

- `GET /admin/users avec un jeton user : 403`
- `DELETE /tasks/3 avec un jeton user : 403`
- `GET /admin/users ne renvoie aucun hash`

Les 5 tests fonctionnels passent déjà et doivent rester verts.

```bash
npx jest 03-roles
```

Rappel : 401, c'est « je ne sais pas qui vous êtes » ; 403, c'est « je
sais qui vous êtes, et c'est non ».
