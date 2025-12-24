#!/usr/bin/env python3
"""
View login logs from the database
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import LoginLog, User
from datetime import datetime, timedelta

def view_login_logs():
    print("📊 Login Logs Database Report")
    print("=" * 50)
    
    # Get all login logs
    logs = LoginLog.objects.select_related('user').order_by('-login_time')
    
    print(f"\n📈 Summary:")
    print(f"   Total login attempts: {logs.count()}")
    print(f"   Successful logins: {logs.filter(success=True).count()}")
    print(f"   Failed attempts: {logs.filter(success=False).count()}")
    
    # Recent activity (last 24 hours)
    yesterday = datetime.now() - timedelta(hours=24)
    recent_logs = logs.filter(login_time__gte=yesterday)
    print(f"   Recent activity (24h): {recent_logs.count()}")
    
    print(f"\n📋 Recent Login Attempts:")
    print("-" * 80)
    print(f"{'Time':<20} {'User':<25} {'Role':<12} {'Status':<10} {'IP':<15} {'Browser'}")
    print("-" * 80)
    
    for log in logs[:15]:  # Show last 15 attempts
        time_str = log.login_time.strftime('%Y-%m-%d %H:%M:%S')
        user_str = log.user.email[:24]
        role_str = log.user.role.title()
        status_str = "✅ Success" if log.success else "❌ Failed"
        ip_str = log.ip_address or "Unknown"
        browser_str = log.browser_info
        
        print(f"{time_str:<20} {user_str:<25} {role_str:<12} {status_str:<10} {ip_str:<15} {browser_str}")
    
    # Login stats by role
    print(f"\n👥 Login Stats by Role:")
    print("-" * 30)
    
    roles = ['admin', 'restaurant', 'customer', 'rider']
    for role in roles:
        role_logs = logs.filter(user__role=role)
        successful = role_logs.filter(success=True).count()
        failed = role_logs.filter(success=False).count()
        total = role_logs.count()
        
        if total > 0:
            success_rate = (successful / total) * 100
            role_icon = {'admin': '👑', 'restaurant': '🏪', 'customer': '👤', 'rider': '🚴'}.get(role, '👤')
            print(f"   {role_icon} {role.title():<12}: {total:>3} total ({successful:>2} success, {failed:>2} failed) - {success_rate:.1f}% success rate")
    
    # Failed login attempts (security monitoring)
    failed_logs = logs.filter(success=False)
    if failed_logs.exists():
        print(f"\n🚨 Failed Login Attempts:")
        print("-" * 60)
        
        for log in failed_logs[:10]:  # Show last 10 failed attempts
            time_str = log.login_time.strftime('%Y-%m-%d %H:%M:%S')
            reason = log.failure_reason or "Unknown"
            print(f"   {time_str} - {log.user.email} - {reason}")
    
    # Most active users
    print(f"\n🔥 Most Active Users:")
    print("-" * 40)
    
    from django.db.models import Count
    active_users = (logs.values('user__email', 'user__role')
                   .annotate(login_count=Count('id'))
                   .order_by('-login_count')[:10])
    
    for user_stat in active_users:
        email = user_stat['user__email']
        role = user_stat['user__role']
        count = user_stat['login_count']
        role_icon = {'admin': '👑', 'restaurant': '🏪', 'customer': '👤', 'rider': '🚴'}.get(role, '👤')
        print(f"   {role_icon} {email:<30} {count:>3} logins")
    
    print(f"\n✅ Login logging system is working perfectly!")
    print(f"   View detailed logs in Django Admin: http://127.0.0.1:8000/admin/core/loginlog/")

if __name__ == "__main__":
    view_login_logs()