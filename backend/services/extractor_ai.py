import httpx
import json
import os
import re

class ExtractorAI:
    def __init__(self):
        self.ollama_url = os.environ.get("OLLAMA_URL", "http://host.docker.internal:11434/api/generate")
        self.ollama_model = os.environ.get("OLLAMA_MODEL", "llama3.1:8b")
        self.groq_api_key = os.environ.get("GROQ_API_KEY")
        self.groq_model = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.groq_url = "https://api.groq.com/openai/v1/chat/completions"

    async def extract_data(self, text: str, motor: str = "llama3.1"):
        """
        Extracts clinical data using the specified motor.
        - 'llama3.1': Local Ollama inference.
        - 'groq': Remote Groq inference.
        """
        prompt = f"""You are a Colombian healthcare data specialist for Resolution 1888 of 2025.
Extract the clinical information from the following text and return it as a JSON object.

Required fields (use null if not found):
- patient_name: string
- patient_id: string (document number)
- patient_id_type: string (CC, TI, etc)
- attention_date: string (YYYY-MM-DD format)
- diagnoses: array of objects with "code" (ICD-10) and "description"
- medications: array of objects with "name", "dose", "frequency"
- procedures: array of strings

Medical text:
{text}

Return ONLY a valid JSON object, nothing else. No markdown, no explanation."""

        if motor == "groq" and self.groq_api_key:
            return await self._extract_with_groq(prompt)
        else:
            return await self._extract_with_ollama(prompt)

    async def _extract_with_ollama(self, prompt: str):
        async with httpx.AsyncClient(timeout=90.0) as client:
            try:
                print(f"[ExtractorAI] Calling Ollama with model {self.ollama_model}")
                response = await client.post(
                    self.ollama_url,
                    json={
                        "model": self.ollama_model,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    }
                )
                response.raise_for_status()
                result = response.json()
                raw_response = result.get("response", "")
                return self._parse_json(raw_response)
            except Exception as e:
                print(f"[ExtractorAI] Ollama error: {e}")
                return {"error": str(e)}

    async def _extract_with_groq(self, prompt: str):
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                print(f"[ExtractorAI] Calling Groq with model {self.groq_model}")
                response = await client.post(
                    self.groq_url,
                    headers={
                        "Authorization": f"Bearer {self.groq_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.groq_model,
                        "messages": [{"role": "user", "content": prompt}],
                        "response_format": {"type": "json_object"}
                    }
                )
                response.raise_for_status()
                result = response.json()
                raw_response = result["choices"][0]["message"]["content"]
                return self._parse_json(raw_response)
            except Exception as e:
                print(f"[ExtractorAI] Groq error: {e}")
                # Fallback to Ollama if Groq fails
                print("[ExtractorAI] Falling back to local Ollama...")
                return await self._extract_with_ollama(prompt)

    def _parse_json(self, raw_response: str):
        if not raw_response:
            return {"error": "Empty response from model"}
        
        print(f"[ExtractorAI] Raw response length: {len(raw_response)} chars")
        print(f"[ExtractorAI] Raw response preview: {raw_response[:300]}")

        # Strategy 1: Direct JSON parse
        try:
            return json.loads(raw_response)
        except json.JSONDecodeError:
            pass

        # Strategy 2: Extract JSON block from markdown
        json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_response, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        # Strategy 3: Find any JSON object in the response
        json_match = re.search(r"\{.*\}", raw_response, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass

        # Strategy 4: Return raw text as structured fallback
        print(f"[ExtractorAI] WARNING: Could not parse JSON, using raw fallback")
        return {
            "patient_name": "Extraction Pending",
            "patient_id": None,
            "patient_id_type": "CC",
            "attention_date": None,
            "diagnoses": [{"code": "Z00", "description": raw_response[:200]}],
            "medications": [],
            "procedures": [],
            "_raw_response": raw_response
        }
