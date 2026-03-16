"""
Medical Guidelines — Doctor Verified (Feb 2026)
Reviewer: Medical Adviser Jayshree
Rating: APPROVED WITH MINOR MODIFICATIONS
"""

# ─── BLOOD PRESSURE ───────────────────────────────────────────────
BP_RANGES = {
    "normal":              {"systolic": (0, 119),   "diastolic": (0, 79)},
    "elevated":            {"systolic": (120, 129),  "diastolic": (0, 79)},
    "stage1_hypertension": {"systolic": (130, 139),  "diastolic": (80, 89)},
    "stage2_hypertension": {"systolic": (140, 179),  "diastolic": (90, 119)},
    "crisis":              {"systolic": (180, 999),  "diastolic": (120, 999)},
}

BP_ALERTS = {
    "warning": {
        "description": "Stage 2 Hypertension — doctor follow-up needed",
        "systolic_min": 140, "diastolic_min": 90
    },
    "urgent": {
        "description": "Hypertensive Crisis — immediate medical attention",
        "systolic_min": 180, "diastolic_min": 120
    }
}

# Plausibility checks (doctor verified)
BP_PLAUSIBILITY = {
    "systolic":  {"min": 60,  "max": 250},
    "diastolic": {"min": 30,  "max": 150},
}

# Elderly BP targets (>65 years) — AHA 2017
BP_ELDERLY = {
    "target_systolic":  (130, 140),
    "target_diastolic": (70, 80),
    "note": "Avoid aggressive lowering <120 unless tolerated"
}

# ─── BLOOD GLUCOSE ────────────────────────────────────────────────
GLUCOSE_RANGES = {
    "fasting": {
        "normal":     (70, 99),
        "prediabetes": (100, 125),
        "diabetes":   (126, 9999),
        "hypo_alert": (0, 69),
        "severe_hypo": (0, 53),
        "hyper_alert": (300, 9999),
        "severe_hyper": (400, 9999),
    },
    "post_meal": {
        "normal":     (0, 139),
        "prediabetes": (140, 199),
        "diabetes":   (200, 9999),
    },
    "random": {
        "normal":  (0, 139),
        "diabetes": (200, 9999),  # with symptoms
    }
}

# HbA1c targets (ADA 2025)
HBA1C = {
    "normal":       (0, 5.6),
    "prediabetes":  (5.7, 6.4),
    "diabetes":     (6.5, 99),
    "target_most_adults": 7.0,
    "target_healthy":     6.5,
    "target_elderly":     8.0,
}

# Glycemic control levels (doctor verified)
GLYCEMIC_CONTROL = {
    "fasting": {
        "good": (80, 130),
        "fair": (131, 150),
        "poor": (151, 9999),
    },
    "post_meal": {
        "good": (0, 179),
        "fair": (180, 200),
        "poor": (201, 9999),
    },
    "std_dev": {
        "good": (0, 24),
        "fair": (25, 35),
        "poor": (36, 9999),
    }
}

# Glucose plausibility
GLUCOSE_PLAUSIBILITY = {"min": 20, "max": 600}

# Gestational diabetes (ACOG 2023 / ADA)
GESTATIONAL_GLUCOSE = {
    "fasting_max":   95,
    "1hr_post_meal": 140,
    "2hr_post_meal": 120,
}

# Elderly glucose targets (ADA 2025)
GLUCOSE_ELDERLY = {
    "fasting": (90, 130),
    "post_meal_max": 180,
    "note": "Individualized — avoid aggressive hypoglycemia treatment"
}

# ─── THYROID ──────────────────────────────────────────────────────
THYROID_RANGES = {
    "tsh": {
        "normal":               (0.5, 4.5),   # ATA 2017 adjusted
        "subclinical_hypo":     (4.5, 10.0),
        "overt_hypo":           (10.0, 9999),
        "subclinical_hyper":    (0.1, 0.49),
        "overt_hyper":          (0.0, 0.09),
    },
    "free_t4":  {"normal": (0.8, 1.8), "unit": "ng/dL"},
    "total_t4": {"normal": (5.0, 12.0), "unit": "µg/dL"},
    "free_t3":  {"normal": (2.3, 4.2), "unit": "pg/mL"},
    "total_t3": {"normal": (80, 200),  "unit": "ng/dL"},
    "anti_tpo": {"normal_max": 35,     "unit": "IU/mL"},
}

THYROID_ALERTS = {
    "warning": {"tsh_high": 4.5,  "tsh_low": 0.5},
    "urgent":  {"tsh_high": 10.0, "tsh_low": 0.1},
}

# Pregnancy TSH (trimester-specific)
THYROID_PREGNANCY = {
    "trimester_1": (0.1, 2.5),
    "trimester_2": (0.2, 3.0),
    "trimester_3": (0.3, 3.0),
}

# TSH plausibility
TSH_PLAUSIBILITY = {"min": 0.01, "max": 100}

# ─── TREND ANALYSIS ──────────────────────────────────────────────
TREND_THRESHOLDS = {
    "blood_pressure": 5.0,   # 5% change = significant (doctor verified)
    "blood_glucose":  10.0,  # 10% change = significant
    "tsh":            5.0,
    "weight":         5.0,
    "default":        5.0,
}

TREND_MIN_READINGS = {
    "7_day":  7,
    "30_day": 14,
    "90_day": 45,
}

# ─── EMERGENCY THRESHOLDS ────────────────────────────────────────
EMERGENCY_THRESHOLDS = {
    "bp_crisis_systolic":   180,
    "bp_crisis_diastolic":  120,
    "severe_hypo":          54,
    "severe_hyper":         400,
    "tsh_urgent_high":      10.0,
    "tsh_urgent_low":       0.1,
}

# ─── MEDICATION SIDE EFFECTS ────────────────────────────────────
MEDICATION_SIDE_EFFECTS = {
    "bp_meds": [
        "Dizziness or lightheadedness (hypotension)",
        "Dry cough (ACE inhibitors)",
        "Ankle swelling (calcium channel blockers)",
        "Fatigue or weakness",
    ],
    "diabetes_meds": [
        "Hypoglycemia (low blood sugar)",
        "Nausea or stomach upset",
        "Weight changes",
        "Rare: lactic acidosis (metformin)",
    ],
    "thyroid_meds": [
        "Palpitations or rapid heartbeat",
        "Jitteriness or tremors",
        "Insomnia",
        "Excessive sweating",
    ],
}