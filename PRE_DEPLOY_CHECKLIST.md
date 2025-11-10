# 🚀 Pre-Deployment Checklist

## ✅ Before You Deploy to Vercel

### 1. **Test MongoDB Connection Locally**
```cmd
npm run test:db
```
**Expected:** `✅ MongoDB connected successfully!`

**If it fails:**
- Go to MongoDB Atlas → Network Access
- Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
- Wait 2 minutes for changes to apply
- Run `npm run test:db` again

---

### 2. **Test Registration Flow**
```cmd
npm run dev
```
1. Go to: http://localhost:3000/auth/register
2. Register with your email
3. Check inbox for verification email
4. Click verification link
5. Login at: http://localhost:3000/auth/login

**Expected:** Should work without errors

---

### 3. **Verify Environment Variables**

Check your `.env` file has these:

```env
✅ MONGODB_URI (starts with mongodb+srv://)
✅ JWT_SECRET (32+ characters)
✅ NEXTAUTH_SECRET (32+ characters)
✅ SENDGRID_API_KEY (starts with SG.)
✅ SENDGRID_FROM_EMAIL (verified email)
✅ NEXT_PUBLIC_APP_URL (http://localhost:3000 for now)
✅ NEXTAUTH_URL (http://localhost:3000 for now)
```

---

### 4. **Clean Sensitive Data**

Make sure `.env.example` has NO real credentials:

```cmd
# Check .env.example - should have placeholders only
type .env.example
```

**Should see:** `your-api-key-here`, `your-secret-here`, etc.
**Should NOT see:** Real API keys, passwords, or secrets

---

### 5. **Commit Your Code**

```cmd
# Check what will be committed
git status

# Should NOT see .env in the list
# Should see .env.example

git add .
git commit -m "Ready for Vercel deployment"
```

---

### 6. **Push to GitHub**

```cmd
git branch -M main
git remote add origin https://github.com/onipinaka/Mailer.git
git push -u origin main
```

---

## 🎯 Now Deploy to Vercel

1. Go to: https://vercel.com/
2. Sign in with GitHub
3. Import repository: `onipinaka/Mailer`
4. Add environment variables (copy from `.env`)
5. Update these AFTER first deployment:
   - `NEXTAUTH_URL` → your Vercel URL
   - `NEXT_PUBLIC_APP_URL` → your Vercel URL
6. Click Deploy!

---

## 📋 Post-Deployment Tasks

### Immediately After Deployment:

1. **Update App URLs:**
   - Vercel Dashboard → Settings → Environment Variables
   - Update: `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`
   - Redeploy

2. **Configure Webhooks:**
   - Razorpay: `https://your-app.vercel.app/api/payment/webhook`
   - SendGrid: `https://your-app.vercel.app/api/sendgrid/webhook`

3. **Test Production:**
   - Register a new account
   - Send a test email
   - Check analytics

---

## 🐛 Common Issues

### "MongoDB connection failed"
```cmd
# Fix: Allow all IPs in MongoDB Atlas
1. MongoDB Atlas → Network Access
2. Add IP: 0.0.0.0/0
3. Wait 2 minutes
```

### "SendGrid authentication failed"
```cmd
# Fix: Verify sender email
1. SendGrid → Settings → Sender Authentication
2. Verify your from email
```

### "Build failed on Vercel"
```cmd
# Fix: Check TypeScript errors
npm run typecheck

# If errors, fix them and push again
git add .
git commit -m "Fix build errors"
git push
```

---

## ✨ Ready to Deploy?

**Run this final check:**

```cmd
# 1. Test database
npm run test:db

# 2. Check TypeScript
npm run typecheck

# 3. Test build locally
npm run build

# 4. Check git status
git status
```

**All green?** You're ready! 🚀

**Follow:** `VERCEL_DEPLOY.md` for detailed deployment steps.

---

**Questions?**
- MongoDB issues → Check Network Access in Atlas
- SendGrid issues → Verify sender email
- Vercel issues → Check deployment logs

**Good luck!** 🎉
