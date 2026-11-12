const request = require('supertest');
const { app, users } = require('./app');

const compte = { email: 'alice@ilaria.test', password: 'alice123' };

// Chaque test repart d'une base vide
beforeEach(() => {
  users.length = 0;
});

describe('Fonctionnel', () => {
  test('inscription : 201', async () => {
    const res = await request(app).post('/register').send(compte);
    expect(res.status).toBe(201);
  });

  test('inscription sans mot de passe : 400', async () => {
    const res = await request(app)
      .post('/register')
      .send({ email: compte.email });
    expect(res.status).toBe(400);
  });

  test('inscription en double : 409', async () => {
    await request(app).post('/register').send(compte);
    const res = await request(app).post('/register').send(compte);
    expect(res.status).toBe(409);
  });

  test('connexion avec les bons identifiants : 200', async () => {
    await request(app).post('/register').send(compte);
    const res = await request(app).post('/login').send(compte);
    expect(res.status).toBe(200);
  });
});

describe('Sécurité', () => {
  test('le mot de passe stocké est un hash bcrypt', async () => {
    await request(app).post('/register').send(compte);
    const stocke = users[0].password;
    expect(stocke).not.toBe(compte.password);
    expect(stocke.startsWith('$2')).toBe(true);
  });

  test('même mot de passe, hash différents (sel)', async () => {
    await request(app).post('/register').send(compte);
    await request(app)
      .post('/register')
      .send({ email: 'bob@ilaria.test', password: 'alice123' });
    expect(users[0].password).not.toBe(users[1].password);
  });

  // Les deux erreurs doivent être identiques : sinon un attaquant
  // apprend quels emails ont un compte (énumération)
  test('email inconnu : 401, Identifiants invalides', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'inconnu@ilaria.test', password: 'x' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Identifiants invalides');
  });

  test('mauvais mot de passe : 401, même message', async () => {
    await request(app).post('/register').send(compte);
    const res = await request(app)
      .post('/login')
      .send({ email: compte.email, password: 'mauvais' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Identifiants invalides');
  });
});
