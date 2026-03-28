const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const feedbackRoutes = require('./routes/feedback.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Rate limiter — 5 submissions per hour per IP
const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    error: 'Too many submissions. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Apply rate limiter ONLY to POST /api/feedback
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'FeedPulse API running' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' MongoDB Connected'))
  .catch(err => console.error(' MongoDB Error:', err));

app.listen(process.env.PORT, () => {
  console.log(` Backend running on port ${process.env.PORT}`);
});