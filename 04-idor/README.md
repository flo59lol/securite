# 04 : ne pas lire les tâches des autres (IDOR)

Deux nouvelles routes : `GET /tasks/:id` lit une tâche, `PUT /tasks/:id`
change son titre (corps `{ title }`).

Aujourd'hui, elles cherchent la tâche par son id, et c'est tout. Alice,
connectée, lit et modifie la tâche 3 de bob en changeant simplement le
numéro dans l'URL. C'est une IDOR (Insecure Direct Object Reference) :
être connecté ne veut pas dire avoir droit à cet objet-là.

## Ce que vous devez obtenir

- un utilisateur ne lit et ne modifie que ses propres tâches ;
- l'admin peut lire toutes les tâches ;
- la tâche d'un autre donne 404, comme une tâche qui n'existe pas : un
  403 révélerait qu'elle existe.

## Au départ : 2 tests rouges sur 7

- `alice ne lit pas la tâche de bob : 404`
- `alice ne modifie pas la tâche de bob`

Les 5 tests fonctionnels passent déjà et doivent rester verts, dont
`l'admin lit la tâche de bob : 200` : attention à ne pas bloquer
l'admin en corrigeant.

```bash
npx jest 04-idor
```
