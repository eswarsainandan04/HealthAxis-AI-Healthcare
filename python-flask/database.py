from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE = 'health.db'

# Function to get a connection
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # Allows dict-like row access
    return conn

# Endpoint to fetch the first 500 rows
@app.route('/defaultRows', methods=['GET'])
def default_rows():
    try:
        conn = get_db_connection()
        rows = conn.execute('SELECT * FROM medicine LIMIT 500').fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows])
    except Exception as e:
        print("Database query error:", e)
        return jsonify({"error": "Database query error"}), 500
    
get_db_connection()

# Endpoint to handle search queries
@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()

    column = data.get('column')
    query = data.get('query')

    if not column or not query:
        return jsonify({"error": "Column and query are required"}), 400

    try:
        conn = get_db_connection()
        sql = f'SELECT * FROM medicine WHERE "{column}" LIKE ?'
        param = f"%{query}%"
        rows = conn.execute(sql, (param,)).fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows])
    except Exception as e:
        print("Database query error:", e)
        return jsonify({"error": "Database query error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
