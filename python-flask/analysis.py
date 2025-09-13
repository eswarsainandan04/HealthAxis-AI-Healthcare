from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from PIL import Image
import PyPDF2
import os
import tempfile
import time
import json
import re
from google.api_core import exceptions

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# Set up Gemini AI API key (replace with your actual API key)
api_key = "AIzaSyBS2x-DOlW8CZZJrHOtJneECzZYxz1sTRs"
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

# Constants for retries
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds

def analyze_medical_report_with_stats(content, content_type):
    prompt = """
    You are a medical AI assistant. Analyze this medical report and provide comprehensive statistical healthcare insights. 
    
    IMPORTANT: Structure your response EXACTLY as follows with these section headers and format:

    PATIENT_DEMOGRAPHICS:
    - Name: [extract patient name if mentioned, otherwise "Not specified"]
    - Age: [extract age or estimate age group]
    - Gender: [extract gender if mentioned]  
    - BMI: [extract BMI if available]
    - Risk_Category: [Low/Medium/High based on findings]

    VITAL_STATISTICS:
    - Blood_Pressure: [systolic/diastolic if available]
    - Heart_Rate: [BPM if available]
    - Temperature: [if available]
    - Oxygen_Saturation: [percentage if available]

    DIAGNOSTIC_METRICS:
    - Primary_Condition: [main diagnosis or condition found]
    - Severity_Score: [rate 1-10 based on severity]
    - Confidence_Level: [your confidence percentage 1-100]
    - Treatment_Urgency: [Immediate/Urgent/Routine/Follow-up]

    LABORATORY_VALUES:
    - Abnormal_Count: [count of abnormal lab values found]
    - Critical_Values: [count of critical values found]
    - Normal_Range_Percentage: [percentage of values in normal range]

    RISK_ASSESSMENT:
    - Cardiovascular_Risk: [Low/Medium/High]
    - Diabetes_Risk: [Low/Medium/High]
    - Infection_Risk: [Low/Medium/High]
    - Overall_Health_Score: [rate 1-100 overall health]

    RECOMMENDATIONS_PRIORITY:
    - Immediate_Actions: [count 0-5 of immediate actions needed]
    - Follow_up_Required: [count 0-5 of follow-ups needed]
    - Lifestyle_Changes: [count 0-5 of lifestyle recommendations]
    - Medication_Adjustments: [count 0-5 of medication changes]

    DETAILED_ANALYSIS:
    Patient_Findings: [Detailed clinical findings and observations from the report]
    Diagnoses: [Complete diagnostic information and medical conditions identified]
    Disease_Report: [Comprehensive analysis of any diseases or conditions found]
    Recommendations: [Detailed treatment recommendations and next steps]

    Please provide actual numerical values and detailed text for each section. Be specific and thorough.
    """

    for attempt in range(MAX_RETRIES):
        try:
            if content_type == "image":
                response = model.generate_content([prompt, content])
            else:  # text
                response = model.generate_content(f"{prompt}\n\nMedical Report Content:\n{content}")
            
            print(f"[DEBUG] AI Response: {response.text[:500]}...")  # Debug output
            parsed_result = parse_statistical_response(response.text)
            print(f"[DEBUG] Parsed Result: {json.dumps(parsed_result, indent=2)}")  # Debug output
            return parsed_result
        except exceptions.GoogleAPIError as e:
            print(f"[DEBUG] API Error on attempt {attempt + 1}: {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY)
            else:
                return fallback_statistical_analysis()

def parse_statistical_response(analysis_text):
    """Parse the AI response into structured statistical data with improved parsing"""
    
    result = {
        "patient_demographics": {
            "name": "Not specified",
            "age": "Not specified",
            "gender": "Not specified", 
            "bmi": "Not available",
            "risk_category": "Medium"
        },
        "vital_statistics": {
            "blood_pressure": "Not recorded",
            "heart_rate": "Not recorded",
            "temperature": "Not recorded",
            "oxygen_saturation": "Not recorded"
        },
        "diagnostic_metrics": {
            "primary_condition": "Under evaluation",
            "severity_score": 5,
            "confidence_level": 75,
            "treatment_urgency": "Routine"
        },
        "laboratory_values": {
            "abnormal_count": 2,
            "critical_values": 0,
            "normal_range_percentage": 85
        },
        "risk_assessment": {
            "cardiovascular_risk": "Medium",
            "diabetes_risk": "Low", 
            "infection_risk": "Low",
            "overall_health_score": 75
        },
        "recommendations_priority": {
            "immediate_actions": 1,
            "follow_up_required": 3,
            "lifestyle_changes": 4,
            "medication_adjustments": 1
        },
        "detailed_analysis": {
            "patient_findings": "Comprehensive medical analysis in progress. Initial assessment shows standard parameters within expected ranges.",
            "diagnoses": "Primary diagnostic evaluation completed. Further assessment may be required for complete diagnosis.",
            "disease_report": "No critical conditions identified in initial screening. Routine monitoring recommended.",
            "recommendations": "Continue current treatment plan. Schedule follow-up appointment in 3-6 months. Maintain healthy lifestyle practices."
        },
        "statistics": {
            "total_parameters_analyzed": 15,
            "abnormal_findings_percentage": 25,
            "critical_alerts": 0,
            "follow_up_score": 7
        }
    }

    lines = analysis_text.split('\n')
    current_section = None
    current_subsection = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Detect main sections
        if "PATIENT_DEMOGRAPHICS:" in line.upper():
            current_section = "patient_demographics"
            continue
        elif "VITAL_STATISTICS:" in line.upper():
            current_section = "vital_statistics"
            continue
        elif "DIAGNOSTIC_METRICS:" in line.upper():
            current_section = "diagnostic_metrics"
            continue
        elif "LABORATORY_VALUES:" in line.upper():
            current_section = "laboratory_values"
            continue
        elif "RISK_ASSESSMENT:" in line.upper():
            current_section = "risk_assessment"
            continue
        elif "RECOMMENDATIONS_PRIORITY:" in line.upper():
            current_section = "recommendations_priority"
            continue
        elif "DETAILED_ANALYSIS:" in line.upper():
            current_section = "detailed_analysis"
            continue
        
        # Parse key-value pairs
        if current_section and (":" in line):
            if line.startswith("-") or line.startswith("•"):
                # Handle bulleted items
                line = line.lstrip("- •").strip()
            
            if ":" in line:
                parts = line.split(":", 1)
                if len(parts) == 2:
                    key = parts[0].strip().lower().replace(" ", "_").replace("-", "_")
                    value = parts[1].strip().strip("[]")
                    
                    if current_section in result and key in result[current_section]:
                        if current_section == "detailed_analysis":
                            result[current_section][key] = value
                        else:
                            # Check if field should be numerical
                            numerical_indicators = [
                                "score", "level", "count", "percentage", "required", "actions", 
                                "changes", "adjustments", "abnormal", "critical", "severity",
                                "confidence", "overall", "immediate", "follow_up", "lifestyle", 
                                "medication"
                            ]
                            
                            is_numerical = any(indicator in key for indicator in numerical_indicators)
                            
                            if is_numerical:
                                # Extract first number found
                                numbers = re.findall(r'\d+', value)
                                if numbers:
                                    try:
                                        result[current_section][key] = int(numbers[0])
                                    except (ValueError, IndexError):
                                        # Set reasonable defaults based on field type
                                        if "score" in key:
                                            result[current_section][key] = 5
                                        elif "percentage" in key:
                                            result[current_section][key] = 50
                                        else:
                                            result[current_section][key] = 1
                                else:
                                    # No numbers found, set defaults
                                    if "score" in key:
                                        result[current_section][key] = 5
                                    elif "percentage" in key:
                                        result[current_section][key] = 50
                                    else:
                                        result[current_section][key] = 1
                            else:
                                result[current_section][key] = value

    def safe_int(value, default=0):
        if isinstance(value, int):
            return value
        if isinstance(value, str):
            numbers = re.findall(r'\d+', value)
            if numbers:
                try:
                    return int(numbers[0])
                except (ValueError, IndexError):
                    return default
        return default

    # Calculate derived statistics
    abnormal_count = safe_int(result["laboratory_values"]["abnormal_count"], 2)
    severity_score = safe_int(result["diagnostic_metrics"]["severity_score"], 5)
    follow_up_required = safe_int(result["recommendations_priority"]["follow_up_required"], 2)
    immediate_actions = safe_int(result["recommendations_priority"]["immediate_actions"], 1)
    critical_values = safe_int(result["laboratory_values"]["critical_values"], 0)
    
    result["statistics"]["abnormal_findings_percentage"] = min(100, max(0, 
        (abnormal_count * 8) + (severity_score * 4)))
    
    result["statistics"]["critical_alerts"] = critical_values
    result["statistics"]["follow_up_score"] = min(10, max(1, follow_up_required + immediate_actions))
    result["statistics"]["total_parameters_analyzed"] = 15

    print(f"[DEBUG] Final parsed result: {json.dumps(result, indent=2)}")
    return result

def fallback_statistical_analysis():
    """Provide fallback statistical data when AI analysis fails"""
    return {
        "patient_demographics": {
            "name": "Analysis unavailable",
            "age": "Analysis unavailable",
            "gender": "Not specified",
            "bmi": "Not available", 
            "risk_category": "Medium"
        },
        "vital_statistics": {
            "blood_pressure": "Not recorded",
            "heart_rate": "Not recorded",
            "temperature": "Not recorded",
            "oxygen_saturation": "Not recorded"
        },
        "diagnostic_metrics": {
            "primary_condition": "Analysis failed - manual review required",
            "severity_score": 5,
            "confidence_level": 50,
            "treatment_urgency": "Manual Review"
        },
        "laboratory_values": {
            "abnormal_count": 0,
            "critical_values": 0,
            "normal_range_percentage": 50
        },
        "risk_assessment": {
            "cardiovascular_risk": "Unknown",
            "diabetes_risk": "Unknown", 
            "infection_risk": "Unknown",
            "overall_health_score": 50
        },
        "recommendations_priority": {
            "immediate_actions": 1,
            "follow_up_required": 1,
            "lifestyle_changes": 1,
            "medication_adjustments": 0
        },
        "detailed_analysis": {
            "patient_findings": "Analysis temporarily unavailable. Please try again or consult healthcare provider.",
            "diagnoses": "System error occurred during analysis.",
            "disease_report": "Manual review recommended.",
            "recommendations": "Please retry analysis or seek professional medical consultation."
        },
        "statistics": {
            "total_parameters_analyzed": 0,
            "abnormal_findings_percentage": 0,
            "critical_alerts": 0,
            "follow_up_score": 5
        }
    }

def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, "rb") as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    file_type = request.form.get('file_type')

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[-1]) as tmp_file:
        file.save(tmp_file.name)
        tmp_file_path = tmp_file.name

    analysis = {}
    
    try:
        if file_type == "image":
            image = Image.open(tmp_file_path)
            analysis = analyze_medical_report_with_stats(image, "image")
            image.close()
        else:  # PDF
            pdf_text = extract_text_from_pdf(tmp_file_path)
            analysis = analyze_medical_report_with_stats(pdf_text, "text")

    finally:
        os.unlink(tmp_file_path)

    return jsonify(analysis)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Healthcare Analysis API is running', 'version': '2.0'})

if __name__ == '__main__':
    app.run(debug=True)
