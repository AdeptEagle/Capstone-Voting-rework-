# Automatic Log Cleanup System

This system automatically cleans up old login logs and audit logs to maintain database performance and comply with data retention policies.

## Features

### 🕐 **Automatic Cleanup Schedules**

1. **Daily Login Logs Cleanup** - Runs daily at 2:00 AM
   - Cleans up User login logs older than 3 days (configurable)
   - Cleans up Admin login logs older than 3 days (configurable)
   - Cleans up login-related audit logs older than 30 days (configurable)

2. **Weekly Audit Logs Cleanup** - Runs weekly on Sunday at 3:00 AM
   - Cleans up non-critical audit logs older than 30 days (configurable)
   - Cleans up critical audit logs older than 90 days (configurable)

3. **Session Cleanup** - Runs every 5 minutes
   - Automatically logs out inactive user sessions after 30 minutes (configurable)

### ⚙️ **Configuration**

All retention periods and schedules can be configured via environment variables:

```bash
# Login logs retention (in days)
USER_LOGIN_LOG_RETENTION_DAYS=3
ADMIN_LOGIN_LOG_RETENTION_DAYS=3

# Audit logs retention (in days)
AUDIT_LOG_RETENTION_DAYS=30
CRITICAL_AUDIT_LOG_RETENTION_DAYS=90

# Session timeout (in minutes)
INACTIVE_SESSION_TIMEOUT_MINUTES=30

# Cleanup schedule configuration
DAILY_CLEANUP_HOUR=2          # 0-23 (24-hour format)
WEEKLY_CLEANUP_DAY=0          # 0-6 (Sunday = 0)
WEEKLY_CLEANUP_HOUR=3         # 0-23 (24-hour format)
```

### 🔧 **Manual Cleanup Endpoints**

For testing and manual maintenance, the following endpoints are available:

- `POST /maintenance/cleanup/login-logs` - Clean up login logs manually
- `POST /maintenance/cleanup/audit-logs` - Clean up audit logs manually
- `POST /maintenance/cleanup/sessions` - Clean up inactive sessions manually
- `POST /maintenance/cleanup/all` - Run all cleanup tasks manually

**Note**: These endpoints require authentication (JWT token).

### 📊 **What Gets Cleaned Up**

#### User Login Logs (`user_login_logs` table)
- Login time, logout time, duration
- IP address, user agent, session ID
- Logs older than configured retention period

#### Admin Login Logs (`admin_login_logs` table)
- Admin login sessions and details
- IP address, user agent, session ID
- Logs older than configured retention period

#### Audit Logs (`audit_log` table)
- Login attempts and security alerts
- Non-critical logs older than 30 days
- Critical logs older than 90 days

### 🚨 **Important Notes**

1. **Data Loss Warning**: Once logs are deleted, they cannot be recovered
2. **Compliance**: Ensure your retention periods comply with local data protection laws
3. **Backup**: Consider backing up important logs before cleanup
4. **Monitoring**: Check application logs for cleanup activity and any errors

### 📝 **Logging**

All cleanup activities are logged with detailed information:
- Number of records deleted
- Types of logs cleaned
- Any errors encountered
- Timestamps of cleanup operations

### 🔍 **Monitoring Cleanup Activity**

Check the application logs for messages like:
```
🧹 Starting daily cleanup of old login logs...
✅ Cleaned up old login logs:
   👤 User login logs: 15 deleted
   👨‍💼 Admin login logs: 8 deleted
   🔍 Audit logs (login-related): 3 deleted
   📊 Total logs cleaned: 26
```

### 🛠️ **Troubleshooting**

If cleanup fails:
1. Check database connectivity
2. Verify environment variables are set correctly
3. Check application logs for specific error messages
4. Ensure sufficient database permissions for DELETE operations

### 📈 **Performance Impact**

- Cleanup runs during low-traffic hours (2-3 AM)
- Uses efficient batch DELETE operations
- Minimal impact on application performance
- Helps maintain database performance over time
