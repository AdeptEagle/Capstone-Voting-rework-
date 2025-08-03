# Email Service Switching Guide

This guide shows how to switch between **Ethereal Email (testing)** and **Gmail SMTP (real emails)**.

## 🔄 Quick Switching

### **Current Setup: Ethereal Email (Testing)**
- ✅ **Active by default**
- ✅ **Perfect for school projects**
- ✅ **No real emails sent**
- ✅ **Professional templates**
- ✅ **Safe for demos**

### **Alternative Setup: Gmail SMTP (Real Emails)**
- 📧 **Sends real emails to users**
- 🔧 **Requires Gmail credentials**
- 🛡️ **Production-ready**

---

## 🔧 How to Switch

### **Step 1: Edit Email Service**
File: `src/services/email.service.ts`

**To switch to Gmail:**
1. Comment out the **Ethereal configuration** (lines 8-16)
2. Uncomment the **Gmail configuration** (lines 22-32)
3. Comment out **Ethereal `from`** fields (lines 45, 95)
4. Uncomment **Gmail `from`** fields (lines 49, 99)
5. Comment out **Ethereal URL logging** (lines 125, 175)
6. Uncomment **Gmail logging** (lines 129, 179)

**To switch back to Ethereal:**
1. Reverse the above steps

### **Step 2: Update Environment Variables**
File: `.env`

**For Gmail:**
```env
# Comment out Ethereal
# ETHEREAL_USER="test@ethereal.email"
# ETHEREAL_PASS="test123"

# Uncomment and configure Gmail
GMAIL_USER="your-email@gmail.com"
GMAIL_PASSWORD="your-gmail-password"
```

**For Ethereal:**
```env
# Uncomment Ethereal
ETHEREAL_USER="test@ethereal.email"
ETHEREAL_PASS="test123"

# Comment out Gmail
# GMAIL_USER="your-email@gmail.com"
# GMAIL_PASSWORD="your-gmail-password"
```

---

## 🎯 When to Use Each

### **Use Ethereal Email (Testing) When:**
- ✅ **School project demos**
- ✅ **Development and testing**
- ✅ **No real email credentials available**
- ✅ **Safe email testing**
- ✅ **Professional presentations**

### **Use Gmail SMTP (Real Emails) When:**
- 📧 **Production deployment**
- 📧 **Real user email delivery**
- 📧 **Actual password reset functionality**
- 📧 **Live system with real users**

---

## 🧪 Testing

### **Test Ethereal Email:**
```bash
curl -X POST http://localhost:3001/auth/test-email
```
- Shows Ethereal URLs for viewing test emails
- No real emails sent

### **Test Gmail SMTP:**
```bash
curl -X POST http://localhost:3001/auth/test-email
```
- Tests Gmail connection
- Shows Gmail credentials status

---

## 📋 Quick Reference

| Feature | Ethereal (Testing) | Gmail (Real) |
|---------|-------------------|--------------|
| **Setup** | No credentials needed | Gmail credentials required |
| **Emails** | Fake emails (viewable URLs) | Real emails sent to users |
| **Perfect for** | School projects, demos | Production, live systems |
| **Security** | Safe for testing | Real email delivery |
| **Templates** | Professional HTML | Professional HTML |

---

## 🚀 Ready to Switch?

**For School Projects:** Keep Ethereal (current setup)
**For Production:** Switch to Gmail using the steps above

The system is designed for **seamless switching** between both options! 🎉 