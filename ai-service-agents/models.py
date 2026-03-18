from pydantic import BaseModel, Field
from typing import Optional, List


# ── PATIENT CONTEXT ───────────────────────────────────────────────
class PatientContext(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    is_elderly: Optional[bool] = False
    is_pregnant: Optional[bool] = False
    trimester: Optional[int] = None          # 1, 2, or 3
    has_diabetes: Optional[bool] = False
    has_hypertension: Optional[bool] = False
    has_thyroid_disorder: Optional[bool] = False
    current_medications: Optional[List[str]] = []
    notes: Optional[str] = None


# ── BLOOD PRESSURE READING ────────────────────────────────────────
class BPReading(BaseModel):
    systolic: float
    diastolic: float
    pulse: Optional[float] = None
    date: Optional[str] = None               # ISO date string
    context: Optional[str] = None            # e.g. "morning", "after meds"


# ── GLUCOSE READING ───────────────────────────────────────────────
class GlucoseReading(BaseModel):
    value: float
    unit: Optional[str] = "mg/dL"
    date: Optional[str] = None
    context: Optional[str] = "fasting"      # fasting / post_meal / random


# ── TSH READING ───────────────────────────────────────────────────
class TSHReading(BaseModel):
    value: float
    unit: Optional[str] = "mIU/L"
    date: Optional[str] = None
    free_t4: Optional[float] = None
    free_t3: Optional[float] = None


# ── HEALTH TRACKING REQUEST ───────────────────────────────────────
class HealthTrackingRequest(BaseModel):
    condition: str = Field(..., description="e.g. hypertension, diabetes, thyroid")
    bp_readings: Optional[List[BPReading]] = []
    glucose_readings: Optional[List[GlucoseReading]] = []
    tsh_readings: Optional[List[TSHReading]] = []
    patient_context: Optional[PatientContext] = None
    time_range: Optional[str] = None        # e.g. "7_day", "30_day", "90_day"


# ── LAB REPORT REQUEST ────────────────────────────────────────────
class LabReportRequest(BaseModel):
    report_text: str
    report_type: Optional[str] = "general"  # blood, imaging, urine, general
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    patient_context: Optional[PatientContext] = None


# ── DOCTOR SEARCH REQUEST ─────────────────────────────────────────
class DoctorSearchRequest(BaseModel):
    latitude: float
    longitude: float
    facility_type: Optional[str] = "hospital"   # hospital, clinic, pharmacy
    radius: Optional[int] = 5000                # metres