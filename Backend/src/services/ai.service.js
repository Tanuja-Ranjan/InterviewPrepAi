const OpenAI = require("openai");
const puppeteer = require("puppeteer");

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

SCORING RULES — follow strictly:

Step 1: Extract all required and preferred skills directly from the job description provided above.
Step 2: Check each extracted skill one by one against the RESUME only. Do not use self description for scoring.
Step 3: Calculate matchScore as follows:
  - Start with 100
  - Count total required skills from job description
  - For each required skill completely missing from resume: subtract (80 / total required skills) points
  - If the candidate's domain is completely different from the job domain (e.g. embedded systems vs backend, graphic design vs ML): cap the final score at 20
  - If experience level is junior or intern but role requires senior: subtract 10 additional points
  - Round final score to nearest integer, minimum 0, maximum 100
Step 4: Be honest and strict. A candidate with no relevant skills should score below 20. Do not be generous.
Step 5: Self description reflects candidate's opinion and aspirations — never use it for scoring. Score only what is proven in the resume.

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

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: false,
    margin: { top: "18mm", bottom: "18mm", left: "18mm", right: "18mm" },
  });
  await browser.close();
  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a professional resume writer. You produce clean, ATS-optimized resumes in HTML. Always return valid JSON only.`,
      },
      {
        role: "user",
        content: `Create a resume in HTML for the candidate below that closely matches this style:
- Single column layout, no sidebars, no columns
- Candidate name centered at top, large and bold
- Contact info centered below name in one line, separated by | symbols
- Each section has a bold uppercase heading followed by a full-width horizontal rule (<hr>)
- Sections in this order: Technical Skills, Experience, Projects, Education, Activities
- Experience and Projects: company/project name bold on left, date right-aligned on same line using space-between flex. Role title italic below. Bullet points using • character, normal black text
- Skills section: category name bold followed by colon, then comma-separated plain text values on same line
- Education: institution bold left, year right-aligned. Degree and CGPA on next line
- Activities: plain bullet points
- Font: Arial or Helvetica, 12px body, 14px section headings, 36px candidate name
- Colors: pure black text (#000000) on white background, no colors anywhere
- No boxes, no cards, no colored headers, no icons, no emojis
- Compact spacing — padding between sections 10px, bullet margin 2px
- Max 2 A4 pages 

Return ONLY this JSON:
{ "html": "<complete HTML as a single string>" }

CANDIDATE DATA:

RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}

CONTENT RULES:
- Include ATS keywords from the job description naturally
- Bullets start with strong action verbs, include metrics where data implies them
- Tailor skills and experience order to match job description priorities
- Do NOT invent fake companies, dates, or metrics
- Write naturally — not AI-sounding
- Be concise, max 2 pages

Return raw JSON only. No markdown. No explanation.`,
      },
    ],
  });

  const jsonContent = JSON.parse(response.choices[0].message.content);
  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);
  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };
