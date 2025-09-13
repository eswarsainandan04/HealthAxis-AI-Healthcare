# HealthAxis – AI Healthcare Platform

**Live Demo:** [https://healthaxis-ojy8.onrender.com/](https://healthaxis-ojy8.onrender.com/)  
**GitHub Repository:** [https://github.com/eswarsainandan04/HealthAxis-AI-Healthcare](https://github.com/eswarsainandan04/HealthAxis-AI-Healthcare)

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

### 1. Frontend – React

1. Navigate to the React frontend folder:
```bash
cd reactjs


## 🖥️ Step-by-Step Instructions

### 1. Frontend - React

```bash
cd reactjs
npm install    # Run only once
npm start      # Start the React frontend


### 1. Start the Frontend

Navigate to the `reactjs` folder and start the React development server:

```bash
cd ReactJS

npm install   # Only required for the first time
npm start

cd python-flask

pip install requirements.txt

python database.py
python chat.py
python analysis.py
python disped.py
python remainder.py
