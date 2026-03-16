from fastapi import FastAPI, HTTPException, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from models import (
    HealthTrackingRequest, LabReportRequest,
    DoctorSearchRequest, PatientContext
)
from lab_agent import get_medical_agent
from tracking_agent import (
    get_health_tracking_agent,
    get_trend_visualization_agent,
    get_report_extraction_agent
)
from DoctorFinder import get_nearby_facilities, get_place_details
from validators import validate_bp, validate_glucose, validate_tsh
from config import config

load_dotenv()

BACKEND_SECRET = os.getenv("BACKEND_SECRET_KEY", "doctorxcare_secret")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("DoctorXCare AI Service starting...")
    yield
    print("DoctorXCare AI Service shutting down...")


app = FastAPI(
    title="DoctorXCare AI Service",
    version="2.0.0",
    description="Doctor-verified AI agents for medical analysis",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def verify_backend(x_backend_secret: str = Header(None)):
    if x_backend_secret != BACKEND_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ── HEALTH CHECK ──────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "OK",
        "service": "DoctorXCare AI Service v2.0",
        "guidelines": "ACC/AHA 2017, ADA 2025, ATA 2017",
        "verified_by": "Medical Adviser Jayshree"
    }


# ── LAB REPORT ANALYSIS ──────────────────────────────────────────
@app.post("/lab/analyze")
async def analyze_lab_report(
    request: LabReportRequest,
    x_backend_secret: str = Header(None)
):
    verify_backend(x_backend_secret)
    try:
        agent = get_medical_agent()
        prompt = f"""
Analyze this medical report:
Patient: {request.patient_name or 'Unknown'}, Age: {request.patient_age or 'Unknown'}, Gender: {request.patient_gender or 'Unknown'}
Report Type: {request.report_type}
Report Content:
{request.report_text}
"""
        result = agent.run(prompt)
        return {
            "success": True,
            "analysis": result.content,
            "report_type": request.report_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── LAB REPORT FROM IMAGE ─────────────────────────────────────────
@app.post("/lab/analyze-image")
async def analyze_lab_image(
    file: UploadFile = File(...),
    x_backend_secret: str = Header(None)
):
    verify_backend(x_backend_secret)
    try:
        import base64
        content = await file.read()
        b64 = base64.b64encode(content).decode()

        agent = get_medical_agent()
        result = agent.run(
            f"Analyze this medical report image and provide structured analysis.",
            images=[{"data": b64, "media_type": file.content_type}]
        )
        return {"success": True, "analysis": result.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── HEALTH TRACKING ───────────────────────────────────────────────
@app.post("/tracking/analyze")
async def analyze_health_tracking(
    request: HealthTrackingRequest,
    x_backend_secret: str = Header(None)
):
    verify_backend(x_backend_secret)
    try:
        # Validate readings
        validation_errors = []
        for bp in request.bp_readings:
            result = validate_bp(bp.systolic, bp.diastolic)
            if not result["valid"]:
                validation_errors.extend(result["errors"])

        for g in request.glucose_readings:
            result = validate_glucose(g.value)
            if not result["valid"]:
                validation_errors.extend(result["errors"])

        for t in request.tsh_readings:
            result = validate_tsh(t.value)
            if not result["valid"]:
                validation_errors.extend(result["errors"])

        agent = get_health_tracking_agent()
        prompt = f"""
Analyze these health readings:
Condition: {request.condition}
Patient Context: {request.patient_context.dict() if request.patient_context else 'Not provided'}

Blood Pressure Readings ({len(request.bp_readings)} total):
{[r.dict() for r in request.bp_readings]}

Glucose Readings ({len(request.glucose_readings)} total):
{[r.dict() for r in request.glucose_readings]}

TSH Readings ({len(request.tsh_readings)} total):
{[r.dict() for r in request.tsh_readings]}

Validation Notes: {validation_errors if validation_errors else 'All values plausible'}
"""
        result = agent.run(prompt)
        return {
            "success": True,
            "analysis": result.content,
            "validation_warnings": validation_errors
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── EXTRACT DATA FROM REPORT ──────────────────────────────────────
@app.post("/tracking/extract")
async def extract_report_data(
    request: LabReportRequest,
    x_backend_secret: str = Header(None)
):
    verify_backend(x_backend_secret)
    try:
        agent = get_report_extraction_agent()
        result = agent.run(f"Extract all health data from this report:\n{request.report_text}")
        import json
        try:
            data = json.loads(result.content)
        except:
            data = {"raw": result.content}
        return {"success": True, "extracted_data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── DOCTOR/FACILITY FINDER ────────────────────────────────────────
@app.post("/doctor/nearby")
async def find_nearby_doctors(
    request: DoctorSearchRequest,
    x_backend_secret: str = Header(None)
):
    verify_backend(x_backend_secret)
    try:
        facilities = await get_nearby_facilities(
            latitude=request.latitude,
            longitude=request.longitude,
            facility_type=request.facility_type,
            radius=request.radius
        )
        return {"success": True, "facilities": facilities, "count": len(facilities)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/doctor/details/{place_id}")
async def get_doctor_details(
    place_id: str,
    x_backend_secret: str = Header(None)
):
    verify_backend(x_backend_secret)
    try:
        details = await get_place_details(place_id)
        return {"success": True, "details": details}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── VALIDATE READINGS ─────────────────────────────────────────────
@app.post("/validate/bp")
async def validate_blood_pressure(systolic: float, diastolic: float):
    return validate_bp(systolic, diastolic)


@app.post("/validate/glucose")
async def validate_blood_glucose(value: float):
    return validate_glucose(value)