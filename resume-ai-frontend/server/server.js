// server/server.js
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai").default; // CommonJS requires .default
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// API route for OpenAI analysis
app.post("/api/openai-analysis", async (req, res) => {
  console.log("OpenAI request received:", req.body);

  try {
    const { matched = [], missing = [] } = req.body;

    if (!matched.length && !missing.length) {
      console.log("No skills provided for analysis");
      return res.status(400).json({ error: "No skills provided for analysis" });
    }

    const userPrompt = `
      You are analyzing a resume.

      Matched skills: ${JSON.stringify(matched)}
      Missing skills: ${JSON.stringify(missing)}

      Respond ONLY in valid JSON format with the following structure:
      {
        "insight": "A clear, justified paragraph summary of the candidate’s strengths and gaps.",
        "recommendations": [
          "Recommendation 1 in clear English",
          "Recommendation 2",
          "Recommendation 3"
        ],
        "grouped": {
          "Critical": ["Skill with 1–2 lines of context why it’s critical"],
          "Important": ["Skill with 1–2 lines of context why it’s important"],
          "Nice-to-Have": ["Skill with 1–2 lines of context why it’s beneficial but not required"]
        }
      }

      Rules:
      - Always fill all three categories, even if one is empty.
      - Each skill should have a short description, not just the name.
      - Keep descriptions concise but informative.
    `;

    console.log("Sending request to OpenAI...");

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.7,
    });

    console.log("OpenAI response raw:", completion.choices?.[0]?.message?.content);

    let parsed = {};
    try {
      parsed = JSON.parse(completion.choices?.[0]?.message?.content || "{}");
    } catch (err) {
      console.error("Failed to parse JSON:", err);
      parsed = {
        insight: completion.choices?.[0]?.message?.content || "No insight generated",
        recommendations: [],
        grouped: {
          Critical: [],
          Important: [],
          "Nice-to-Have": []
        },
      };
    }

    res.json({
      insight: parsed.insight || "No insight generated",
      recommendations: parsed.recommendations || [],
      grouped: parsed.grouped || {
        Critical: [],
        Important: [],
        "Nice-to-Have": []
      },
    });

    console.log("Response sent to frontend:", parsed);
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
