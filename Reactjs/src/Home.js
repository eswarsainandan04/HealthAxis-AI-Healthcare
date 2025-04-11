import React from "react";
import "./Home.css";

function Home() {
  return (
    <div>
      <header>
        <h1>Personal AI Healthcare</h1>
      </header>
      <div className="hero">
        <h2>Revolutionizing Healthcare with AI</h2>
        <p>Your personalized, AI-powered health companion, available 24/7.</p>
        <a href="#features">Get Started</a>
      </div>
      <div className="container">
        <section id="features" className="features-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>24/7 Emergency Support</h3>
              <p>Receive instant assistance during critical medical emergencies.</p>
            </div>
            <div className="feature-card">
              <h3>Symptom Checker</h3>
              <p>AI-driven analysis to help guide your next steps with confidence.</p>
            </div>
            <div className="feature-card">
              <h3>Secure Data</h3>
              <p>Your health data is encrypted and accessible only to you.</p>
            </div>
            <div className="feature-card">
              <h3>Personalized Treatment Plans</h3>
              <p>Receive tailored health solutions based on your medical history.</p>
            </div>
          </div>
        </section>
        <section id="ai" className="ai-section">
          <h2>About AI in Healthcare</h2>
          <div className="ai-content">
            <p>
              At <strong>Personal AI Healthcare</strong>, we are revolutionizing
              how healthcare is delivered. With cutting-edge AI technology, we
              empower individuals to manage their health efficiently. Our
              mission is to provide personalized, secure, and accessible
              healthcare anytime, anywhere.
            </p>
            <iframe
              src="https://www.youtube.com/embed/qFM1dXFAtJ8?si=B78vH8oOugBRseK7"
              frameBorder="0"
              allowFullScreen
              title="AI in Healthcare Video"
            ></iframe>
          </div>
        </section>
        <section id="about" className="about-section">
          <h2>About Us</h2>
          <div className="about-content">
            <img src="/us.jpg" alt="About Us" />
            <p>
              At <strong>Personal AI Healthcare</strong>, we are revolutionizing
              how healthcare is delivered. With cutting-edge AI technology, we
              empower individuals to manage their health efficiently. Our
              mission is to provide personalized, secure, and accessible
              healthcare anytime, anywhere.
            </p>
          </div>
        </section>
      </div>
      <footer>
        <p>&copy; 2025 Personal AI Healthcare. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
