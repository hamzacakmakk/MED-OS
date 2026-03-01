import unittest
from app import app
import database
import os
import json

class HospitalAPITestCase(unittest.TestCase):
    def setUp(self):
        # Use a separate test db
        app.config['TESTING'] = True
        database.DB_FILE = "test_hospital.db"
        if os.path.exists(database.DB_FILE):
            os.remove(database.DB_FILE)
        database.init_db()
        self.client = app.test_client()

    def tearDown(self):
        if os.path.exists(database.DB_FILE):
            try:
                os.remove(database.DB_FILE)
            except Exception:
                pass

    def test_register_and_login_doctor(self):
        # Register
        res = self.client.post('/api/doctors/register', json={
            'name': 'Dr. Smith',
            'email': 'smith@test.com',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, 201)

        # Login
        res = self.client.post('/api/doctors/login', json={
            'email': 'smith@test.com',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('token', data)

    def test_patient_endpoints(self):
        # Register patient
        res = self.client.post('/api/patients/register', json={
            'name': 'John Doe',
            'tc_no': '12345678901',
            'age': 30
        })
        self.assertEqual(res.status_code, 201)

        # Try to get patients without token
        res = self.client.get('/api/patients')
        self.assertEqual(res.status_code, 401)

        # Register and login doctor to get token
        self.client.post('/api/doctors/register', json={
            'name': 'Dr. Jane',
            'email': 'jane@test.com',
            'password': 'pass'
        })
        login_res = self.client.post('/api/doctors/login', json={
            'email': 'jane@test.com',
            'password': 'pass'
        })
        token = json.loads(login_res.data)['token']

        # Get patients with token
        res = self.client.get('/api/patients', headers={
            'Authorization': f'Bearer {token}'
        })
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(len(data['patients']), 1)
        self.assertEqual(data['patients'][0]['name'], 'John Doe')

if __name__ == '__main__':
    unittest.main()
