require('dotenv').config();
const keys = require('./config/keys');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');
const postRoutes = require('./routes/post');

const app = express();
const PORT = keys.PORT || 5002;
let mongoConnectionPromise = null;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5002',
  'https://my-blog-liard-nine-52.vercel.app',
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (allowedOrigins.includes(origin)) return true;
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── MongoDB ───────────────────────────────────────────────────────────────────
const ensureDbConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!mongoConnectionPromise) {
    mongoose.set('strictQuery', false);
    mongoConnectionPromise = mongoose
      .connect(keys.MONGO_URI)
      .then(() => {
        console.log('MongoDB connected');
      })
      .catch((err) => {
        mongoConnectionPromise = null;
        throw err;
      });
  }

  await mongoConnectionPromise;
};

// ── Middleware ────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(async (req, res, next) => {
  try {
    await ensureDbConnection();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err?.message || err);
    return res.status(503).json({ message: 'Database connection unavailable. Please retry.' });
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use(fileUpload({ useTempFiles: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/', userRoutes);
app.use('/', uploadRoutes);
app.use('/', postRoutes);

// ── Start ─────────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
