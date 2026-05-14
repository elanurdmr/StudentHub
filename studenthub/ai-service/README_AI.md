# StudentHub AI Service

Python FastAPI mikroservisi — skill eşleştirme skoru hesaplar.

## Kurulum

```bash
cd ai-service
pip install -r requirements.txt
```

## Çalıştırma

```bash
uvicorn main:app --port 8001 --reload
```

Servis `http://localhost:8001` adresinde çalışır.

## Endpoint'ler

### POST /match
Kullanıcının skill'leri ile projenin gerektirdiği skill'leri karşılaştırır.

**İstek:**
```json
{
  "userSkills": [
    { "name": "React", "level": "expert" },
    { "name": "Python", "level": "intermediate" }
  ],
  "requiredSkills": ["React", "Node.js", "Python"]
}
```

**Yanıt:**
```json
{
  "matchScore": 56,
  "matchedSkills": ["React", "Python"],
  "missingSkills": ["Node.js"]
}
```

Level ağırlıkları: `beginner=1`, `intermediate=2`, `expert=3`  
Skor = (ağırlıklı eşleşme / maxPossible) * 100, max 100, min 0.

### GET /health
```json
{ "status": "ok" }
```
