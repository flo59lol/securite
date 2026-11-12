// Exercice 01 : hachage des mots de passe
const express = require('express');

const app = express();
app.use(express.json());

// Base en mémoire : elle se vide à chaque redémarrage
const users = [];

app.post('/register', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'Email et mot de passe requis' });
  }
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ error: 'Email déjà utilisé' });
  }

  users.push({ id: users.length + 1, email, password });
  res.status(201).json({ message: 'Compte créé' });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Utilisateur inconnu' });
  }
  if (user.password !== password) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }

  res.json({ message: 'Connecté' });
});

// users est exporté pour que les tests lisent ce qui est stocké
module.exports = { app, users };
