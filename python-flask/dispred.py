from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Load the dataset
data = pd.read_csv("data.csv", encoding='ISO-8859-1')

# Preprocess the dataset
data['Symptom'] = data['Symptom'].apply(lambda x: [sym.strip().lower() for sym in x.split(",")])
all_symptoms = sorted({symptom for symptoms in data['Symptom'] for symptom in symptoms})

# Create a binary-encoded DataFrame for symptoms
encoded_data = pd.DataFrame(0, index=data.index, columns=all_symptoms)
for i, symptoms in enumerate(data['Symptom']):
    for symptom in symptoms:
        encoded_data.loc[i, symptom] = 1

# Merge encoded symptoms with the disease label
final_data = pd.concat([data['Disease'], encoded_data], axis=1)
X = final_data.drop('Disease', axis=1)
y = final_data['Disease']

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get symptoms from request
        symptoms = request.json.get('symptoms', [])
        print("Received symptoms:", symptoms)

        # Build input vector
        input_vector = pd.DataFrame(0, index=[0], columns=all_symptoms)
        for symptom in symptoms:
            if symptom.lower() in input_vector.columns:
                input_vector.at[0, symptom.lower()] = 1

        # Predict disease
        prediction = model.predict(input_vector)
        predicted_disease = prediction[0]
        print("Predicted disease:", predicted_disease)

        # Retrieve info from dataset
        matches = data[data['Disease'] == predicted_disease]
        if matches.empty:
            return jsonify({'error': 'No matching disease data found.'}), 404

        disease_info = matches.iloc[0]

        response = {
            'predicted_disease': predicted_disease,
            'medicine': disease_info.get('Medicine', 'N/A'),
            'precaution': disease_info.get('Precaution', 'N/A'),
            'tests': disease_info.get('Tests', 'N/A'),
            'treatment_duration': disease_info.get('Treatment Duration', 'N/A'),
            'disease_description': disease_info.get('Disease_Description', 'N/A'),
            'consultation_description': disease_info.get('Consultation_Description', 'N/A'),
            'nutrition_description': disease_info.get('Nutrition_Description', 'N/A')
        }

        print("Response data:", response)
        return jsonify(response)

    except Exception as e:
        print("Error occurred:", str(e))
        return jsonify({'error': str(e)}), 500

# Run app
if __name__ == '__main__':
    app.run(debug=True)
