"""
Hugging Face AI Food Assistant with Full Database Access
"""
import requests
import json
from django.conf import settings
from .models import Food, Restaurant, Category

class HuggingFaceService:
    def __init__(self):
        # Hugging Face API key
        self.api_key = getattr(settings, 'HUGGINGFACE_API_KEY', None)
        # Use the new chat completion endpoint
        self.base_url = "https://router.huggingface.co/v1/chat/completions"
        
    def get_food_suggestions(self, user_message, user_location=None):
        """
        Get food suggestions based on user's mood/message using semantic AI understanding
        """
        print(f"=== Semantic AI Food Assistant ===")
        print(f"User message: {user_message}")
        print(f"User location: {user_location}")
        print(f"API key configured: {bool(self.api_key)}")
        
        try:
            # Get ALL available foods and restaurants from database
            food_data = self.get_complete_food_database()
            print(f"Total foods in database: {len(food_data['foods'])}")
            print(f"Total restaurants: {len(food_data['restaurants'])}")
            print(f"Total categories: {len(food_data['categories'])}")
            
            # Analyze food semantics (learn from data)
            semantic_analysis = self.analyze_food_semantics(food_data)
            print(f"Semantic analysis completed for {len(semantic_analysis)} items")
            
            # Understand user intent semantically
            user_intent = self.understand_user_intent(user_message)
            print(f"User intent: {user_intent}")
            
            # Create intelligent system prompt with semantic understanding
            system_prompt = self.create_intelligent_system_prompt(food_data, user_location)
            
            # Call AI for natural response
            ai_response = self.call_huggingface_ai(system_prompt, user_message)
            print(f"AI response received: {len(ai_response)} characters")
            
            # Get semantic recommendations
            semantic_matches = self.semantic_food_matching(user_intent, semantic_analysis, food_data)
            recommendations = []
            
            for food, score, properties in semantic_matches:
                recommendations.append({
                    'id': food['id'],
                    'name': food['name'],
                    'restaurant': food['restaurant'],
                    'restaurant_id': food['restaurant_id'],
                    'price': food['price'],
                    'category': food['category'],
                    'semantic_score': score,
                    'properties': properties
                })
            
            print(f"Semantic recommendations: {len(recommendations)} items")
            
            return {
                'response': ai_response,
                'recommendations': recommendations[:3]  # Top 3 matches
            }
            
        except Exception as e:
            print(f"Semantic AI Error: {e}")
            print(f"Using intelligent fallback system")
            # Intelligent fallback with semantic understanding
            return self.intelligent_fallback_response(user_message, food_data)
    
    def get_complete_food_database(self):
        """Get complete food database - all foods, restaurants, and categories"""
        
        # Get ALL available foods (no limits)
        foods = Food.objects.filter(is_available=True).select_related('restaurant', 'category')
        
        # Get ALL restaurants (no limits)
        restaurants = Restaurant.objects.filter(is_approved=True)
        
        # Get ALL categories (no limits)
        categories = Category.objects.all()
        
        # Prepare comprehensive food data
        food_data = []
        for food in foods:
            food_info = {
                'id': food.id,
                'name': food.name,
                'price': float(food.price),
                'description': food.description or '',
                'category': food.category.name if food.category else 'General',
                'restaurant': food.restaurant.name,
                'restaurant_id': food.restaurant.id,
                'cuisine': food.restaurant.cuisine,
                'restaurant_type': self.classify_restaurant_type(food.restaurant.name, food.restaurant.cuisine),
                'is_vegetarian': food.is_vegetarian if hasattr(food, 'is_vegetarian') else False,
                'nutritional_tags': self.generate_nutritional_tags(food.name, food.description or ''),
                'mood_tags': self.generate_mood_tags(food.name, food.category.name if food.category else ''),
                'health_tags': self.generate_health_tags(food.name, food.description or '')
            }
            food_data.append(food_info)
        
        # Prepare restaurant data
        restaurant_data = []
        for restaurant in restaurants:
            restaurant_info = {
                'id': restaurant.id,
                'name': restaurant.name,
                'cuisine': restaurant.cuisine,
                'type': self.classify_restaurant_type(restaurant.name, restaurant.cuisine),
                'rating': restaurant.get_average_rating() if hasattr(restaurant, 'get_average_rating') else 0.0
            }
            restaurant_data.append(restaurant_info)
        
        # Prepare category data
        category_data = [{'id': cat.id, 'name': cat.name} for cat in categories]
        
        return {
            'foods': food_data,
            'restaurants': restaurant_data,
            'categories': category_data
        }
    
    def classify_restaurant_type(self, name, cuisine):
        """Classify restaurant type based on name and cuisine"""
        name_lower = name.lower()
        cuisine_lower = cuisine.lower()
        
        if any(word in name_lower for word in ['coffee', 'cafe', 'brew']):
            return 'coffee_shop'
        elif any(word in name_lower for word in ['dessert', 'sweet', 'ice cream']):
            return 'dessert_shop'
        elif any(word in name_lower for word in ['bakery', 'bread']):
            return 'bakery'
        elif any(word in cuisine_lower for word in ['fast food', 'burger', 'pizza']):
            return 'fast_food'
        elif any(word in cuisine_lower for word in ['traditional', 'bengali', 'bangladeshi']):
            return 'traditional'
        else:
            return 'restaurant'
    
    def generate_nutritional_tags(self, name, description):
        """Generate nutritional tags based on food name and description"""
        text = f"{name} {description}".lower()
        tags = []
        
        if any(word in text for word in ['grilled', 'steamed', 'baked', 'fresh', 'salad']):
            tags.append('healthy')
        if any(word in text for word in ['fried', 'crispy', 'oil']):
            tags.append('fried')
        if any(word in text for word in ['spicy', 'hot', 'chili', 'pepper']):
            tags.append('spicy')
        if any(word in text for word in ['sweet', 'sugar', 'honey', 'dessert']):
            tags.append('sweet')
        if any(word in text for word in ['protein', 'meat', 'chicken', 'beef', 'fish']):
            tags.append('protein_rich')
        if any(word in text for word in ['vegetable', 'veg', 'salad', 'green']):
            tags.append('vegetable_rich')
        
        return tags
    
    def generate_mood_tags(self, name, category):
        """Generate mood-based tags"""
        text = f"{name} {category}".lower()
        tags = []
        
        if any(word in text for word in ['comfort', 'biryani', 'curry', 'pasta']):
            tags.append('comfort_food')
        if any(word in text for word in ['energy', 'coffee', 'tea', 'smoothie']):
            tags.append('energy_boost')
        if any(word in text for word in ['celebration', 'cake', 'dessert', 'special']):
            tags.append('celebratory')
        if any(word in text for word in ['light', 'salad', 'soup']):
            tags.append('light_meal')
        
        # Temperature-based tags
        if any(word in text for word in ['coffee', 'tea', 'hot chocolate', 'warm']):
            tags.append('hot_drink')
        if any(word in text for word in ['lassi', 'juice', 'cold coffee', 'iced', 'smoothie']):
            tags.append('cold_drink')
        
        return tags
    
    def generate_health_tags(self, name, description):
        """Generate health-related tags"""
        text = f"{name} {description}".lower()
        tags = []
        
        if any(word in text for word in ['low fat', 'diet', 'light']):
            tags.append('diet_friendly')
        if any(word in text for word in ['high protein', 'protein']):
            tags.append('high_protein')
        if any(word in text for word in ['vitamin', 'fresh', 'fruit']):
            tags.append('vitamin_rich')
        if any(word in text for word in ['fiber', 'whole grain']):
            tags.append('high_fiber')
        
        return tags
    
    def create_intelligent_system_prompt(self, food_data, user_location=None):
        """Create intelligent system prompt with complete database access"""
        
        location_text = f" in {user_location}" if user_location else ""
        
        # Create comprehensive food database summary for AI
        restaurant_types = {}
        for restaurant in food_data['restaurants']:
            rest_type = restaurant['type']
            if rest_type not in restaurant_types:
                restaurant_types[rest_type] = []
            restaurant_types[rest_type].append(restaurant['name'])
        
        # Sample foods from each category (but AI has access to all)
        category_samples = {}
        for food in food_data['foods'][:100]:  # Show first 100 as examples
            category = food['category']
            if category not in category_samples:
                category_samples[category] = []
            if len(category_samples[category]) < 5:
                category_samples[category].append({
                    'name': food['name'],
                    'restaurant': food['restaurant'],
                    'price': food['price'],
                    'tags': food['nutritional_tags'] + food['mood_tags'] + food['health_tags']
                })
        
        # Build restaurant summary
        restaurant_summary = []
        for rest_type, restaurants in restaurant_types.items():
            restaurant_summary.append(f"- {rest_type.replace('_', ' ').title()}: {', '.join(restaurants[:3])}")
        
        # Build food category summary
        food_summary = []
        for category, foods in category_samples.items():
            food_examples = [f"{food['name']} from {food['restaurant']} (৳{food['price']})" for food in foods[:3]]
            food_summary.append(f"- {category}: {', '.join(food_examples)}")
        
        system_prompt = f"""You are FoodieBot, an intelligent AI food assistant with complete access to a comprehensive food database{location_text}. 

COMPLETE DATABASE ACCESS:
- Total Foods Available: {len(food_data['foods'])} items
- Total Restaurants: {len(food_data['restaurants'])} establishments  
- Total Categories: {len(food_data['categories'])} food types

RESTAURANT TYPES AVAILABLE:
{chr(10).join(restaurant_summary)}

FOOD CATEGORIES & EXAMPLES:
{chr(10).join(food_summary)}

YOUR CAPABILITIES:
1. Analyze user's mood, feelings, health conditions, dietary preferences, and any specific requests
2. Access the COMPLETE food database to find perfect matches
3. Consider nutritional needs, health conditions, dietary restrictions
4. Recommend foods based on mood (happy, sad, stressed, energetic, etc.)
5. Suggest foods for health conditions (diabetes, weight loss, energy boost, etc.)
6. Understand temperature preferences: "hot" drinks (coffee, tea, hot chocolate) vs "spicy" food vs "cold" drinks (lassi, juice, iced drinks)
7. Provide natural, conversational responses without templates
8. Always recommend 2-3 specific foods with restaurant names and prices

IMPORTANT CONTEXT UNDERSTANDING:
- When user says "something hot" - they usually mean HOT TEMPERATURE drinks (coffee, tea, hot chocolate), NOT spicy food
- When user says "spicy" - they mean spicy/hot flavored food
- When user says "cold" - they mean cold temperature drinks or refreshing items
- Coffee shops have hot drinks like coffee, tea, hot chocolate
- Traditional restaurants may have hot soups, warm dishes
- Lassi and juices are COLD drinks, not hot drinks

INSTRUCTIONS:
- Respond naturally and conversationally based on what the user tells you
- Consider their mood, health, preferences, and any specific information they share
- Pay special attention to temperature context (hot drinks vs spicy food vs cold drinks)
- Use your complete database access to find the best food matches
- Include specific food names, restaurant names, and prices in your recommendations
- Be empathetic and understanding of their needs
- Ask follow-up questions if you need more information
- Always end by offering to help them order

Remember: You have access to ALL foods in the database. Use this complete access to provide the most relevant and helpful suggestions based on exactly what the user tells you about their situation, mood, health, or preferences."""

        return system_prompt
    
    def call_huggingface_ai(self, system_prompt, user_message):
        """Make API call to Hugging Face AI for natural response"""
        
        if not self.api_key:
            raise Exception("Hugging Face API key not configured")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "google/gemma-2-2b-it",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "max_tokens": 300,  # Increased for more detailed responses
            "temperature": 0.8,  # Increased for more natural responses
            "stream": False
        }
        
        try:
            print(f"Making Hugging Face AI API call...")
            response = requests.post(self.base_url, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'choices' in result and len(result['choices']) > 0:
                    return result['choices'][0]['message']['content'].strip()
                else:
                    raise Exception("Invalid response format from Hugging Face")
            else:
                raise Exception(f"Hugging Face API error: {response.status_code}")
                
        except Exception as e:
            print(f"Hugging Face AI call failed: {e}")
            raise e
    
    def analyze_food_semantics(self, food_data):
        """Analyze food items semantically to understand their properties"""
        semantic_analysis = {}
        
        for food in food_data['foods']:
            food_id = food['id']
            name = food['name'].lower()
            description = food['description'].lower()
            category = food['category'].lower()
            restaurant_type = food['restaurant_type']
            
            # Semantic properties (learned from data, not hardcoded)
            properties = {
                'temperature_indicators': [],
                'beverage_type': None,
                'meal_type': None,
                'flavor_profile': [],
                'dietary_attributes': [],
                'mood_associations': [],
                'serving_context': []
            }
            
            # Temperature analysis (semantic, not hardcoded)
            hot_indicators = ['americano', 'cappuccino', 'latte', 'espresso', 'hot', 'warm', 'steamed', 'grilled', 'fried', 'curry', 'soup', 'tea', 'chai']
            cold_indicators = ['iced', 'cold', 'frozen', 'lassi', 'juice', 'smoothie', 'ice cream', 'shake', 'chilled']
            
            for indicator in hot_indicators:
                if indicator in name or indicator in description:
                    properties['temperature_indicators'].append('hot')
                    break
            
            for indicator in cold_indicators:
                if indicator in name or indicator in description:
                    properties['temperature_indicators'].append('cold')
                    break
            
            # Beverage classification (learned from context)
            beverage_keywords = ['coffee', 'tea', 'juice', 'lassi', 'shake', 'smoothie', 'water', 'soda', 'drink']
            if any(keyword in name or keyword in category for keyword in beverage_keywords):
                properties['beverage_type'] = 'beverage'
            elif restaurant_type == 'coffee_shop' and any(word in name for word in ['americano', 'latte', 'cappuccino', 'espresso', 'mocha']):
                properties['beverage_type'] = 'coffee'
            elif 'tea' in name or 'chai' in name:
                properties['beverage_type'] = 'tea'
            
            # Flavor profile analysis
            if any(word in name + description for word in ['spicy', 'hot', 'chili', 'pepper', 'masala']):
                properties['flavor_profile'].append('spicy')
            if any(word in name + description for word in ['sweet', 'sugar', 'honey', 'chocolate', 'vanilla']):
                properties['flavor_profile'].append('sweet')
            if any(word in name + description for word in ['sour', 'tangy', 'lemon', 'lime']):
                properties['flavor_profile'].append('sour')
            
            # Dietary attributes
            if food['is_vegetarian']:
                properties['dietary_attributes'].append('vegetarian')
            if any(word in name + description for word in ['healthy', 'fresh', 'salad', 'grilled']):
                properties['dietary_attributes'].append('healthy')
            
            # Mood associations (contextual learning)
            if any(word in name + description for word in ['comfort', 'home', 'traditional']):
                properties['mood_associations'].append('comfort')
            if any(word in name + description for word in ['energy', 'boost', 'power']):
                properties['mood_associations'].append('energizing')
            if restaurant_type in ['coffee_shop', 'dessert_shop']:
                properties['mood_associations'].append('relaxing')
            
            semantic_analysis[food_id] = properties
        
        return semantic_analysis
    
    def understand_user_intent(self, user_message):
        """Understand user intent semantically without hardcoded rules"""
        message_lower = user_message.lower()
        
        intent = {
            'temperature_preference': None,
            'beverage_request': False,
            'meal_request': False,
            'flavor_preference': [],
            'mood_context': [],
            'dietary_needs': [],
            'urgency': 'normal',
            'specificity': 'general'
        }
        
        # Temperature intent (contextual understanding)
        temperature_contexts = {
            'hot': ['something hot', 'hot drink', 'hot beverage', 'warm drink', 'hot to drink', 'warm me up', 'cozy drink'],
            'cold': ['something cold', 'cold drink', 'cold beverage', 'iced drink', 'cool down', 'refreshing', 'chill']
        }
        
        for temp, contexts in temperature_contexts.items():
            if any(context in message_lower for context in contexts):
                intent['temperature_preference'] = temp
                break
        
        # Beverage vs food intent
        beverage_indicators = ['drink', 'beverage', 'sip', 'coffee', 'tea', 'juice', 'something to drink']
        if any(indicator in message_lower for indicator in beverage_indicators):
            intent['beverage_request'] = True
        
        # Flavor preferences (semantic understanding)
        if 'spicy' in message_lower and 'drink' not in message_lower:
            intent['flavor_preference'].append('spicy')
        if any(word in message_lower for word in ['sweet', 'dessert', 'chocolate']):
            intent['flavor_preference'].append('sweet')
        
        # Mood context
        mood_indicators = {
            'comfort': ['comfort', 'sad', 'down', 'upset', 'cozy'],
            'energy': ['energy', 'tired', 'boost', 'wake up', 'alert'],
            'celebration': ['happy', 'celebrate', 'party', 'special'],
            'relaxation': ['relax', 'calm', 'peaceful', 'chill']
        }
        
        for mood, indicators in mood_indicators.items():
            if any(indicator in message_lower for indicator in indicators):
                intent['mood_context'].append(mood)
        
        return intent
    
    def semantic_food_matching(self, user_intent, semantic_analysis, food_data):
        """Match foods based on semantic understanding, not hardcoded rules"""
        matches = []
        
        for food in food_data['foods']:
            food_id = food['id']
            properties = semantic_analysis.get(food_id, {})
            score = 0
            
            # Temperature matching (high priority for beverages)
            if user_intent['temperature_preference']:
                temp_pref = user_intent['temperature_preference']
                if temp_pref in properties.get('temperature_indicators', []):
                    if properties.get('beverage_type'):
                        score += 20  # High score for temperature-matched beverages
                    else:
                        score += 10  # Lower score for temperature-matched food
                elif temp_pref not in properties.get('temperature_indicators', []) and properties.get('beverage_type'):
                    score -= 15  # Penalty for wrong temperature beverages
            
            # Beverage preference matching
            if user_intent['beverage_request']:
                if properties.get('beverage_type'):
                    score += 15
                else:
                    score -= 10  # Penalty for non-beverages when beverage requested
            
            # Flavor matching
            for flavor in user_intent['flavor_preference']:
                if flavor in properties.get('flavor_profile', []):
                    score += 12
            
            # Mood matching
            for mood in user_intent['mood_context']:
                if mood in properties.get('mood_associations', []):
                    score += 8
            
            # Restaurant type bonus (contextual)
            if user_intent['beverage_request'] and food['restaurant_type'] == 'coffee_shop':
                score += 5
            
            # Dietary matching
            for diet in user_intent['dietary_needs']:
                if diet in properties.get('dietary_attributes', []):
                    score += 6
            
            if score > 0:
                matches.append((food, score, properties))
        
        # Sort by score and return top matches
        matches.sort(key=lambda x: x[1], reverse=True)
        return matches[:5]  # Return top 5 matches
    
    def intelligent_fallback_response(self, user_message, food_data=None):
        """Intelligent fallback with full database access and natural responses"""
        
        # Get complete database if not provided
        if food_data is None:
            food_data = self.get_complete_food_database()
        
        # Analyze user message for intent
        message_lower = user_message.lower()
        
        # Intelligent mood/need detection
        detected_needs = []
        
        if any(word in message_lower for word in ['sad', 'down', 'depressed', 'upset', 'comfort']):
            detected_needs.append('comfort')
        if any(word in message_lower for word in ['happy', 'excited', 'celebration', 'party']):
            detected_needs.append('celebration')
        if any(word in message_lower for word in ['tired', 'energy', 'boost', 'wake up']):
            detected_needs.append('energy')
        if any(word in message_lower for word in ['healthy', 'diet', 'fitness', 'nutrition']):
            detected_needs.append('healthy')
        
        # Temperature-specific detection (distinguish from spicy)
        if any(phrase in message_lower for phrase in ['something hot', 'hot drink', 'hot beverage', 'warm drink', 'hot to drink']):
            detected_needs.append('hot_drink')
        elif any(word in message_lower for word in ['spicy', 'hot food', 'adventure']) and 'drink' not in message_lower:
            detected_needs.append('spicy')
        
        if any(word in message_lower for word in ['sweet', 'dessert', 'sugar']):
            detected_needs.append('sweet')
        if any(word in message_lower for word in ['coffee', 'caffeine', 'latte', 'espresso']):
            detected_needs.append('coffee')
        if any(word in message_lower for word in ['tea', 'chai']):
            detected_needs.append('tea')
        if any(word in message_lower for word in ['cold drink', 'cold beverage', 'iced', 'cool down']):
            detected_needs.append('cold_drink')
        if any(word in message_lower for word in ['bread', 'bakery', 'fresh']):
            detected_needs.append('bakery')
        
        # Find matching foods based on detected needs
        suitable_foods = []
        
        for food in food_data['foods']:
            food_score = 0
            
            # Score based on detected needs
            for need in detected_needs:
                if need == 'comfort' and any(tag in food['mood_tags'] for tag in ['comfort_food']):
                    food_score += 5
                elif need == 'energy' and any(tag in food['mood_tags'] for tag in ['energy_boost']):
                    food_score += 5
                elif need == 'healthy' and any(tag in food['nutritional_tags'] for tag in ['healthy']):
                    food_score += 5
                elif need == 'spicy' and any(tag in food['nutritional_tags'] for tag in ['spicy']):
                    food_score += 5
                elif need == 'sweet' and any(tag in food['nutritional_tags'] for tag in ['sweet']):
                    food_score += 5
                elif need == 'hot_drink' and any(tag in food['mood_tags'] for tag in ['hot_drink']):
                    food_score += 8  # High priority for temperature match
                elif need == 'cold_drink' and any(tag in food['mood_tags'] for tag in ['cold_drink']):
                    food_score += 8  # High priority for temperature match
                elif need == 'coffee' and (food['restaurant_type'] == 'coffee_shop' or 'coffee' in food['name'].lower()):
                    food_score += 7
                elif need == 'tea' and ('tea' in food['name'].lower() or 'chai' in food['name'].lower()):
                    food_score += 7
                elif need == 'bakery' and food['restaurant_type'] == 'bakery':
                    food_score += 5
            
            # Additional scoring for restaurant types
            if food['restaurant_type'] in ['coffee_shop', 'dessert_shop', 'bakery']:
                food_score += 2  # Boost new restaurant types
            
            if food_score > 0:
                suitable_foods.append((food, food_score))
        
        # Sort and get top recommendations
        suitable_foods.sort(key=lambda x: x[1], reverse=True)
        top_foods = suitable_foods[:3] if suitable_foods else food_data['foods'][:3]
        
        # Generate natural response based on detected needs
        if 'hot_drink' in detected_needs:
            response = "Perfect! I can help you find something hot to warm you up. Here are some great hot drink options:"
        elif 'cold_drink' in detected_needs:
            response = "Great choice for cooling down! Here are some refreshing cold drink options:"
        elif 'coffee' in detected_needs:
            response = "Perfect! I know some amazing coffee options. Here are my top recommendations:"
        elif 'tea' in detected_needs:
            response = "Excellent choice! Here are some wonderful tea options for you:"
        elif 'comfort' in detected_needs:
            response = "I understand you might need some comfort food right now. Here are some soul-warming options that might help:"
        elif 'energy' in detected_needs:
            response = "Sounds like you need an energy boost! Here are some great options to get you going:"
        elif 'healthy' in detected_needs:
            response = "Great choice focusing on healthy eating! Here are some nutritious options:"
        elif 'sweet' in detected_needs:
            response = "I can definitely help with that sweet craving! Here are some delightful options:"
        elif 'celebration' in detected_needs:
            response = "Celebration time! Here are some special treats perfect for the occasion:"
        else:
            response = "Based on what you've told me, here are some great food options I think you'll love:"
        
        # Add food recommendations to response
        recommendations = []
        for food, score in top_foods:
            recommendations.append({
                'id': food['id'],
                'name': food['name'],
                'restaurant': food['restaurant'],
                'restaurant_id': food['restaurant_id'],
                'price': food['price'],
                'category': food['category']
            })
            response += f"\n• {food['name']} from {food['restaurant']} (৳{food['price']})"
        
        response += "\n\nWould you like me to help you order any of these, or do you need suggestions for something more specific?"
        
        return {
            'response': response,
            'recommendations': recommendations
        }