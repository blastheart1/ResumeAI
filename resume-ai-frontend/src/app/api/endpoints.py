from fastapi import APIRouter, UploadFile, File, Form
from app.core.model_loader import embedding_model
from app.models.resume_model import AnalysisResult, SkillScore
from sentence_transformers import util
import json
import openai

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResult)
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    # (1) Parse resume text
    resume_text = await resume.read()
    resume_text = resume_text.decode("utf-8", errors="ignore")

    # (2) Extract skills/terms from JD
    jd_terms = [w.strip() for w in job_description.split() if len(w) > 2]

    # (3) Embed + similarity scoring
    jd_emb = embedding_model.encode(jd_terms, convert_to_tensor=True)
    res_emb = embedding_model.encode([resume_text], convert_to_tensor=True)
    sims = util.cos_sim(jd_emb, res_emb).cpu().numpy().flatten()

    # Build SkillScore for free-mode
    skills = [
        SkillScore(term=jd_terms[i], score=float(sims[i]), matched=sims[i] > 0.6)
        for i in range(len(jd_terms))
    ]
    match_pct = (
        sum(1 for s in skills if s.matched) / len(skills) * 100 if jd_terms else 0
    )

    # Prepare payload for LLM
    payload = {
        "summary": {"match_pct": match_pct, "total": len(jd_terms)},
        "items": [{"term": s.term, "score": s.score, "matched": s.matched} for s in skills],
    }

    # (4) Call LLM for AI-enhanced grouping/recommendations
    try:
        client = openai.OpenAI()
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a resume analysis assistant. Return valid JSON only."
                },
                {
                    "role": "user",
                    "content": (
                        "Group the following skills into Critical / Important / Nice-to-Have "
                        "and provide 3 actionable resume recommendations. "
                        "Each skill must include: 'skill', 'priority', 'confidence', 'recommendation'. "
                        f"Return JSON with keys 'grouped' and 'recommendations'.\n\n{json.dumps(payload)}"
                    )
                }
            ],
            temperature=0.2
        )

        llm_content = resp.choices[0].message.content.strip()
        llm_json = json.loads(llm_content)

        # Ensure grouped contains list of skills with required fields
        grouped = {}
        for priority, skill_list in llm_json.get("grouped", {}).items():
            grouped[priority] = [
                {
                    "skill": s.get("skill", ""),
                    "priority": s.get("priority", priority),
                    "confidence": float(s.get("confidence", 0)),
                    "recommendation": s.get("recommendation", "")
                }
                for s in skill_list
            ]

        recommendations = llm_json.get("recommendations", [])
    except Exception as e:
        grouped = {}
        recommendations = [f"LLM call failed: {str(e)}"]

    return AnalysisResult(
        match_pct=match_pct,
        skills=skills,
        grouped=grouped,
        recommendations=recommendations
    )
