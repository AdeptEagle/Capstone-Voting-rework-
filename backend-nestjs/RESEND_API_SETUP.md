# Switching to Resend API for Email Service

## Why Switch to Resend API?

### ✅ Benefits of API-based Email Services:
- **No port restrictions** - Works on all Railway plans (Free, Hobby, Pro)
- **Better deliverability** - Higher inbox rates, less spam filtering
- **Built-in analytics** - Open rates, click tracking, bounce handling
- **Rate limiting protection** - Prevents accidental spam
- **Better error handling** - Detailed error responses
- **Template management** - Built-in email templates
- **Domain verification** - Better sender reputation

### ❌ Traditional SMTP Issues:
- Port blocking on Railway Free/Hobby plans (ports 25, 465, 587, 2525)
- Lower deliverability rates
- No analytics or tracking
- Manual bounce handling
- Higher spam risk

## Setup Instructions

### 1. Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key
1. Go to [API Keys](https://resend.com/api-keys) in your dashboard
2. Click "Create API Key"
3. Name it (e.g., "Voting System Production")
4. Copy the API key (starts with `re_`)

### 3. Verify Domain (Optional but Recommended)
1. Go to [Domains](https://resend.com/domains) in your dashboard
2. Add your domain (e.g., `yourdomain.com`)
3. Add the required DNS records
4. Wait for verification

### 4. Configure Environment Variables

#### For Railway Deployment:
```bash
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your-actual-api-key-here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

#### For Local Development:
Add to your `.env` file:
```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_your-actual-api-key-here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 5. Deploy Changes
1. Commit your changes
2. Push to deployment branch
3. Railway will automatically redeploy

## Configuration Examples

### Option 1: Resend API (Recommended)
```env
EMAIL_SERVICE=resend
RESEND_API_KEY=re_1234567890abcdef
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Option 2: Keep Brevo SMTP (if on Pro plan)
```env
EMAIL_SERVICE=brevo
BREVO_SMTP_LOGIN=99936e001@smtp-brevo.com
BREVO_SMTP_KEY=your-brevo-smtp-key
BREVO_SENDER_EMAIL=adeavotingsys@gmail.com
```

### Option 3: Gmail SMTP (if on Pro plan)
```env
EMAIL_SERVICE=gmail
GMAIL_USER=your-gmail@gmail.com
GMAIL_PASSWORD=your-16-character-app-password
```

## Testing the Setup

### 1. Check Logs
After deployment, check Railway logs for:
```
✅ Resend API configuration found - using API service
✅ API email service configured - no SMTP verification needed
```

### 2. Test Password Reset
1. Go to forgot password page
2. Enter email address
3. Check logs for:
```
✅ Password reset email sent successfully via Resend API to user@example.com
```

### 3. Check Email Delivery
- Check your inbox for the reset email
- Check Resend dashboard for delivery status
- Monitor bounce rates and open rates

## Troubleshooting

### Common Issues:

#### 1. "Resend configuration missing"
**Solution:** Ensure both `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set

#### 2. "Invalid API key"
**Solution:** Check that your API key starts with `re_` and is correct

#### 3. "Domain not verified"
**Solution:** Either verify your domain or use a verified domain for `RESEND_FROM_EMAIL`

#### 4. Emails going to spam
**Solution:** 
- Verify your domain
- Use a professional sender email
- Avoid spam trigger words

## Pricing

### Resend Free Tier:
- **3,000 emails/month**
- **100 emails/day**
- **Perfect for small to medium applications**

### Resend Pro Tier:
- **50,000 emails/month**
- **$20/month**
- **Advanced features and analytics**

## Migration Checklist

- [ ] Create Resend account
- [ ] Get API key
- [ ] Set environment variables
- [ ] Deploy changes
- [ ] Test password reset functionality
- [ ] Monitor email delivery
- [ ] Update documentation
- [ ] Remove old SMTP credentials (optional)

## Support

- [Resend Documentation](https://resend.com/docs)
- [Resend Support](https://resend.com/support)
- [Railway SMTP Guide](https://docs.railway.com/reference/outbound-networking)
