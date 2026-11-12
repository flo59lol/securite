// Exercice 03 : contrôle des rôles
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Clé de signature des jetons. En dur pour l'instant :
// la session 4 la sortira du code (variable d'environnement).
const JWT_SECRET = 'cle-de-dev-ilaria-a-ne-pas-garder';

const app = express();
app.use(express.json());

// Comptes pré-enregistrés (password contient le hash bcrypt)
const users = [
  {
    id: 1,
    email: 'alice@ilaria.test',
    role: 'user',
    // mot de passe : alice123
    password:
      '$2b$10$geEr9Zc64xkKj1wxt/.FMu5rpcLHsElh48JvjYn.O8e4mxBo3r2hm',
  },
  {
    id: 2,
    email: 'bob@ilaria.test',
    role: 'user',
    // mot de passe : bob123
    password:
      '$2b$10$qCP71I9K9mxSa/g.7XhZ1uc5gZFDesJfnQhIPj22Asv7RxnDpCESa',
  },
  {
    id: 3,
    email: 'admin@ilaria.test',
    role: 'admin',
    // mot de passe : admin123
    password:
      '$2b$10$XXXs/Zn9D/o6MXf8LJQmGuJ1MNYngoPfNzP.vkD3.kktznBcKpr3.',
  },
];

const tasks = [
  { id: 1, ownerId: 1, title: 'Réviser le hachage' },
  { id: 2, ownerId: 1, title: 'Lire la RFC 7519' },
  { id: 3, ownerId: 2, title: 'Écrire les tests' },
  { id: 4, ownerId: 3, title: 'Préparer la démo' },
];

// Vérifie le jeton et range l'utilisateur dans req.user
function authentifier(req, res, next) {
  const entete = req.headers.authorization || '';
  const [type, token] = entete.split(' ');
  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Jeton manquant' });
  }
  try {
    // verify contrôle signature et expiration ;
    // algorithms refuse tout autre algorithme que HS256
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    req.user = { id: Number(payload.sub), role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Jeton invalide' });
  }
}

function exigerRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
}

app.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === email);
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }
  // sub est une chaîne dans la norme JWT
  const token = jwt.sign(
    { sub: String(user.id), role: user.role },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '15m' }
  );
  res.json({ token });
});

app.get('/tasks', authentifier, (req, res) => {
  res.json(tasks.filter((t) => t.ownerId === req.user.id));
});

// Réservé à l'admin : la liste des comptes
app.get('/admin/users', authentifier, exigerRole('admin'), (_req, res) => {
  res.json(
    users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
    }))
  );
});

// Réservé à l'admin : supprimer une tâche
app.delete('/tasks/:id', authentifier, exigerRole('admin'), (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Tâche introuvable' });
  }
  tasks.splice(index, 1);
  res.status(204).end();
});

module.exports = { app, users, tasks, JWT_SECRET };
