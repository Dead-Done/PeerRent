/**
 * PeerRent Express application.
 * Builds and exports the app; database connection and listening live in server.js.
 */
const express = require('express');
const helmet = require('helmet');
const multer = require('multer');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const { checkUser } = require('./middleware/auth');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const viewRoutes = require('./routes/viewRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// CSP is disabled until inline scripts and handlers are moved out of the views (see roadmap).
app.use(helmet({ contentSecurityPolicy: false }));

if (isProd) app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method', { methods: ['POST'] }));

// Uploaded item images
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Design assets
const assetsDir = path.join(__dirname, 'imagesrc');
if (fs.existsSync(assetsDir)) {
  app.use('/assets', express.static(assetsDir));
}

app.use(checkUser);

app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/rentals', rentalRoutes);
app.use('/admin', adminRoutes);
app.use('/', viewRoutes);

// 404 handler
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.status(404).render('error', { status: 404, message: 'Page not found.', user: res.locals.user || null });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const isApi = req.originalUrl.startsWith('/api');
  let status = 500;
  let message = 'Something went wrong. Please try again later.';

  if (err instanceof multer.MulterError) {
    status = 400;
    message = `Upload error: ${err.message}`;
  } else if (err && err.message === 'Unsupported file type') {
    status = 400;
    message = 'Unsupported file type. Please upload JPEG, PNG, GIF or WebP images.';
  } else if (err && err.name === 'CastError') {
    status = 404;
    message = 'Not found.';
  } else {
    console.error('Unhandled error:', err);
  }

  if (isApi) return res.status(status).json({ message });
  res.status(status).render('error', { status, message, user: res.locals.user || null });
});

module.exports = app;
