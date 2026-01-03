from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64
from PIL import Image
import io

from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Get API key with fallback
API_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Innovation types mapping
INNOVATION_TYPES = {
    "diy_tools": "DIY Tools",
    "electronics": "Electronics Projects",
    "home_utility": "Home Utility Items",
    "creative_art": "Creative/Art Projects",
    "eco_friendly": "Eco-friendly Solutions",
    "small_business": "Small Business Ideas",
    "educational": "Educational Models"
}

# Define Models
class WasteInput(BaseModel):
    waste_name: Optional[str] = None
    waste_description: Optional[str] = None
    image_base64: Optional[str] = None

class InnovationRequest(BaseModel):
    waste_id: str
    waste_description: str
    innovation_types: List[str]
    budget: float
    currency: str = "USD"
    skill_level: str

class Step(BaseModel):
    step_number: int
    title: str
    description: str
    duration: str
    tools_required: List[str]
    safety_note: Optional[str] = None

class Innovation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    waste_description: str
    title: str
    description: str
    innovation_type: str
    difficulty: str
    estimated_cost: float
    currency: str
    materials_needed: List[str]
    tools_required: List[str]
    time_estimate: str
    steps: List[Step]
    sustainability_score: int
    reusability_score: int
    potential_value: str
    safety_warnings: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SavedInnovation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    innovation: Innovation
    user_id: str = "default_user"
    saved_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# AI Service Functions
async def identify_waste_from_image(image_base64: str) -> dict:
    """Identify e-waste from image using AI"""
    try:
        chat = LlmChat(
            api_key=API_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert in identifying electronic waste and recyclable materials. Analyze images and provide detailed descriptions of e-waste components."
        ).with_model("openai", "gpt-5.2")
        
        image_content = ImageContent(image_base64=image_base64)
        
        user_message = UserMessage(
            text="""Analyze this image and identify the e-waste. Provide:
            1. Type of e-waste (e.g., old mobile phone, broken laptop, circuit board)
            2. Main components visible
            3. Condition assessment
            4. Potential materials that can be reused
            
            Format your response as JSON with keys: waste_type, components, condition, reusable_materials""",
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Parse the AI response
        return {
            "waste_description": response,
            "identified_from": "image"
        }
    except Exception as e:
        logging.error(f"Error identifying waste from image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to identify waste: {str(e)}")

async def classify_waste_from_text(waste_name: str, waste_description: str = "") -> dict:
    """Classify e-waste from text description"""
    try:
        chat = LlmChat(
            api_key=API_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert in electronic waste classification. Provide detailed analysis of e-waste based on text descriptions."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(
            text=f"""Analyze this e-waste description:
            Name: {waste_name}
            Additional Info: {waste_description if waste_description else 'None'}
            
            Provide:
            1. Detailed waste type classification
            2. Common components in this type of e-waste
            3. Typical condition/state
            4. Reusable materials and components
            
            Format as JSON with keys: waste_type, components, condition, reusable_materials"""
        )
        
        response = await chat.send_message(user_message)
        
        return {
            "waste_description": response,
            "identified_from": "text"
        }
    except Exception as e:
        logging.error(f"Error classifying waste from text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to classify waste: {str(e)}")

async def generate_innovations(request: InnovationRequest) -> List[Innovation]:
    """Generate innovation ideas using AI"""
    try:
        innovation_types_str = ", ".join([INNOVATION_TYPES.get(t, t) for t in request.innovation_types])
        
        chat = LlmChat(
            api_key=API_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert in upcycling and creating innovative projects from e-waste. You help people transform electronic waste into useful, creative, and sustainable projects."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(
            text=f"""Generate 3 innovative project ideas from this e-waste:
            
            E-waste: {request.waste_description}
            Budget: {request.budget} {request.currency}
            Skill Level: {request.skill_level}
            Innovation Types: {innovation_types_str}
            
            For each idea, provide:
            1. Creative project title
            2. Detailed description (2-3 sentences)
            3. Innovation type (from the requested types)
            4. Difficulty level (Beginner/Intermediate/Advanced)
            5. Estimated cost (must be within budget)
            6. List of materials needed (5-7 items)
            7. List of tools required (3-5 items)
            8. Time estimate (e.g., "2-3 hours", "1 day")
            9. Sustainability score (1-100)
            10. Reusability score (1-100)
            11. Potential value or utility description
            12. 2-3 important safety warnings
            
            Return ONLY a valid JSON array with 3 objects. Each object must have all these fields:
            [{{
                "title": "...",
                "description": "...",
                "innovation_type": "...",
                "difficulty": "...",
                "estimated_cost": 0.0,
                "materials_needed": [...],
                "tools_required": [...],
                "time_estimate": "...",
                "sustainability_score": 0,
                "reusability_score": 0,
                "potential_value": "...",
                "safety_warnings": [...]
            }}]
            
            Make ideas practical, creative, and achievable within the budget and skill level."""
        )
        
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        try:
            # Try to extract JSON from response
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            ideas = json.loads(response_text)
        except:
            # If JSON parsing fails, create a default response
            ideas = [{
                "title": "Creative Upcycling Project",
                "description": "Transform your e-waste into something useful",
                "innovation_type": innovation_types_str.split(",")[0].strip() if innovation_types_str else "DIY Project",
                "difficulty": request.skill_level,
                "estimated_cost": request.budget * 0.7,
                "materials_needed": ["E-waste components", "Basic tools", "Adhesive"],
                "tools_required": ["Screwdriver", "Pliers", "Wire cutters"],
                "time_estimate": "2-3 hours",
                "sustainability_score": 75,
                "reusability_score": 70,
                "potential_value": "Functional and eco-friendly",
                "safety_warnings": ["Handle sharp components carefully", "Work in ventilated area"]
            }]
        
        innovations = []
        for idea in ideas[:3]:  # Limit to 3 ideas
            innovation = Innovation(
                waste_description=request.waste_description,
                title=idea.get("title", "Unnamed Project"),
                description=idea.get("description", ""),
                innovation_type=idea.get("innovation_type", ""),
                difficulty=idea.get("difficulty", request.skill_level),
                estimated_cost=float(idea.get("estimated_cost", 0)),
                currency=request.currency,
                materials_needed=idea.get("materials_needed", []),
                tools_required=idea.get("tools_required", []),
                time_estimate=idea.get("time_estimate", "Unknown"),
                steps=[],  # Will be generated separately
                sustainability_score=int(idea.get("sustainability_score", 70)),
                reusability_score=int(idea.get("reusability_score", 65)),
                potential_value=idea.get("potential_value", ""),
                safety_warnings=idea.get("safety_warnings", [])
            )
            innovations.append(innovation)
        
        return innovations
    except Exception as e:
        logging.error(f"Error generating innovations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate innovations: {str(e)}")

async def generate_steps(innovation: Innovation) -> List[Step]:
    """Generate step-by-step instructions for an innovation"""
    try:
        chat = LlmChat(
            api_key=API_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert instructor who creates clear, detailed step-by-step guides for DIY projects."
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(
            text=f"""Create detailed step-by-step instructions for this project:
            
            Project: {innovation.title}
            Description: {innovation.description}
            Difficulty: {innovation.difficulty}
            Materials: {', '.join(innovation.materials_needed)}
            Tools: {', '.join(innovation.tools_required)}
            
            Provide 5-8 clear steps. For each step include:
            1. Step title (brief, action-oriented)
            2. Detailed description (2-3 sentences)
            3. Duration estimate
            4. Tools needed for this step
            5. Safety note if applicable
            
            Return ONLY a valid JSON array:
            [{{
                "title": "...",
                "description": "...",
                "duration": "...",
                "tools_required": [...],
                "safety_note": "..."
            }}]"""
        )
        
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        try:
            response_text = response.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            steps_data = json.loads(response_text)
        except:
            # Default steps if parsing fails
            steps_data = [
                {
                    "title": "Prepare Materials",
                    "description": "Gather all required materials and tools",
                    "duration": "10 minutes",
                    "tools_required": ["All listed tools"],
                    "safety_note": "Ensure workspace is clean and organized"
                }
            ]
        
        steps = []
        for idx, step_data in enumerate(steps_data, 1):
            step = Step(
                step_number=idx,
                title=step_data.get("title", f"Step {idx}"),
                description=step_data.get("description", ""),
                duration=step_data.get("duration", "Variable"),
                tools_required=step_data.get("tools_required", []),
                safety_note=step_data.get("safety_note")
            )
            steps.append(step)
        
        return steps
    except Exception as e:
        logging.error(f"Error generating steps: {str(e)}")
        return []

# API Endpoints
@api_router.get("/")
async def root():
    return {"message": "ReCircuit API - Transform E-waste into Innovation"}

@api_router.post("/analyze-waste")
async def analyze_waste(waste_input: WasteInput):
    """Analyze e-waste from image or text"""
    try:
        if waste_input.image_base64:
            result = await identify_waste_from_image(waste_input.image_base64)
        elif waste_input.waste_name:
            result = await classify_waste_from_text(
                waste_input.waste_name,
                waste_input.waste_description or ""
            )
        else:
            raise HTTPException(status_code=400, detail="Either image or waste name is required")
        
        waste_id = str(uuid.uuid4())
        
        # Store in cache (optional)
        await db.waste_cache.insert_one({
            "id": waste_id,
            "description": result["waste_description"],
            "identified_from": result["identified_from"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "waste_id": waste_id,
            "waste_description": result["waste_description"],
            "identified_from": result["identified_from"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in analyze_waste: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/generate-innovations")
async def create_innovations(request: InnovationRequest):
    """Generate innovation ideas"""
    try:
        innovations = await generate_innovations(request)
        
        # Store innovations in database
        for innovation in innovations:
            doc = innovation.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.innovations.insert_one(doc)
        
        return {
            "innovations": [innovation.model_dump() for innovation in innovations]
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in create_innovations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/innovation/{innovation_id}")
async def get_innovation_detail(innovation_id: str):
    """Get innovation with step-by-step guide"""
    try:
        # Find innovation in database
        innovation_doc = await db.innovations.find_one({"id": innovation_id}, {"_id": 0})
        
        if not innovation_doc:
            raise HTTPException(status_code=404, detail="Innovation not found")
        
        # Convert ISO string back to datetime
        if isinstance(innovation_doc.get('created_at'), str):
            innovation_doc['created_at'] = datetime.fromisoformat(innovation_doc['created_at'])
        
        innovation = Innovation(**innovation_doc)
        
        # Generate steps if not already generated
        if not innovation.steps:
            steps = await generate_steps(innovation)
            innovation.steps = steps
            
            # Update in database
            await db.innovations.update_one(
                {"id": innovation_id},
                {"$set": {"steps": [step.model_dump() for step in steps]}}
            )
        
        return innovation.model_dump()
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in get_innovation_detail: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/save-innovation")
async def save_innovation(innovation_id: str, user_id: str = "default_user"):
    """Save innovation to user's collection"""
    try:
        innovation_doc = await db.innovations.find_one({"id": innovation_id}, {"_id": 0})
        
        if not innovation_doc:
            raise HTTPException(status_code=404, detail="Innovation not found")
        
        if isinstance(innovation_doc.get('created_at'), str):
            innovation_doc['created_at'] = datetime.fromisoformat(innovation_doc['created_at'])
        
        innovation = Innovation(**innovation_doc)
        
        saved = SavedInnovation(
            innovation=innovation,
            user_id=user_id
        )
        
        doc = saved.model_dump()
        doc['saved_at'] = doc['saved_at'].isoformat()
        doc['innovation']['created_at'] = doc['innovation']['created_at'].isoformat()
        
        await db.saved_innovations.insert_one(doc)
        
        return {"message": "Innovation saved successfully", "saved_id": saved.id}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in save_innovation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/saved-innovations")
async def get_saved_innovations(user_id: str = "default_user"):
    """Get user's saved innovations"""
    try:
        saved = await db.saved_innovations.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("saved_at", -1).to_list(100)
        
        return {"saved_innovations": saved}
    except Exception as e:
        logging.error(f"Error in get_saved_innovations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
