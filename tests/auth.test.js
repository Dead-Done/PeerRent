jest.mock('../config/mailer');
const request = require('supertest');
const app = require('../app');
const db = require('./helpers/db');
const User = require('../models/User');
const { sendLoginCode } = require('../config/mailer');

beforeAll(db.connect);
beforeEach(() => sendLoginCode.mockResolvedValue());
afterEach(async () => { await db.clear(); jest.clearAllMocks(); });
afterAll(db.close);

const register = (email = 'a@test.com', secretPin = '1234') =>
  request(app).post('/api/users/register').send({ email, secretPin });

async function requestCode(email = 'a@test.com') {
  await request(app).post('/api/users/login/request-code').send({ email }).expect(200);
  const calls = sendLoginCode.mock.calls;
  return calls[calls.length - 1][1];
}

const verify = (email, fullOtp) =>
  request(app).post('/api/users/login/verify-otp').send({ email, fullOtp });

describe('register', () => {
  test('rejects a PIN that is not 4 digits', async () => {
    expect((await register('a@test.com', '12')).status).toBe(400);
    expect((await register('a@test.com', 'abcd')).status).toBe(400);
    expect((await register('a@test.com', '12345')).status).toBe(400);
  });

  test('succeeds with a valid PIN', async () => {
    expect((await register()).status).toBe(201);
  });

  test('rejects a duplicate email', async () => {
    await register();
    const res = await register();
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  test('stores the email lowercase and treats case variants as duplicates', async () => {
    await register('Mixed@Test.com');
    const user = await User.findOne({});
    expect(user.email).toBe('mixed@test.com');
    expect((await register('MIXED@test.com')).status).toBe(400);
  });
});

describe('request-code', () => {
  test('known and unknown emails get the same status and body; mail only for known', async () => {
    await register();
    const known = await request(app).post('/api/users/login/request-code').send({ email: 'a@test.com' });
    const unknown = await request(app).post('/api/users/login/request-code').send({ email: 'nobody@test.com' });
    expect(known.status).toBe(200);
    expect(unknown.status).toBe(known.status);
    expect(unknown.body.message).toBe(known.body.message);
    expect(Object.keys(unknown.body).sort()).toEqual(Object.keys(known.body).sort());
    expect(sendLoginCode).toHaveBeenCalledTimes(1);
    expect(sendLoginCode.mock.calls[0][0]).toBe('a@test.com');
  });

  test('stores a hash, not the plain code', async () => {
    await register();
    const code = await requestCode();
    const user = await User.findOne({ email: 'a@test.com' });
    expect(user.otpHash).toBeDefined();
    expect(user.otpHash).not.toBe(code);
    expect(user.otpHash).toMatch(/^\$2[aby]\$/);
  });

  test('returns 503 when the mail cannot be sent', async () => {
    await register();
    sendLoginCode.mockRejectedValueOnce(new Error('smtp down'));
    const res = await request(app).post('/api/users/login/request-code').send({ email: 'a@test.com' });
    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/Could not send login code/);
  });
});

describe('verify-otp', () => {
  test('correct PIN + code returns a token and clears the code', async () => {
    await register();
    const code = await requestCode();
    const res = await verify('a@test.com', '1234' + code);
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    const user = await User.findOne({ email: 'a@test.com' });
    expect(user.otpHash).toBeUndefined();
  });

  test('form login sets an HttpOnly, SameSite=Lax cookie and redirects', async () => {
    await register();
    const code = await requestCode();
    const res = await request(app)
      .post('/api/users/login/verify-otp')
      .type('form')
      .send({ email: 'a@test.com', fullOtp: '1234' + code });
    expect(res.status).toBe(302);
    const cookie = res.headers['set-cookie'].find((c) => c.startsWith('token='));
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  test('wrong PIN and wrong code return the identical generic message', async () => {
    await register();
    const code = await requestCode();
    const otherCode = code === '1000' ? '1001' : '1000';
    const wrongPin = await verify('a@test.com', '9999' + code);
    const wrongOtp = await verify('a@test.com', '1234' + otherCode);
    const unknown = await verify('nobody@test.com', '12345678');
    expect(wrongPin.status).toBe(400);
    expect(wrongPin.body.message).toBe('Invalid email, PIN or code.');
    expect(wrongOtp.status).toBe(wrongPin.status);
    expect(wrongOtp.body.message).toBe(wrongPin.body.message);
    expect(unknown.body.message).toBe(wrongPin.body.message);
  });

  test('five wrong attempts invalidate the code even for the correct key', async () => {
    await register();
    const code = await requestCode();
    let last;
    for (let i = 0; i < 5; i++) last = await verify('a@test.com', '9999' + code);
    expect(last.body.message).toBe('Too many attempts. Request a new code.');
    const res = await verify('a@test.com', '1234' + code);
    expect(res.status).toBe(400);
    expect(res.body.token).toBeUndefined();
  });

  test('an expired code fails', async () => {
    await register();
    const code = await requestCode();
    await User.updateOne({ email: 'a@test.com' }, { otpExpires: new Date(Date.now() - 1000) });
    const res = await verify('a@test.com', '1234' + code);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid email, PIN or code.');
  });

  test('a code cannot be reused after a successful login', async () => {
    await register();
    const code = await requestCode();
    expect((await verify('a@test.com', '1234' + code)).status).toBe(200);
    expect((await verify('a@test.com', '1234' + code)).status).toBe(400);
  });
});
