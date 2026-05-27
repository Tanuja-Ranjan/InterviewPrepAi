const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware")
const interviewRouter = express.Router();

/**
 * @route POST /api/interview
 * @description Generate interview report based on resume, self description and job description
 * @access Private
 */
interviewRouter.post("/", authMiddleware, upload.single("resume"), interviewController.generateInterviewReportController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description Get interview report by interviewId
 * @access Private
 */
interviewRouter.get("/report/:interviewId", authMiddleware, interviewController.getInterviewReportByIdController)
 
/**
 * @route GET /api/interview/
 * @description Get all interview reports for the logged in user
 * @access Private
 */
interviewRouter.get("/", authMiddleware, interviewController.getAllInterviewReportsController)

/**
 * @route GET /api/interview/resume/pdf
 * @description Generate resume PDF based on user self description, job description, resume
 * @access Private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware, interviewController.generateResumePdfController)
 
module.exports = interviewRouter