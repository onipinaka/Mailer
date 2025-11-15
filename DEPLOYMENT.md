# MailPulse Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. MongoDB Atlas
- [ ] Create MongoDB Atlas account
- [ ] Create new cluster (free tier works)
- [ ] Create database user with password
- [ ] Whitelist all IPs (0.0.0.0/0) for Vercel
- [ ] Get connection string
- [ ] Test connection locally

### 2. SendGrid Setup
- [ ] Create SendGrid account
- [ ] Verify sender email/domain
- [ ] Create API key with "Mail Send" permission
- [ ] Test sending email locally
- [ ] Note: Webhook URL will be configured post-deployment

### 3. Razorpay Setup
- [ ] Create Razorpay account
- [ ] Get Test KEY_ID and KEY_SECRET
- [ ] Generate webhook secret
- [ ] Test payment flow locally
- [ ] Note: Webhook URL will be configured post-deployment

### 4. Google reCAPTCHA
- [ ] Go to https://www.google.com/recaptcha/admin
- [ ] Create new reCAPTCHA v2 site
- [ ] Add your domain and localhost
- [ ] Get Site Key and Secret Key

### 5. Generate Secrets
```bash
# Generate JWT secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For NEXTAUTH_SECRET
```

## 📋 Local Testing

- [ ] All environment variables configured in `.env`
- [ ] `npm install` completed successfully
- [ ] `npm run dev` starts without errors
- [ ] Can register new account
- [ ] Receive verification email
- [ ] Can verify email and login
- [ ] Can upload CSV and send test campaign
- [ ] Can view analytics
- [ ] Payment flow works (test mode)

## 🚀 Vercel Deployment

### 1. Code Repository
- [ ] Code pushed to GitHub/GitLab
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` is committed
- [ ] README.md is complete

### 2. Vercel Project Setup
- [ ] Create new Vercel project
- [ ] Import from GitHub repository
- [ ] Vercel auto-detects Next.js
- [ ] Framework Preset: Next.js
- [ ] Root Directory: ./

### 3. Environment Variables in Vercel

**Add these in Vercel Dashboard → Settings → Environment Variables:**

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mailpulse

# Authentication
JWT_SECRET=your-jwt-secret-from-openssl
NEXTAUTH_SECRET=your-nextauth-secret-from-openssl

# SendGrid
SENDGRID_API_KEY=SG.your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=MailPulse

# Razorpay (use live keys for production)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_live_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

# URLs (update with your Vercel domain)
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Payment
LIFETIME_PRICE=4000
LIFETIME_PRICE_CURRENCY=INR
```

- [ ] All environment variables added
- [ ] NEXTAUTH_URL and NEXT_PUBLIC_APP_URL use production domain
- [ ] Using Razorpay LIVE keys (not test)

### 4. Deploy
- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete
- [ ] Check for build errors
- [ ] Visit deployed URL

## 🔧 Post-Deployment Configuration

### 1. Razorpay Webhook
- [ ] Go to Razorpay Dashboard → Webhooks
- [ ] Add webhook URL: `https://your-app.vercel.app/api/payment/webhook`
- [ ] Select event: `payment.captured`
- [ ] Copy webhook secret to env vars
- [ ] Test webhook with test payment

### 2. SendGrid Webhook
- [ ] Go to SendGrid → Settings → Mail Settings → Event Webhook
- [ ] Enable Event Webhook
- [ ] HTTP POST URL: `https://your-app.vercel.app/api/sendgrid/webhook`
- [ ] Select events: `Delivered`, `Bounce`, `Open`
- [ ] Save settings
- [ ] Send test email to verify tracking

### 3. DNS & Domain (Optional)
- [ ] Add custom domain in Vercel
- [ ] Update DNS records
- [ ] Wait for SSL certificate
- [ ] Update environment variables with new domain

### 4. reCAPTCHA Domain
- [ ] Go to reCAPTCHA admin
- [ ] Add production domain to allowed domains
- [ ] Remove localhost if not needed

## ✨ Production Testing

### User Flow Testing
- [ ] Can access landing page
- [ ] Registration works
- [ ] Verification email received
- [ ] Email verification link works
- [ ] Login successful
- [ ] Dashboard loads
- [ ] User info displays correctly
- [ ] 100 free credits shown

### Campaign Testing
- [ ] Can upload CSV
- [ ] CSV parsing works
- [ ] Can write email template
- [ ] Placeholders detected
- [ ] Can send via SendGrid
- [ ] Can send via Gmail (with app password)
- [ ] Can send via custom SMTP
- [ ] Emails received by recipients
- [ ] Credits deducted correctly

### Analytics Testing
- [ ] Sent count correct
- [ ] Open tracking works (tracking pixel)
- [ ] Bounce tracking works (SendGrid webhook)
- [ ] Analytics page displays data
- [ ] Charts render correctly

### Payment Testing
- [ ] Billing page loads
- [ ] Razorpay checkout opens
- [ ] Test payment succeeds
- [ ] Webhook received
- [ ] User upgraded to lifetime
- [ ] Credits show "Unlimited"
- [ ] Can send without credit limit

### Security Testing
- [ ] Can't access dashboard without login
- [ ] Logout works correctly
- [ ] Password reset flow works
- [ ] Rate limiting prevents spam
- [ ] reCAPTCHA blocks bots
- [ ] HTML is sanitized (no XSS)
- [ ] API endpoints require authentication

## 🔒 Security Hardening

- [ ] All secrets in environment variables
- [ ] No hardcoded credentials in code
- [ ] MongoDB network access restricted
- [ ] Razorpay using webhook secret verification
- [ ] HTTPS enforced (Vercel default)
- [ ] HTTP-only cookies enabled
- [ ] CSRF protection active
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all forms
- [ ] HTML sanitization enabled

## 📊 Monitoring Setup

### Vercel
- [ ] Check deployment logs
- [ ] Monitor function executions
- [ ] Set up error alerts

### MongoDB Atlas
- [ ] Enable database monitoring
- [ ] Set up alerts for high usage
- [ ] Monitor connection count

### SendGrid
- [ ] Monitor email deliverability
- [ ] Check bounce rates
- [ ] Review spam reports

### Razorpay
- [ ] Monitor successful payments
- [ ] Check for failed transactions
- [ ] Review webhook logs

## 📝 Documentation

- [ ] Update README with production URL
- [ ] Document any customizations
- [ ] Create user guide
- [ ] Document backup procedures

## 🎯 Go Live Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Fast page loads (<3s)
- [ ] SEO meta tags set
- [ ] Analytics configured (GA, etc.)
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Contact/Support email

## 🚨 Emergency Procedures

### If Something Goes Wrong

**Can't login:**
1. Check MongoDB connection
2. Verify JWT_SECRET matches
3. Clear browser cookies

**Emails not sending:**
1. Check SendGrid API key
2. Verify sender email
3. Check Vercel function logs

**Payments failing:**
1. Verify Razorpay keys
2. Check webhook signature
3. Review payment logs

**Site down:**
1. Check Vercel status
2. Review deployment logs
3. Rollback to previous deployment

## 📞 Support Resources

- Vercel: https://vercel.com/docs
- MongoDB: https://docs.mongodb.com/
- SendGrid: https://docs.sendgrid.com/
- Razorpay: https://razorpay.com/docs/
- Next.js: https://nextjs.org/docs

## ✅ Final Sign-Off

- [ ] All items in checklist completed
- [ ] Production URL accessible
- [ ] Test account created and verified
- [ ] Test campaign sent successfully
- [ ] Test payment processed
- [ ] Team notified of launch
- [ ] Monitoring dashboards bookmarked

---

**Deployment Date:** ___________  
**Deployed By:** ___________  
**Production URL:** ___________  

🎉 **Congratulations! MailPulse is LIVE!** 🎉
