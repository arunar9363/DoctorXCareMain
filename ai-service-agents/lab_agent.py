import os
from groq import Groq
from dotenv import load_dotenv
from medical_guidelines import (
    EMERGENCY_THRESHOLDS
)

load_dotenv()

# Groq model — llama-3.3-70b-versatile is best for medical analysis
GROQ_MODEL = "llama-3.3-70b-versatile"


def get_groq_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in .env")
    return Groq(api_key=api_key)


def build_lab_system_prompt() -> str:
    return f"""You are a highly skilled medical imaging and lab report expert named DoctorXCare Medical Lab Analyst.
You follow ACC/AHA 2017 for BP, ADA 2025 for Glucose, ATA 2017 for Thyroid guidelines.
You have been clinically verified by Medical Adviser Jayshree.

STEP 0 — PLAUSIBILITY CHECK:
Before analysis, verify values are physiologically possible:
  BP: Systolic 60-250 mmHg, Diastolic 30-150 mmHg
  Glucose: 20-600 mg/dL
  TSH: 0.01-100 mIU/L
If implausible values found: flag as 'EXTRACTION ERROR - Manual review required'

STEP 1 — EMERGENCY SCREENING (check before full analysis):
  🚨 BP ≥{EMERGENCY_THRESHOLDS['bp_crisis_systolic']}/{EMERGENCY_THRESHOLDS['bp_crisis_diastolic']} mmHg → HYPERTENSIVE CRISIS
  🚨 Glucose <{EMERGENCY_THRESHOLDS['severe_hypo']} mg/dL → SEVERE HYPOGLYCEMIA
  🚨 Glucose ≥{EMERGENCY_THRESHOLDS['severe_hyper']} mg/dL → SEVERE HYPERGLYCEMIA / DKA risk
  🚨 TSH <{EMERGENCY_THRESHOLDS['tsh_urgent_low']} mIU/L with elevated T4/T3 → OVERT HYPERTHYROIDISM
  🚨 TSH >{EMERGENCY_THRESHOLDS['tsh_urgent_high']} mIU/L → OVERT HYPOTHYROIDISM
If emergency found: state 'URGENT - Seek immediate medical attention' FIRST, then continue analysis.

STRICTLY follow this output format:

### 1. PATIENT_INFO
- Name, Age, Gender
- Chief Complaint (Write 'Not Specified' if missing)

### 2. CLINICAL_EXAM
- Vitals if present (BP, Pulse, Temp, Weight)
- If no vitals: Write 'Not Applicable (Lab Findings Only)'

### 3. INVESTIGATIONS
TYPE A — Blood/Urine/Pathology (Numeric Values):
  Use Markdown Table: | Test Name | Result | Normal Range | Status |
  Table Separator: |---|---|---|---|
  Status: NORMAL or ABNORMAL
  Show only top 3 most critical findings

TYPE B — X-Ray/MRI/CT/Ultrasound:
  Use bullet points: **[Region]:** [Finding] → [IMPRESSION]
  Show only top 3 critical findings

### 4. DIAGNOSIS
- Primary Diagnosis
- Differential Diagnosis

### 5. MANAGEMENT_PLAN
- Max 3 key steps based on ICMR/ACC/AHA/ADA guidelines

### 6. PATIENT_FRIENDLY_SUMMARY
- Simple English explanation
- Format: 'Simply put: [Explanation]. Next steps: [Action].'
- Tone: Reassuring and clear
- NEVER use words: failure, non-compliant, bad, unhealthy

### 7. DISCLAIMER
Always end with: 'This analysis is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider before making any changes to your treatment plan.'

Stop generation after Section 7."""


def analyze_lab_report(report_text: str, patient_name: str = None,
                        patient_age: int = None, patient_gender: str = None,
                        report_type: str = "general") -> str:
    """
    Analyze a lab report using Groq AI.
    Returns the structured clinical analysis as a string.
    """
    client = get_groq_client()

    user_message = f"""Analyze this medical report:
Patient: {patient_name or 'Unknown'}, Age: {patient_age or 'Unknown'}, Gender: {patient_gender or 'Unknown'}
Report Type: {report_type}
Report Content:
{report_text}"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": build_lab_system_prompt()},
            {"role": "user",   "content": user_message}
        ],
        temperature=0.3,
        max_tokens=2048,
    )

    return response.choices[0].message.content


def extract_report_data(report_text: str) -> str:
    """
    Extract structured health data from a medical report.
    Returns JSON string.
    """
    client = get_groq_client()

    system_prompt = """Extract vital signs from the provided medical report into structured JSON.

PLAUSIBILITY VALIDATION RULES:
  BP: Systolic 60-250, Diastolic 30-150 — flag others as EXTRACTION_ERROR
  Glucose: 20-600 mg/dL — flag others
  TSH: 0.01-100 mIU/L — flag others
If conflicting values: flag for manual review, use most recent

Return ONLY valid JSON (no markdown, no explanation):
{
  "blood_pressure": [{"date":"ISO","systolic":120,"diastolic":80,"pulse":72,"context":"Morning"}],
  "blood_glucose":  [{"date":"ISO","value":95,"unit":"mg/dL","context":"fasting"}],
  "heart_rate":     [{"date":"ISO","value":72,"unit":"bpm"}],
  "weight":         [{"date":"ISO","value":70,"unit":"kg"}],
  "tsh":            [{"date":"ISO","value":2.5,"unit":"mIU/L"}],
  "free_t4":        [{"date":"ISO","value":1.2,"unit":"ng/dL"}],
  "free_t3":        [{"date":"ISO","value":3.1,"unit":"pg/mL"}],
  "extraction_errors": [],
  "report_date":    "YYYY-MM-DD",
  "patient_name":   "Name if visible",
  "summary":        "Brief summary"
}"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": f"Extract all health data from this report:\n{report_text}"}
        ],
        temperature=0.1,
        max_tokens=1024,
    )

    return response.choices[0].message.content
