from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_apscheduler import APScheduler
import sqlite3
import os
import google.generativeai as genai
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

genai.configure(api_key="AIzaSyBS2x-DOlW8CZZJrHOtJneECzZYxz1sTRs")
model = genai.GenerativeModel('gemini-1.5-flash')

# Database file path
DB_PATH = 'health.db'

def init_db():
    """Initialize the database and create the remainders table if it doesn't exist"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS remainders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            gender TEXT NOT NULL,
            age INTEGER NOT NULL,
            email TEXT NOT NULL,
            disease TEXT NOT NULL,
            complaint TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_email_sent TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    
init_db()

def generate_health_message(full_name, gender, age, disease, complaint, created_at):
    """Generate AI health message using Google Generative AI"""
    try:
        days_since_created = (datetime.now() - datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S')).days
        
        prompt = f"""
        You are an expert health doctor. Based on the following patient information, provide a comprehensive health update including medications, precautions, nutrition advice, and general wellness tips.
        
        Patient Details:
        - Name: {full_name}
        - Gender: {gender}
        - Age: {age}
        - Disease/Condition: {disease}
        - Symptoms/Complaint: {complaint}
        - Days since initial consultation: {days_since_created}
        
        Please provide:
        1. Current medication recommendations
        2. Important precautions to take
        3. Nutritional advice specific to their condition
        4. Lifestyle modifications
        5. When to seek immediate medical attention
        6. Progress monitoring suggestions
        
        Keep the response professional, caring, and actionable. Limit to 300 words.
        Dont generate ** or *
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Unable to generate personalized health advice at this time. Please consult with your healthcare provider for continued care regarding your {disease}."

@app.route('/add_remainder', methods=['POST'])
def add_remainder():
    """Add a new health remainder"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['fullName', 'gender', 'age', 'email', 'disease', 'complaint']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'message': f'{field} is required'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO remainders (full_name, gender, age, email, disease, complaint)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data['fullName'],
            data['gender'],
            int(data['age']),
            data['email'],
            data['disease'],
            data['complaint']
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Health remainder added successfully!'}), 201
        
    except Exception as e:
        return jsonify({'message': f'Error adding remainder: {str(e)}'}), 500

@app.route('/generate_health_message', methods=['POST'])
def get_health_message():
    """Generate AI health message for a specific patient"""
    try:
        data = request.get_json()
        
        required_fields = ['fullName', 'gender', 'age', 'disease', 'complaint', 'createdAt']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'message': f'{field} is required'}), 400
        
        message = generate_health_message(
            data['fullName'],
            data['gender'],
            data['age'],
            data['disease'],
            data['complaint'],
            data['createdAt']
        )
        
        return jsonify({'message': message}), 200
        
    except Exception as e:
        return jsonify({'message': f'Error generating health message: {str(e)}'}), 500

@app.route('/get_diseases/<email>', methods=['GET'])
def get_diseases(email):
    """Get all diseases for a specific email"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT DISTINCT disease FROM remainders WHERE email = ?', (email,))
        diseases = [row[0] for row in cursor.fetchall()]
        
        conn.close()
        
        if diseases:
            return jsonify({'diseases': diseases}), 200
        else:
            return jsonify({'message': 'No remainders found for this email'}), 404
            
    except Exception as e:
        return jsonify({'message': f'Error fetching diseases: {str(e)}'}), 500

@app.route('/delete_remainder', methods=['DELETE'])
def delete_remainder():
    """Delete a specific remainder by email and disease"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('disease'):
            return jsonify({'message': 'Email and disease are required'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if the record exists
        cursor.execute('SELECT id FROM remainders WHERE email = ? AND disease = ?', 
                      (data['email'], data['disease']))
        record = cursor.fetchone()
        
        if not record:
            conn.close()
            return jsonify({'message': 'No remainder found with this email and disease'}), 404
        
        # Delete the record
        cursor.execute('DELETE FROM remainders WHERE email = ? AND disease = ?', 
                      (data['email'], data['disease']))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Remainder deleted successfully!'}), 200
        
    except Exception as e:
        return jsonify({'message': f'Error deleting remainder: {str(e)}'}), 500

@app.route('/get_all_remainders', methods=['GET'])
def get_all_remainders():
    """Get all remainders (optional endpoint for debugging)"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, full_name, gender, age, email, disease, complaint, created_at
            FROM remainders ORDER BY created_at DESC
        ''')
        
        remainders = []
        for row in cursor.fetchall():
            remainders.append({
                'id': row[0],
                'full_name': row[1],
                'gender': row[2],
                'age': row[3],
                'email': row[4],
                'disease': row[5],
                'complaint': row[6],
                'created_at': row[7]
            })
        
        conn.close()
        return jsonify({'remainders': remainders}), 200
        
    except Exception as e:
        return jsonify({'message': f'Error fetching remainders: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'message': 'Health Remainder API is running!', 'status': 'OK'}), 200

@app.route('/get_pending_reminders', methods=['GET'])
def get_pending_reminders():
    """Get all patients who need health reminders"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, full_name, gender, age, email, disease, complaint, created_at, last_email_sent
            FROM remainders 
            WHERE datetime(COALESCE(last_email_sent, created_at), '+24 hours') <= datetime('now')
        ''')
        
        patients = []
        for row in cursor.fetchall():
            patients.append({
                'id': row[0],
                'full_name': row[1],
                'gender': row[2],
                'age': row[3],
                'email': row[4],
                'disease': row[5],
                'complaint': row[6],
                'created_at': row[7],
                'last_email_sent': row[8]
            })
        
        conn.close()
        return jsonify({'patients': patients}), 200
        
    except Exception as e:
        return jsonify({'message': f'Error fetching pending reminders: {str(e)}'}), 500

@app.route('/update_email_sent', methods=['POST'])
def update_email_sent():
    """Update last_email_sent timestamp after successful email"""
    try:
        data = request.get_json()
        
        if not data.get('patient_id'):
            return jsonify({'message': 'patient_id is required'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE remainders 
            SET last_email_sent = datetime('now') 
            WHERE id = ?
        ''', (data['patient_id'],))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Email timestamp updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': f'Error updating email timestamp: {str(e)}'}), 500

if __name__ == '__main__':
    # Initialize database on startup
    init_db()
    print(f"Database initialized at: {os.path.abspath(DB_PATH)}")
    print("Starting Health Remainder API server...")
    print("EmailJS integration handled by React frontend")
    app.run(debug=True)
