const pdfParse = require("pdf-parse");
const { generateInterviewReport } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReportModel");

async function generateInterviewReportController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume PDF is required" });
    }

    // ✅ Correct pdf-parse usage — it's a function, not a class
    const resumeContent = await pdfParse(req.file.buffer);

    const { selfDescription, jobDescription } = req.body;

    if (!selfDescription || !jobDescription) {
      return res
        .status(400)
        .json({ message: "selfDescription and jobDescription are required" });
    }

    const interviewReportByAi = await generateInterviewReport({
      resume: resumeContent.text,
      selfDescription,
      jobDescription,
    });

    console.log("AI RESPONSE:", JSON.stringify(interviewReportByAi, null, 2)); // ADD THIS
    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeContent.text,
      selfDescription,
      jobDescription,
      ...interviewReportByAi,
    });

    res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport,
    });
  } catch (err) {
    console.error("[generateReport] Error:", err.message);
    res
      .status(500)
      .json({ message: "Failed to generate report", error: err.message });
  }
}


module.exports = { generateInterviewReportController };
