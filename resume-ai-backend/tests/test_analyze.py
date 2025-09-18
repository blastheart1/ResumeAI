# tests/test_analyze.py
import requests

# Adjust the path to your resume file
RESUME_PATH = r"C:\Users\This PC\Documents\VSCProjects\ResumeAI\resume-ai-backend\tests\test_files\AntonioLuis_Santos_Resume.pdf"

# Sample job description
JOB_DESCRIPTION = """
Job Overview:
We are looking for a Tech VA (GHL Expert) to support our high-ticket sales operations by managing and optimizing technical processes...
[Insert the full JD text you shared here]
"""

def test_analyze_resume():
    url = "http://localhost:8000/analyze"  # FastAPI server must be running
    with open(RESUME_PATH, "rb") as f:
        files = {"resume": f}
        data = {"job_description": JOB_DESCRIPTION}
        response = requests.post(url, files=files, data=data)

    if response.ok:
        result = response.json()
        print("Analysis Result:")
        print(result)
    else:
        print(f"Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_analyze_resume()
