const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app, JWT_SECRET } = require('./app');

async function connecter(email, password) {
  const res = await request(app)
    .post('/login')
    .send({ email, password });
  return res.body.token;
}

// Encode un objet en base64url, comme dans un vrai JWT
function b64(objet) {
  return Buffer.from(JSON.stringify(objet)).toString('base64url');
}

describe('Fonctionnel', () => {
  test('connexion avec les bons identifiants : 200', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'alice@ilaria.test', password: 'alice123' });
    expect(res.status).toBe(200);
  });

  test('mauvais mot de passe : 401', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'alice@ilaria.test', password: 'faux' });
    expect(res.status).toBe(401);
  });
});

describe('Sécurité : le jeton émis', () => {
  test('la connexion renvoie un jeton', async () => {
    const token = await connecter('alice@ilaria.test', 'alice123');
    expect(typeof token).toBe('string');
  });

  test('le jeton porte sub, role, exp (15 min)', async () => {
    const token = await connecter('alice@ilaria.test', 'alice123');
    const decode = jwt.decode(token, { complete: true });
    expect(decode.header.alg).toBe('HS256');
    expect(decode.payload.sub).toBe('1');
    expect(decode.payload.role).toBe('user');
    expect(decode.payload.exp - decode.payload.iat).toBe(900);
  });
});

describe('Sécurité : GET /tasks', () => {
  test('sans jeton : 401', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(401);
  });

  test('jeton signé par une autre clé : 401', async () => {
    const faux = jwt.sign({ sub: '1', role: 'user' }, 'autre-cle', {
      expiresIn: '15m',
    });
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${faux}`);
    expect(res.status).toBe(401);
  });

  test('jeton expiré : 401', async () => {
    const passe = Math.floor(Date.now() / 1000) - 60;
    const expire = jwt.sign(
      { sub: '1', role: 'user', exp: passe },
      JWT_SECRET
    );
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${expire}`);
    expect(res.status).toBe(401);
  });

  // alg none : le jeton se déclare non signé, sans signature
  test('jeton alg none non signé : 401', async () => {
    const entete = b64({ alg: 'none', typ: 'JWT' });
    const charge = b64({ sub: '1', role: 'admin' });
    const nonSigne = `${entete}.${charge}.`;
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${nonSigne}`);
    expect(res.status).toBe(401);
  });

  // Bonne clé, mais HS512 : c'est le serveur qui impose
  // l'algorithme, pas le jeton
  test('jeton HS512 au lieu de HS256 : 401', async () => {
    const autreAlg = jwt.sign({ sub: '1', role: 'user' }, JWT_SECRET, {
      algorithm: 'HS512',
      expiresIn: '15m',
    });
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${autreAlg}`);
    expect(res.status).toBe(401);
  });

  test('bon jeton : 200, seulement ses tâches', async () => {
    const token = await connecter('alice@ilaria.test', 'alice123');
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.every((t) => t.ownerId === 1)).toBe(true);
  });
});
