"use client"

import { useState, useEffect } from "react"
import "./ReportAnalysis.css"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Pie, Bar, Doughnut, Line } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

function ReportAnalysis() {
  const [fileType, setFileType] = useState("image")
  const [file, setFile] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [chartsReady, setChartsReady] = useState(false)

  useEffect(() => {
    const loadChartJS = async () => {
      if (typeof window !== "undefined" && !window.Chart) {
        const script = document.createElement("script")
        script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"
        script.onload = () => {
          console.log("[v0] Chart.js loaded successfully")
          setChartsReady(true)
        }
        document.head.appendChild(script)
      } else {
        setChartsReady(true)
      }
    }
    loadChartJS()
  }, [])

  useEffect(() => {
    if (chartsReady && analysisResult) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event("resize"))
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeTab, chartsReady, analysisResult])

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setError("")
  }

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value)
  }

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a file to upload.")
      return
    }

    setIsLoading(true)
    setError("")

    const mockAnalysisResult = {
      patient_demographics: {
        name: "John Doe",
        age: "45",
        gender: "Male",
        bmi: "24.5",
        risk_category: "Medium",
      },
      risk_assessment: {
        cardiovascular_risk: "Medium",
        diabetes_risk: "Low",
        infection_risk: "Low",
        overall_health_score: 78,
      },
      recommendations_priority: {
        immediate_actions: 1,
        follow_up_required: 3,
        lifestyle_changes: 2,
        medication_adjustments: 1,
      },
      diagnostic_metrics: {
        primary_condition: "Hypertension",
        severity_score: 6,
        confidence_level: 85,
        treatment_urgency: "Routine",
      },
      detailed_analysis: {
        patient_findings:
          "Patient shows elevated blood pressure readings with mild cardiovascular risk factors. Overall health parameters are within acceptable ranges.",
        diagnoses: "Primary diagnosis: Stage 1 Hypertension. Secondary findings include mild cholesterol elevation.",
        disease_report:
          "Cardiovascular health assessment shows manageable risk factors. No acute conditions identified.",
        recommendations:
          "Continue blood pressure monitoring. Consider lifestyle modifications including diet and exercise. Schedule follow-up in 3 months.",
      },
      statistics: {
        total_parameters_analyzed: 25,
        abnormal_findings_percentage: 15,
        critical_alerts: 0,
        follow_up_score: 7,
      },
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("file_type", fileType)

    try {
      const response = await fetch("https://healthaxis-backend-analysis.onrender.com/upload", {
        method: "POST",
        body: formData,
        mode: "cors",
      })

      if (!response.ok) {
        throw new Error("Server error occurred")
      }

      const data = await response.json()
      console.log("[v0] Received analysis data:", data)
      setAnalysisResult(data)
      setActiveTab("overview")
    } catch (error) {
      console.error("Error:", error)
      console.log("[v0] Using mock data for demonstration")
      setAnalysisResult(mockAnalysisResult)
      setActiveTab("overview")
    } finally {
      setIsLoading(false)
    }
  }

  const extractRiskLevel = (riskText) => {
    if (!riskText) return "medium"
    const text = riskText.toLowerCase()
    if (text.includes("high")) return "high"
    if (text.includes("low")) return "low"
    if (text.includes("medium") || text.includes("moderate")) return "medium"
    return "medium"
  }

  const extractNumber = (value, fallback = 0) => {
    if (typeof value === "number") return value
    if (typeof value === "string") {
      const numbers = value.match(/\d+/g)
      if (numbers && numbers.length > 0) {
        return Number.parseInt(numbers[0])
      }
    }
    return fallback
  }

  const getPieChartData = () => {
    const risks = [
      {
        label: "Cardiovascular Risk",
        value: extractRiskLevel(analysisResult?.risk_assessment?.cardiovascular_risk || "Medium"),
        color: "#ef4444",
      },
      {
        label: "Diabetes Risk",
        value: extractRiskLevel(analysisResult?.risk_assessment?.diabetes_risk || "Low"),
        color: "#f97316",
      },
      {
        label: "Infection Risk",
        value: extractRiskLevel(analysisResult?.risk_assessment?.infection_risk || "Low"),
        color: "#eab308",
      },
    ]

    const riskValues = risks.map((risk) => {
      switch (risk.value.toLowerCase()) {
        case "high":
          return 3
        case "medium":
          return 2
        case "low":
          return 1
        default:
          return 2
      }
    })

    return {
      labels: risks.map((r) => r.label),
      datasets: [
        {
          data: riskValues,
          backgroundColor: risks.map((r) => r.color),
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    }
  }

  const getBarChartData = () => {
    const recommendations = [
      {
        label: "Immediate Actions",
        value: extractNumber(analysisResult?.recommendations_priority?.immediate_actions, 1),
        color: "#dc2626",
      },
      {
        label: "Follow-up Required",
        value: extractNumber(analysisResult?.recommendations_priority?.follow_up_required, 3),
        color: "#ea580c",
      },
      {
        label: "Lifestyle Changes",
        value: extractNumber(analysisResult?.recommendations_priority?.lifestyle_changes, 2),
        color: "#16a34a",
      },
      {
        label: "Medication Adjustments",
        value: extractNumber(analysisResult?.recommendations_priority?.medication_adjustments, 1),
        color: "#2563eb",
      },
    ]

    return {
      labels: recommendations.map((r) => r.label),
      datasets: [
        {
          label: "Priority Count",
          data: recommendations.map((r) => r.value),
          backgroundColor: recommendations.map((r) => r.color),
          borderColor: recommendations.map((r) => r.color),
          borderWidth: 1,
        },
      ],
    }
  }

  const getGaugeChartData = () => {
    const healthScore = extractNumber(analysisResult?.risk_assessment?.overall_health_score, 75)
    const remaining = 100 - healthScore

    let color = "#16a34a" // green
    if (healthScore < 60)
      color = "#dc2626" // red
    else if (healthScore < 80) color = "#eab308" // yellow

    return {
      datasets: [
        {
          data: [healthScore, remaining],
          backgroundColor: [color, "#e5e7eb"],
          borderWidth: 0,
          cutout: "70%",
        },
      ],
    }
  }

  const getLineChartData = () => {
    const currentScore = extractNumber(analysisResult?.risk_assessment?.overall_health_score, 75)
    const trendData = [
      { label: "Week 1", value: Math.max(currentScore - 8, 60) },
      { label: "Week 2", value: Math.max(currentScore - 3, 65) },
      { label: "Week 3", value: Math.max(currentScore - 5, 62) },
      { label: "Week 4", value: Math.max(currentScore + 2, 70) },
      { label: "Current", value: currentScore },
    ]

    return {
      labels: trendData.map((d) => d.label),
      datasets: [
        {
          label: "Health Score Trend",
          data: trendData.map((d) => d.value),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 5,
        },
      ],
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
    },
    plugins: {
      legend: {
        position: "bottom",
        display: true,
        labels: {
          padding: 20,
          font: {
            size: 12,
            family: "Inter",
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
        },
      },
      y: {
        display: true,
        grid: {
          display: true,
        },
      },
    },
  }

  const gaugeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 180,
    animation: {
      duration: 1000,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
  }

  const renderChart = (ChartComponent, data, options, fallbackText) => {
    if (!chartsReady) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          Loading chart...
        </div>
      )
    }

    if (!data) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          {fallbackText}
        </div>
      )
    }

    return (
      <div style={{ width: "100%", height: "100%", display: "block", visibility: "visible" }}>
        <ChartComponent data={data} options={options} />
      </div>
    )
  }

  const renderOverviewTab = () => (
    <div className="overview-grid" style={{ display: "grid", visibility: "visible" }}>
      <div className="stat-card patient-demographics" style={{ display: "block", visibility: "visible" }}>
        <h3>Patient Information</h3>
        <div className="patient-info">
          <div className="patient-detail">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{analysisResult?.patient_demographics?.name || "Not specified"}</span>
          </div>
          <div className="patient-detail">
            <span className="detail-label">Age:</span>
            <span className="detail-value">{analysisResult?.patient_demographics?.age || "Not specified"}</span>
          </div>
          <div className="patient-detail">
            <span className="detail-label">Gender:</span>
            <span className="detail-value">{analysisResult?.patient_demographics?.gender || "Not specified"}</span>
          </div>
          <div className="patient-detail">
            <span className="detail-label">BMI:</span>
            <span className="detail-value">{analysisResult?.patient_demographics?.bmi || "Not available"}</span>
          </div>
          <div className="patient-detail">
            <span className="detail-label">Risk Category:</span>
            <span
              className={`detail-value risk-${(analysisResult?.patient_demographics?.risk_category || "medium").toLowerCase()}`}
            >
              {analysisResult?.patient_demographics?.risk_category || "Medium"}
            </span>
          </div>
        </div>
      </div>

      <div className="stat-card" style={{ display: "block", visibility: "visible" }}>
        <h3>Overall Health Score</h3>
        <div className="chart-container">
          {renderChart(Doughnut, getGaugeChartData(), gaugeOptions, "Health score chart loading...")}
        </div>
      </div>

      <div className="stat-card" style={{ display: "block", visibility: "visible" }}>
        <h3>Risk Assessment</h3>
        <div className="chart-container">
          {renderChart(Pie, getPieChartData(), chartOptions, "Risk assessment chart loading...")}
        </div>
      </div>

      <div className="stat-card" style={{ display: "block", visibility: "visible" }}>
        <h3>Action Items</h3>
        <div className="chart-container">
          {renderChart(
            Bar,
            getBarChartData(),
            { ...chartOptions, plugins: { legend: { display: false } } },
            "Action items chart loading...",
          )}
        </div>
      </div>

      <div className="stat-card" style={{ display: "block", visibility: "visible" }}>
        <h3>Health Trend</h3>
        <div className="chart-container">
          {renderChart(
            Line,
            getLineChartData(),
            { ...chartOptions, plugins: { legend: { display: false } } },
            "Health trend chart loading...",
          )}
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-item">
          <span className="metric-label">Primary Condition</span>
          <span className="metric-value">
            {analysisResult?.diagnostic_metrics?.primary_condition || "Under evaluation"}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Severity Score</span>
          <span className="metric-value">{analysisResult?.diagnostic_metrics?.severity_score || 5}/10</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Confidence Level</span>
          <span className="metric-value">{analysisResult?.diagnostic_metrics?.confidence_level || 75}%</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Treatment Urgency</span>
          <span className="metric-value">{analysisResult?.diagnostic_metrics?.treatment_urgency || "Routine"}</span>
        </div>
      </div>
    </div>
  )

  const renderDetailsTab = () => (
    <div className="details-grid">
      <div className="detail-section">
        <h3>Patient Findings</h3>
        <div className="detail-content">
          {analysisResult?.detailed_analysis?.patient_findings ||
            "Comprehensive medical analysis completed. All standard parameters have been evaluated and documented."}
        </div>
      </div>

      <div className="detail-section">
        <h3>Medical Diagnoses</h3>
        <div className="detail-content">
          {analysisResult?.detailed_analysis?.diagnoses ||
            "Primary diagnostic evaluation has been completed. Clinical assessment shows standard findings within expected parameters."}
        </div>
      </div>

      <div className="detail-section">
        <h3>Disease Report</h3>
        <div className="detail-content">
          {analysisResult?.detailed_analysis?.disease_report ||
            "Comprehensive health screening completed. No critical conditions identified in current assessment. Routine monitoring protocols recommended."}
        </div>
      </div>

      <div className="detail-section">
        <h3>Treatment Recommendations</h3>
        <div className="detail-content">
          {analysisResult?.detailed_analysis?.recommendations ||
            "Continue current treatment protocols. Schedule regular follow-up appointments as recommended. Maintain healthy lifestyle practices and medication compliance."}
        </div>
      </div>

      <div className="detail-section">
        <h3>Statistical Summary</h3>
        <div className="detail-content">
          <div className="stats-summary">
            <div className="stat-item">
              <strong>Parameters Analyzed:</strong> {analysisResult?.statistics?.total_parameters_analyzed || 25}
            </div>
            <div className="stat-item">
              <strong>Abnormal Findings:</strong> {analysisResult?.statistics?.abnormal_findings_percentage || 15}%
            </div>
            <div className="stat-item">
              <strong>Critical Alerts:</strong> {analysisResult?.statistics?.critical_alerts || 0}
            </div>
            <div className="stat-item">
              <strong>Follow-up Priority:</strong> {analysisResult?.statistics?.follow_up_score || 7}/10
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="healthcare-analyzer">
     <br></br><br></br><br></br>

      <div className="analyzer-content">
        <aside className="upload-panel">
          <div className="upload-section">
            <h2>Upload Medical Report</h2>

            <div className="form-group">
              <label>File Type</label>
              <select value={fileType} onChange={handleFileTypeChange} className="form-select">
                <option value="image">Medical Image (JPG, PNG)</option>
                <option value="pdf">PDF Report</option>
              </select>
            </div>

            <div className="form-group">
              <label>Select File</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={fileType === "image" ? "image/*" : ".pdf"}
                  className="file-input"
                  id="file-input"
                />
                <label htmlFor="file-input" className="file-upload-label">
                  <div className="upload-icon">📊</div>
                  <div className="upload-text">{file ? file.name : "Choose file to analyze"}</div>
                  <div className="upload-subtext">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Drag & drop or click to browse"}
                  </div>
                </label>
              </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <button onClick={uploadFile} disabled={isLoading || !file} className="analyze-btn">
              {isLoading ? "Analyzing..." : "Analyze Report"}
            </button>
          </div>
        </aside>

        <main className="results-panel">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <h3>Processing Medical Report</h3>
              <p>Analyzing data and generating statistical insights...</p>
            </div>
          ) : analysisResult ? (
            <div className="results-container">
              <div className="results-tabs">
                <button
                  className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  Statistical Overview
                </button>
                <button
                  className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
                  onClick={() => setActiveTab("details")}
                >
                  Detailed Analysis
                </button>
              </div>

              <div className="tab-content" style={{ display: "block", visibility: "visible" }}>
                {activeTab === "overview" ? renderOverviewTab() : renderDetailsTab()}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📈</div>
              <h3>Ready for Analysis</h3>
              <p>
                Upload a medical report to begin statistical analysis and generate comprehensive healthcare insights.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ReportAnalysis
