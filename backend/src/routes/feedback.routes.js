const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  createFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  getWeeklySummary,
  retriggerAI
} = require('../controllers/feedback.controller');
const { protect } = require('../middleware/auth.middleware');

// Rate limiter for submissions
const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many submissions. Try again after 1 hour.' }
});

router.post('/', feedbackLimiter, createFeedback);
router.get('/', protect, getAllFeedback);
router.get('/summary', protect, getWeeklySummary);          // AI weekly summary
router.post('/:id/retrigger', protect, retriggerAI);        // Re-trigger AI
router.patch('/:id', protect, updateFeedbackStatus);
router.delete('/:id', protect, deleteFeedback);

module.exports = router;