const request = require('supertest');
const app = require('../app');
const db = require('./helpers/db');

beforeAll(db.connect);
afterAll(db.close);

describe('error handling', () => {
  test('unknown /api route returns 404 JSON', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.message).toBeDefined();
  });

  test('unknown page returns a 404 HTML page', async () => {
    const res = await request(app).get('/no-such-page');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('404');
  });

  test('a bad ObjectId in /api/items/:id returns 404, not 500', async () => {
    const res = await request(app).get('/api/items/not-an-id');
    expect(res.status).toBe(404);
  });

  test('an unauthenticated browser request is redirected to /login', async () => {
    const res = await request(app).get('/my-rentals').set('Accept', 'text/html');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });
});
