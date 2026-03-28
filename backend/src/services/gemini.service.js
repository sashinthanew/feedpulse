const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyaseFeedback = async (title, description) => {
  try {
    console.log('🤖 Gemini called for:', title); // ← add this

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Analyse this product feedback. Return ONLY valid JSON with no extra text.
      
      Title: "${title}"
      Description: "${description}"
      
      Return this exact JSON structure:
      {
        "category": "Bug | Feature Request | Improvement | Other",
        "sentiment": "Positive | Neutral | Negative",
        "priority_score": <number 1-10>,
        "summary": "<one sentence summary>",
        "tags": ["tag1", "tag2", "tag3"]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log('🤖 Gemini raw response:', text); // ← add this

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const parsed = JSON.parse(jsonMatch[0]);
    console.log('✅ Gemini parsed:', parsed); // ← add this

    return parsed;
  } catch (error) {
    console.error('❌ Gemini Error:', error.message); // ← already there
    return null;
  }
};

module.exports = { analyaseFeedback };