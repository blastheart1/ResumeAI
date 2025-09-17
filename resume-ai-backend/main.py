# main.py
import re
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from resume_parser import extract_text, tokenize, ngrams, STOPWORDS

app = FastAPI(title="Resume AI - Simple Analyzer")

# ---- CORS ----
origins = [
    "http://localhost:5173",  # Vite
    "http://localhost:3000",  # CRA
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Response models ----
class SuggestionItems(BaseModel):
    matched: Optional[List[str]] = []
    missing: Optional[List[str]] = []

class Suggestion(BaseModel):
    category: str
    title: str
    score: float
    items: Optional[SuggestionItems] = None
    message: str

class AnalyzeResponse(BaseModel):
    success: bool
    suggestions: List[Suggestion]


# ---- Basic analysis logic ----
def extract_jd_terms(job_text: str, top_n=40) -> List[str]:
    tokens = [t for t in tokenize(job_text) if t and t not in STOPWORDS]
    cand = {}
    for n in range(1, 3 + 1):
        for g in ngrams(tokens, n):
            words = g.split()
            if all(w in STOPWORDS or len(w) < 2 for w in words):
                continue
            cand[g] = cand.get(g, 0) + 1
    items = sorted(
        cand.items(),
        key=lambda kv: (kv[1], len(kv[0].split())),
        reverse=True,
    )
    return [term for term, _ in items][:top_n]


def basic_resume_vs_jd_analysis(resume_text: str, job_text: str) -> List[dict]:
    resume_lower = resume_text.lower()
    jd_terms = extract_jd_terms(job_text, top_n=60)

    matched = [term for term in jd_terms if term in resume_lower]
    missing = [term for term in jd_terms if term not in resume_lower]

    score = round(len(matched) / max(1, len(jd_terms)), 3)
    suggestions = []

    # Skills block
    suggestions.append({
        "category": "skills",
        "title": "Skill coverage",
        "score": score,
        "items": {"matched": matched[:12], "missing": missing[:12]},
        "message": (
            f"Resume matches {len(matched)} of {len(jd_terms)} prioritized JD terms "
            f"({int(score*100)}%). Consider adding the missing skills/keywords "
            "in your summary or skills section."
        ),
    })

    # Quantification check
    numbers = re.findall(r"\b\d{1,4}\b", resume_text)
    if len(numbers) < 3:
        suggestions.append({
            "category": "format",
            "title": "Quantify achievements",
            "score": 0.5,
            "items": None,
            "message": "Your resume has few numeric mentions. Try quantifying accomplishments (e.g. 'Reduced costs by 20%').",
        })

    # Years of experience check
    jd_years = re.search(r"(\d+)\+?\s+years?", job_text.lower())
    resume_years = re.search(r"(\d+)\+?\s+years?", resume_text.lower())
    if jd_years and not resume_years:
        suggestions.append({
            "category": "experience",
            "title": "Years of experience missing",
            "score": 0.2,
            "items": None,
            "message": f"The job asks for ~{jd_years.group(1)} years. Consider making your relevant experience clearer.",
        })

    return suggestions


# ---- Endpoint ----
MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8 MB

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(resume: UploadFile = File(...), job_description: str = Form(...)):
    file_bytes = await resume.read()

    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 8 MB)")

    try:
        text = extract_text(file_bytes, resume.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract resume text: {e}")

    suggestions = basic_resume_vs_jd_analysis(text, job_description)

    return {"success": True, "suggestions": suggestions}
