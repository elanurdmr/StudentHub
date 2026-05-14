from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="StudentHub AI Service")


class UserSkill(BaseModel):
    name: str
    level: str = "intermediate"


class MatchRequest(BaseModel):
    userSkills: List[UserSkill]
    requiredSkills: List[str]


class MatchResponse(BaseModel):
    matchScore: int
    matchedSkills: List[str]
    missingSkills: List[str]


LEVEL_WEIGHTS = {"beginner": 1, "intermediate": 2, "expert": 3}


def calculateMatch(user_skills: List[UserSkill], required_skills: List[str]) -> MatchResponse:
    if not user_skills or not required_skills:
        return MatchResponse(matchScore=0, matchedSkills=[], missingSkills=list(required_skills))

    max_possible_score = len(required_skills) * 3
    skill_map = {s.name.lower(): s.level.lower() for s in user_skills}

    matched = []
    missing = []
    weighted_matched = 0

    for req in required_skills:
        key = req.lower()
        if key in skill_map:
            matched.append(req)
            weight = LEVEL_WEIGHTS.get(skill_map[key], 2)
            weighted_matched += weight
        else:
            missing.append(req)

    score = min(100, max(0, round((weighted_matched / max_possible_score) * 100)))
    return MatchResponse(matchScore=score, matchedSkills=matched, missingSkills=missing)


@app.post("/match", response_model=MatchResponse)
async def match(request: MatchRequest):
    return calculateMatch(request.userSkills, request.requiredSkills)


@app.get("/health")
async def health():
    return {"status": "ok"}
