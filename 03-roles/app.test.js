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

// Chaque test repart des tâches de départ
const tachesDeDepart = tasks.map((t) => ({ ...t }));
beforeEach(() => {
  const copie = tachesDeDepart.map((t) => ({ ...t }));
  tasks.splice(0, tasks.length, ...copie);
});

describe('Fonctionnel', () => {
  test('GET /admin/users sans jeton : 401', async () => {
    const res = await request(app).get('/admin/users');
    expect(res.status).toBe(401);
  });

  test('DELETE /tasks/3 sans jeton : 401', async () => {
    const res = await request(app).delete('/tasks/3');
    expect(res.status).toBe(401);
  });

  test('GET /admin/users en admin : 200', async () => {
    const res = await request(app)
      .get('/admin/users')
      .set('Authorization', admin);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].email).toBe('alice@ilaria.test');
  });

  test('DELETE /tasks/3 en admin : 204', async () => {
    const res = await request(app)
      .delete('/tasks/3')
      .set('Authorization', admin);
    expect(res.status).toBe(204);
    expect(tasks.find((t) => t.id === 3)).toBeUndefined();
  });

  test('DELETE d\'une tâche inexistante en admin : 404', async () => {
    const res = await request(app)
      .delete('/tasks/999')
      .set('Authorization', admin);
    expect(res.status).toBe(404);
  });
});

describe('Sécurité', () => {
  test('GET /admin/users avec un jeton user : 403', async () => {
    const res = await request(app)
      .get('/admin/users')
      .set('Authorization', alice);
    expect(res.status).toBe(403);
  });

  test('DELETE /tasks/3 avec un jeton user : 403', async () => {
    const res = await request(app)
      .delete('/tasks/3')
      .set('Authorization', alice);
    expect(res.status).toBe(403);
    expect(tasks.find((t) => t.id === 3)).toBeDefined();
  });

  test('GET /admin/users ne renvoie aucun hash', async () => {
    const res = await request(app)
      .get('/admin/users')
      .set('Authorization', admin);
    for (const u of res.body) {
      expect(u).not.toHaveProperty('password');
      expect(u).not.toHaveProperty('hash');
    }
    // Filet : aucune trace d'un hash bcrypt dans la réponse
    expect(JSON.stringify(res.body)).not.toContain('$2');
  });
});
