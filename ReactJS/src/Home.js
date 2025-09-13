"use client"

import { useState, useEffect } from "react"
import "./Home.css"

function Home() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [statsVisible, setStatsVisible] = useState(false)

  const features = [
    {
      title: "Symptom Checker",
      description:
        "Advanced AI-powered symptom analysis to help identify potential health conditions and provide preliminary assessments.",
      icon: "🩺",
    },
    {
      title: "24/7 Availability",
      description:
        "Round-the-clock healthcare support and monitoring, ensuring you have access to medical assistance anytime.",
      icon: "🕐",
    },
    {
      title: "Medicine Search Engine",
      description:
        "Comprehensive database of medications with AI-powered search, interactions checker, and dosage recommendations.",
      icon: "💊",
    },
    {
      title: "AI Personal Chatbot",
      description:
        "Intelligent healthcare assistant that learns from your medical history to provide personalized health guidance.",
      icon: "🤖",
    },
    {
      title: "Hospitals Availability",
      description:
        "Real-time hospital capacity tracking, appointment scheduling, and emergency room wait time monitoring.",
      icon: "🏥",
    },
  ]

  const stats = [
    { number: "99.7%", label: "Diagnostic Accuracy" },
    { number: "24/7", label: "Availability" },
    { number: "500K+", label: "Patients Served" },
    { number: "50+", label: "Healthcare Partners" },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [features.length])

  useEffect(() => {
    const handleScroll = () => {
      const statsSection = document.getElementById("stats")
      if (statsSection) {
        const rect = statsSection.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setStatsVisible(true)
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="home-container">
      <header className="main-header">
        <div className="header-content">
          <h1>AI Healthcare Platform</h1>
          <p className="header-subtitle">Revolutionizing Healthcare with AI</p>
        
          <button
            className="start-now-btn"
            onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}
          >
            Start Now
          </button>
        </div>
      </header>

      <section className="hero-spacer"></section>

      <section id="stats" className="stats-section">
        <div className="container">
          <h2>Platform Performance Metrics</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className={`stat-card ${statsVisible ? "animate" : ""}`}>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="features-overview">
        <div className="container">
          <h2>Advanced AI Capabilities</h2>
          <div className="features-showcase">
            <div className="feature-tabs">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`feature-tab ${activeFeature === index ? "active" : ""}`}
                  onClick={() => setActiveFeature(index)}
                >
                  <span className="feature-icon">{feature.icon}</span>
                  <span className="feature-title">{feature.title}</span>
                </div>
              ))}
            </div>
            <div className="feature-content">
              <div className="feature-display">
                <h3>{features[activeFeature].title}</h3>
                <p>{features[activeFeature].description}</p>
                <div className="feature-metrics">
                  <div className="metric">
                    <span className="metric-value">98.5%</span>
                    <span className="metric-label">Accuracy Rate</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">&lt;2s</span>
                    <span className="metric-label">Response Time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="technology-section">
        <div className="container">
          <h2>Cutting-Edge Technology Stack</h2>
          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-icon">🤖</div>
              <h3>Machine Learning</h3>
              <p>
                Deep neural networks trained on millions of medical cases for accurate pattern recognition and
                diagnosis.
              </p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">🔬</div>
              <h3>Natural Language Processing</h3>
              <p>
                Advanced NLP algorithms that understand medical terminology and patient descriptions with human-like
                comprehension.
              </p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">📡</div>
              <h3>Real-time Analytics</h3>
              <p>
                Continuous data processing and analysis providing instant insights and recommendations for healthcare
                providers.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      <section className="integration-section">
        <div className="container">
          <div className="integration-content">
            <div className="integration-text">
              <h2>Seamless Healthcare Integration</h2>
              <p>
                Our platform integrates effortlessly with existing healthcare systems, electronic health records, and
                medical devices. Experience unified healthcare management with real-time data synchronization and
                comprehensive patient insights.
              </p>
              <ul className="integration-features">
                <li>✓ EHR System Integration</li>
                <li>✓ Medical Device Connectivity</li>
                <li>✓ Laboratory Information Systems</li>
                <li>✓ Telemedicine Platforms</li>
                <li>✓ Pharmacy Management Systems</li>
              </ul>
              <button className="btn-primary">Explore Integrations</button>
            </div>
            <div className="integration-visual">
              <div className="integration-diagram">
                <div className="central-hub">AI Platform</div>
                <div className="integration-point point-1">EHR</div>
                <div className="integration-point point-2">Devices</div>
                <div className="integration-point point-3">Labs</div>
                <div className="integration-point point-4">Pharmacy</div>
                <div className="connection-line line-1"></div>
                <div className="connection-line line-2"></div>
                <div className="connection-line line-3"></div>
                <div className="connection-line line-4"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="video-section">
        <div className="container">
          <h2>See AI Healthcare in Action</h2>
          <p className="video-intro">
            Discover how artificial intelligence is transforming modern healthcare through advanced diagnostics,
            predictive analytics, and personalized treatment approaches.
          </p>
          <div className="video-container">
            <iframe
              src="https://www.youtube.com/embed/qFM1dXFAtJ8?si=B78vH8oOugBRseK7"
              frameBorder="0"
              allowFullScreen
              title="Revolutionizing Healthcare with AI"
              className="healthcare-video"
            ></iframe>
          </div>
        </div>
      </section>

      <footer className="main-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>AI Healthcare Platform</h3>
              <p>Revolutionizing healthcare through artificial intelligence and advanced medical technology.</p>
            </div>
            <div className="footer-section">
              <h4>Platform</h4>
              <ul>
                <li>Features</li>
                <li>Integrations</li>
                <li>Security</li>
                <li>API Documentation</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Training</li>
                <li>System Status</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li>About Us</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 AI Healthcare Platform. All rights reserved. | HIPAA Compliant | ISO 27001 Certified</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

