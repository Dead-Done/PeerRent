const request = require('supertest');
const app = require('../app');
const db = require('./helpers/db');

beforeAll(db.connect);
afterAll(db.close);

const login = (agent, id, password) =>
  agent.post('/admin/login').type('form').send({ adminId: id, adminPassword: password });

describe('admin', () => {
  test('wrong credentials redirect back with an error', async () => {
    const res = await login(request(app), 'testadmin', 'nope');
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^\/admin\?error=/);
  });

  test('the old hardcoded credentials no longer work', async () => {
    const res = await login(request(app), 'admin123', 'adminpass456');
    expect(res.headers.location).toMatch(/^\/admin\?error=/);
  });

  test('protected admin routes redirect to /admin without a session', async () => {
    for (const path of ['/admin/dashboard', '/admin/users', '/admin/items', '/admin/rentals']) {
      const res = await request(app).get(path);
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/admin');
    }
    const del = await request(app).post('/admin/items/abc/delete');
    expect(del.status).toBe(302);
    expect(del.headers.location).toBe('/admin');
  });

  test('correct credentials open the dashboard via the session cookie, and logout ends it', async () => {
    const agent = request.agent(app);
    const res = await login(agent, 'testadmin', 'test-admin-pass');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/dashboard');

    expect((await agent.get('/admin/dashboard')).status).toBe(200);
    expect((await agent.get('/admin/items')).status).toBe(200);

    const out = await agent.post('/admin/logout');
    expect(out.status).toBe(302);
    expect(out.headers.location).toBe('/admin');

    const after = await agent.get('/admin/dashboard');
    expect(after.status).toBe(302);
    expect(after.headers.location).toBe('/admin');
  });
});
