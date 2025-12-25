#!/usr/bin/env python3
"""
Test the Hugging Face GPT-2 Chatbot functionality
"""
import requests
import json

def test_huggingface_chatbot():
    print("🤖 Testing Hugging Face GPT-2 Chatbot System...")
    
    # Login as customer
    login_data = {
        "email": "skmoin@gmail.com",
        "password": "password123"
    }
    
    try:
        # Login
        login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token = login_response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            # Test AI Chat endpoint
            print("\n💬 Testing Hugging Face GPT-2 Chat API:")
            
            # Test message
            test_message = {
                "message": "I'm feeling excited and happy today! What delicious food should I try?",
                "location": "Dhaka, Bangladesh"
            }
            
            chat_response = requests.post(
                'http://127.0.0.1:8000/api/v1/customer/ai-chat/', 
                json=test_message,
                headers=headers
            )
            
            print(f"Chat API Status: {chat_response.status_code}")
            
            if chat_response.status_code == 200:
                result = chat_response.json()
                print(f"\n✅ Hugging Face GPT-2 Chat Response:")
                print(f"Message: {result.get('message', 'N/A')}")
                print(f"AI Response: {result.get('response', 'N/A')}")
                print(f"Recommendations: {len(result.get('recommendations', []))} items")
                
                # Show recommendations
                recommendations = result.get('recommendations', [])
                if recommendations:
                    print(f"\n🍽️ Food Recommendations:")
                    for i, food in enumerate(recommendations, 1):
                        print(f"  {i}. {food.get('name')} from {food.get('restaurant')} - ৳{food.get('price')}")
                
                # Check if it's using Hugging Face or fallback
                if 'error' in result:
                    print(f"\n⚠️ Using fallback system: {result['error']}")
                else:
                    print(f"\n✅ Hugging Face GPT-2 is working correctly!")
                
                # Test different moods
                print(f"\n🎭 Testing Different Moods:")
                
                moods = [
                    "I'm feeling sad and need comfort food 😔",
                    "I want something healthy and energizing! 💪",
                    "I'm in the mood for something spicy and adventurous 🌶️"
                ]
                
                for mood in moods:
                    mood_response = requests.post(
                        'http://127.0.0.1:8000/api/v1/customer/ai-chat/', 
                        json={"message": mood},
                        headers=headers
                    )
                    
                    if mood_response.status_code == 200:
                        mood_result = mood_response.json()
                        print(f"\n🎭 Mood: {mood}")
                        print(f"Response: {mood_result.get('response', 'N/A')[:100]}...")
                        print(f"Recommendations: {len(mood_result.get('recommendations', []))} items")
                
                print(f"\n✅ Multi-mood testing completed!")
                
            else:
                print(f"❌ Chat API Error: {chat_response.status_code}")
                try:
                    error_data = chat_response.json()
                    print(f"Error details: {error_data}")
                except:
                    print(f"Error text: {chat_response.text}")
                
        else:
            print(f"❌ Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Test Error: {e}")

if __name__ == "__main__":
    test_huggingface_chatbot()