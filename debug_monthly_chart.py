#!/usr/bin/env python3
"""
Debug the monthly chart data to see what's being returned
"""
import requests
import json

def debug_monthly_chart():
    print("🔍 DEBUGGING MONTHLY CHART DATA")
    print("=" * 50)
    
    # Login as restaurant user
    login_data = {
        "email": "restaurant@gmail.com",
        "password": "pass1234"
    }
    
    try:
        # Login
        login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=login_data)
        
        if login_response.status_code == 200:
            token = login_response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
            
            # Get monthly chart data
            response = requests.get(
                'http://127.0.0.1:8000/api/v1/restaurant/analytics/?period=monthly', 
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                chart_data = data.get('chart_data', {})
                
                print("📊 MONTHLY CHART RAW DATA:")
                print(f"Period: {chart_data.get('period')}")
                print(f"Total Revenue: ৳{chart_data.get('total_revenue', 0):,.2f}")
                print(f"Max Value: ৳{chart_data.get('max_value', 0):,.2f}")
                
                labels = chart_data.get('labels', [])
                values = chart_data.get('values', [])
                
                print(f"\nLabels ({len(labels)} items): {labels}")
                print(f"Values ({len(values)} items): {values}")
                
                print(f"\nNon-zero data points:")
                for i, (label, value) in enumerate(zip(labels, values)):
                    if value > 0:
                        print(f"  Day {label}: ৳{value:,.2f}")
                
                # Check what today's date is
                from datetime import datetime
                today = datetime.now()
                print(f"\nToday's date: {today.strftime('%Y-%m-%d')} (Day {today.day})")
                print(f"Expected data points for monthly chart: {today.day} (days from 1 to {today.day})")
                
                if len(labels) == today.day:
                    print("✅ CORRECT: Monthly chart shows daily data from day 1 to today")
                else:
                    print(f"❌ INCORRECT: Expected {today.day} data points, got {len(labels)}")
                    
            else:
                print(f"❌ API Error: {response.status_code}")
                print(response.text)
                
        else:
            print(f"❌ Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_monthly_chart()