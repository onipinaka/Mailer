# MailPulse - Enterprise Email Marketing SaaS Platform

A secure, full-stack email marketing platform built with Next.js that enables users to send personalized bulk emails using Gmail, custom SMTP servers, or SendGrid.

## 🚀 Features

### Core Functionality
- **Multiple Send Methods**: Support for Gmail (app password), custom SMTP, and SendGrid API
- **Personalized Emails**: CSV upload with dynamic merge tags (`{{name}}`, `{{company}}`, etc.)
- **Rich Text Editor**: HTML email editor with content sanitization
- **Email Analytics**: Track sent, delivered, opened, and bounced emails
- **Unsubscribe Management**: Automatic suppression list handling

### Authentication & Security
- **JWT-based Authentication**: Access + refresh tokens in HTTP-only cookies
- **Email Verification**: SendGrid-powered email verification flow
- **Password Recovery**: Secure forgot/reset password functionality
- **Rate Limiting**: Protection against brute force attacks
- **Google reCAPTCHA**: Bot protection on signup
- **bcrypt Password Hashing**: 12 salt rounds for maximum security
- **HTML Sanitization**: DOMPurify prevents XSS attacks
- **CSRF Protection**: SameSite=Strict cookies

### Payment Integration
- **Razorpay Integration**: Secure one-time payment (₹4,000 lifetime plan)
- **Webhook Verification**: HMAC SHA256 signature validation
- **Free Trial**: 100 free email credits for all users
- **Lifetime Unlock**: Unlimited emails after payment

### Infrastructure
- **Next.js App Router**: Modern TypeScript-based architecture
- **MongoDB Atlas**: Cloud database with Mongoose ODM
- **Vercel Deployment**: Serverless deployment ready
- **API Routes**: Backend logic in Next.js API routes

## 📦 Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, ShadCN UI
- **Backend**: Next.js API Routes (Node.js)
- **Database**: MongoDB Atlas (Mongoose)
- **Authentication**: JWT + HTTP-only cookies
- **Email**: Nodemailer (Gmail/SMTP) + SendGrid
- **Payments**: Razorpay
- **Security**: bcrypt, DOMPurify, rate limiting, reCAPTCHA
- **Charts**: Recharts
- **Deployment**: Vercel

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB Atlas account
- SendGrid account and API key
- Razorpay account (KEY_ID and KEY_SECRET)
- Google reCAPTCHA v2 keys

### Step 1: Clone and Install Dependencies

```bash
git clone <repository-url>
cd mailer
npm install
```

### Step 2: Environment Setup

Create a `.env` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mailpulse?retryWrites=true&w=majority

# JWT Secrets (generate using: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production

# SendGrid
SENDGRID_API_KEY=SG.your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=MailPulse

# Razorpay
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Google reCAPTCHA v2
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# App URL
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payment Settings
LIFETIME_PRICE=4000
LIFETIME_PRICE_CURRENCY=INR
```

### Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🌐 Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo>
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. Add all environment variables from `.env` in Vercel dashboard
6. Click "Deploy"

### Step 3: Configure Webhooks

After deployment, set up webhooks:

**Razorpay Webhook:**
```
https://your-domain.vercel.app/api/payment/webhook
```

**SendGrid Webhook:**
```
https://your-domain.vercel.app/api/sendgrid/webhook
```

Configure SendGrid to send events: delivered, bounce, open

### Step 4: Update Environment Variables

In Vercel dashboard, update:
```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 📁 Project Structure

```
/app
  /api
    /auth              # Authentication routes
      /register        # User registration
      /login           # User login
      /verify          # Email verification
      /logout          # Logout
      /forgot-password # Password reset request
      /reset-password  # Password reset
    /send              # Campaign sending
    /user              # User info
    /analytics         # Campaign analytics
    /payment
      /create-order    # Create Razorpay order
      /webhook         # Payment webhook
    /sendgrid
      /webhook         # SendGrid events
    /track
      /open            # Email open tracking
    /unsubscribe       # Unsubscribe handler
  /auth                # Auth pages
    /login
    /register
    /verify
  /dashboard           # Dashboard pages
    /compose           # Campaign composer
    /analytics         # Analytics view
    /billing           # Payment/upgrade
  layout.tsx           # Root layout
  page.tsx             # Landing page
  globals.css          # Global styles
/components
  /ui                  # Reusable UI components
/lib
  db.ts                # MongoDB connection
  auth.ts              # JWT utilities
  middleware.ts        # Auth middleware
  mail.ts              # Email sending
  payment.ts           # Razorpay integration
  utils.ts             # Helper functions
/models
  User.ts              # User model
  EmailEvent.ts        # Campaign analytics
  Unsubscribe.ts       # Suppression list
/utils
  sanitizeHTML.ts      # XSS prevention
  replacePlaceholders.ts # Template engine
  rateLimiter.ts       # Rate limiting
```

## 🔒 Security Features

### Frontend Security
- HTTP-only cookies for JWT tokens
- CSRF protection (SameSite=Strict)
- reCAPTCHA on registration/login
- Input sanitization
- HTML content filtering

### Backend Security
- Rate limiting on critical endpoints
- Email validation before sending
- Razorpay webhook signature verification
- bcrypt password hashing (12 rounds)
- No permanent credential storage
- HTML template sanitization

### Infrastructure Security
- HTTPS-only in production
- Environment variable secrets
- CORS restriction
- Security headers in next.config.js

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/verify` | GET | Verify email |
| `/api/auth/logout` | POST | Logout user |
| `/api/auth/forgot-password` | POST | Request password reset |
| `/api/auth/reset-password` | POST | Reset password |
| `/api/user` | GET | Get user info |
| `/api/send` | POST | Send email campaign |
| `/api/analytics` | GET | Get campaign stats |
| `/api/payment/create-order` | POST | Create payment order |
| `/api/payment/webhook` | POST | Handle payment success |
| `/api/sendgrid/webhook` | POST | Handle email events |
| `/api/track/open` | GET | Track email opens |
| `/api/unsubscribe` | GET | Unsubscribe email |

## 🧪 Testing

### Manual Testing Flow

1. **Registration**:
   - Go to `/auth/register`
   - Enter email and password
   - Check email for verification link
   - Click link to verify

2. **Login**:
   - Go to `/auth/login`
   - Enter credentials
   - Redirected to dashboard

3. **Send Campaign**:
   - Upload CSV with `email,name,company` columns
   - Write subject and HTML template with `{{name}}` placeholders
   - Select send method (Gmail/SMTP/SendGrid)
   - Configure credentials
   - Click "Send Campaign"

4. **Payment**:
   - Go to billing page
   - Click "Upgrade to Lifetime"
   - Complete Razorpay checkout
   - Check unlimited credits unlock

5. **Analytics**:
   - View sent, delivered, opened, bounced stats
   - See campaign history
   - Check open rates

## 🚨 Important Notes

### Gmail Configuration
To use Gmail, you need an **App Password**:
1. Enable 2FA on your Google account
2. Go to Google Account > Security > App Passwords
3. Generate password for "Mail"
4. Use this password (not your Gmail password)

### SendGrid Setup
1. Create SendGrid account
2. Verify sender identity
3. Create API key with "Mail Send" permission
4. Configure event webhook for analytics

### Razorpay Setup
1. Create Razorpay account
2. Get test/live KEY_ID and KEY_SECRET
3. Create webhook secret
4. Set webhook URL after deployment

### MongoDB Atlas
1. Create cluster
2. Add IP whitelist (0.0.0.0/0 for Vercel)
3. Create database user
4. Get connection string

## 🐛 Troubleshooting

### Email Not Sending
- Check SMTP credentials
- Verify Gmail app password
- Ensure SendGrid API key is valid
- Check rate limits

### Payment Not Working
- Verify Razorpay keys
- Check webhook signature
- Ensure HTTPS in production

### Database Connection Failed
- Verify MongoDB connection string
- Check IP whitelist
- Ensure user has permissions

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 👨‍💻 Support

For issues or questions:
- Open GitHub issue
- Check API logs in Vercel dashboard
- Review MongoDB logs in Atlas

## 🎯 Future Enhancements

- [ ] Email scheduling
- [ ] A/B testing
- [ ] Email templates library
- [ ] Contact management
- [ ] Team collaboration
- [ ] API access for developers
- [ ] Webhook integrations
- [ ] Advanced segmentation

---

**Built with ❤️ using Next.js, MongoDB, and SendGrid**
