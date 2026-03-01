import os
import re
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)
CHAT_MODEL = os.getenv("GROQ_CHAT_MODEL", "llama-3.3-70b-versatile")

def chatbot(user_input: str):
    try:
        completion = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {"role": "system", "content": "You are a Gen Z AI assistant. Reply in Hinglish, max 2 sentences."},
                {"role": "user", "content": user_input}
            ],
            temperature=0.7, max_tokens=100,
        )
        return completion.choices[0].message.content
    except Exception as e:
        raise RuntimeError("Groq chat request failed") from e

def _extract_json_object(text: str):
    if not text:
        return None

    fenced = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", text, re.IGNORECASE)
    if fenced:
        try:
            return json.loads(fenced.group(1))
        except Exception:
            pass

    direct = re.search(r"\{[\s\S]*\}", text)
    if direct:
        try:
            return json.loads(direct.group(0))
        except Exception:
            return None

    return None


def _normalized_filters(payload: dict):
    safe = payload if isinstance(payload, dict) else {}

    def as_str(value, fallback=""):
        text = str(value or "").strip()
        return text if text else fallback

    def as_list(value):
        if not isinstance(value, list):
            return []
        return [str(item).strip() for item in value if str(item).strip()]

    status = as_str(safe.get("status_any"), "any").lower()
    if status not in {"any", "online", "busy", "offline"}:
        status = "any"

    return {
        "query": as_str(safe.get("query")),
        "filters": {
            "campus": as_str(safe.get("filters", {}).get("campus") if isinstance(safe.get("filters"), dict) else safe.get("campus")),
            "branch": as_str(safe.get("filters", {}).get("branch") if isinstance(safe.get("filters"), dict) else safe.get("branch")),
            "batch": as_str(safe.get("filters", {}).get("batch") if isinstance(safe.get("filters"), dict) else safe.get("batch")),
            "skills_all": as_list(safe.get("filters", {}).get("skills_all") if isinstance(safe.get("filters"), dict) else safe.get("skills_all")),
            "skills_any": as_list(safe.get("filters", {}).get("skills_any") if isinstance(safe.get("filters"), dict) else safe.get("skills_any")),
            "interests_any": as_list(safe.get("filters", {}).get("interests_any") if isinstance(safe.get("filters"), dict) else safe.get("interests_any")),
            "looking_for_any": as_list(safe.get("filters", {}).get("looking_for_any") if isinstance(safe.get("filters"), dict) else safe.get("looking_for_any")),
            "status_any": status,
            "open_to_connect": bool(safe.get("filters", {}).get("open_to_connect") if isinstance(safe.get("filters"), dict) and safe.get("filters", {}).get("open_to_connect") is not None else (safe.get("open_to_connect") if safe.get("open_to_connect") is not None else True)),
        },
        "sort_by": as_str(safe.get("sort_by"), "compatibility"),
        "limit": max(1, min(int(safe.get("limit", 20) or 20), 100)),
        "intent": as_str(safe.get("intent"), "find_teammates"),
    }

def filter_fields_generator(user_input: str, user_profile: dict = None):
    try:
        profile = user_profile or {}
        my_campus = profile.get("campus", "UIT")
        my_branch = profile.get("branch", "Computer Science and Engineering")
        
        query_lower = user_input.lower()
        injected_context = ""
        
        if any(word in query_lower for word in ["apni branch", "meri branch", "same branch", "apni class", "meri class"]):
            injected_context += f" [System Rule: You MUST set the 'branch' field strictly to '{my_branch} भी'.] "
            
        if any(word in query_lower for word in ["apna college", "mera college", "same college", "apne campus"]):
            injected_context += f" [System Rule: You MUST set the 'campus' field strictly to '{my_campus}'.] "

        smart_user_input = user_input + injected_context

        system_prompt = """
You are a precise JSON data extractor for a teammate matchmaker algorithm.
Your ONLY job is to extract skills, interests, and hard filters from the user's query and output a VALID JSON object. Do not make up any data. If a field is not mentioned, leave it empty.

Output EXACTLY this JSON structure:
{
  "strict_filters": {
    "campus": "",
    "branch": "",
    "batch": ""
  },
  "scoring_filters": {
    "skills_any": [],
    "interests_any": [],
    "looking_for_any": []
  },
  "status_any": "any"
}
"""

        completion = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": smart_user_input}
            ],
            temperature=0.0,
            max_tokens=250,
            response_format={"type": "json_object"} 
        )

        response = completion.choices[0].message.content
        parsed_data = json.loads(response) 
        
        return parsed_data

    except Exception as e:
        print(f"Error: {e}")
        return {
            "strict_filters": {"campus": "", "branch": "", "batch": ""},
            "scoring_filters": {"skills_any": [], "interests_any": [], "looking_for_any": []},
            "status_any": "any"
        }