# 01 : hacher les mots de passe

L'API permet de créer un compte (`POST /register`, corps
`{ email, password }`) et de se connecter (`POST /login`, même corps).

Aujourd'hui, `app.js` range le mot de passe tel quel dans le tableau
`users` et le compare tel quel à la connexion. Qui lit la base lit tous
les mots de passe. Et le message d'erreur de connexion dit si l'email
existe : « Utilisateur inconnu » ou « Mot de passe incorrect ».

## Ce que vous devez obtenir

- le mot de passe est haché avec `bcryptjs` avant d'être stocké (gardez
  le champ `password`, il contiendra désormais le hash) ;
- la connexion compare le mot de passe reçu au hash avec bcrypt ;
- un email inconnu et un mauvais mot de passe donnent la même réponse :
  401 et `{ error: 'Identifiants invalides' }`.

## Au départ : 4 tests rouges sur 8

- `le mot de passe stocké est un hash bcrypt`
- `même mot de passe, hash différents (sel)`
- `email inconnu : 401, Identifiants invalides`
- `mauvais mot de passe : 401, même message`

Les 4 tests fonctionnels passent déjà et doivent rester verts.

```bash
npx jest 01-hachage
```

Indice : `bcrypt.hash(motDePasse, 10)` et
`bcrypt.compare(motDePasse, hash)` renvoient des promesses.
