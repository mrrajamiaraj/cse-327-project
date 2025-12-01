# core/search_views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Restaurant, Food
from .serializers import RestaurantSerializer


class SearchView(APIView):
    """
    Search for restaurants by name or food items.
    When searching for food items, returns restaurants that sell those items.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response({
                'restaurants': [],
                'count': 0,
                'message': 'No query provided'
            })
        
        # Search restaurants by name (case-insensitive)
        restaurants_by_name = Restaurant.objects.filter(
            name__icontains=query,
            is_approved=True
        )
        
        # Search food items and get their restaurants
        foods = Food.objects.filter(name__icontains=query)
        restaurant_ids_from_food = foods.values_list('restaurant_id', flat=True).distinct()
        restaurants_by_food = Restaurant.objects.filter(
            id__in=restaurant_ids_from_food,
            is_approved=True
        )
        
        # Combine and deduplicate using union
        all_restaurants = (restaurants_by_name | restaurants_by_food).distinct()
        
        serializer = RestaurantSerializer(all_restaurants, many=True, context={'request': request})
        return Response({
            'restaurants': serializer.data,
            'count': all_restaurants.count()
        })
