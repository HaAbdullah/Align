import requests
import json

API_KEY = ""

def test_claude_api():
    """Simple function to test Claude API key with a basic prompt"""
    
    headers = {
        "x-api-key": API_KEY,
        "content-type": "application/json",
        "anthropic-version": "2023-06-01"
    }
    
    payload = {
        "model": "claude-3-7-sonnet-20250219",
        "messages": [
            {"role": "user", "content": "Say hello and tell me that my API key is working!"}
        ],
        "max_tokens": 100
    }
    
    try:
        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            response_data = response.json()
            print("✅ API key is valid! Claude's response:")
            print(response_data["content"][0]["text"])
            return True
        else:
            print(f"❌ API request failed with status code: {response.status_code}")
            print(f"Error message: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing your Claude API key...")
    test_claude_api()