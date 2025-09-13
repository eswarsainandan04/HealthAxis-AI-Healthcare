from flask import Flask, render_template, request, jsonify
import os
import google.generativeai as genai
from flask_cors import CORS

# Configure the generative AI with the API key
api_key = os.environ.get('API_KEY', 'AIzaSyBS2x-DOlW8CZZJrHOtJneECzZYxz1sTRs')
genai.configure(api_key=api_key)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Conversation context
conversation_context = {}

# Doctor role prompts
DOCTOR_ROLES = {
    "general": "You are a general practitioner with extensive medical knowledge. You provide comprehensive healthcare advice and can handle a wide range of medical conditions.",
    "dentist": "You are a dentist expert specializing in oral health, dental care, teeth problems, gum diseases, and dental procedures. You focus on dental and oral health issues.",
    "cardiologist": "You are a cardiology expert specializing in heart conditions, cardiovascular diseases, blood pressure issues, and heart-related symptoms.",
    "dermatologist": "You are a dermatology expert specializing in skin conditions, skin diseases, rashes, acne, and all skin-related health issues.",
    "neurologist": "You are a neurology expert specializing in brain and nervous system disorders, headaches, migraines, and neurological conditions.",
    "orthopedist": "You are an orthopedic expert specializing in bone, joint, muscle, and skeletal system problems and injuries.",
    "pediatrician": "You are a pediatrician expert specializing in children's health, childhood diseases, and medical care for infants, children, and adolescents.",
    "psychiatrist": "You are a psychiatry expert specializing in mental health, psychological disorders, anxiety, depression, and emotional well-being.",
    "gynecologist": "You are a gynecology expert specializing in women's reproductive health, pregnancy, menstrual issues, and female health concerns.",
    "ophthalmologist": "You are an ophthalmology expert specializing in eye health, vision problems, eye diseases, and eye-related medical conditions."
}

def is_similar(new_question, asked_questions):
    """Check if the new question is more than 50% similar to any previously asked question."""
    new_words = set(new_question.lower().split())
    for question in asked_questions:
        old_words = set(question.lower().split())
        similarity = len(new_words & old_words) / max(len(new_words), len(old_words))
        if similarity > 0.5:
            return True
    return False

@app.route('/chat', methods=['POST'])
def chat():
    global conversation_context
    
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        user_input = data.get('message', '').strip()
        doctor_type = data.get('doctorType', 'general')

        if not user_input:
            return jsonify({"response": "Please enter a message."})

        # Store doctor type in context
        if "doctor_type" not in conversation_context:
            conversation_context["doctor_type"] = doctor_type

        # Initial setup for user details
        if "step" not in conversation_context:
            conversation_context["step"] = "ask_name"
            role_intro = DOCTOR_ROLES.get(doctor_type, DOCTOR_ROLES["general"])
            return jsonify({"response": f"Hello! I am your AI {doctor_type.title()} specialist. {role_intro} What's your name?"})

        elif conversation_context["step"] == "ask_name":
            conversation_context["name"] = user_input
            conversation_context["step"] = "ask_age"
            return jsonify({"response": f"Hello {user_input}, what's your age?"})

        elif conversation_context["step"] == "ask_age":
            conversation_context["age"] = user_input
            conversation_context["step"] = "ask_address"
            return jsonify({"response": "Could you tell me your location/address?"})

        elif conversation_context["step"] == "ask_address":
            conversation_context["address"] = user_input
            conversation_context["step"] = "ask_symptoms"
            return jsonify({"response": "Please describe the symptoms or health concerns you are experiencing?"})

        elif conversation_context["step"] == "ask_symptoms":
            conversation_context["symptoms"] = user_input
            conversation_context["step"] = "ask_questions"
            conversation_context["questions_asked"] = 0
            conversation_context["responses"] = {}
            conversation_context["asked_questions"] = []
            return jsonify({"response": "I understand. Let me ask you a few more specific questions to provide you with the best possible assessment."})

        elif conversation_context["step"] == "ask_questions":
            # Store the user's response to the last question
            if conversation_context["questions_asked"] > 0:
                conversation_context["responses"][f"question_{conversation_context['questions_asked']}"] = user_input

            if conversation_context["questions_asked"] < 3:
                conversation_context["questions_asked"] += 1
                try:
                    doctor_role = DOCTOR_ROLES.get(conversation_context["doctor_type"], DOCTOR_ROLES["general"])
                    user_prompt = (
                        f"{doctor_role} "
                        f"The patient reported these symptoms: {conversation_context['symptoms']}. "
                        f"Ask ONE specific, clear follow-up question to gather more diagnostic information. "
                        f"Keep it professional and concise. "
                        f"Avoid asking questions similar to these already asked: {conversation_context['asked_questions']}. "
                        f"Focus on {conversation_context['doctor_type']} specialty areas."
                    )

                    while True:
                        response = genai.GenerativeModel("gemini-2.0-flash-exp").generate_content(user_prompt)
                        question = response.text.strip()
                        if not is_similar(question, conversation_context["asked_questions"]):
                            conversation_context["asked_questions"].append(question)
                            return jsonify({"response": question})
                except Exception as e:
                    print(f"AI Generation Error: {str(e)}")
                    return jsonify({"response": "I'm having trouble generating the next question. Could you provide more details about your symptoms or any specific concerns you have?"})

            else:
                conversation_context["step"] = "final_response"
                return jsonify({"response": "Thank you for providing all the information. Let me analyze your symptoms and provide you with a comprehensive assessment."})

        elif conversation_context["step"] == "final_response":
            try:
                doctor_role = DOCTOR_ROLES.get(conversation_context["doctor_type"], DOCTOR_ROLES["general"])
                user_prompt = (
                    f"{doctor_role} "
                    f"Based on Name: {conversation_context['name']}, Age: {conversation_context['age']}, "
                    f"Address: {conversation_context['address']}. Symptoms: {conversation_context['symptoms']}. "
                    f"Responses to follow-up questions: {conversation_context['responses']}. "
                    "Provide a very short summary with the following sections: "
                    "1. **Likely Diagnosis**: (brief diagnosis) "
                    "2. **Medical Prescription**: (brief prescription) "
                    "3. **Precautions**: (brief precautions) "
                    "4. **Hospitals to Visit**: (list 5 hospitals near the address) "
                )
                
                response = genai.GenerativeModel("gemini-2.0-flash-exp").generate_content(user_prompt)
                
                # Get nearby hospitals
                hospitals_prompt = f"List 3-5 reputable hospitals or medical centers near {conversation_context['address']} that have {conversation_context['doctor_type']} specialists."
                try:
                    hospitals_response = genai.GenerativeModel("gemini-2.0-flash-exp").generate_content(hospitals_prompt)
                    hospitals_text = hospitals_response.text
                except Exception as e:
                    hospitals_text = "Please consult your local medical directory for nearby healthcare facilities."

                final_response = response.text.replace("**", "")
                final_response += f"\n\n5. **Recommended Healthcare Facilities:**\n{hospitals_text} in few words"
                final_response += f"\n\n6. **Disclaimer:** This assessment is for informational purposes only. Please consult with a qualified healthcare professional for proper diagnosis and treatment."
                final_response += f"\n\nThank you for using our AI {conversation_context['doctor_type'].title()} consultation service. Take care!"

                patient_data = {
                    "name": conversation_context.get("name", "N/A"),
                    "age": conversation_context.get("age", "N/A"),
                    "address": conversation_context.get("address", "N/A"),
                    "doctor_type": conversation_context.get("doctor_type", "general"),
                    "symptoms": conversation_context.get("symptoms", "N/A")
                }

                # Reset conversation
                conversation_context = {}
                return jsonify({
                    "response": final_response,
                    "patientData": patient_data
                })
                
            except Exception as e:
                print(f"Final Response Error: {str(e)}")
                conversation_context = {}
                return jsonify({"response": "I apologize, but I'm experiencing technical difficulties. Please consult with a healthcare professional directly for proper medical advice. You may also try starting a new consultation."})

    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({"error": "Server error occurred. Please try again."}), 500

@app.route('/reset', methods=['POST'])
def reset_conversation():
    global conversation_context
    conversation_context = {}
    return jsonify({"status": "reset"})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Server is running"})

if __name__ == '__main__':
    app.run(debug=True)
