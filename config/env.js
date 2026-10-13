const REQUIRED = ['MONGODB_URI', 'JWT_SECRET', 'SESSION_SECRET', 'ADMIN_ID', 'ADMIN_PASSWORD'];

function validateEnv(env = process.env) {
  const missing = REQUIRED.filter((k) => !env[k]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill them in.`);
  }
}

module.exports = { validateEnv, REQUIRED };
