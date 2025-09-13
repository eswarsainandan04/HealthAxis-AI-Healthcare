# HealthAxis – AI Healthcare Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Click%20Here-brightgreen)](https://healthaxis-ojy8.onrender.com/) 
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/eswarsainandan04/HealthAxis-AI-Healthcare)

---

## 💻 Project Overview

HealthAxis is an AI-driven healthcare platform that provides personalized medical services including **disease prediction, medicine search, report analysis, reminders, hospital directory, and consultation chatbot**. It leverages **machine learning, data visualization, and APIs** to deliver intelligent healthcare solutions.

---

## 🛠️ Tech Stack

- **Frontend:** React.js  
- **Backend:** Python Flask  
- **Database:** SQLite3  
- **Machine Learning:** scikit-learn  
- **APIs:** Gemini API  
- **Other Tools:** EmailJS, Leaflet.js

---

## 🌟 Features

1. **Overview Page**  
   - Provides a general summary of the platform and services available.

2. **Healthcare Services**
   - **Medical Search**: Search from **200,000+ medicines** stored in SQLite database.  
   - **Disease Prediction**: Enter symptoms to predict potential diseases using a **machine learning model** and receive tips.  
   - **Report Analysis**: Upload blood reports for **statistical analysis and visualizations** using Gemini API.

3. **Healthcare Reminder**  
   - Sends alerts every **6 hours** based on the user’s disease.  
   - Notifications via **EmailJS** integrated with Gemini API.

4. **Hospitals Directory**  
   - Displays **~70 hospitals in Vijayawada** using **Leaflet.js** and JSON data.  

5. **Consultation Chatbot**  
   - Select the type of doctor and chat with a specialist.  
   - Prescriptions can be **generated and downloaded** using Gemini API.

---

## 🖥️ Project Setup Instructions

### ✅ Prerequisites

Make sure you have the following installed:

- [Node.js & npm](https://nodejs.org/)  
- [Python 3.8+](https://www.python.org/)  
- Required Node.js and Python packages

---



```bash
cd reactjs
npm install    # Only required once
npm start


cd python-flask
pip install -r requirements.txt

python database.py      # Setup database
python chat.py          # Start chatbot service
python analysis.py      # Run analysis engine
python disped.py        # Start data display service
python remainder.py     # Start reminder service
