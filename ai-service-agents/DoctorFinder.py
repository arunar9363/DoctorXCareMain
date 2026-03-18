import os
import httpx
from dotenv import load_dotenv

load_dotenv()

MAPS_API_KEY = os.getenv("Maps_API_KEY")
PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"

FACILITY_TYPE_MAP = {
    "hospital":  "hospital",
    "clinic":    "doctor",
    "pharmacy":  "pharmacy",
    "doctor":    "doctor",
    "lab":       "health",
    "health":    "health",
}


async def get_nearby_facilities(
    latitude: float,
    longitude: float,
    facility_type: str = "hospital",
    radius: int = 5000
) -> list:
    """
    Find nearby medical facilities using Google Places API.
    Returns a list of facility dicts.
    """
    if not MAPS_API_KEY:
        raise ValueError("Maps_API_KEY not found in .env")

    place_type = FACILITY_TYPE_MAP.get(facility_type.lower(), "hospital")

    params = {
        "location": f"{latitude},{longitude}",
        "radius":   radius,
        "type":     place_type,
        "key":      MAPS_API_KEY,
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(PLACES_NEARBY_URL, params=params)
        response.raise_for_status()
        data = response.json()

    status = data.get("status")
    if status == "REQUEST_DENIED":
        raise RuntimeError(f"Google Maps API denied: {data.get('error_message', 'Unknown error')}")
    if status == "ZERO_RESULTS":
        return []
    if status not in ("OK", "ZERO_RESULTS"):
        raise RuntimeError(f"Google Maps API error: {status}")

    facilities = []
    for place in data.get("results", []):
        facilities.append({
            "place_id":     place.get("place_id"),
            "name":         place.get("name"),
            "address":      place.get("vicinity"),
            "rating":       place.get("rating"),
            "total_ratings": place.get("user_ratings_total"),
            "open_now":     place.get("opening_hours", {}).get("open_now"),
            "types":        place.get("types", []),
            "location": {
                "lat": place["geometry"]["location"]["lat"],
                "lng": place["geometry"]["location"]["lng"],
            },
            "photo_reference": (
                place["photos"][0]["photo_reference"]
                if place.get("photos") else None
            ),
        })

    return facilities


async def get_place_details(place_id: str) -> dict:
    """
    Get detailed info about a specific place using its place_id.
    """
    if not MAPS_API_KEY:
        raise ValueError("Maps_API_KEY not found in .env")

    params = {
        "place_id": place_id,
        "fields":   (
            "name,formatted_address,formatted_phone_number,"
            "opening_hours,rating,user_ratings_total,"
            "website,url,geometry,types,photos"
        ),
        "key": MAPS_API_KEY,
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(PLACE_DETAILS_URL, params=params)
        response.raise_for_status()
        data = response.json()

    status = data.get("status")
    if status != "OK":
        raise RuntimeError(f"Google Places Details API error: {status} — {data.get('error_message', '')}")

    result = data.get("result", {})
    return {
        "name":             result.get("name"),
        "address":          result.get("formatted_address"),
        "phone":            result.get("formatted_phone_number"),
        "website":          result.get("website"),
        "google_maps_url":  result.get("url"),
        "rating":           result.get("rating"),
        "total_ratings":    result.get("user_ratings_total"),
        "open_now":         result.get("opening_hours", {}).get("open_now"),
        "weekday_hours":    result.get("opening_hours", {}).get("weekday_text", []),
        "types":            result.get("types", []),
        "location": {
            "lat": result.get("geometry", {}).get("location", {}).get("lat"),
            "lng": result.get("geometry", {}).get("location", {}).get("lng"),
        },
    }