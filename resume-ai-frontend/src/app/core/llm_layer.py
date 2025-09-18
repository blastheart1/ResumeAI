from openai import OpenAI
import os, json

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def enrich_with_llm(skill_matches):
    prompt = f"""
    You are analyzing resume vs job description skills.
    Input: {json.dumps(skill_matches, indent=2)}.

    For each skill:
    - Add a priority (Critical, Important, Nice-to-Have).
    - Add a short actionable recommendation.

    Return JSON only.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        response_format={"type": "json_object"}
    )

    return json.loads(response.choices[0].message.content)
