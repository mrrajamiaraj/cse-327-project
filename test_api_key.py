#!/usr/bin/env python3
"""
Quick test to verify Hugging Face API key is working
"""
import os
from dotenv import load_dotenv
import requests

load_dotenv()

def test_api_key():
    api_key = os.getenv('HUGGINGFACE_API_KEY')
    
    if not api_key or api_key == 'your_huggingface_api_key_here':
        print("❌ Please add your Hugging Face API key to .env file")
        print("Get it from: https://huggingface.co/settings/tokens")
        return False
    
    print(f"✅ API key found: {api_key[:8]}...")
    
    # Test API call
    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {
        "model": "google/gemma-2-2b-it",
        "messages": [
            {"role": "user", "content": "Hello, I'm testing the API"}
        ],
        "max_tokens": 20
    }
    
    try:
        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Hugging Face API is working!")
            return True
        else:
            print(f"❌ API Error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return False

if __name__ == "__main__":
    test_api_key()