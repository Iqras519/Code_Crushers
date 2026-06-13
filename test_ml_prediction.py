import base64
import requests
import json
import time
from PIL import Image, ImageDraw
from io import BytesIO

# Generate Non-Crack Image (Solid Grey)
img_no_crack = Image.new("RGB", (224, 224), color=(128, 128, 128))
buffered = BytesIO()
img_no_crack.save(buffered, format="JPEG")
no_crack_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

# Generate Crack Image (Grey with a jagged black line simulating a crack)
img_crack = Image.new("RGB", (224, 224), color=(128, 128, 128))
draw = ImageDraw.Draw(img_crack)
draw.line([(20, 20), (50, 80), (100, 110), (150, 190), (200, 200)], fill=(0, 0, 0), width=3)
buffered2 = BytesIO()
img_crack.save(buffered2, format="JPEG")
crack_base64 = base64.b64encode(buffered2.getvalue()).decode("utf-8")

# Save them locally
img_no_crack.save("non_crack_test.jpg")
img_crack.save("crack_test.jpg")
print("Generated test images: non_crack_test.jpg and crack_test.jpg")

base_url = "http://localhost:3000/api"

# Register a test engineer user
email = f"engineer_{int(time.time())}@example.com"
print(f"Registering user: {email}")
reg_res = requests.post(f"{base_url}/auth/register", json={
    "name": "ML Tester",
    "email": email,
    "password": "password123",
    "role": "Structural Engineer"
})
reg_data = reg_res.json()
token = reg_data["token"]
headers = {"Authorization": f"Bearer {token}"}

# Test 1: Non-Crack Image
print("\n--- Testing Non-Crack Image ---")
res_no = requests.post(f"{base_url}/analyses", headers=headers, json={
    "fileName": "non_crack_test.jpg",
    "structureType": "building",
    "notes": "Testing a solid grey non-crack image",
    "imageData": no_crack_base64
})
print("Non-crack response status:", res_no.status_code)
no_data = res_no.json()
print("Non-crack response body:", json.dumps(no_data, indent=2))

# Test 2: Crack Image
print("\n--- Testing Crack Image ---")
res_yes = requests.post(f"{base_url}/analyses", headers=headers, json={
    "fileName": "crack_test.jpg",
    "structureType": "building",
    "notes": "Testing an image with a crack pattern",
    "imageData": crack_base64
})
print("Crack response status:", res_yes.status_code)
yes_data = res_yes.json()
print("Crack response body:", json.dumps(yes_data, indent=2))

# Test 3: Recommendation Generation
print("\n--- Checking Recommendations ---")
rec_res = requests.get(f"{base_url}/recommendations", headers=headers)
recs = rec_res.json()
print(f"Total recommendations: {len(recs)}")
linked_rec = next((r for r in recs if r["analysisId"] == yes_data["id"]), None)
if linked_rec:
    print("Recommendation generated successfully for crack analysis:")
    print(json.dumps(linked_rec, indent=2))
else:
    print("WARNING: No recommendation found for crack analysis!")

# Test 4: Report Generation
print("\n--- Checking Report ---")
rep_res = requests.get(f"{base_url}/reports/{yes_data['id']}", headers=headers)
report = rep_res.json()
print("Report generated successfully:")
print(json.dumps(report, indent=2))
