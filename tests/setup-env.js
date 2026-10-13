process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret';
process.env.ADMIN_ID = process.env.ADMIN_ID || 'testadmin';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'test-admin-pass';
process.env.AUTH_RATE_LIMIT = process.env.AUTH_RATE_LIMIT || '1000';
