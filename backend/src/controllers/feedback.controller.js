const Feedback = require('../models/Feedback');
const { analyaseFeedback } = require('../services/gemini.service');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// POST /api/feedback
const createFeedback = async (req, res) => {
  try {
    const { title, description, category, submitterName, submitterEmail } = req.body;

    const feedback = await Feedback.create({
      title, description, category, submitterName, submitterEmail
    });

    analyaseFeedback(title, description).then(async (aiResult) => {
      if (aiResult) {
        await Feedback.findByIdAndUpdate(feedback._id, {
          ai_category: aiResult.category,
          ai_sentiment: aiResult.sentiment,
          ai_priority: aiResult.priority_score,
          ai_summary: aiResult.summary,
          ai_tags: aiResult.tags,
          ai_processed: true
        });
      }
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully!',
      data: feedback
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// GET /api/feedback
const getAllFeedback = async (req, res) => {
  try {
    const { category, status, page = 1, limit = 10, sort = '-createdAt', search } = req.query;

    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ai_summary: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Feedback.countDocuments(query);
    const feedbacks = await Feedback.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: feedbacks,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/feedback/:id
const updateFeedbackStatus = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ success: false, error: 'Not found' });

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// DELETE /api/feedback/:id
const deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/feedback/summary — AI Weekly Summary (2.5)
const getWeeklySummary = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentFeedbacks = await Feedback.find({
      createdAt: { $gte: sevenDaysAgo },
      ai_processed: true
    }).select('title ai_summary ai_tags ai_sentiment ai_priority');

    if (recentFeedbacks.length === 0) {
      return res.json({
        success: true,
        data: { summary: 'No feedback received in the last 7 days.' }
      });
    }

    // Build prompt from recent feedbacks
    const feedbackList = recentFeedbacks.map((f, i) =>
      `${i + 1}. Title: "${f.title}" | Summary: "${f.ai_summary}" | Tags: ${f.ai_tags?.join(', ')} | Sentiment: ${f.ai_sentiment} | Priority: ${f.ai_priority}`
    ).join('\n');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      You are a product manager assistant. Analyse these ${recentFeedbacks.length} feedback items from the last 7 days and return ONLY valid JSON.

      Feedback items:
      ${feedbackList}

      Return this exact JSON:
      {
        "top_themes": [
          { "theme": "Theme name", "description": "Brief explanation", "count": 3 },
          { "theme": "Theme name", "description": "Brief explanation", "count": 2 },
          { "theme": "Theme name", "description": "Brief explanation", "count": 1 }
        ],
        "overall_sentiment": "Mostly Positive | Mixed | Mostly Negative",
        "recommendation": "One actionable sentence for the product team"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch[0]);

    res.json({
      success: true,
      data: {
        period: '7 days',
        total_analysed: recentFeedbacks.length,
        ...parsed
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate summary: ' + error.message });
  }
};

// POST /api/feedback/:id/retrigger — Re-trigger AI (2.6)
const retriggerAI = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, error: 'Not found' });

    const aiResult = await analyaseFeedback(feedback.title, feedback.description);

    if (!aiResult) {
      return res.status(500).json({ success: false, error: 'Gemini AI failed. Try again.' });
    }

    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        ai_category: aiResult.category,
        ai_sentiment: aiResult.sentiment,
        ai_priority: aiResult.priority_score,
        ai_summary: aiResult.summary,
        ai_tags: aiResult.tags,
        ai_processed: true
      },
      { new: true }
    );

    res.json({ success: true, message: 'AI analysis updated!', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  getWeeklySummary,
  retriggerAI
};