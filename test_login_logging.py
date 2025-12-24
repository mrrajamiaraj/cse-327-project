#!/usr/bin/env python3
"""
Test the new login logging system
"""
import requests
import json

def test_login_logging():
    print("🧪 Testing Login Logging System...")
    
    # Test successful login
    print("\n1️⃣ Testing Successful Login:")
    login_data = {
        "email": "restaurant@gmail.com",
        "password": "restaurantchalai"
    }
    
    try:
        login_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=login_data)
        print(f"   Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            print("   ✅ Successful login - should be logged")
            token = login_response.json()['access']
            headers = {'Authorization': f'Bearer {token}'}
        else:
            print(f"   ❌ Login failed: {login_response.text}")
            return
    except Exception as e:
        print(f"   Error: {e}")
        return
    
    # Test failed login
    print("\n2️⃣ Testing Failed Login:")
    failed_login_data = {
        "email": "restaurant@gmail.com",
        "password": "wrongpassword"
    }
    
    try:
        failed_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=failed_login_data)
        print(f"   Failed login status: {failed_response.status_code}")
        if failed_response.status_code == 401:
            print("   ✅ Failed login - should be logged")
        else:
            print(f"   Unexpected response: {failed_response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test login with non-existent user
    print("\n3️⃣ Testing Login with Non-existent User:")
    nonexistent_login_data = {
        "email": "nonexistent@gmail.com",
        "password": "anypassword"
    }
    
    try:
        nonexistent_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=nonexistent_login_data)
        print(f"   Non-existent user login status: {nonexistent_response.status_code}")
        if nonexistent_response.status_code == 401:
            print("   ✅ Non-existent user login rejected - no log should be created")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test admin login to view logs
    print("\n4️⃣ Testing Admin Access to Login Logs:")
    admin_login_data = {
        "email": "admin@test.com",  # This is an admin user
        "password": "password123"
    }
    
    try:
        admin_response = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json=admin_login_data)
        print(f"   Admin login status: {admin_response.status_code}")
        
        if admin_response.status_code == 200:
            admin_token = admin_response.json()['access']
            admin_headers = {'Authorization': f'Bearer {admin_token}'}
            
            # Try to access login logs
            logs_response = requests.get('http://127.0.0.1:8000/api/v1/admin/login-logs/', headers=admin_headers)
            print(f"   Login logs API status: {logs_response.status_code}")
            
            if logs_response.status_code == 200:
                logs = logs_response.json()
                if isinstance(logs, dict) and 'results' in logs:
                    logs_list = logs['results']
                elif isinstance(logs, list):
                    logs_list = logs
                else:
                    logs_list = []
                
                print(f"   ✅ Found {len(logs_list)} login log entries")
                
                # Show recent logs
                for i, log in enumerate(logs_list[:5]):  # Show first 5
                    status = "✅ Success" if log.get('success') else "❌ Failed"
                    print(f"      {i+1}. {log.get('user_email')} ({log.get('user_role')}) - {status} - {log.get('login_time')}")
                
                # Test login stats
                stats_response = requests.get('http://127.0.0.1:8000/api/v1/admin/login-logs/stats/', headers=admin_headers)
                print(f"   Login stats API status: {stats_response.status_code}")
                
                if stats_response.status_code == 200:
                    stats = stats_response.json()
                    print(f"   📊 Login Statistics:")
                    print(f"      Total logins: {stats.get('total_logins', 0)}")
                    print(f"      Successful: {stats.get('successful_logins', 0)}")
                    print(f"      Failed: {stats.get('failed_logins', 0)}")
                    print(f"      Recent (30 days): {stats.get('recent_logins', 0)}")
                    
                    logins_by_role = stats.get('logins_by_role', [])
                    if logins_by_role:
                        print(f"      By role:")
                        for role_stat in logins_by_role:
                            print(f"        {role_stat.get('user__role', 'Unknown')}: {role_stat.get('count', 0)}")
            else:
                print(f"   ❌ Could not access login logs: {logs_response.text}")
        else:
            print(f"   ❌ Admin login failed: {admin_response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n✅ Login logging test completed!")
    print("   Check Django admin at http://127.0.0.1:8000/admin/core/loginlog/ to see the logs")

if __name__ == "__main__":
    test_login_logging()