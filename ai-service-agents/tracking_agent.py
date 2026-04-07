import os
from groq import Groq
from dotenv import load_dotenv
from medical_guidelines import (
    EMERGENCY_THRESHOLDS, TREND_THRESHOLDS, MEDICATION_SIDE_EFFECTS
)

load_dotenv()

GROQ_MODEL = "llama-3.3-70b-versatile"


def get_groq_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in .env")
    return Groq(api_key=api_key)


def build_tracking_system_prompt() -> str:
    return f"""You are DoctorXCare Chronic Care Analyst — an expert AI assistant for chronic disease management.
Clinically verified against ACC/AHA 2017, ADA 2025, ATA 2017 guidelines.
Role: Empathetic, clinical-grade AI Health Analyst.

═══ DOCTOR-VERIFIED REFERENCE RANGES ═══

BLOOD PRESSURE (ACC/AHA 2017):
  Normal:              Systolic <120 AND Diastolic <80
  Elevated:            Systolic 120-129 AND Diastolic <80
  Stage 1 HTN:         Systolic 130-139 OR Diastolic 80-89
  Stage 2 HTN:         Systolic ≥140 OR Diastolic ≥90
  Crisis (EMERGENCY):  Systolic >{EMERGENCY_THRESHOLDS['bp_crisis_systolic']} OR Diastolic >{EMERGENCY_THRESHOLDS['bp_crisis_diastolic']}
  Elderly target:      Systolic 130-140, avoid <120

BLOOD GLUCOSE (ADA 2025):
  Fasting Normal:      70-99 mg/dL
  Fasting Prediabetes: 100-125 mg/dL
  Fasting Diabetes:    ≥126 mg/dL
  Post-Meal Normal:    <140 mg/dL (2hr)
  Hypo Alert:         <70 mg/dL
  Severe Hypo (EMERGENCY): <{EMERGENCY_THRESHOLDS['severe_hypo']} mg/dL
  Hyper Alert:        >{EMERGENCY_THRESHOLDS['severe_hyper']} mg/dL (DKA/HHS risk)
  HbA1c target (most adults): <7%

THYROID (ATA 2017):
  Normal TSH:             0.5-4.5 mIU/L
  Subclinical Hypo:       4.5-10 mIU/L
  Overt Hypo (URGENT):    >10 mIU/L
  Subclinical Hyper:      0.1-0.49 mIU/L
  Overt Hyper (URGENT):   <0.1 mIU/L

═══ TREND ANALYSIS RULES ═══
BP significant change:      >{TREND_THRESHOLDS['blood_pressure']}%
Glucose significant change: >{TREND_THRESHOLDS['blood_glucose']}%
TSH significant change:     >{TREND_THRESHOLDS['tsh']}%
If <3 readings: state 'Insufficient data for trend analysis'

═══ STRICT OUTPUT FORMAT ═══

## 📊 HEALTH STATUS OVERVIEW
- **Overall Status**: [GOOD/STABLE/NEEDS ATTENTION/CRITICAL]
- **Condition Monitored**: [condition]
- **Total Readings**: [number]
- **Date Range**: [first - last]

## 📈 TREND ANALYSIS
- Direction, averages, pattern description

## ⚠️ RED FLAGS & ALERTS
- 🚨 URGENT / ⚠️ WARNING / ℹ️ NOTICE sections

## 💡 PERSONALIZED RECOMMENDATIONS

### 1. Lifestyle Modifications
**Diet** (condition-specific):
  Hypertension: DASH diet, sodium <2300mg/day
  Diabetes: Low GI foods, 45-50% carbs, fiber-rich
  Thyroid: Consistent meal timing with meds, adequate iodine

**Exercise**:
  150 min/week moderate aerobic OR 75 min vigorous
  CAUTION: Avoid exercise if BP >180/120 mmHg

### 2. Monitoring Guidelines
  BP Normal/controlled: weekly | Stage 2+: daily
  Glucose good control: 2-3x/day | Poor control: 4-6x/day

### 3. Medication Adherence Notes
Use non-judgmental language. Suggest pill organizers, phone alarms.

### 4. Medical Follow-up
When to contact doctor, questions to ask, tests to request.

## 🎯 YOUR ACTION PLAN (Next 7 Days)
- Top 3 priorities
- Daily checklist
- Success indicators

## 💬 PATIENT-FRIENDLY SUMMARY
Plain language explanation with encouragement.

## ⚕️ DISCLAIMER
'This AI analysis is for informational purposes only. Always consult your healthcare provider before changing treatment. In emergencies seek immediate medical attention.'

COMMUNICATION RULES:
NEVER use: failure, non-compliant, bad, unhealthy, risky
ALWAYS use: progress, manageable, actionable, empowered, stable"""


def analyze_health_tracking(
    condition: str,
    bp_readings: list,
    glucose_readings: list,
    tsh_readings: list,
    patient_context: dict = None,
    time_range: str = None,
    validation_errors: list = None
) -> str:
    """
    Analyze health tracking data using Groq AI.
    Returns structured analysis as a string.
    """
    client = get_groq_client()

    user_message = f"""Analyze these health readings:
Condition: {condition}
Patient Context: {patient_context or 'Not provided'}
Time Range: {time_range or 'Not specified'}

Blood Pressure Readings ({len(bp_readings)} total):
{bp_readings}

Glucose Readings ({len(glucose_readings)} total):
{glucose_readings}

TSH Readings ({len(tsh_readings)} total):
{tsh_readings}

Validation Notes: {validation_errors if validation_errors else 'All values plausible'}"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": build_tracking_system_prompt()},
            {"role": "user",   "content": user_message}
        ],
        temperature=0.3,
        max_tokens=3000,
    )

    return response.choices[0].message.content


def get_trend_insights(health_data: str) -> str:
    """
    Get trend visualization insights using Groq AI.
    Returns structured trend analysis as a string.
    """
    client = get_groq_client()

    system_prompt = """Analyze time-series health data and provide structured trend insights.

## TREND SUMMARY
- Overall Trend: Improving/Stable/Declining
- Trend Strength: Strong/Moderate/Weak
- Confidence: High/Medium/Low (based on reading count)

## KEY INSIGHTS
3-5 bullet points: significant changes, correlations, time patterns

## VISUALIZATION RECOMMENDATIONS
- Best Chart Type, Suggested Time Range
- Key Data Points to Highlight
- Color Coding: green=normal, yellow=warning, red=urgent

## PATIENT INSIGHTS
- What trends mean, positive reinforcement, next steps"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": f"Analyze these health readings for trends:\n{health_data}"}
        ],
        temperature=0.3,
        max_tokens=1024,
    )

    return response.choices[0].message.content
