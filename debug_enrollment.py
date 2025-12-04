import requests

def debug_enrollment():
    base_url = "http://localhost:5080/api"
    # Login
    try:
        res = requests.post(f"{base_url}/auth/login", json={"email": "alice@student.com", "password": "password123"})
        data = res.json()
        if "token" not in data:
            print("Login failed:", data)
            return

        token = data["token"]
        headers = {"Authorization": f"Bearer {token}"}

        print("Login successful. Fetching enrollments...")
        res = requests.get(f"{base_url}/enrollments", headers=headers)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_enrollment()
