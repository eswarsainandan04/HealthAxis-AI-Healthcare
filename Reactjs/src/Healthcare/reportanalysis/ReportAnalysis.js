import { useState, useEffect, useRef } from "react";
import "./ReportAnalysis.css";

function ReportAnalysis() {
  const [fileType, setFileType] = useState("image");
  const [file, setFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState({
    patientFindings: "",
    diagnoses: "",
    diseaseReport: "",
    recommendations: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Refs for textareas
  const patientFindingsRef = useRef(null);
  const diagnosesRef = useRef(null);
  const diseaseReportRef = useRef(null);
  const recommendationsRef = useRef(null);

  // Function to adjust textarea height
  const adjustTextareaHeight = (textarea) => {
    if (textarea) {
      textarea.style.height = "auto"; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set height based on content
    }
  };

  // Adjust textarea heights whenever analysisResult changes
  useEffect(() => {
    adjustTextareaHeight(patientFindingsRef.current);
    adjustTextareaHeight(diagnosesRef.current);
    adjustTextareaHeight(diseaseReportRef.current);
    adjustTextareaHeight(recommendationsRef.current);
  }, [analysisResult]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
  };

  // Helper function to replace *, **, and numbered lists
  const formatResponseText = (text) => {
    return text
      .replace(/\*\*/g, ' ')  // Replace '**' with a single space
      .replace(/\*/g, '   ')  // Replace '*' with three spaces
      .replace(/\d\./g, '   '); // Replace '1.', '2.', '3.', etc., with three spaces
  };

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", fileType);

    console.log("Uploading file:", file.name);

    try {
      const response = await fetch("http://localhost:5015/upload", {
        method: "POST",
        body: formData,
        mode: "cors",
      });

      console.log("Response Status:", response.status);

      if (!response.ok) {
        throw new Error("Server error occurred");
      }

      const data = await response.json();
      console.log("Server Response:", data);

      // Format the response text before setting it in the state
      setAnalysisResult({
        patientFindings: formatResponseText(data.patient_findings),
        diagnoses: formatResponseText(data.diagnoses),
        diseaseReport: formatResponseText(data.disease_report),
        recommendations: formatResponseText(data.recommendations)
      });
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to analyze the report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="report-analyzer-container">
        <br></br><br></br><br></br>
      <h2>Upload a Medical Report</h2>
      <div className="upload-form">
        <div className="form-group">
          <label htmlFor="file_type">Select File Type:</label>
          <select
            id="file_type"
            value={fileType}
            onChange={handleFileTypeChange}
            className="file-type-select"
          >
            <option value="image">Image</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="file" className="file-input-label">
            {file ? file.name : "Choose a file"}
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="file-input"
              accept={fileType === "image" ? "image/*" : ".pdf"}
            />
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="button"
          onClick={uploadFile}
          className="analyze-button"
          disabled={isLoading}
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      <div className="analysis-result">
        <h3>Analysis Result:</h3>
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <div className="result-content">
            {analysisResult.patientFindings ? (
              <>
                <div className="result-section">
                  <h4>Patient Details:</h4>
                  <textarea
                    ref={patientFindingsRef}
                    readOnly
                    value={analysisResult.patientFindings}
                  />
                </div>
                <div className="result-section">
                  <h4>Diagnoses:</h4>
                  <textarea
                    ref={diagnosesRef}
                    readOnly
                    value={analysisResult.diagnoses}
                  />
                </div>
                <div className="result-section">
                  <h4>Disease Report:</h4>
                  <textarea
                    ref={diseaseReportRef}
                    readOnly
                    value={analysisResult.diseaseReport}
                  />
                </div>
                <div className="result-section">
                  <h4>Recommendations:</h4>
                  <textarea
                    ref={recommendationsRef}
                    readOnly
                    value={analysisResult.recommendations}
                  />
                </div>
              </>
            ) : (
              <p className="no-result">Upload a report to see analysis</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportAnalysis;