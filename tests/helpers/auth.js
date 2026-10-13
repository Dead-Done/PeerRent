const { sendLoginCode } = require('../../config/mailer');

// Requires the test file to call jest.mock('../config/mailer')
async function registerAndLogin(agent, email, pin = '1234') {
  await agent.post('/api/users/register').send({ email, secretPin: pin }).expect(201);
  await agent.post('/api/users/login/request-code').send({ email }).expect(200);
  const calls = sendLoginCode.mock.calls.filter((c) => c[0] === email.toLowerCase());
  const code = calls[calls.length - 1][1];
  const res = await agent
    .post('/api/users/login/verify-otp')
    .send({ email, fullOtp: pin + code })
    .expect(200);
  return res.body.token;
}

module.exports = { registerAndLogin };
