from pydantic import BaseModel
from typing import Literal, Optional

class SuggestionItem(BaseModel):
    skill: str
    confidence: float
    priority: Optional[Literal["Critical", "Important", "Nice-to-Have"]] = None
    recommendation: Optional[str] = None
