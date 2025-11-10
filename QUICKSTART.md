# MailPulse - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in the values:

**Minimum Required for Development:**
```env
# MongoDB (required) - Get free cluster at https://cloud.mongodb.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mailpulse

# JWT Secret (required) - Generate: openssl rand -base64 32
JWT_SECRET=your-random-secret-here
NEXTAUTH_SECRET=another-random-secret-here

# SendGrid (required for email verification)
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Razorpay (for payments)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

# reCAPTCHA (optional for dev)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

# App URLs
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 📋 Testing the Full Flow

### Step 1: Create Account
1. Go to http://localhost:3000/auth/register
2. Enter email and password
3. Check your email for verification link
4. Click link to verify

### Step 2: Login
1. Go to http://localhost:3000/auth/login
2. Enter your credentials
3. You'll see dashboard with 100 free credits

### Step 3: Send Test Campaign

1. **Prepare CSV File** (`test-contacts.csv`):
```csv
email,name,company
john@example.com,John Doe,Acme Corp
jane@example.com,Jane Smith,Tech Inc
```

2. **Go to Compose** (`/dashboard/compose`)

3. **Upload CSV** - Select your CSV file

4. **Write Email**:
   - Subject: `Hello {{name}}, message from {{company}}`
   - Body: 
   ```html
   <h1>Hi {{name}}!</h1>
   <p>This is a test email from MailPulse.</p>
   <p>Your company: {{company}}</p>
   ```

5. **Choose Send Method**:
   - **SendGrid** (easiest): Uses platform SendGrid
   - **Gmail**: Requires [Gmail App Password](https://support.google.com/accounts/answer/185833)
   - **SMTP**: Custom mail server

6. **Click Send Campaign**

7. **Check Results** - View sent count and analytics

### Step 4: View Analytics
1. Go to `/dashboard/analytics`
2. See sent, delivered, opened emails
3. View campaign history

### Step 5: Test Payment (Optional)
1. Go to `/dashboard/billing`
2. Click "Upgrade to Lifetime"
3. Use Razorpay test mode
4. After payment, credits become "Unlimited"

## 🔧 Common Issues

### "Cannot connect to MongoDB"
- Check your MONGODB_URI is correct
- Ensure IP is whitelisted in MongoDB Atlas
- Verify database user has permissions

### "Emails not sending"
- **SendGrid**: Check API key is valid
- **Gmail**: Must use App Password, not regular password
- **SMTP**: Verify host, port, and credentials

### "Payment webhook not working"
- Webhooks only work on public URLs
- Use ngrok for local testing: `ngrok http 3000`
- Update webhook URL in Razorpay dashboard

### "reCAPTCHA failing"
- Get keys from https://www.google.com/recaptcha
- Add localhost to allowed domains
- Or skip in development (will auto-pass)

## 🌐 Production Deployment (Vercel)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Add all environment variables
4. Change URLs to your Vercel domain:
   ```env
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
5. Deploy!

### 3. Configure Webhooks
**Razorpay:**
```
https://your-app.vercel.app/api/payment/webhook
```

**SendGrid Events:**
```
https://your-app.vercel.app/api/sendgrid/webhook
```
Enable: delivered, bounce, open

## 📚 Next Steps

1. **Customize Branding**:
   - Edit `app/page.tsx` for landing page
   - Update colors in `tailwind.config.js`
   - Change "MailPulse" to your brand name

2. **Add Features**:
   - Email scheduling
   - A/B testing
   - Advanced analytics
   - Contact management

3. **Enhance Security**:
   - Add 2FA
   - IP whitelisting
   - Audit logging
   - GDPR compliance

## 🆘 Need Help?

- Check `README.md` for detailed docs
- Review API routes in `/app/api`
- Check browser console for errors
- Review Vercel logs for production issues

## 📁 Key Files to Know

- `/app/api/send/route.ts` - Email sending logic
- `/lib/mail.ts` - Email utilities
- `/models/User.ts` - User database model
- `/app/dashboard/compose/page.tsx` - Campaign composer
- `/lib/payment.ts` - Razorpay integration

## 🎉 You're Ready!

Your MailPulse instance is ready to send personalized bulk emails securely. Start with the free 100 credits and upgrade when ready!

**Happy emailing! 📧**
