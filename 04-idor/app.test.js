const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app, tasks, JWT_SECRET } = require('./app');

// Fabrique un jeton valide, sans passer par /login
function jeton(id, role) {
  return jwt.sign({ sub: String(id), role }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '15m',
  });
}
const alice = `Bearer ${jeton(1, 'user')}`;
const admin = `Bearer ${jeton(3, 'admin')}`;

// Tâche 1 : à alice. Tâche 3 : à bob.
const tachesDeDepart = tasks.map((t) => ({ ...t }));
beforeEach(() => {
  const copie = tachesDeDepart.map((t) => ({ ...t }));
  tasks.splice(0, tasks.length, ...copie);
});

describe('Fonctionnel', () => {
  test('GET /tasks/1 sans jeton : 401', async () => {
    const res = await request(app).get('/tasks/1');
    expect(res.status).toBe(401);
  });

  test('alice lit sa tâche : 200', async () => {
    const res = await request(app)
      .get('/tasks/1')
      .set('Authorization', alice);
    expect(res.status).toBe(200);
    expect(res.body.ownerId).toBe(1);
  });

  test('alice modifie sa tâche : 200', async () => {
    const res = await request(app)
      .put('/tasks/1')
      .set('Authorization', alice)
      .send({ title: 'Nouveau titre' });
    expect(res.status).toBe(200);
    expect(tasks.find((t) => t.id === 1).title).toBe('Nouveau titre');
  });

  test('tâche inexistante : 404', async () => {
    const res = await request(app)
      .get('/tasks/999')
      .set('Authorization', alice);
    expect(res.status).toBe(404);
  });

  test('l\'admin lit la tâche de bob : 200', async () => {
    const res = await request(app)
      .get('/tasks/3')
      .set('Authorization', admin);
    expect(res.status).toBe(200);
    expect(res.body.ownerId).toBe(2);
  });
});

describe('Sécurité', () => {
  // 404 et non 403 : un 403 dirait à alice que la tâche 3 existe
  test('alice ne lit pas la tâche de bob : 404', async () => {
    const res = await request(app)
      .get('/tasks/3')
      .set('Authorization', alice);
    expect(res.status).toBe(404);
  });

  test('alice ne modifie pas la tâche de bob', async () => {
    const res = await request(app)
      .put('/tasks/3')
      .set('Authorization', alice)
      .send({ title: 'Piraté' });
    expect(res.status).toBe(404);
    const tacheDeBob = tasks.find((t) => t.id === 3);
    expect(tacheDeBob.title).toBe('Écrire les tests');
  });
});
