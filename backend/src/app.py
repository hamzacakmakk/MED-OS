from flask import Flask, request, jsonify
from flask_cors import CORS
from flasgger import Swagger
import bcrypt
import jwt
import datetime
from functools import wraps
import database

app = Flask(__name__)
CORS(app)
Swagger(app)

SECRET_KEY = "my_super_secret_hospital_key_change_in_production"

# Initialize DB on startup
database.init_db()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # token expects Authorization: Bearer <token>
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_doctor_id = data['doctor_id']
            # We could fetch the doctor from db here if needed, but ID is enough
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_doctor_id, *args, **kwargs)
    return decorated

@app.route('/api/doctors/register', methods=['POST'])
def register_doctor():
    """
    Register a new doctor
    ---
    tags:
      - Doctors
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
              example: "Dr. Ahmet Yılmaz"
            email:
              type: string
              example: "ahmet@hastane.com"
            password:
              type: string
              example: "gizlisifre"
    responses:
      201:
        description: Doctor registered successfully
      400:
        description: Missing data
      409:
        description: Email already exists
    """
    data = request.get_json()
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing data!'}), 400
        
    name = data['name']
    email = data['email']
    password = data['password']
    
    # Hash password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    success = database.create_doctor(name, email, hashed_password)
    
    if success:
        return jsonify({'message': 'Doctor registered successfully!'}), 201
    else:
        return jsonify({'message': 'Email already exists!'}), 409

@app.route('/api/doctors/login', methods=['POST'])
def login_doctor():
    """
    Doctor login
    ---
    tags:
      - Doctors
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            email:
              type: string
              example: "ahmet@hastane.com"
            password:
              type: string
              example: "gizlisifre"
    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            message:
              type: string
            token:
              type: string
      400:
        description: Missing data
      401:
        description: Invalid credentials
    """
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing data!'}), 400
        
    email = data['email']
    password = data['password']
    
    doctor = database.get_doctor_by_email(email)
    
    if not doctor:
        return jsonify({'message': 'Invalid credentials!'}), 401
        
    # Check password
    stored_password = doctor['password']
    if bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
        # Generate token
        token_data = {
            'doctor_id': doctor['id'],
            # Changed to datetime.datetime.now(datetime.timezone.utc) since utcnow is deprecated
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
        }
        token = jwt.encode(token_data, SECRET_KEY, algorithm="HS256")
        
        return jsonify({
            'message': 'Login successful!',
            'token': token
        }), 200
    else:
        return jsonify({'message': 'Invalid credentials!'}), 401

@app.route('/api/patients/register', methods=['POST'])
def register_patient():
    """
    Register a new patient
    ---
    tags:
      - Patients
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
              example: "Ayşe Demir"
            tc_no:
              type: string
              example: "12345678901"
            age:
              type: integer
              example: 45
    responses:
      201:
        description: Patient registered successfully
      400:
        description: Missing data
      409:
        description: TC No already exists
    """
    data = request.get_json()
    if not data or not data.get('name') or not data.get('tc_no') or not data.get('age'):
        return jsonify({'message': 'Missing data!'}), 400
        
    success = database.create_patient(data['name'], data['tc_no'], data['age'])
    
    if success:
        return jsonify({'message': 'Patient registered successfully!'}), 201
    else:
        return jsonify({'message': 'TC No already exists!'}), 409

@app.route('/api/patients', methods=['GET'])
@token_required
def get_patients(current_doctor_id):
    """
    Get all patients
    ---
    tags:
      - Patients
    security:
      - Bearer: []
    responses:
      200:
        description: A list of patients
        schema:
          type: object
          properties:
            patients:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  name:
                    type: string
                  tc_no:
                    type: string
                  age:
                    type: integer
      401:
        description: Unauthorized
    """
    # current_doctor_id is passed by token_required decorator
    patients = database.get_all_patients()
    return jsonify({'patients': patients}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
