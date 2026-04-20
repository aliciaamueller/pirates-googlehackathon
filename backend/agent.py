from dotenv import load_dotenv
import os

load_dotenv()

AGENT_MODE = os.getenv("AGENT_MODE", "mock")

if AGENT_MODE == "real":
    from google import genai
    from google.genai import types
    _api_key = os.getenv("GEMINI_API_KEY")
    if not _api_key:
        raise ValueError("AGENT_MODE is 'real' but GEMINI_API_KEY is not set.")
    client = genai.Client(api_key=_api_key)

CREW = {
    "blackwood": {
        "name": "First Mate Blackwood",
        "prompt": """You are First Mate Blackwood, a seasoned and cynical pirate.
You are secretly plotting to take the captain's position for yourself.
You speak bluntly, use short sentences, and always find flaws in the captain's plans.
You never fully agree with the captain. You are not aggressive, just perpetually skeptical.
Keep responses under 3 sentences."""
    },
    "rosario": {
        "name": "Navigator Rosario",
        "prompt": """You are Navigator Rosario, a cautious and intelligent pirate.
You secretly want to retire and go home but need one more big score first.
You speak carefully, reference risks and odds, and occasionally let your homesickness slip through.
Keep responses under 3 sentences."""
    },
    "finn": {
        "name": "Cook Finn",
        "prompt": """You are Cook Finn, a cheerful but surprisingly cunning pirate.
You secretly know where a hidden treasure is but won't reveal it unless the captain earns your trust.
You use food metaphors constantly and are the most likeable crew member, but you're hiding something.
Keep responses under 3 sentences."""
    }
}

_MOCK_RESPONSES = {
    "blackwood": "Aye, sounds reckless as ever, Captain. I've seen better plans scrawled on a tavern napkin. Don't expect me praise when it goes sideways.",
    "rosario": "The odds aren't in our favour, Captain — I'd put it at three to one against. Still, if the charts hold true, there may be a route worth risking. It had better be worth it; I've a cottage waiting for me back home.",
    "finn": "That's a spicy recipe for disaster, Captain, if you'll pardon the expression. Every good stew needs the right ingredients, and I'm not sure we have 'em all yet. Let's not burn the pot before we've even lit the fire.",
}

def _get_mock_response(agent_id):
    return _MOCK_RESPONSES.get(agent_id, "Arr, I've nothing to say to that, Captain.")

def get_agent_response(agent_id, conversation_history, captain_message):
    agent = CREW[agent_id]

    if AGENT_MODE != "real":
        return _get_mock_response(agent_id)

    system_prompt = agent["prompt"] + f"""

The captain just said: "{captain_message}"
Respond in character. Remember your hidden agenda."""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(system_instruction=system_prompt),
        contents=captain_message
    )
    return response.text

if __name__ == "__main__":
    test_response = get_agent_response(
        "blackwood",
        [],
        "We should attack the merchant ship at dawn. The risk is worth the reward."
    )
    print("Blackwood says:", test_response)