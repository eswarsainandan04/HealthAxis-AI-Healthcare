from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from PIL import Image
import PyPDF2
import os
import tempfile
import time
from google.api_core import exceptions

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# Set up Gemini AI API key (replace with your actual API key)
api_key = "YOUR_GEMINI_API_KEY"
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

# Constants for retries
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds

def analyze_medical_report(content, content_type):
    prompt = """
    Analyze this medical report concisely. Provide the following sections:
    1. Patient Findings: [patient Detailed findings from the report]
    2. Diagnoses: [Detailed diagnoses from the report]
    3. Disease Report: [Highlight the disease name if any]
    4. Recommendations: [Recommendations based on the report]
    and please provide more details for every points
    """

    for attempt in range(MAX_RETRIES):
        try:
            if content_type == "image":
                response = model.generate_content([prompt, content])
            else:  # text
                response = model.generate_content(f"{prompt}\n\n{content}")
            
            # Parse the response into sections
            analysis_text = response.text
            sections = {
                "patient_findings": "",
                "diagnoses": "",
                "disease_report": "",
                "recommendations": ""
            }

            # Split the response into sections based on the headings
            current_section = None
            for line in analysis_text.split('\n'):
                if "Patient Findings:" in line:
                    current_section = "patient_findings"
                    sections[current_section] = line.replace("Patient Findings:", "").strip()
                elif "Diagnoses:" in line:
                    current_section = "diagnoses"
                    sections[current_section] = line.replace("Diagnoses:", "").strip()
                elif "Disease Report:" in line:
                    current_section = "disease_report"
                    sections[current_section] = line.replace("Disease Report:", "").strip()
                elif "Recommendations:" in line:
                    current_section = "recommendations"
                    sections[current_section] = line.replace("Recommendations:", "").strip()
                elif current_section:
                    sections[current_section] += "\n" + line.strip()

            return sections
        except exceptions.GoogleAPIError:
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY)
            else:
                return fallback_analysis(content, content_type)

def fallback_analysis(content, content_type):
    if content_type == "image":
        return {
            "patient_findings": "Error analyzing the image. Please try again later.",
            "diagnoses": "",
            "disease_report": "",
            "recommendations": ""
        }
    else:  # text
        word_count = len(content.split())
        return {
            "patient_findings": f"Fallback Analysis: {word_count} words detected. Review manually.",
            "diagnoses": "",
            "disease_report": "",
            "recommendations": ""
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
        tmp_file_path = tmp_file.name  # Store the temp file path

    analysis = {}
    
    try:
        if file_type == "image":
            image = Image.open(tmp_file_path)
            analysis = analyze_medical_report(image, "image")
            image.close()
        else:  # PDF
            pdf_text = extract_text_from_pdf(tmp_file_path)
            analysis = analyze_medical_report(pdf_text, "text")

    finally:
        os.unlink(tmp_file_path)

    return jsonify(analysis)

if __name__ == '__main__':
    app.run(debug=True, port=5015)