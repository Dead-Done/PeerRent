jest.mock('../config/mailer');
const request = require('supertest');
const app = require('../app');
const db = require('./helpers/db');
const { registerAndLogin } = require('./helpers/auth');
const { sendLoginCode } = require('../config/mailer');
const Item = require('../models/Item');
const RentalRequest = require('../models/RentalRequest');

beforeAll(db.connect);
beforeEach(() => sendLoginCode.mockResolvedValue());
afterEach(async () => { await db.clear(); jest.clearAllMocks(); });
afterAll(db.close);

const bearer = (t) => ({ Authorization: `Bearer ${t}` });
const newItem = (token, overrides = {}) =>
  request(app).post('/api/items').set(bearer(token))
    .send({ name: 'Camera', description: 'A good camera', dailyPrice: 100, ...overrides });

describe('items', () => {
  test('creating an item requires auth (401 JSON for API)', async () => {
    const res = await request(app).post('/api/items').send({ name: 'x', description: 'y', dailyPrice: 1 });
    expect(res.status).toBe(401);
    expect(res.body.message).toBeDefined();
  });

  test('owner can create, update and delete', async () => {
    const token = await registerAndLogin(request(app), 'owner@test.com');
    const created = await newItem(token);
    expect(created.status).toBe(201);
    const id = created.body._id;

    const updated = await request(app).put(`/api/items/${id}`).set(bearer(token))
      .send({ name: 'Camera 2', description: 'Better', dailyPrice: 120 });
    expect(updated.status).toBe(200);
    expect(updated.body.name).toBe('Camera 2');

    const deleted = await request(app).delete(`/api/items/${id}`).set(bearer(token));
    expect(deleted.status).toBe(200);
    expect(await Item.findById(id)).toBeNull();
  });

  test('a non-owner gets 403 on update and delete', async () => {
    const ownerToken = await registerAndLogin(request(app), 'owner@test.com');
    const otherToken = await registerAndLogin(request(app), 'other@test.com');
    const id = (await newItem(ownerToken)).body._id;

    const put = await request(app).put(`/api/items/${id}`).set(bearer(otherToken))
      .send({ name: 'Hacked', description: 'x', dailyPrice: 1 });
    expect(put.status).toBe(403);
    const del = await request(app).delete(`/api/items/${id}`).set(bearer(otherToken));
    expect(del.status).toBe(403);
    expect(await Item.findById(id)).not.toBeNull();
  });

  test('update rejects a negative price', async () => {
    const token = await registerAndLogin(request(app), 'owner@test.com');
    const id = (await newItem(token)).body._id;
    const res = await request(app).put(`/api/items/${id}`).set(bearer(token))
      .send({ name: 'Camera', description: 'x', dailyPrice: -5 });
    expect(res.status).toBe(400);
  });

  test('search treats regex characters literally', async () => {
    const token = await registerAndLogin(request(app), 'owner@test.com');
    await newItem(token, { name: 'Lens (a+) kit' });
    await newItem(token, { name: 'Tripod' });

    const evil = await request(app).get('/marketplace').query({ search: '(a+)+$' });
    expect(evil.status).toBe(200);

    const literal = await request(app).get('/marketplace').query({ search: '(a+)' });
    expect(literal.status).toBe(200);
    expect(literal.text).toContain('Lens (a+) kit');
    expect(literal.text).not.toContain('Tripod');
  });

  test('search also matches the description', async () => {
    const token = await registerAndLogin(request(app), 'owner@test.com');
    await newItem(token, { name: 'Gadget', description: 'waterproof housing' });
    const res = await request(app).get('/marketplace').query({ search: 'WATERPROOF' });
    expect(res.text).toContain('Gadget');
  });

  test('deleting an item declines its pending rentals', async () => {
    const ownerToken = await registerAndLogin(request(app), 'owner@test.com');
    const renterToken = await registerAndLogin(request(app), 'renter@test.com');
    const id = (await newItem(ownerToken)).body._id;
    await request(app).post(`/rentals/${id}`).set(bearer(renterToken)).expect(302);

    await request(app).delete(`/api/items/${id}`).set(bearer(ownerToken)).expect(200);
    const rental = await RentalRequest.findOne({});
    expect(rental.status).toBe('declined');
  });

  test('deleting an item with an accepted rental is refused', async () => {
    const ownerToken = await registerAndLogin(request(app), 'owner@test.com');
    const renterToken = await registerAndLogin(request(app), 'renter@test.com');
    const id = (await newItem(ownerToken)).body._id;
    await request(app).post(`/rentals/${id}`).set(bearer(renterToken)).expect(302);
    const rental = await RentalRequest.findOne({});
    await request(app).post(`/rentals/${rental._id}/status`).set(bearer(ownerToken))
      .send({ status: 'accepted' }).expect(302);

    const res = await request(app).delete(`/api/items/${id}`).set(bearer(ownerToken));
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('This item has an active rental.');
    expect(await Item.findById(id)).not.toBeNull();
  });
});
