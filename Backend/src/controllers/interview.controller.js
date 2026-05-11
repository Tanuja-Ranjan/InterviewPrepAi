const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReportModel");

/**
 * @description Generate interview report based on resume, self description and job description
 */

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


/**
 * @description Get interview report by interviewId
 */
async function getInterviewReportByIdController(req, res) { 
  const { interviewId } = req.params
  
  const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })
  
  if (!interviewReport) {
    return res.status(404).json({ message: "Interview report not found" });
  }
  res.status(200).json({
    message: "Interview report fetched successfully",
    interviewReport
  });

}


/**
 * @description Get all interview reports for the logged in user
 */
async function getAllInterviewReportsController(req, res) { 
  const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -_v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

  res.status(200).json({
    message: "Interview reports fetched successfully",
    interviewReports
  });

}

/**
 * @description Controller to generate resume PDF based on user self description, job description, resume
 */
async function generateResumePdfController(req, res) { 
  const { interviewReportId } = req.params
  
  const interviewReport = await interviewReportModel.findById(interviewReportId)
  
  if (!interviewReport) {
    return res.status(404).json({ message: "Interview report not found" });
  }

  const { resume, selfDescription, jobDescription } = interviewReport
  
  const pdfBuffer = await generateResumePdf({ resume, selfDescription, jobDescription })

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
  });
  res.send(pdfBuffer);
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController
};
