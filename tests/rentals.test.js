jest.mock('../config/mailer');
const request = require('supertest');
const app = require('../app');
const db = require('./helpers/db');
const { registerAndLogin } = require('./helpers/auth');
const { sendLoginCode } = require('../config/mailer');
const RentalRequest = require('../models/RentalRequest');
const Review = require('../models/Review');

beforeAll(db.connect);
beforeEach(() => sendLoginCode.mockResolvedValue());
afterEach(async () => { await db.clear(); jest.clearAllMocks(); });
afterAll(db.close);

const bearer = (t) => ({ Authorization: `Bearer ${t}` });

async function setup() {
  const ownerToken = await registerAndLogin(request(app), 'owner@test.com');
  const renterToken = await registerAndLogin(request(app), 'renter@test.com');
  const item = (await request(app).post('/api/items').set(bearer(ownerToken))
    .send({ name: 'Camera', description: 'A camera', dailyPrice: 100 })).body;
  return { ownerToken, renterToken, itemId: item._id };
}

const rent = (token, itemId) => request(app).post(`/rentals/${itemId}`).set(bearer(token));
const setStatus = (token, id, status) =>
  request(app).post(`/rentals/${id}/status`).set(bearer(token)).send({ status });

async function completedRental() {
  const ctx = await setup();
  await rent(ctx.renterToken, ctx.itemId).expect(302);
  const rental = await RentalRequest.findOne({});
  await setStatus(ctx.ownerToken, rental._id, 'accepted').expect(302);
  await setStatus(ctx.ownerToken, rental._id, 'completed').expect(302);
  return { ...ctx, rentalId: rental._id.toString() };
}

describe('rental requests', () => {
  test('cannot rent your own item', async () => {
    const { ownerToken, itemId } = await setup();
    const res = await rent(ownerToken, itemId);
    expect(res.status).toBe(400);
    expect(await RentalRequest.countDocuments()).toBe(0);
  });

  test('duplicate pending request is blocked', async () => {
    const { renterToken, itemId } = await setup();
    await rent(renterToken, itemId).expect(302);
    const res = await rent(renterToken, itemId);
    expect(res.status).toBe(400);
    expect(await RentalRequest.countDocuments()).toBe(1);
  });

  test('cannot request again while a rental is accepted', async () => {
    const { ownerToken, renterToken, itemId } = await setup();
    await rent(renterToken, itemId).expect(302);
    const rental = await RentalRequest.findOne({});
    await setStatus(ownerToken, rental._id, 'accepted').expect(302);
    expect((await rent(renterToken, itemId)).status).toBe(400);
  });
});

describe('status transitions', () => {
  test('pending -> completed is rejected', async () => {
    const { ownerToken, renterToken, itemId } = await setup();
    await rent(renterToken, itemId);
    const rental = await RentalRequest.findOne({});
    const res = await setStatus(ownerToken, rental._id, 'completed');
    expect(res.status).toBe(400);
    expect(res.text).toBe('Cannot change a pending rental to completed.');
  });

  test('pending -> accepted -> completed works', async () => {
    const { ownerToken, renterToken, itemId } = await setup();
    await rent(renterToken, itemId);
    const rental = await RentalRequest.findOne({});
    await setStatus(ownerToken, rental._id, 'accepted').expect(302);
    await setStatus(ownerToken, rental._id, 'completed').expect(302);
    expect((await RentalRequest.findById(rental._id)).status).toBe('completed');
  });

  test('declined -> accepted is rejected', async () => {
    const { ownerToken, renterToken, itemId } = await setup();
    await rent(renterToken, itemId);
    const rental = await RentalRequest.findOne({});
    await setStatus(ownerToken, rental._id, 'declined').expect(302);
    expect((await setStatus(ownerToken, rental._id, 'accepted')).status).toBe(400);
  });

  test('only the owner can change the status', async () => {
    const { renterToken, itemId } = await setup();
    await rent(renterToken, itemId);
    const rental = await RentalRequest.findOne({});
    expect((await setStatus(renterToken, rental._id, 'accepted')).status).toBe(403);
    expect((await RentalRequest.findById(rental._id)).status).toBe('pending');
  });
});

describe('reviews', () => {
  test('review page and post are refused for a non-completed rental', async () => {
    const { renterToken, itemId } = await setup();
    await rent(renterToken, itemId);
    const rental = await RentalRequest.findOne({});
    const page = await request(app).get(`/rentals/${rental._id}/review`).set(bearer(renterToken));
    expect(page.status).toBe(400);
    const post = await request(app).post(`/rentals/${rental._id}/review`).set(bearer(renterToken))
      .send({ rating: 5, comment: 'Great' });
    expect(post.status).toBe(400);
  });

  test('only the renter can review a completed rental', async () => {
    const { ownerToken, renterToken, rentalId } = await completedRental();
    const ownerPage = await request(app).get(`/rentals/${rentalId}/review`).set(bearer(ownerToken));
    expect(ownerPage.status).toBe(403);
    const ownerPost = await request(app).post(`/rentals/${rentalId}/review`).set(bearer(ownerToken))
      .send({ rating: 5, comment: 'Mine' });
    expect(ownerPost.status).toBe(403);

    const page = await request(app).get(`/rentals/${rentalId}/review`).set(bearer(renterToken));
    expect(page.status).toBe(200);
    const post = await request(app).post(`/rentals/${rentalId}/review`).set(bearer(renterToken))
      .send({ rating: 5, comment: 'Great' });
    expect(post.status).toBe(302);
    expect(await Review.countDocuments()).toBe(1);
  });

  test('a second review for the same rental is rejected', async () => {
    const { renterToken, rentalId } = await completedRental();
    const send = () => request(app).post(`/rentals/${rentalId}/review`).set(bearer(renterToken))
      .send({ rating: 4, comment: 'Nice' });
    expect((await send()).status).toBe(302);
    expect((await send()).status).toBe(400);
    expect(await Review.countDocuments()).toBe(1);
  });
});
