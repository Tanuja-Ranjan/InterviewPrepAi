const OpenAI = require("openai");

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert technical interviewer. Always return valid JSON only.`,
      },
      {
        role: "user",
        content: `Analyze this candidate and return ONLY this exact JSON structure:
{
  "matchScore": <number 0-100>,
  "title": "<job title>",
  "technicalQuestions": [
    { "question": "<string>", "intention": "<string>", "answer": "<string>" }
  ],
  "behavioralQuestions": [
    { "question": "<string>", "intention": "<string>", "answer": "<string>" }
  ],
  "skillGaps": [
    { "skill": "<string>", "severity": "<low|medium|high>" }
  ],
  "preparationPlan": [
    { "day": <integer>, "focus": "<string>", "tasks": ["<string>", "<string>"] }
  ]
}

RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}

Rules:
- Exactly 5 technicalQuestions
- Exactly 4 behavioralQuestions
- Exactly 7 days in preparationPlan
- severity must be exactly "low", "medium", or "high"
- Return raw JSON only, no markdown, no explanation`,
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = { generateInterviewReport };
