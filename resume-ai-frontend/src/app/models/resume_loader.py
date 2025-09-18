from pydantic import BaseModel
from typing import List, Optional

class SkillScore(BaseModel):
    term: str
    score: float
    matched: bool

class AnalysisResult(BaseModel):
    match_pct: float
    skills: List[SkillScore]
    recommendations: Optional[List[str]] = None
    grouped: Optional[dict] = None
