import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Groq API key — used for lab analysis, health tracking, chronic disease management
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    # Google Maps API key — used only for hospital/facility finder
    MAPS_API_KEY = os.getenv("Maps_API_KEY")

    # Secret shared between Node.js backend and this Python service
    BACKEND_SECRET = os.getenv("BACKEND_SECRET_KEY", "doctorxcare_secret")

    @classmethod
    def validate(cls):
        missing = []
        if not cls.GROQ_API_KEY:
            missing.append("GROQ_API_KEY")
        if not cls.MAPS_API_KEY:
            missing.append("Maps_API_KEY")
        if missing:
            raise ValueError(f"Missing required env vars: {', '.join(missing)}")


config = Config()
