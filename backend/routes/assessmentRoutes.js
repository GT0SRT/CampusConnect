// backend/routes/assessmentRoutes.js

const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini (new API)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post("/generate", async (req, res) => {
  try {
    const { text, count } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const prompt = `
Generate ${count} MCQ questions from the following text:

"${text}"

Return ONLY JSON like:
[
  {
    "question": "",
    "options": ["","","",""],
    "answer": ""
  }
]
`;

    // New v1 API call
    const result = await model.generateContent(prompt);
    let output = result.response.text().trim();

    // Cleanup any markdown
    output = output.replace(/```json/g, "").replace(/```/g, "");

    const start = output.indexOf("[");
    const end = output.lastIndexOf("]") + 1;

    const jsonText = output.substring(start, end);
    const parsed = JSON.parse(jsonText);

    return res.json({ questions: parsed });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Generation failed", details: error.message });
  }
});

module.exports = router;