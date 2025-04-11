from flask import Flask, render_template, request, jsonify
import os
import google.generativeai as genai
from flask_cors import CORS  # Allow CORS for React front-end

# Ensure your API key is stored in an environment variable for security
os.environ['API_KEY'] = 'YOUR_GEMINI_API_KEY'

# Configure the generative AI with the API key
genai.configure(api_key=os.environ['API_KEY'])

# Initialize Flask app
app = Flask(__name__)

# Enable CORS to allow requests from React front-end
CORS(app)

# Conversation context
conversation_context = {}

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
    user_input = request.json.get('message', '').strip()

    if not user_input:
        return jsonify({"response": "Please enter a message."})

    # Initial setup for user details
    if "step" not in conversation_context:
        conversation_context["step"] = "ask_name"
        return jsonify({"response": "Hello! I am an AI Doctor, What's your name?"})

    elif conversation_context["step"] == "ask_name":
        conversation_context["name"] = user_input
        conversation_context["step"] = "ask_age"
        return jsonify({"response": f"Hello {user_input}, what's your age?"})

    elif conversation_context["step"] == "ask_age":
        conversation_context["age"] = user_input
        conversation_context["step"] = "ask_address"
        return jsonify({"response": "Tell me your address?"})

    elif conversation_context["step"] == "ask_address":
        conversation_context["address"] = user_input
        conversation_context["step"] = "ask_symptoms"
        return jsonify({"response": "Tell me the symptoms you are experiencing?"})

    elif conversation_context["step"] == "ask_symptoms":
        conversation_context["symptoms"] = user_input
        conversation_context["step"] = "ask_questions"
        conversation_context["questions_asked"] = 0
        conversation_context["responses"] = {}
        conversation_context["asked_questions"] = []  # Track asked questions
        return jsonify({"response": "Got it. Let me ask you a few more questions to understand better."})

    elif conversation_context["step"] == "ask_questions":
        # Store the user's response to the last question
        if conversation_context["questions_asked"] > 0:
            conversation_context["responses"][f"{conversation_context['questions_asked']}"] = user_input

        if conversation_context["questions_asked"] < 3:
            # Generate the next follow-up question
            conversation_context["questions_asked"] += 1
            try:
                user_prompt = (
                    f"User reported these symptoms: {conversation_context['symptoms']}. "
                    f"Ask a **simple and clear** follow-up question in one short sentence to get more details. "
                    f"Do not ask the same type of question that has already been asked: {conversation_context['asked_questions']}. "
                )

                while True:
                    response = genai.GenerativeModel("gemini-2.0-flash-exp").generate_content(user_prompt)
                    question = response.text.strip()
                    if not is_similar(question, conversation_context["asked_questions"]):
                        conversation_context["asked_questions"].append(question)
                        return jsonify({"response": question})
            except Exception as e:
                return jsonify({"response": "I couldn't generate the next question. Please describe your symptoms in more detail."})

        else:
            # Skip the duration question and proceed to final response
            conversation_context["step"] = "final_response"
            return jsonify({"response": "I have all the details I need. Let me provide you with a diagnosis and nearby hospitals, ok?"})

    elif conversation_context["step"] == "final_response":
        # Generate the diagnosis and hospitals based on the address
        try:
            user_prompt = (
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

            # Fetch nearby hospitals (for now, this is a placeholder for an actual implementation)
            user_address = conversation_context["address"]
            hospitals_prompt = f"List 3 hospitals near this address: {user_address}."
            try:
                hospitals_response = genai.GenerativeModel("gemini-2.0-flash-exp").generate_content(hospitals_prompt)
            except Exception as e:
                hospitals_response = "I couldn't find hospitals near your address. Please check online or consult locally."

            # Clean the final response
            final_response = response.text.replace("**", " ")

            final_response += f"\n\nNearby hospitals:\n{hospitals_response.text if isinstance(hospitals_response, object) else hospitals_response}"

            # Reset conversation to close the chat
            conversation_context = {}
            return jsonify({"response": final_response + "\n Thank you for using the AI Doctor. Take care!"})
        except Exception as e:
            conversation_context = {}
            return jsonify({"response": "Error: something went wrong or information not available. Please consult a doctor directly."})

if __name__ == '__main__':
    app.run(debug=True, port=5005)