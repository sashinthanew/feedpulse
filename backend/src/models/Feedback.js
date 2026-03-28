const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 120,
    trim: true
  },
  description: {
    type: String,
    required: true,
    minlength: 20
  },
  category: {
    type: String,
    enum: ['Bug', 'Feature Request', 'Improvement', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['New', 'In Review', 'Resolved'],
    default: 'New'
  },
  submitterName: { type: String, default: '' },
  submitterEmail: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    default: ''
  },
  // AI Fields
  ai_category: { type: String, default: '' },
  ai_sentiment: {
    type: String,
    enum: ['Positive', 'Neutral', 'Negative', ''],
    default: ''
  },
  ai_priority: { type: Number, min: 1, max: 10, default: null },
  ai_summary: { type: String, default: '' },
  ai_tags: { type: [String], default: [] },
  ai_processed: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for performance
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ ai_priority: -1 });
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);