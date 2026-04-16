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

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [keys.BACKEND_URL, keys.FRONTEND_URL],
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
}));

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose.set('strictQuery', false);
mongoose
  .connect(keys.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
