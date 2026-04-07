from fastapi import FastAPI, HTTPException, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import json
from dotenv import load_dotenv

from models import (
    HealthTrackingRequest, LabReportRequest,
    DoctorSearchRequest
)
from lab_agent import analyze_lab_report, extract_report_data
from tracking_agent import analyze_health_tracking, get_trend_insights
from DoctorFinder import get_nearby_facilities, get_place_details
from validators import validate_bp, validate_glucose, validate_tsh
from config import config

load_dotenv()

BACKEND_SECRET = os.getenv("BACKEND_SECRET_KEY", "doctorxcare_secret")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("DoctorXCare AI Service starting... (Powered by Groq AI)")
    yield
    print("DoctorXCare AI Service shutting down...")


app = FastAPI(
    title="DoctorXCare AI Service",
    version="3.0.0",
    description="Doctor-verified AI agents powered by Groq — medical analysis, health tracking, specialist finder",
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
        raise HTTPException(status_code=401, detail="Unauthorized — invalid backend secret")


# ── HEALTH CHECK ──────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "OK",
        "service": "DoctorXCare AI Service v3.0",
        "ai_provider": "Groq (llama-3.3-70b-versatile)",
        "hospital_finder": "Google Places API",
        "guidelines": "ACC/AHA 2017, ADA 2025, ATA 2017",
        "verified_by": "Medical Adviser Jayshree"
    }


# ── LAB REPORT ANALYSIS (TEXT) ───────────────────────────────────
@app.post("/lab/analyze")
async def analyze_lab_report_endpoint(
    request: LabReportRequest,
    x_backend_secret: str = Header(None)
):
    verify_backend(x_backend_secret)
    try:
        analysis = analyze_lab_report(
            report_text=request.report_text,
            patient_name=request.patient_name,
            patient_age=request.patient_age,
            patient_gender=request.patient_gender,
            report_type=request.report_type or "general"
        )
        return {
            "success": True,
            "analysis": analysis,
            "report_type": request.report_type
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
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
        # Read file content and convert to text description for Groq
        content = await file.read()
        file_size_kb = len(content) / 1024

        # Groq doesn't support direct image input — ask user to provide text
        # We inform the frontend to use OCR or text-based upload
        return {
            "success": False,
            "error": "Image analysis requires text extraction. Please copy the report text and use /lab/analyze instead.",
            "hint": "Use a PDF reader or OCR tool to extract text from your report, then submit as text."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── HEALTH TRACKING ANALYSIS ──────────────────────────────────────
@app.post("/tracking/analyze")
async def analyze_health_tracking_endpoint(
    request: HealthTrackingRequest,
    x_backend_secret: str = Header(None)
):
    verify_backend(x_backend_secret)
    try:
        # Validate readings first
        validation_errors = []

        for bp in (request.bp_readings or []):
            result = validate_bp(bp.systolic, bp.diastolic)
            if not result["valid"]:
                validation_errors.extend(result["errors"])

        for g in (request.glucose_readings or []):
            result = validate_glucose(g.value)
            if not result["valid"]:
                validation_errors.extend(result["errors"])

        for t in (request.tsh_readings or []):
            result = validate_tsh(t.value)
            if not result["valid"]:
                validation_errors.extend(result["errors"])

        patient_ctx = request.patient_context.dict() if request.patient_context else None

        analysis = analyze_health_tracking(
            condition=request.condition,
            bp_readings=[r.dict() for r in (request.bp_readings or [])],
            glucose_readings=[r.dict() for r in (request.glucose_readings or [])],
            tsh_readings=[r.dict() for r in (request.tsh_readings or [])],
            patient_context=patient_ctx,
            time_range=request.time_range,
            validation_errors=validation_errors if validation_errors else None
        )

        return {
            "success": True,
            "analysis": analysis,
            "validation_warnings": validation_errors
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── EXTRACT DATA FROM REPORT TEXT ────────────────────────────────
@app.post("/tracking/extract")
async def extract_report_data_endpoint(
    request: LabReportRequest,
    x_backend_secret: str = Header(None)
):
    verify_backend(x_backend_secret)
    try:
        raw = extract_report_data(request.report_text)
        try:
            # Strip markdown code fences if present
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            data = json.loads(cleaned.strip())
        except json.JSONDecodeError:
            data = {"raw": raw}
        return {"success": True, "extracted_data": data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── TREND INSIGHTS ────────────────────────────────────────────────
@app.post("/tracking/trends")
async def get_trends_endpoint(
    request: HealthTrackingRequest,
    x_backend_secret: str = Header(None)
):
    verify_backend(x_backend_secret)
    try:
        health_data = {
            "condition": request.condition,
            "bp_readings": [r.dict() for r in (request.bp_readings or [])],
            "glucose_readings": [r.dict() for r in (request.glucose_readings or [])],
            "tsh_readings": [r.dict() for r in (request.tsh_readings or [])],
        }
        insights = get_trend_insights(str(health_data))
        return {"success": True, "insights": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── DOCTOR / FACILITY FINDER (Google Maps) ────────────────────────
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


@app.post("/validate/tsh")
async def validate_tsh_endpoint(value: float):
    return validate_tsh(value)
