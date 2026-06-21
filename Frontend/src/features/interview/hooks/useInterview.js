import {
  getAllInterviewReports,
  generateInterviewReport,
  getInterviewReportById,
  generateResumePdf as generateResumePdfApi,
  deleteInterviewReport as deleteInterviewReportApi,
} from "../services/interview.api";
import { useContext, useEffect } from "react";
import { InterviewContext } from "../interview.context";
import { useParams } from "react-router-dom";

export const useInterview = () => {
  const { interviewId } = useParams();
  const context = useContext(InterviewContext);

  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }

  const { loading, setLoading, report, setReport, reports, setReports } =
    context;

  const generateReport = async ({
    jobDescription,
    selfDescription,
    resumeFile,
  }) => {
    setLoading(true);
    try {
      const response = await generateInterviewReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });
      setReport(response.interviewReport);
      return response.interviewReport;
    } catch (err) {
      console.error("Error generating interview report:", err);
    } finally {
      setLoading(false);
    }
  };

  const getReportById = async (interviewId) => {
    setLoading(true);
    try {
      const response = await getInterviewReportById(interviewId);
      setReport(response.interviewReport);
      return response.interviewReport; // ✅ try ke andar
    } catch (err) {
      console.error("Error fetching interview report:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAllReports = async () => {
    setLoading(true);
    try {
      const response = await getAllInterviewReports();
      setReports(response.interviewReports);
      return response.interviewReports;
    } catch (err) {
      console.error("Error fetching interview reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const getResumePdf = async (interviewReportId) => {
    // ✅ naam badla
    setLoading(true);
    try {
      const response = await generateResumePdfApi(interviewReportId); // ✅ Api wala call
      const url = window.URL.createObjectURL(
        new Blob([response], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `resume_${interviewReportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove(); // ✅ cleanup
    } catch (err) {
      console.error("Error generating resume PDF:", err);
    } finally {
      setLoading(false);
    }
  };


  const deleteReport = async (interviewId) => {
    setLoading(true);
    try {
      await deleteInterviewReportApi(interviewId);
      setReports((prev) => prev.filter((r) => r._id !== interviewId)); // ✅ list se hata do
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId);
    } else {
      getAllReports();
    }
  }, [interviewId]);

  return {
    loading,
    report,
    reports,
    generateReport,
    getReportById,
    getAllReports,
    getResumePdf,
    deleteReport
  }; // ✅ getResumePdf
};
