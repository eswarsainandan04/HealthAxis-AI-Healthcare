"use client"

import { useState, useEffect } from "react"
import "./Remainder.css"

const EMAILJS_SERVICE_ID = "service_rdnldcj"
const EMAILJS_TEMPLATE_ID = "template_a6vpfw2"
const EMAILJS_PUBLIC_KEY = "lX0f8x6FUdQGYjY1e"

const EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send"

const Remainder = () => {
  const [activeTab, setActiveTab] = useState("add")
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    age: "",
    email: "",
    disease: "",
    complaint: "",
  })
  const [deleteEmail, setDeleteEmail] = useState("")
  const [diseases, setDiseases] = useState([])
  const [selectedDisease, setSelectedDisease] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const checkAndSendReminders = async () => {
      try {
        const response = await fetch("https://healthaxis-backend-remainder.onrender.com/get_pending_reminders")
        const result = await response.json()

        if (response.ok && result.patients && result.patients.length > 0) {
          console.log(`[v0] Found ${result.patients.length} patients needing reminders`)

          for (const patient of result.patients) {
            try {
              const healthResponse = await fetch("https://healthaxis-backend-remainder.onrender.com/generate_health_message", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  fullName: patient.full_name,
                  gender: patient.gender,
                  age: patient.age,
                  disease: patient.disease,
                  complaint: patient.complaint,
                  createdAt: patient.created_at,
                }),
              })

              const healthResult = await healthResponse.json()

              if (healthResponse.ok) {
                const emailSent = await sendHealthReminderEmail(
                  patient.full_name,
                  patient.email,
                  patient.disease,
                  healthResult.message,
                )

                if (emailSent) {
                  await fetch("https://healthaxis-backend-remainder.onrender.com/update_email_sent", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      patient_id: patient.id,
                    }),
                  })

                  console.log(`[v0] Health reminder sent successfully to ${patient.full_name} (${patient.email})`)
                } else {
                  console.log(`[v0] Failed to send health reminder to ${patient.full_name}`)
                }
              }
            } catch (error) {
              console.error(`[v0] Error processing reminder for ${patient.full_name}:`, error)
            }
          }
        }
      } catch (error) {
        console.error("[v0] Error checking for pending reminders:", error)
      }
    }

    const interval = setInterval(checkAndSendReminders, 60000)

    checkAndSendReminders()

    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const sendConfirmationEmail = async (fullName, email, disease) => {
    try {
      const emailPayload = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          full_name: fullName,
          email: email,
          message: `Thank you for registering with our Health Remainder System. We have successfully added your health remainder for ${disease}. You will receive automated health updates every 24 hours with personalized advice and reminders.`,
        },
      }

      const response = await fetch(EMAILJS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      })

      return response.ok
    } catch (error) {
      console.error("Error sending confirmation email:", error)
      return false
    }
  }

  const sendHealthReminderEmail = async (fullName, email, disease, healthMessage) => {
    try {
      const emailPayload = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          full_name: fullName,
          email: email,
          message: `Health Update - ${disease} Care Reminder\n\n${healthMessage}\n\nThis is an automated health reminder from the Health Remainder System. Please consult with your healthcare provider for any concerns.`,
        },
      }

      const response = await fetch(EMAILJS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      })

      return response.ok
    } catch (error) {
      console.error("Error sending health reminder email:", error)
      return false
    }
  }

  const handleAddRemainder = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("https://healthaxis-backend-remainder.onrender.com/add_remainder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      const result = await response.json()

      if (response.ok) {
        const emailSent = await sendConfirmationEmail(formData.fullName, formData.email, formData.disease)

        if (emailSent) {
          setMessage(`${result.message} Confirmation email sent successfully!`)
        } else {
          setMessage(`${result.message} (Note: Confirmation email could not be sent)`)
        }

        setFormData({
          fullName: "",
          gender: "",
          age: "",
          email: "",
          disease: "",
          complaint: "",
        })
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage("Error adding remainder")
    }
  }

  const handleEmailSearch = async () => {
    if (!deleteEmail) {
      setMessage("Please enter an email")
      return
    }
    try {
      const response = await fetch(`https://healthaxis-backend-remainder.onrender.com/get_diseases/${deleteEmail}`)
      const result = await response.json()
      if (response.ok) {
        setDiseases(result.diseases)
        setMessage("")
      } else {
        setMessage(result.message)
        setDiseases([])
      }
    } catch (error) {
      setMessage("Error fetching diseases")
      setDiseases([])
    }
  }

  const handleDeleteRemainder = async () => {
    if (!deleteEmail || !selectedDisease) {
      setMessage("Please select a disease to delete")
      return
    }
    try {
      const response = await fetch("https://healthaxis-backend-remainder.onrender.com/delete_remainder", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: deleteEmail,
          disease: selectedDisease,
        }),
      })
      const result = await response.json()
      setMessage(result.message)
      if (response.ok) {
        setDiseases(diseases.filter((d) => d !== selectedDisease))
        setSelectedDisease("")
      }
    } catch (error) {
      setMessage("Error deleting remainder")
    }
  }

  return (
    <div className="hcr-remainder-container">
      <br></br><br></br><br></br>

      <div className="hcr-main-content">
        <div className="hcr-tab-navigation">
          <button
            className={activeTab === "add" ? "hcr-tab-button hcr-tab-active" : "hcr-tab-button"}
            onClick={() => setActiveTab("add")}
          >
            <span className="hcr-tab-icon">➕</span>
            Add Health Reminders
          </button>
          <button
            className={activeTab === "delete" ? "hcr-tab-button hcr-tab-active" : "hcr-tab-button"}
            onClick={() => setActiveTab("delete")}
          >
            <span className="hcr-tab-icon">🗑️</span>
            Manage Reminders
          </button>
        </div>

        {message && (
          <div className={`hcr-message ${message.includes('Error') || message.includes('could not') ? 'hcr-message-error' : 'hcr-message-success'}`}>
            <div className="hcr-message-content">
              {message.includes('Error') || message.includes('could not') ? '⚠️' : '✅'} {message}
            </div>
          </div>
        )}

        {activeTab === "add" && (
          <div className="hcr-form-container">
            <div className="hcr-form-header">
              <h2 className="hcr-form-title">Patient Registration</h2>
              <p className="hcr-form-description">Please provide accurate information for personalized health reminders</p>
            </div>
            
            <form onSubmit={handleAddRemainder} className="hcr-form">
              <div className="hcr-form-row">
                <div className="hcr-form-group">
                  <label className="hcr-label">Full Name *</label>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleInputChange} 
                    required 
                    className="hcr-input"
                    placeholder="Enter patient's full name"
                  />
                </div>

                <div className="hcr-form-group">
                  <label className="hcr-label">Gender *</label>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleInputChange} 
                    required
                    className="hcr-select"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="hcr-form-row">
                <div className="hcr-form-group">
                  <label className="hcr-label">Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="120"
                    className="hcr-input"
                    placeholder="Patient age"
                  />
                </div>

                <div className="hcr-form-group">
                  <label className="hcr-label">Email Address *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                    className="hcr-input"
                    placeholder="patient@example.com"
                  />
                </div>
              </div>

              <div className="hcr-form-group hcr-full-width">
                <label className="hcr-label">Medical Condition *</label>
                <input 
                  type="text" 
                  name="disease" 
                  value={formData.disease} 
                  onChange={handleInputChange} 
                  required 
                  className="hcr-input"
                  placeholder="e.g., Diabetes, Hypertension, Asthma"
                />
              </div>

              <div className="hcr-form-group hcr-full-width">
                <label className="hcr-label">Symptoms & Concerns *</label>
                <textarea
                  name="complaint"
                  value={formData.complaint}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="hcr-textarea"
                  placeholder="Please provide detailed information about symptoms, current medications, and specific health concerns..."
                ></textarea>
              </div>

              <button type="submit" className="hcr-submit-button">
                <span className="hcr-button-icon">📋</span>
                Register Patient & Setup Reminders
              </button>
            </form>
          </div>
        )}

        {activeTab === "delete" && (
          <div className="hcr-form-container">
            <div className="hcr-form-header">
              <h2 className="hcr-form-title">Reminder Management</h2>
              <p className="hcr-form-description">Search and manage existing health reminders</p>
            </div>

            <div className="hcr-search-section">
              <div className="hcr-form-group hcr-full-width">
                <label className="hcr-label">Patient Email Address</label>
                <div className="hcr-email-search">
                  <input
                    type="email"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    placeholder="Enter registered email address"
                    className="hcr-input hcr-search-input"
                  />
                  <button onClick={handleEmailSearch} className="hcr-search-button">
                    <span className="hcr-button-icon">🔍</span>
                    Search Records
                  </button>
                </div>
              </div>
            </div>

            {diseases.length > 0 && (
              <div className="hcr-results-section">
                <div className="hcr-form-group hcr-full-width">
                  <label className="hcr-label">Active Health Reminders</label>
                  <select 
                    value={selectedDisease} 
                    onChange={(e) => setSelectedDisease(e.target.value)}
                    className="hcr-select"
                  >
                    <option value="">Select condition to manage</option>
                    {diseases.map((disease, index) => (
                      <option key={index} value={disease}>
                        {disease}
                      </option>
                    ))}
                  </select>

                  {selectedDisease && (
                    <div className="hcr-delete-section">
                      <div className="hcr-warning-box">
                        <span className="hcr-warning-icon">⚠️</span>
                        <p>You are about to remove the health reminder for <strong>{selectedDisease}</strong>. This action cannot be undone.</p>
                      </div>
                      <button onClick={handleDeleteRemainder} className="hcr-delete-button">
                        <span className="hcr-button-icon">🗑️</span>
                        Remove Selected Reminder
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Remainder
