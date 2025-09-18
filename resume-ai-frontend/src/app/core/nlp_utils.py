import spacy
from sentence_transformers import SentenceTransformer, util

nlp = spacy.load("en_core_web_sm")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

def extract_skills(text: str):
    doc = nlp(text)
    return [token.text for token in doc if token.pos_ in ("NOUN", "PROPN")]

def compute_similarity(resume_skills, jd_skills):
    results = []
    resume_embeddings = embedder.encode(resume_skills, convert_to_tensor=True)
    jd_embeddings = embedder.encode(jd_skills, convert_to_tensor=True)

    for i, r in enumerate(resume_skills):
        sim_scores = util.cos_sim(resume_embeddings[i], jd_embeddings)[0].cpu().tolist()
        best_match_idx = max(range(len(jd_skills)), key=lambda j: sim_scores[j])
        confidence = sim_scores[best_match_idx]
        results.append({
            "skill": r,
            "confidence": round(confidence, 2),
        })
    return results
