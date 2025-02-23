from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import openai
import firebase_admin
from firebase_admin import credentials, firestore
from fastapi.middleware.cors import CORSMiddleware

# Initialize Firebase
cred = credentials.Certificate("path/to/firebase-credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize FastAPI
app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI API Key
openai.api_key = "your-openai-api-key"

class UIRequest(BaseModel):
    prompt: str

@app.post("/generate_ui/")
async def generate_ui(request: UIRequest):
    """Generate UI Component from AI."""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": request.prompt}]
        )
        ui_component = response["choices"][0]["message"]["content"]
        return {"component": ui_component}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/pin_component/")
async def pin_component(request: UIRequest):
    """Pin a UI component to Firebase."""
    doc_ref = db.collection("components").add({"content": request.prompt})
    return {"message": "Component pinned", "id": doc_ref[1].id}

@app.get("/get_pinned_components/")
async def get_pinned_components():
    """Retrieve all pinned components."""
    docs = db.collection("components").stream()
    components = [doc.to_dict() for doc in docs]
    return {"components": components}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
