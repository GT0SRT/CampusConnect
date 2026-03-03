import os
import json
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

generation_config = {
  "temperature": 0.0, # Zero hallucination
  "response_mime_type": "application/json", # Native JSON Enforcement!
}
model = genai.GenerativeModel('gemini-1.5-flash', generation_config=generation_config)

def filter_fields_generator(user_input: str, user_profile: dict = None):
    try:
        profile = user_profile or {}
        my_campus = profile.get("campus", "UIT")
        my_branch = profile.get("branch", "Computer Science and Engineering")
        
        query_lower = user_input.lower()

        system_prompt = f"""
You are a teammate matchmaker API. Extract the requirements from the user's query into a strict JSON format.
Do NOT make up data. If a field is not mentioned, leave it as an empty string or empty array.

User Query: "{user_input}"

Output EXACTLY this JSON structure:
{{
  "strict_filters": {{
    "campus": "",
    "branch": "",
    "batch": ""
  }},
  "scoring_filters": {{
    "skills_any": [],
    "interests_any": [],
    "looking_for_any": []
  }},
  "status_any": "any"
}}
"""
        response = model.generate_content(system_prompt)
        
        parsed_data = json.loads(response.text) 
        return parsed_data

    except Exception as e:
        print(f"Matchmaker Error: {e}")
        # Fallback dictionary
        return {
            "strict_filters": {"campus": "", "branch": "", "batch": ""},
            "scoring_filters": {"skills_any": [], "interests_any": [], "looking_for_any": []},
            "status_any": "any"
        }