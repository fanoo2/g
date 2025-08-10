from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="AI Recommendation Service", version="0.1.0")

class RecommendRequest(BaseModel):
    user_id: str
    recent_stream_ids: List[str] = []

class RecommendResponse(BaseModel):
    recommendations: List[str]

@app.get('/health')
async def health():
    return {"status": "ok"}

@app.post('/recommend', response_model=RecommendResponse)
async def recommend(req: RecommendRequest):
    # placeholder algorithm
    recs = [f"stream_{i}" for i in range(1,6)]
    return RecommendResponse(recommendations=recs)
