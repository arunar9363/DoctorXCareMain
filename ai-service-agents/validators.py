from medical_guidelines import (
    BP_PLAUSIBILITY, GLUCOSE_PLAUSIBILITY, TSH_PLAUSIBILITY
)


def validate_bp(systolic: float, diastolic: float) -> dict:
    errors = []
    if not (BP_PLAUSIBILITY["systolic"]["min"] <= systolic <= BP_PLAUSIBILITY["systolic"]["max"]):
        errors.append(f"Systolic {systolic} mmHg is outside plausible range (60-250)")
    if not (BP_PLAUSIBILITY["diastolic"]["min"] <= diastolic <= BP_PLAUSIBILITY["diastolic"]["max"]):
        errors.append(f"Diastolic {diastolic} mmHg is outside plausible range (30-150)")
    if systolic <= diastolic:
        errors.append("Systolic must be greater than diastolic")
    return {"valid": len(errors) == 0, "errors": errors}


def validate_glucose(value: float) -> dict:
    errors = []
    if not (GLUCOSE_PLAUSIBILITY["min"] <= value <= GLUCOSE_PLAUSIBILITY["max"]):
        errors.append(f"Glucose {value} mg/dL is outside plausible range (20-600)")
    return {"valid": len(errors) == 0, "errors": errors}


def validate_tsh(value: float) -> dict:
    errors = []
    if not (TSH_PLAUSIBILITY["min"] <= value <= TSH_PLAUSIBILITY["max"]):
        errors.append(f"TSH {value} mIU/L is outside plausible range (0.01-100)")
    return {"valid": len(errors) == 0, "errors": errors}


def classify_bp(systolic: float, diastolic: float) -> str:
    if systolic >= 180 or diastolic >= 120:
        return "HYPERTENSIVE_CRISIS"
    elif systolic >= 140 or diastolic >= 90:
        return "STAGE2_HYPERTENSION"
    elif systolic >= 130 or diastolic >= 80:
        return "STAGE1_HYPERTENSION"
    elif 120 <= systolic <= 129 and diastolic < 80:
        return "ELEVATED"
    else:
        return "NORMAL"


def classify_glucose(value: float, context: str = "fasting") -> str:
    if value < 54:
        return "SEVERE_HYPOGLYCEMIA"
    elif value < 70:
        return "HYPOGLYCEMIA"
    elif value >= 400:
        return "SEVERE_HYPERGLYCEMIA"
    elif value >= 300:
        return "HYPERGLYCEMIA_ALERT"

    if context == "fasting":
        if value <= 99:   return "NORMAL"
        elif value <= 125: return "PREDIABETES"
        else:              return "DIABETES"
    elif context == "post_meal":
        if value < 140:   return "NORMAL"
        elif value < 200: return "PREDIABETES"
        else:              return "DIABETES"
    return "UNKNOWN"


def classify_tsh(value: float) -> str:
    if value >= 10.0:    return "OVERT_HYPOTHYROIDISM"
    elif value >= 4.5:   return "SUBCLINICAL_HYPOTHYROIDISM"
    elif value >= 0.5:   return "NORMAL"
    elif value >= 0.1:   return "SUBCLINICAL_HYPERTHYROIDISM"
    else:                return "OVERT_HYPERTHYROIDISM"


def get_alert_level(classification: str) -> str:
    urgent = {"HYPERTENSIVE_CRISIS", "SEVERE_HYPOGLYCEMIA",
              "SEVERE_HYPERGLYCEMIA", "OVERT_HYPOTHYROIDISM", "OVERT_HYPERTHYROIDISM"}
    warning = {"STAGE2_HYPERTENSION", "HYPOGLYCEMIA", "HYPERGLYCEMIA_ALERT",
               "DIABETES", "SUBCLINICAL_HYPOTHYROIDISM", "SUBCLINICAL_HYPERTHYROIDISM"}
    notice = {"STAGE1_HYPERTENSION", "ELEVATED", "PREDIABETES"}

    if classification in urgent:  return "URGENT"
    if classification in warning: return "WARNING"
    if classification in notice:  return "NOTICE"
    return "NORMAL"