import React, { useState } from 'react';
import './styles.css';

const DiseasePrediction = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [predictedDisease, setPredictedDisease] = useState('');
  const [diseaseDetails, setDiseaseDetails] = useState(null);
  const apiUrl = 'http://127.0.0.1:5001/predict';

  const symptoms = [
    // Your symptom list goes here
    "headache", "loss of balance", "nausea", "spinning movements", "unsteadiness", "vomiting",
    "blackheads", "pus filled pimples", "scurring", "skin rash", "extra marital contacts", 
    "high fever", "muscle wasting", "patches in throat", "chills", "continuous sneezing", 
    "shivering", "watering from eyes", "movement stiffness", "muscle weakness", "painful walking", 
    "stiff neck", "swelling joints", "shortness of breath", "wheezing", "chest tightness", 
    "coughing", "chronic coughing", "phlegm production", "chest discomfort", "mood swings", 
    "manic episodes", "depressive episodes", "lump in breast", "nipple changes", "skin changes", 
    "extreme thirst", "blurry vision", "excessive urination", "breathlessness", "cough", 
    "family history", "fatigue", "mucoid sputum", "mucus production", "unexplained bruising", 
    "bone fractures", "joint pain", "back pain", "dizziness", "neck pain", "weakness in limbs", 
    "lethargy", "loss of appetite", "malaise", "mild fever", "red spots over body", 
    "swelled lymph nodes", "itching", "itchy rash", "fever", "blisters", "persistent cough", 
    "severe diarrhea", "dehydration", "abdominal cramps", "rapid heart rate", "sunken eyes", 
    "abdominal pain", "yellowing of eyes", "yellowish skin", "chronic cough", "abdominal bloating", 
    "diarrhea", "foul-smelling stool", "blood in stool", "weight loss", "chest pain", 
    "congestion", "loss of smell", "muscle pain", "phlegm", "redness of eyes", "runny nose", 
    "sinus pressure", "throat irritation", "loss of taste/smell", "unusual bleeding", 
    "dark spots", "weight gain", "moon face", "high blood pressure", "abdominal discomfort", 
    "bloating", "gas", "pain behind the eyes", "severe headache", "joint/muscle pain", 
    "bleeding", "rash", "bleeding gums", "low platelet count", "persistent sadness", 
    "loss of interest", "insomnia", "blurred and distorted vision", "excessive hunger", 
    "increased appetite", "irregular sugar level", "obesity", "polyuria", "restlessness", 
    "bloody stool", "constipation", "irritation in anus", "pain during bowel movements", 
    "pain in anal region", "burning micturition", "spotting urination", "stomach pain", 
    "itchy", "red", "inflamed skin", "dryness", "severe body aches", "joint stiffness", 
    "difficulty swallowing", "hoarseness", "widespread pain", "sleep disturbances", 
    "cognitive issues", "burning sensation", "frequent urination", "dischromic patches", 
    "nodal skin eruptions", "skin rashes", "swollen joints", "diarrhoea", "heartburn", 
    "regurgitation", "intense headaches", "fainting", "elevated body temperature", 
    "sweating", "feeling weak", "feeling unwell", "illness", "excessive worry", "muscle tension", 
    "acidity", "ulcers on tongue", "swelling", "rapid heartbeat", "breathing difficulty", 
    "joint inflammation", "dark urine", "jaundice", "clay-colored stool", "receiving blood transfusion", 
    "receiving unsterile injections", "yellow urine", "acute liver failure", "coma", 
    "stomach bleeding", "swollen lymph nodes", "recurrent infections", "night sweats", 
    "chronic diarrhea", "mouth ulcers", "lack of concentration", "abnormal menstruation", 
    "fast heart rate", "irritability", "anxiety", "drying and tingling lips", "palpitations", 
    "slurred speech", "brittle nails", "cold hands and feet", "depression", "enlarged thyroid", 
    "puffy face and eyes", "swollen extremities", "blister", "red sore around nose", 
    "yellow crust ooze", "sore throat", "body aches", "diarrhea/constipation", "confusion", 
    "seizures", "sensitivity to light", "severe back pain", "blood in urine", 
    "frequent infections", "easy bruising", "sharp pelvic pain", "pain during intercourse", 
    "abdominal swelling", "severe itching", "red eyes", "rash starting on the face", 
    "rapid breathing", "indigestion", "visual disturbances", "intrusive thoughts", 
    "compulsive behaviors", "hip joint pain", "knee pain", "stiffness", "reduced flexibility", 
    "urine discoloration", "severe abdominal pain", "fragile bones", "loss of height", 
    "fractures", "sharp back pain", "altered sensorium", "weakness of one body side", 
    "internal itching", "passage of gases", "rusty sputum", "irregular periods", "acne", 
    "infertility", "tremors", "slow movements", "rigid muscles", "poor balance", "urinary issues", 
    "pelvic pain", "unexplained fatigue", "weight changes", "inflammatory nails", 
    "silver like dusting", "skin peeling", "small dents in nails", "redness", "bone pain", 
    "delayed growth", "skeletal deformities", "facial redness", "visible blood vessels", 
    "coughing blood", "hallucinations", "delusions", "disorganized speech", "new moles", 
    "bleeding lesions", "inability to focus", "social withdrawal", "loud snoring", 
    "gasping during sleep", "daytime fatigue", "severe dehydration", "sudden numbness", 
    "vision problems", "difficulty speaking", "persistent fatigue", "muscle stiffness", 
    "blood in sputum", "belly pain", "toxic look (typhos)", "rectal bleeding", "slow wound healing", 
    "bladder discomfort", "continuous feel of urine", "foul smell of urine", "cloudy urine", 
    "bruising", "cramps", "prominent veins on calf", "swollen blood vessels", "swollen legs", 
    "white patches of skin", "loss of pigment", "persistent bloating", "severe coughing fits", 
    "sneezing", "blurred vision", "excessive thirst", "muscle aches", "pain in head", 
    "high body temperature", "weakness","cold"
  ];

  const iconMapping = {
    diseaseDescription: 'icons/diseases.jpg',
    consultationDescription: 'icons/consultation.jpg',
    tests: 'icons/Tests.jpg',
    nutritionDescription: 'icons/Nutrition.jpg',
    precaution: 'icons/Precaution.jpg',
    medicine: 'icons/medicine.jpg',
    treatmentDuration: 'icons/duration.jpg'
  };

  const filteredSymptoms = symptoms.filter(symptom => symptom.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectSymptom = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleRemoveSymptom = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
  };

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom.');
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: selectedSymptoms }),
      });

      const result = await response.json();

      if (response.ok) {
        setPredictedDisease(result.predicted_disease);
        setDiseaseDetails({
          diseaseDescription: result.disease_description,
          medicine: result.medicine,
          precaution: result.precaution,
          tests: result.tests,
          treatmentDuration: result.treatment_duration,
          consultationDescription: result.consultation_description,
          nutritionDescription: result.nutrition_description
        });
      } else {
        alert(result.error || 'Failed to predict disease.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while predicting the disease.');
    }
  };
  const keyMapping = {
    diseaseDescription: "Disease Description",
    medicine: "Recommended Medicine",
    precaution: "Precautionary Measures",
    tests: "Recommended Tests",
    treatmentDuration: "Treatment Duration",
    consultationDescription: "Consultation Advice",
    nutritionDescription: "Nutritional Advice"
  };
  

  return (
    <div className="disease-prediction">
    <br></br><br></br><br></br>
      <h1>Enter your Symptoms</h1>
      <br></br>
      <p><strong>Note:</strong>Select Multiple Symptoms</p>

      <div className="search-container">
        <input
          type="text"
          id="search-input"
          placeholder="Search symptoms..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <ul id="results-list">
          {filteredSymptoms.map((symptom, index) => (
            <li key={index} onClick={() => handleSelectSymptom(symptom)}>
              {symptom}
            </li>
          ))}
        </ul>
      </div>

      <div className="selected-symptoms">
        <h4>Selected Symptoms</h4>
        <ul>
          {selectedSymptoms.map((symptom, index) => (
            <li key={index}>
              {symptom}
              <button onClick={() => handleRemoveSymptom(symptom)}>X</button>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleSubmit}>Submit</button>

      {predictedDisease && (
        <div className="prediction-result">
          <h4>Predicted Disease:</h4>
          <p>{predictedDisease}</p>
        </div>
      )}

{diseaseDetails && (
  <div className="disease-details">
    {Object.entries(diseaseDetails).map(([key, value]) => (
      <div className="data-card" key={key}>
        <img src={`/${iconMapping[key] || 'default.jpg'}`} alt={key} className="data-icon" width="100" height="100" />
        <div className="data-content">
          <h4>{keyMapping[key] || key}</h4> {/* Show proper label */}
          <p>{value}</p>
        </div>
      </div>
    ))}
  </div>
)}

    </div>
  );
};

export default DiseasePrediction;
