# 🤖 Grok AI Chatbot Setup Guide

## Overview
This guide will help you set up the AI-powered food recommendation chatbot using Grok AI. The chatbot analyzes user mood and suggests personalized food recommendations from your restaurant database.

## Features Implemented

### 🎯 Core Features
- **Floating Chat Button**: Always accessible on customer dashboard
- **Mood Analysis**: AI understands user emotions and context
- **Smart Food Suggestions**: Recommendations based on mood, time, and preferences
- **Chat History**: All conversations are saved and retrievable
- **Real-time Responses**: Instant AI-powered suggestions
- **Food Integration**: Direct links to recommended restaurants/foods

### 🧠 AI Capabilities
- Mood detection (happy, sad, stressed, excited, etc.)
- Context awareness (time of day, weather, location)
- Personalized recommendations from your database
- Conversational and empathetic responses
- Fallback system when AI is unavailable

## Setup Instructions

### Step 1: Get Grok API Key

1. **Visit X.AI Platform**: Go to [https://x.ai](https://x.ai)
2. **Create Account**: Sign up or log in to your X.AI account
3. **Access API**: Navigate to the API section
4. **Generate Key**: Create a new API key for your application
5. **Copy Key**: Save your API key securely

### Step 2: Configure Environment Variables

Add your Grok API key to the `.env` file:

```bash
# Grok AI Configuration
GROK_API_KEY=your_actual_grok_api_key_here
```

**Important**: Replace `your_actual_grok_api_key_here` with your real Grok API key.

### Step 3: Install Required Dependencies

The chatbot uses existing dependencies, but ensure you have:

```bash
# Backend (already included)
pip install requests  # For API calls
pip install django    # Framework

# Frontend (already included)
npm install react     # UI framework
```

### Step 4: Test the Integration

1. **Start Backend Server**:
   ```bash
   python manage.py runserver
   ```

2. **Start Frontend Server**:
   ```bash
   npm run dev
   ```

3. **Test Chatbot**:
   - Navigate to customer dashboard (`http://localhost:5173/home`)
   - Look for the floating orange robot button (🤖) in bottom-right corner
   - Click to open chat interface
   - Send a test message like "I'm feeling happy today!"

## Usage Examples

### Customer Interactions

**Happy Mood**:
```
User: "I'm feeling great today! 😊"
Bot: "That's wonderful! For your happy mood, I'd recommend:
1. Margherita Pizza from Tony's Pizzeria (৳450) - Perfect for celebrating!
2. Chocolate Brownie from Sweet Treats (৳180) - Sweet like your mood!
Would you like me to help you order any of these?"
```

**Comfort Food**:
```
User: "I'm feeling down and need comfort food 😔"
Bot: "I understand you need some comfort. Here are some soul-warming options:
1. Chicken Biryani from Spice Garden (৳280) - Rich and satisfying
2. Creamy Pasta from Italian Corner (৳320) - Warm and comforting
These should help lift your spirits!"
```

**Healthy Options**:
```
User: "I want to eat healthy today 🥗"
Bot: "Great choice for healthy eating! I recommend:
1. Fresh Garden Salad from Green Bowl (৳220) - Packed with nutrients
2. Grilled Chicken from Fit Foods (৳380) - Lean protein option
Perfect for your wellness goals!"
```

## Technical Architecture

### Backend Components

1. **GrokAIService** (`core/grok_ai.py`):
   - Handles API communication with Grok
   - Processes food database for context
   - Implements fallback suggestions
   - Manages error handling

2. **AIChatViewSet** (`core/views.py`):
   - REST API endpoints for chat
   - Message storage and retrieval
   - User authentication
   - Response formatting

3. **AIChatMessage Model** (`core/models.py`):
   - Stores chat history
   - Links to user accounts
   - Timestamps for conversations

### Frontend Components

1. **AIChatBot** (`frontend/src/components/AIChatBot.jsx`):
   - Floating chat button
   - Chat interface popup
   - Message handling
   - Food recommendation display

2. **HomeScreen Integration**:
   - Embedded chatbot component
   - Seamless user experience
   - Responsive design

## API Endpoints

### Chat Endpoints
- `POST /api/v1/customer/ai-chat/` - Send message to AI
- `GET /api/v1/customer/ai-chat/history/` - Get chat history

### Request Format
```json
{
  "message": "I'm feeling happy today!",
  "location": "Dhaka, Bangladesh"
}
```

### Response Format
```json
{
  "id": 123,
  "message": "I'm feeling happy today!",
  "response": "That's wonderful! For your happy mood, I'd recommend...",
  "recommendations": [
    {
      "id": 1,
      "name": "Margherita Pizza",
      "restaurant": "Tony's Pizzeria",
      "price": 450,
      "category": "Pizza"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Customization Options

### 1. Modify AI Prompts
Edit `core/grok_ai.py` to customize:
- System prompts for different personalities
- Response formats and styles
- Recommendation logic
- Mood detection keywords

### 2. UI Customization
Modify `frontend/src/components/AIChatBot.jsx`:
- Chat button position and style
- Popup size and appearance
- Message bubble designs
- Color schemes and animations

### 3. Add New Features
Extend functionality by adding:
- Voice input/output
- Image sharing
- Location-based suggestions
- Dietary restriction handling
- Multi-language support

## Troubleshooting

### Common Issues

1. **API Key Not Working**:
   - Verify key is correct in `.env` file
   - Check X.AI account status
   - Ensure API quota is available

2. **Chat Not Opening**:
   - Check browser console for errors
   - Verify user is logged in
   - Ensure backend server is running

3. **No Food Recommendations**:
   - Check if foods exist in database
   - Verify restaurant data is complete
   - Review AI response parsing logic

4. **Slow Responses**:
   - Check internet connection
   - Monitor Grok API response times
   - Consider implementing caching

### Debug Mode

Enable debug logging in `core/grok_ai.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Performance Optimization

### 1. Caching
- Cache frequent AI responses
- Store common food recommendations
- Implement Redis for session data

### 2. Database Optimization
- Index food and restaurant tables
- Optimize query performance
- Use select_related for joins

### 3. Frontend Optimization
- Lazy load chat history
- Implement message pagination
- Optimize re-renders

## Security Considerations

### 1. API Key Protection
- Never expose API key in frontend
- Use environment variables only
- Rotate keys regularly

### 2. Input Validation
- Sanitize user messages
- Limit message length
- Prevent injection attacks

### 3. Rate Limiting
- Implement per-user limits
- Monitor API usage
- Handle quota exceeded gracefully

## Monitoring and Analytics

### 1. Usage Metrics
- Track chat sessions
- Monitor popular queries
- Analyze recommendation success

### 2. Performance Metrics
- API response times
- Error rates
- User satisfaction

### 3. Business Insights
- Popular food categories
- Peak usage times
- Conversion rates

## Future Enhancements

### Planned Features
- **Voice Chat**: Speech-to-text and text-to-speech
- **Image Recognition**: Food photo analysis
- **Predictive Suggestions**: Based on order history
- **Group Orders**: Multi-user recommendations
- **Nutrition Info**: Health-conscious suggestions
- **Seasonal Menus**: Time-based recommendations

### Integration Opportunities
- **Social Media**: Share recommendations
- **Calendar**: Event-based suggestions
- **Weather**: Weather-appropriate foods
- **Fitness Apps**: Activity-based nutrition

## Support

For technical support or questions:
1. Check this documentation first
2. Review error logs in Django admin
3. Test with fallback responses
4. Contact development team

## Success Metrics

The chatbot is working correctly when:
- ✅ Floating button appears on customer dashboard
- ✅ Chat opens with welcome message
- ✅ AI responds to mood-based queries
- ✅ Food recommendations are relevant
- ✅ Chat history is preserved
- ✅ Food links navigate correctly
- ✅ Fallback works when AI is unavailable

---

**Congratulations!** 🎉 Your AI-powered food recommendation chatbot is now ready to help customers discover their perfect meals based on their mood and preferences!