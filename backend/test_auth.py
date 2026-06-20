import urllib.request
import urllib.parse
import json

def test():
    # Register
    req1 = urllib.request.Request("http://localhost:8000/api/auth/register", method="POST")
    req1.add_header('Content-Type', 'application/json')
    # Use a random email
    import random
    email = f"test_{random.randint(1000, 9999)}@example.com"
    data1 = json.dumps({"name": "Test User", "email": email, "password": "password123"}).encode('utf-8')
    try:
        res1 = urllib.request.urlopen(req1, data=data1)
        print("Register:", res1.status, res1.read().decode('utf-8'))
    except Exception as e:
        print("Register Error:", getattr(e, 'code', 'N/A'), getattr(e, 'read', lambda: b'')().decode('utf-8'))
        return

    # Login
    req2 = urllib.request.Request("http://localhost:8000/api/auth/login", method="POST")
    req2.add_header('Content-Type', 'application/x-www-form-urlencoded')
    data2 = urllib.parse.urlencode({"username": email, "password": "password123"}).encode('utf-8')
    try:
        res2 = urllib.request.urlopen(req2, data=data2)
        print("Login:", res2.status, res2.read().decode('utf-8'))
    except Exception as e:
        print("Login Error:", getattr(e, 'code', 'N/A'), getattr(e, 'read', lambda: b'')().decode('utf-8'))

test()
