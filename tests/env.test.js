const { validateEnv, REQUIRED } = require('../config/env');

describe('validateEnv', () => {
  test('throws and lists all required names when env is empty', () => {
    expect(REQUIRED).toHaveLength(5);
    let message = '';
    try { validateEnv({}); } catch (e) { message = e.message; }
    expect(message).toMatch(/Missing required environment variables/);
    REQUIRED.forEach((name) => expect(message).toContain(name));
  });

  test('does not throw with a full env', () => {
    const env = Object.fromEntries(REQUIRED.map((k) => [k, 'x']));
    expect(() => validateEnv(env)).not.toThrow();
  });
});
