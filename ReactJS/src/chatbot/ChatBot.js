"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import "./ChatBot.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPaperPlane as faSend, faRotateRight, faStethoscope } from "@fortawesome/free-solid-svg-icons"
import jsPDF from "jspdf"

const ChatBot = () => {
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [isFinalResponse, setIsFinalResponse] = useState(false)
  const [prescriptionText, setPrescriptionText] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [connectionError, setConnectionError] = useState(false)
  const [patientData, setPatientData] = useState({})

  const chatBoxRef = useRef(null)
  const inputRef = useRef(null)

  const doctorTypes = [
    { value: "general", label: "General Practitioner", icon: "🏥" },
    { value: "dentist", label: "Dentist", icon: "🦷" },
    { value: "cardiologist", label: "Cardiologist", icon: "❤️" },
    { value: "dermatologist", label: "Dermatologist", icon: "🧴" },
    { value: "neurologist", label: "Neurologist", icon: "🧠" },
    { value: "orthopedist", label: "Orthopedist", icon: "🦴" },
    { value: "pediatrician", label: "Pediatrician", icon: "👶" },
    { value: "psychiatrist", label: "Psychiatrist", icon: "🧘" },
    { value: "gynecologist", label: "Gynecologist", icon: "👩" },
    { value: "ophthalmologist", label: "Ophthalmologist", icon: "👁️" },
  ]

  const formatMessage = (text) => {
    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "\n")
      .replace(
        /(Possible Diagnosis|Recommended Treatment|Important Precautions|Next Steps|Recommended Healthcare Facilities)/g,
        "\n\n$1",
      )
      .replace(/(Likely Diagnosis:)/g, "<strong>$1</strong>\n")
      .replace(/(Medical Prescription:)/g, "<strong>$1</strong>\n")
      .replace(/(Precautions:)/g, "<strong>$1</strong>\n")
      .replace(/(Hospitals to Visit)/g, "<strong>$1</strong>\n")
      .replace(/(Recommended Healthcare Facilities:)/g, "<strong>$1</strong>\n")
      .replace(/(Disclaimer:)/g, "<strong>$1</strong>\n")
      .trim()
  }

  const stripHtmlTags = (text) => {
    return text.replace(/<[^>]*>/g, "").trim()
  }

  const parseAssessmentData = (text) => {
    const sections = {
      diagnosis: "",
      prescription: "",
      precautions: "",
      hospitals: "",
      facilities: "",
      disclaimer: "",
    }

    const lines = text.split("\n")
    let currentSection = ""

    lines.forEach((line) => {
      const cleanLine = line.trim()
      if (cleanLine.includes("Likely Diagnosis:")) {
        currentSection = "diagnosis"
        let diagnosisText = stripHtmlTags(cleanLine.replace("Likely Diagnosis:", "")).trim()
        diagnosisText = diagnosisText.replace(/^\d+\.\s*/, "")
        sections.diagnosis = diagnosisText
      } else if (cleanLine.includes("Medical Prescription:")) {
        currentSection = "prescription"
        let prescriptionText = stripHtmlTags(cleanLine.replace("Medical Prescription:", "")).trim()
        prescriptionText = prescriptionText.replace(/^\d+\.\s*/, "")
        sections.prescription = prescriptionText
      } else if (cleanLine.includes("Precautions:")) {
        currentSection = "precautions"
        let precautionsText = stripHtmlTags(cleanLine.replace("Precautions:", "")).trim()
        precautionsText = precautionsText.replace(/^\d+\.\s*/, "")
        sections.precautions = precautionsText
      } else if (cleanLine.includes("Hospitals to Visit")) {
        currentSection = "hospitals"
        let hospitalsText = stripHtmlTags(cleanLine.replace("Hospitals to Visit:", "")).trim()
        hospitalsText = hospitalsText.replace(/^\d+\.\s*/, "")
        sections.hospitals = hospitalsText
      } else if (cleanLine.includes("Recommended Healthcare Facilities:")) {
        currentSection = "facilities"
        sections.facilities = stripHtmlTags(cleanLine.replace("Recommended Healthcare Facilities:", "")).trim()
      } else if (cleanLine.includes("Disclaimer:")) {
        currentSection = "disclaimer"
        sections.disclaimer = stripHtmlTags(cleanLine.replace("Disclaimer:", "")).trim()
      } else if (cleanLine && currentSection) {
        let additionalText = stripHtmlTags(cleanLine)
        additionalText = additionalText.replace(/^\d+\.\s*/, "")
        sections[currentSection] += (sections[currentSection] ? " " : "") + additionalText
      }
    })

    return sections
  }

  const checkConnection = async () => {
    try {
      await axios.get("https://healthaxis-backend.onrender.com/health", { timeout: 5000 })
      setConnectionError(false)
      return true
    } catch (error) {
      setConnectionError(true)
      return false
    }
  }

  const selectDoctor = async (doctorType) => {
    setSelectedDoctor(doctorType)
    setLoading(true)
    setConnectionError(false)
    setChatHistory([])
    setIsFinalResponse(false)
    setPrescriptionText("")
    setMessage("")
    setPatientData({})

    const isConnected = await checkConnection()
    if (!isConnected) {
      const errorMessage =
        "Unable to connect to the medical AI service. Please check if the server is running on http://localhost:5000 and try again."
      setChatHistory([{ bot: errorMessage }])
      setLoading(false)
      return
    }

    try {
      await axios.post("https://healthaxis-backend.onrender.com/reset", {}, { timeout: 5000 })

      const response = await axios.post(
        "https://healthaxis-backend.onrender.com/chat",
        {
          message: "start",
          doctorType: doctorType,
        },
        { timeout: 90000 },
      )

      const botResponse = formatMessage(response.data.response)
      setChatHistory([{ bot: botResponse }])
    } catch (error) {
      console.error("Error:", error)
      let errorMessage = "I'm having trouble connecting to the medical AI service. "

      if (error.code === "ECONNREFUSED") {
        errorMessage += "Please make sure the server is running on http://localhost:5000."
      } else if (error.response?.status === 500) {
        errorMessage += "The AI service is experiencing technical difficulties. Please try again in a moment."
      } else if (error.response?.status === 400) {
        errorMessage += "There was an issue with your request. Please try starting a new consultation."
      } else {
        errorMessage += "Please check your internet connection and try again."
      }

      setChatHistory([{ bot: errorMessage }])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || isFinalResponse || loading || !selectedDoctor) return

    const userMessage = message
    setMessage("")
    setLoading(true)

    const newChatHistory = [...chatHistory, { user: userMessage }]
    setChatHistory(newChatHistory)

    try {
      const response = await axios.post(
        "https://healthaxis-backend.onrender.com/chat",
        {
          message: userMessage,
          doctorType: selectedDoctor,
        },
        { timeout: 15000 },
      )

      const botResponse = formatMessage(response.data.response)
      const updatedChatHistory = [...newChatHistory, { bot: botResponse }]
      setChatHistory(updatedChatHistory)

      if (botResponse.includes("Thank you for using our AI") || botResponse.includes("Take care!")) {
        setIsFinalResponse(true)
        setPrescriptionText(botResponse)
        if (response.data.patientData) {
          setPatientData(response.data.patientData)
        }
      }
    } catch (error) {
      console.error("Error:", error)
      let errorMessage = "I'm experiencing technical difficulties. "

      if (error.code === "ECONNREFUSED") {
        errorMessage += "The medical AI service appears to be offline. Please try again later."
      } else if (error.response?.status === 500) {
        errorMessage +=
          "The AI service encountered an error. Please try rephrasing your message or start a new consultation."
      } else if (error.code === "ECONNABORTED") {
        errorMessage += "The request timed out. Please try again with a shorter message."
      } else {
        errorMessage += "Please check your connection and try again."
      }

      const errorChatHistory = [...newChatHistory, { bot: errorMessage }]
      setChatHistory(errorChatHistory)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      try {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = "/ai.png"
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
        })
        pdf.addImage(img, "PNG", pageWidth / 2 - 10, 10, 20, 20)
      } catch (error) {
        pdf.setFontSize(10)
        pdf.setFont(undefined, "bold")
        pdf.text("🏥 AI", pageWidth / 2, 20, { align: "center" })
      }

      pdf.setFontSize(12)
      pdf.setFont(undefined, "bold")
      pdf.text("AI HealthCare Report", pageWidth / 2, 35, { align: "center" })

      const patientInfo = {
        name: patientData.name || "N/A",
        age: patientData.age || "N/A",
        address: patientData.address || "N/A",
      }

      pdf.setFontSize(8)
      pdf.setFont(undefined, "normal")
      let yPos = 45

      const doctorLabel = doctorTypes.find((d) => d.value === selectedDoctor)?.label || selectedDoctor

      pdf.text("CONFIDENTIAL MEDICAL ASSESSMENT REPORT", pageWidth / 2, yPos, { align: "center" })
      yPos += 10

      pdf.setFont(undefined, "bold")
      pdf.text("PATIENT INFORMATION:", 20, yPos)
      yPos += 6
      pdf.setFont(undefined, "normal")
      pdf.text(`Patient Name: ${patientInfo.name}`, 20, yPos)
      yPos += 5
      pdf.text(`Age: ${patientInfo.age}`, 20, yPos)
      yPos += 5
      pdf.text(`Address: ${patientInfo.address}`, 20, yPos)
      yPos += 5
      pdf.text(`Consulting Specialist: ${doctorLabel}`, 20, yPos)
      yPos += 5
      pdf.text(`Consultation Type: Medical Assessment & Treatment Plan`, 20, yPos)
      yPos += 5
      pdf.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, yPos)
      yPos += 12

      pdf.setFont(undefined, "bold")
      pdf.text("CLINICAL ASSESSMENT & RECOMMENDATIONS:", 20, yPos)
      yPos += 8

      const assessmentData = parseAssessmentData(prescriptionText)

      const colWidth1 = 40 // Reduced first column width
      const colWidth2 = pageWidth - colWidth1 - 30 // Increased second column width
      const startX = 20
      const baseRowHeight = 20 // Increased row height

      const tableData = [
        ["Likely Diagnosis:", assessmentData.diagnosis || "Clinical evaluation required for definitive diagnosis"],
        ["Medical Prescription:", assessmentData.prescription || "Medication as per clinical guidelines"],
        ["Precautions:", assessmentData.precautions || "Follow standard health safety measures"],
        ["Hospitals to Visit:", assessmentData.hospitals || "Consult local healthcare directory"],
        ["Healthcare Facilities:", assessmentData.facilities || "Contact nearby medical centers"],
      ]

      pdf.setFontSize(7)
      let currentY = yPos

      tableData.forEach((row, index) => {
        const splitText = pdf.splitTextToSize(row[1], colWidth2 - 6)
        const rowHeight = Math.max(baseRowHeight, splitText.length * 4 + 8)

        // Draw table borders
        pdf.setLineWidth(0.3)
        pdf.rect(startX, currentY, colWidth1, rowHeight)
        pdf.rect(startX + colWidth1, currentY, colWidth2, rowHeight)

        // Add content with better positioning
        pdf.setFont(undefined, "bold")
        const labelLines = pdf.splitTextToSize(row[0], colWidth1 - 4)
        pdf.text(labelLines, startX + 2, currentY + 6)

        pdf.setFont(undefined, "normal")
        pdf.text(splitText, startX + colWidth1 + 3, currentY + 6)

        currentY += rowHeight
      })

      yPos = currentY + 15


      pdf.setFontSize(8)
      pdf.setFont(undefined, "normal")
      pdf.text("Best Regards,", pageWidth - 80, yPos)
      yPos += 6
      pdf.setFont(undefined, "bold")
      pdf.text("Mr. Tummapala Eswar Sai Nandan", pageWidth - 80, yPos)
      yPos += 5
      pdf.setFont(undefined, "normal")
      pdf.text("BTech, Information Technology", pageWidth - 80, yPos)

      pdf.save("Medical_Assessment_Report.pdf")
    } catch (error) {
      console.error("PDF generation error:", error)
      const blob = new Blob([prescriptionText], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "Medical_Assessment.txt"
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const resetChat = async () => {
    try {
      await axios.post("https://healthaxis-backend.onrender.com/reset", {}, { timeout: 5000 })
    } catch (error) {
      console.error("Reset error:", error)
    }

    if (selectedDoctor) {
      selectDoctor(selectedDoctor)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [chatHistory])

  useEffect(() => {
    if (inputRef.current && !isFinalResponse && selectedDoctor) {
      inputRef.current.focus()
    }
  }, [chatHistory, isFinalResponse, selectedDoctor])

  return (
    <div className="appRaacontainer">
      <div className="doctor-selection-container">
        <br></br>
        <br></br>
        <br></br>

        <div className="doctor-header">
          <FontAwesomeIcon icon={faStethoscope} className="header-icon" />
          <h2>Select Doctor</h2>
        </div>
        <div className="doctor-list">
          {doctorTypes.map((doctor) => (
            <button
              key={doctor.value}
              className={`doctor-item ${selectedDoctor === doctor.value ? "active" : ""}`}
              onClick={() => selectDoctor(doctor.value)}
            >
              <span className="doctor-icon">{doctor.icon}</span>
              <span className="doctor-name">{doctor.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="chat-container">
        {!selectedDoctor ? (
          <div className="no-doctor-selected">
            <img src="/ai.png" alt="AI Doctor" className="default-ai-image" />
            <h3>Welcome to AI Medical Assistant</h3>
            <p className="ai-description">
              Our advanced AI-powered medical assistant provides professional healthcare consultations across multiple
              specialties. Get personalized medical advice, symptom analysis, and treatment recommendations from our
              intelligent system. Select a specialist from the left panel to begin your comprehensive medical
              consultation with our AI doctor.
            </p>
          </div>
        ) : (
          <>
            <br></br>
            <br></br>
            <br></br>

            <div className="chat-header">
              <div className="headerRa-content">
                <img src="/ai.png" alt="AI Doctor" className="header-logo" />
                <div className="header-text">
                  <h3>AI {doctorTypes.find((d) => d.value === selectedDoctor)?.label}</h3>
                  <p>Professional medical consultation</p>
                </div>
              </div>
              <button className="reset-btn" onClick={resetChat}>
                <FontAwesomeIcon icon={faRotateRight} />
                <span>Reset</span>
              </button>
            </div>

            <div className="chat-messages" ref={chatBoxRef}>
              {chatHistory.map((chat, index) => (
                <div key={index} className="message-group">
                  {chat.user && (
                    <div className="message user-message">
                      <img src="/user.png" alt="User" className="message-avatar" />
                      <div className="message-content">
                        <p>{chat.user}</p>
                      </div>
                    </div>
                  )}
                  {chat.bot && (
                    <div className="message bot-message">
                      <img src="/ai.png" alt="AI Doctor" className="message-avatar" />
                      <div className="message-content">
                        <p style={{ whiteSpace: "pre-line" }} dangerouslySetInnerHTML={{ __html: chat.bot }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="message bot-message">
                  <img src="/ai.png" alt="AI Doctor" className="message-avatar" />
                  <div className="message-content loading">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <p>AI Doctor is analyzing...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-input-container">
              {isFinalResponse && (
                <div className="completion-actions">
                  <button className="action-btn download-btn" onClick={handleDownload}>
                    📄 Download Assessment
                  </button>
                  <button className="action-btn new-consultation-btn" onClick={resetChat}>
                    🔄 New Consultation
                  </button>
                </div>
              )}

              <div className="input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isFinalResponse
                      ? "Consultation completed"
                      : !selectedDoctor
                        ? "Select a doctor first"
                        : "Type your message..."
                  }
                  disabled={isFinalResponse || loading || !selectedDoctor}
                  className="message-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={isFinalResponse || loading || !message.trim() || !selectedDoctor}
                  className="send-button"
                >
                  <FontAwesomeIcon icon={faSend} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChatBot
