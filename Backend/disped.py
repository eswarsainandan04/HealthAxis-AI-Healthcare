from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Load the dataset
data = pd.read_csv("data.csv", encoding='ISO-8859-1')

# Preprocessing the dataset
data['Symptom'] = data['Symptom'].apply(lambda x: [sym.strip().lower() for sym in x.split(",")])
all_symptoms = sorted({symptom for symptoms in data['Symptom'] for symptom in symptoms})
encoded_data = pd.DataFrame(0, index=data.index, columns=all_symptoms)

for i, symptoms in enumerate(data['Symptom']):
    for symptom in symptoms:
        encoded_data.loc[i, symptom] = 1

final_data = pd.concat([data['Disease'], encoded_data], axis=1)
X = final_data.drop('Disease', axis=1)
y = final_data['Disease']

# Split data and train the model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# Flask app setup
app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        symptoms = request.json.get('symptoms', [])
        
        # Create the input vector based on the provided symptoms
        input_vector = pd.DataFrame(0, index=[0], columns=all_symptoms)
        for symptom in symptoms:
            if symptom.lower() in input_vector.columns:
                input_vector.loc[0, symptom.lower()] = 1

        # Make the prediction using the trained model
        prediction = model.predict(input_vector)
        predicted_disease = prediction[0]
        
        # Retrieve additional information from the dataset
        disease_info = data[data['Disease'] == predicted_disease].iloc[0]
        
        response = {
            'predicted_disease': predicted_disease,
            'medicine': disease_info.get('Medicine', ''),
            'precaution': disease_info.get('Precaution', ''),
            'tests': disease_info.get('Tests', ''),
            'treatment_duration': disease_info.get('Treatment Duration', ''),
            'disease_description': disease_info.get('Disease_Description', ''),
            'consultation_description': disease_info.get('Consultation_Description', ''),
            'nutrition_description': disease_info.get('Nutrition_Description', '')
        }

        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
