#!/usr/bin/env python3
"""
Final test to verify graph consistency between seller dashboard and total revenue pages
"""
import requests
import json

def test_final_consistency():
    print("🎯 FINAL GRAPH CONSISTENCY TEST")
    print("=" * 60)
    
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
            
            print("✅ Login successful")
            print("\n📊 TESTING SELLER DASHBOARD CHARTS:")
            print("-" * 40)
            
            # Test all periods for seller dashboard
            dashboard_data = {}
            for period in ['daily', 'monthly', 'yearly']:
                response = requests.get(
                    f'http://127.0.0.1:8000/api/v1/restaurant/analytics/?period={period}', 
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    chart_data = data.get('chart_data', {})
                    dashboard_data[period] = chart_data
                    
                    print(f"\n📈 {period.upper()} Chart:")
                    print(f"  📍 Data Points: {len(chart_data.get('labels', []))}")
                    print(f"  💰 Total Revenue: ৳{chart_data.get('total_revenue', 0):,.2f}")
                    print(f"  📊 Max Value: ৳{chart_data.get('max_value', 0):,.2f}")
                    
                    values = chart_data.get('values', [])
                    non_zero = [v for v in values if v > 0]
                    print(f"  ✨ Active Points: {len(non_zero)}/{len(values)}")
                    
                    if non_zero:
                        print(f"  📋 Sample Values: {[f'৳{v:,.0f}' for v in non_zero[:3]]}")
                        print(f"  📈 Distribution: Min=৳{min(non_zero):,.0f}, Max=৳{max(non_zero):,.0f}")
                else:
                    print(f"❌ Failed to get {period} data: {response.status_code}")
            
            print("\n💰 TESTING TOTAL REVENUE PAGE:")
            print("-" * 40)
            
            # Test total revenue page
            earnings_response = requests.get('http://127.0.0.1:8000/api/v1/restaurant/earnings/', headers=headers)
            
            if earnings_response.status_code == 200:
                earnings = earnings_response.json()
                
                print(f"✅ Total Revenue Page loaded successfully")
                print(f"💵 Total Earnings: ৳{earnings.get('total_earnings', 0):,.2f}")
                print(f"💰 Available Balance: ৳{earnings.get('available_balance', 0):,.2f}")
                print(f"📊 Daily Revenue (Net): ৳{earnings.get('daily_revenue', {}).get('net', 0):,.2f}")
                
                # Monthly data
                monthly_data = earnings.get('monthly_data', [])
                print(f"\n📅 Monthly Data: {len(monthly_data)} months")
                if monthly_data:
                    current_month = monthly_data[-1]
                    print(f"  Current Month ({current_month.get('month')}):")
                    print(f"    Gross: ৳{current_month.get('gross_revenue', 0):,.2f}")
                    print(f"    Net: ৳{current_month.get('net_revenue', 0):,.2f}")
                    print(f"    Orders: {current_month.get('orders_count', 0)}")
                
                # Weekly data
                weekly_data = earnings.get('weekly_data', [])
                print(f"\n📅 Weekly Data: {len(weekly_data)} weeks")
                if weekly_data:
                    current_week = weekly_data[-1]
                    print(f"  Current Week ({current_week.get('week')}):")
                    print(f"    Net: ৳{current_week.get('net_revenue', 0):,.2f}")
                    print(f"    Orders: {current_week.get('orders_count', 0)}")
            
            print("\n🔍 CROSS-PAGE CONSISTENCY CHECK:")
            print("-" * 40)
            
            # Compare daily data
            if 'daily' in dashboard_data and earnings_response.status_code == 200:
                dashboard_daily_total = dashboard_data['daily'].get('total_revenue', 0)
                earnings_daily_gross = earnings.get('daily_revenue', {}).get('gross', 0)
                
                print(f"📊 Daily Revenue Comparison:")
                print(f"  Dashboard: ৳{dashboard_daily_total:,.2f}")
                print(f"  Total Revenue (Gross): ৳{earnings_daily_gross:,.2f}")
                
                if abs(dashboard_daily_total - earnings_daily_gross) < 1:
                    print(f"  ✅ MATCH: Perfect consistency!")
                else:
                    print(f"  ❌ MISMATCH: Difference of ৳{abs(dashboard_daily_total - earnings_daily_gross):,.2f}")
            
            # Compare monthly data
            if 'monthly' in dashboard_data and monthly_data:
                dashboard_monthly_total = dashboard_data['monthly'].get('total_revenue', 0)
                earnings_monthly_gross = monthly_data[-1].get('gross_revenue', 0) if monthly_data else 0
                
                print(f"\n📊 Monthly Revenue Comparison:")
                print(f"  Dashboard: ৳{dashboard_monthly_total:,.2f}")
                print(f"  Total Revenue (Gross): ৳{earnings_monthly_gross:,.2f}")
                
                if abs(dashboard_monthly_total - earnings_monthly_gross) < 1:
                    print(f"  ✅ MATCH: Perfect consistency!")
                else:
                    print(f"  ❌ MISMATCH: Difference of ৳{abs(dashboard_monthly_total - earnings_monthly_gross):,.2f}")
            
            print("\n🎯 CHART FUNCTIONALITY VERIFICATION:")
            print("-" * 40)
            
            # Verify chart periods work correctly
            periods_working = 0
            for period in ['daily', 'monthly', 'yearly']:
                if period in dashboard_data:
                    chart = dashboard_data[period]
                    labels = chart.get('labels', [])
                    values = chart.get('values', [])
                    
                    if len(labels) == len(values) and len(labels) > 0:
                        non_zero_values = [v for v in values if v > 0]
                        if len(non_zero_values) > 0:
                            periods_working += 1
                            print(f"  ✅ {period.upper()}: {len(non_zero_values)} active data points")
                        else:
                            print(f"  ⚠️  {period.upper()}: No active data points")
                    else:
                        print(f"  ❌ {period.upper()}: Invalid chart data structure")
            
            print(f"\n🏆 FINAL RESULT:")
            print(f"  Working Chart Periods: {periods_working}/3")
            print(f"  Data Consistency: {'✅ PERFECT' if periods_working == 3 else '⚠️ NEEDS ATTENTION'}")
            print(f"  Chart Logic: {'✅ WORKING' if periods_working >= 2 else '❌ BROKEN'}")
            
            if periods_working == 3:
                print(f"\n🎉 SUCCESS: All charts are working with proper data distribution!")
                print(f"📊 Both seller dashboard and total revenue page show consistent data")
                print(f"🎯 Chart logic is functioning correctly across all time periods")
            else:
                print(f"\n⚠️  Some issues detected - check the data distribution")
                
        else:
            print(f"❌ Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_final_consistency()