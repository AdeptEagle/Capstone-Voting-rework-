# Gmail SMTP Setup Guide (School Project)

This guide will help you configure Gmail SMTP for sending password reset emails in the Voting System for school project use.

## 🔧 Prerequisites

1. **Gmail Account**: You need a Gmail account
2. **Regular Password**: Use your regular Gmail password (no 2FA required for school project)

## 📋 Step-by-Step Setup

### Step 1: Enable "Less Secure App Access" (if needed)

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security**
3. If you see "Less secure app access", enable it
4. If you don't see this option, your account might already allow it

### Step 2: Configure Environment Variables

Update your `.env` file with your Gmail credentials:

```env
# Gmail SMTP Configuration (School Project)
GMAIL_USER="your-email@gmail.com"
GMAIL_PASSWORD="your-gmail-password"
```

### Step 3: Test the Email Service

1. Start your server: `npm run start:dev`
2. Test the email connection:
   ```bash
   curl -X POST http://localhost:3001/auth/test-email
   ```
3. Test password reset:
   ```bash
   curl -X POST http://localhost:3001/auth/request-password-reset \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","userType":"voter"}'
   ```

## 🔒 Security Notes for School Project

### ✅ What's OK for School Projects
- Use regular Gmail password
- Enable "Less secure app access" if needed
- Keep credentials in `.env` file (don't commit to Git)

### ❌ What to Avoid
- Don't commit credentials to Git
- Don't share your Gmail password
- Don't use this setup for production systems

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Make sure you're using your correct Gmail password
   - Check if "Less secure app access" is enabled

2. **"Less secure app access" error**
   - Enable "Less secure app access" in your Google Account
   - This is required for school projects without 2FA

3. **"Connection timeout" error**
   - Check your internet connection
   - Verify Gmail SMTP settings are correct

4. **"Authentication failed" error**
   - Double-check your Gmail password
   - Make sure "Less secure app access" is enabled

### Testing Commands

```bash
# Test email service connection
curl -X POST http://localhost:3001/auth/test-email

# Test password reset request
curl -X POST http://localhost:3001/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com","userType":"voter"}'

# Verify reset token
curl -X GET "http://localhost:3001/auth/verify-reset-token/YOUR_TOKEN"

# Reset password
curl -X POST http://localhost:3001/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN","newPassword":"newpassword123"}'
```

## 📧 Email Templates

The system sends two types of emails:

### 1. Password Reset Request Email
- **Subject**: "Password Reset Request - Voting System"
- **Content**: Professional HTML email with reset link
- **Features**: Responsive design, security notices, expiration info

### 2. Password Changed Confirmation Email
- **Subject**: "Password Successfully Changed - Voting System"
- **Content**: Confirmation of successful password change
- **Features**: Security notice if user didn't make the change

## 📝 Environment Variables Reference

```env
# Required for Gmail SMTP (School Project)
GMAIL_USER="your-email@gmail.com"
GMAIL_PASSWORD="your-gmail-password"

# Frontend URL for reset links
FRONTEND_URL="http://localhost:3000"
```

## 🎯 Next Steps

After setting up Gmail SMTP:

1. **Test thoroughly** with real email addresses
2. **Monitor email delivery** in Gmail's Sent folder
3. **Document the setup** in your project report
4. **Explain the security considerations** in your presentation

---

**Note**: This simplified setup is appropriate for school projects and development. For production systems, always use proper security measures like 2FA and App Passwords. 