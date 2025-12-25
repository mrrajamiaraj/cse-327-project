# 🤖 OpenAI GPT Chatbot Setup Guide

## Overview
This guide will help you set up the AI-powered food recommendation chatbot using OpenAI's GPT API. OpenAI offers free tier credits for new accounts, making it accessible for development and testing.

## Why OpenAI GPT?
- ✅ **Free Tier**: $5 in free credits for new accounts
- ✅ **Reliable**: Industry-standard AI service
- ✅ **Well-documented**: Extensive documentation and community support
- ✅ **No billing required initially**: Use free credits to get started
- ✅ **High quality**: GPT-3.5-turbo provides excellent responses

## Setup Instructions

### Step 1: Get OpenAI API Key

1. **Visit OpenAI Platform**: Go to [https://platform.openai.com](https://platform.openai.com)
2. **Create Account**: Sign up with your email (you'll get $5 free credits)
3. **Navigate to API Keys**: Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
4. **Create New Key**: Click "Create new secret key"
5. **Copy Key**: Save your API key securely (starts with `sk-`)

### Step 2: Configure Environment Variables

Add your OpenAI API key to the `.env` file:

```bash
# AI Configuration
OPENAI_API_KEY=sk-your_actual_openai_api_key_here
```

**Important**: Replace `sk-your_actual_openai_api_key_here` with your real OpenAI API key.

### Step 3: Test the Integration

1. **Restart Backend Server**:
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

## Features Included

### 🎯 Core Capabilities
- **Mood Analysis**: GPT understands complex emotions and context
- **Smart Recommendations**: AI suggests foods based on mood, time, preferences
- **Conversational**: Natural, empathetic responses
- **Database Integration**: Only recommends available foods from your restaurant database
- **Fallback System**: Intelligent rule-based suggestions when API is unavailable

### 💬 Example Conversations

**Happy Mood**:
```
User: "I'm feeling amazing today! 🎉"
GPT: "That's fantastic! Your great mood calls for some celebration food! I'd recommend:
1. Beef Burger from Chillox (৳320) - Perfect for a happy celebration!
2. Firni from Kacchi Bhai (৳85) - Sweet treat to match your sweet mood!
These will keep your spirits high! Would you like me to help you order?"
```

**Comfort Food**:
```
User: "I'm stressed and need comfort food 😰"
GPT: "I understand you're feeling stressed. Let me suggest some comforting options:
1. Chicken Biryani from Haji Biriyani (৳280) - Rich, warm, and satisfying
2. Beef Tehari from Kacchi Bhai (৳250) - Traditional comfort that soothes the soul
These should help you feel better. Take care of yourself! 💙"
```

**Healthy Options**:
```
User: "I want to eat healthy today 🥗"
GPT: "Great choice for your health! Here are some nutritious options:
1. Grilled Chicken from Fit Kitchen (৳380) - Lean protein, perfectly seasoned
2. Fresh Salad Bowl from Green Garden (৳220) - Packed with vitamins and energy
Your body will thank you for these choices! 🌱"
```

## Technical Details

### API Configuration
- **Model**: `gpt-3.5-turbo` (free tier compatible)
- **Max Tokens**: 200 (cost-effective)
- **Temperature**: 0.7 (balanced creativity)
- **Timeout**: 30 seconds

### Cost Management
- **Free Credits**: $5 for new accounts (lasts months for chatbot usage)
- **Cost per Request**: ~$0.002 for typical chatbot responses
- **Monthly Estimate**: $1-5 for moderate usage
- **Fallback System**: Reduces API calls when needed

### Error Handling
- **API Limits**: Graceful fallback to rule-based suggestions
- **Network Issues**: Timeout handling with user-friendly messages
- **Invalid Keys**: Clear error messages for debugging
- **Rate Limiting**: Automatic retry with exponential backoff

## Usage Monitoring

### Check API Usage
1. Visit [OpenAI Usage Dashboard](https://platform.openai.com/usage)
2. Monitor daily/monthly usage
3. Set up billing alerts if needed
4. Track cost per conversation

### Optimize Costs
- **Shorter Prompts**: Reduce token usage
- **Caching**: Store common responses
- **Fallback First**: Use AI for complex queries only
- **User Limits**: Implement per-user rate limiting

## Troubleshooting

### Common Issues

1. **"API Key Not Working"**:
   - Verify key starts with `sk-`
   - Check key is active in OpenAI dashboard
   - Ensure no extra spaces in `.env` file

2. **"Rate Limit Exceeded"**:
   - You're making too many requests
   - Wait a few minutes and try again
   - Consider upgrading to paid tier

3. **"Insufficient Credits"**:
   - Check usage at platform.openai.com/usage
   - Add payment method for continued usage
   - Fallback system will activate automatically

4. **"Model Not Found"**:
   - Ensure using `gpt-3.5-turbo`
   - Check OpenAI model availability
   - Update model name if needed

### Debug Mode

Enable detailed logging by adding to `core/openai_service.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Security Best Practices

### API Key Security
- ✅ Never commit API keys to version control
- ✅ Use environment variables only
- ✅ Rotate keys regularly
- ✅ Monitor usage for unusual activity

### Input Validation
- ✅ Sanitize user messages
- ✅ Limit message length (500 chars)
- ✅ Filter inappropriate content
- ✅ Rate limit per user

## Scaling Considerations

### Performance Optimization
- **Response Caching**: Cache common mood-food combinations
- **Async Processing**: Handle multiple requests concurrently
- **Database Indexing**: Optimize food search queries
- **CDN Integration**: Cache static responses

### Business Intelligence
- **Conversation Analytics**: Track popular moods and foods
- **Recommendation Success**: Monitor click-through rates
- **User Satisfaction**: Collect feedback on suggestions
- **Peak Usage**: Identify busy times for scaling

## Comparison: OpenAI vs Grok vs Fallback

| Feature | OpenAI GPT | Grok AI | Fallback System |
|---------|------------|---------|-----------------|
| **Cost** | $5 free credits | Requires billing | Free |
| **Quality** | Excellent | Excellent | Good |
| **Speed** | Fast (1-3s) | Fast (1-3s) | Instant |
| **Availability** | 99.9% uptime | 99% uptime | 100% |
| **Setup** | Easy | Medium | None |
| **Customization** | High | High | Medium |

## Migration from Grok

The system automatically falls back to OpenAI if Grok is unavailable. To fully switch:

1. Add OpenAI API key to `.env`
2. System will prefer OpenAI over Grok
3. Remove Grok key to use OpenAI exclusively
4. Both can coexist for redundancy

## Success Metrics

Your chatbot is working correctly when:
- ✅ Floating robot button appears on customer dashboard
- ✅ Chat opens with GPT-powered welcome message
- ✅ AI provides contextual, mood-based food suggestions
- ✅ Recommendations link to real foods in your database
- ✅ Chat history is preserved across sessions
- ✅ Fallback works when API is unavailable

## Next Steps

1. **Add OpenAI API Key**: Get your free $5 credits
2. **Test Conversations**: Try different moods and preferences
3. **Monitor Usage**: Track API costs and user engagement
4. **Customize Prompts**: Adjust AI personality and responses
5. **Scale Up**: Add payment method when free credits are used

---

**Ready to go!** 🚀 Your GPT-powered food recommendation chatbot will provide intelligent, empathetic suggestions to help customers discover their perfect meals!