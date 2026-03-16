import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    LAB_API_KEY      = os.getenv("LAB_SERVICE_API_KEY")
    TRACKING_API_KEY = os.getenv("TRACKING_SERVICE_API_KEY")
    MAPS_API_KEY     = os.getenv("Maps_API_KEY")
    BACKEND_SECRET   = os.getenv("BACKEND_SECRET_KEY", "doctorxcare_secret")

    @classmethod
    def validate(cls):
        missing = []
        if not cls.LAB_API_KEY:      missing.append("LAB_SERVICE_API_KEY")
        if not cls.TRACKING_API_KEY: missing.append("TRACKING_SERVICE_API_KEY")
        if not cls.MAPS_API_KEY:     missing.append("Maps_API_KEY")
        if missing:
            raise ValueError(f"Missing env vars: {', '.join(missing)}")

config = Config()