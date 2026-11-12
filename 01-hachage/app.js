// Exercice 01 : hachage des mots de passe
const express = require('express');
const bcrypt = require('bcryptjs');

const cout_bcrypt = 10;

const app = express();
app.use(express.json());

// Base en mémoire : elle se vide à chaque redémarrage
const users = [];

app.post('/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'Email et mot de passe requis' });
  }
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ error: 'Email déjà utilisé' });
  }

  const hash = await bcrypt.hash(password, cout_bcrypt);
  users.push({ id: users.length + 1, email, password: hash });
  res.status(201).json({ message: 'Compte créé' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === email);
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  res.json({ message: 'Connecté' });
});

// users est exporté pour que les tests lisent ce qui est stocké
module.exports = { app, users };
