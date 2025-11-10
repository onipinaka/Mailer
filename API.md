# MailPulse API Documentation

## Base URL
- Development: `http://localhost:3000`
- Production: `https://your-domain.vercel.app`

## Authentication
Most endpoints require authentication via JWT tokens stored in HTTP-only cookies.

---

## 🔐 Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "recaptchaToken": "recaptcha-response-token"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account."
}
```

**Errors:**
- 400: Invalid input
- 409: User already exists
- 429: Too many registration attempts

---

### POST /api/auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "verified": true,
    "freeCredits": 100,
    "paidLifetime": false
  }
}
```

**Sets Cookies:**
- `accessToken` (15 min expiry)
- `refreshToken` (7 day expiry)

**Errors:**
- 401: Invalid credentials
- 403: Email not verified
- 429: Too many login attempts

---

### POST /api/auth/logout
Logout current user.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/verify
Verify email address.

**Query Parameters:**
- `token`: Verification token from email

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

**Errors:**
- 400: Invalid or expired token

---

### POST /api/auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If an account exists, a password reset link has been sent."
}
```

---

### POST /api/auth/reset-password
Reset password using token.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "newSecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now log in."
}
```

**Errors:**
- 400: Invalid or expired token

---

## 👤 User Endpoints

### GET /api/user
Get current user information.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "verified": true,
    "freeCredits": 85,
    "paidLifetime": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- 401: Unauthorized (not logged in)

---

## 📧 Campaign Endpoints

### POST /api/send
Send email campaign.

**Authentication:** Required

**Request Body:**
```json
{
  "subject": "Hello {{name}}, special offer!",
  "htmlTemplate": "<h1>Hi {{name}}</h1><p>From {{company}}</p>",
  "recipients": [
    {
      "email": "john@example.com",
      "name": "John Doe",
      "company": "Acme Corp"
    },
    {
      "email": "jane@example.com",
      "name": "Jane Smith",
      "company": "Tech Inc"
    }
  ],
  "sendMethod": "sendgrid",
  "config": {
    "gmail": {
      "user": "sender@gmail.com",
      "password": "app-password"
    },
    "smtp": {
      "host": "smtp.example.com",
      "port": 587,
      "user": "smtp-user",
      "password": "smtp-pass",
      "secure": false
    }
  }
}
```

**Send Methods:**
- `sendgrid`: Uses platform SendGrid
- `gmail`: Uses Gmail (requires app password)
- `smtp`: Custom SMTP server

**Response (200):**
```json
{
  "success": true,
  "campaignId": "camp_1234567890_abc123",
  "sent": 2,
  "failed": 0,
  "skipped": 0,
  "remainingCredits": 98,
  "errors": []
}
```

**Errors:**
- 400: Invalid input or missing placeholders
- 402: Insufficient credits
- 429: Too many send requests

---

## 📊 Analytics Endpoints

### GET /api/analytics
Get campaign analytics for current user.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "totals": {
    "sent": 250,
    "delivered": 248,
    "opened": 125,
    "bounced": 2,
    "failed": 0,
    "openRate": 50.4,
    "bounceRate": 0.8
  },
  "campaigns": [
    {
      "campaignId": "camp_1234567890_abc123",
      "subject": "Welcome Email",
      "sent": 100,
      "delivered": 99,
      "opened": 50,
      "bounced": 1,
      "failed": 0,
      "recipients": 100,
      "sendMethod": "sendgrid",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 💳 Payment Endpoints

### POST /api/payment/create-order
Create Razorpay payment order for lifetime plan.

**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "orderId": "order_xyz123",
  "amount": 400000,
  "currency": "INR",
  "keyId": "rzp_live_xxxxx"
}
```

**Errors:**
- 400: User already has lifetime plan

---

### POST /api/payment/webhook
Handle Razorpay payment webhook (internal use).

**Headers:**
- `x-razorpay-signature`: HMAC SHA256 signature

**Response (200):**
```json
{
  "success": true
}
```

**Note:** This endpoint is called by Razorpay, not directly by clients.

---

## 📈 Tracking Endpoints

### GET /api/track/open
Track email open event (via tracking pixel).

**Query Parameters:**
- `campaignId`: Campaign identifier
- `email`: Recipient email (optional)

**Response:** 1x1 transparent PNG image

---

### GET /api/unsubscribe
Handle email unsubscribe.

**Query Parameters:**
- `email`: Email to unsubscribe
- `campaignId`: Campaign ID (optional)
- `reason`: Unsubscribe reason (optional)

**Response:** Redirect to unsubscribe success page

---

## 🔔 Webhook Endpoints

### POST /api/sendgrid/webhook
Receive SendGrid email events.

**Request Body:**
```json
[
  {
    "email": "recipient@example.com",
    "event": "delivered",
    "campaignId": "camp_1234567890_abc123",
    "timestamp": 1234567890
  },
  {
    "email": "bounce@example.com",
    "event": "bounce",
    "campaignId": "camp_1234567890_abc123",
    "timestamp": 1234567891
  }
]
```

**Events Tracked:**
- `delivered`: Email successfully delivered
- `bounce`: Email bounced
- `dropped`: Email dropped by SendGrid
- `open`: Email opened

**Response (200):**
```json
{
  "success": true
}
```

---

## 🔐 Security Features

### Rate Limiting
Rate limits are applied to prevent abuse:

| Endpoint | Limit |
|----------|-------|
| `/api/auth/login` | 5 requests per 15 minutes |
| `/api/auth/register` | 3 requests per hour |
| `/api/send` | 10 requests per minute |

### Authentication
- JWT tokens with 15-minute expiry
- Refresh tokens with 7-day expiry
- HTTP-only cookies (not accessible via JavaScript)
- SameSite=Strict for CSRF protection

### Input Validation
- All inputs validated using Zod schemas
- Email addresses validated before sending
- HTML templates sanitized with DOMPurify
- File uploads restricted to CSV only

### Password Security
- bcrypt hashing with 12 salt rounds
- Minimum 8 characters required
- Reset tokens expire after 1 hour

---

## 🚨 Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (registration) |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (email not verified) |
| 404 | Not Found |
| 409 | Conflict (user already exists) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## 📝 Example Usage

### Complete Flow Example (JavaScript)

```javascript
// 1. Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePass123',
    recaptchaToken: 'recaptcha-token'
  })
});

// 2. Verify email (user clicks link in email)
// GET /api/auth/verify?token=xxx

// 3. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePass123'
  }),
  credentials: 'include' // Important for cookies
});

// 4. Send Campaign
const sendResponse = await fetch('/api/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    subject: 'Hello {{name}}',
    htmlTemplate: '<h1>Hi {{name}}</h1>',
    recipients: [
      { email: 'test@example.com', name: 'Test User' }
    ],
    sendMethod: 'sendgrid'
  })
});

// 5. Get Analytics
const analyticsResponse = await fetch('/api/analytics', {
  credentials: 'include'
});
const analytics = await analyticsResponse.json();
console.log(analytics.totals);

// 6. Upgrade to Lifetime
const orderResponse = await fetch('/api/payment/create-order', {
  method: 'POST',
  credentials: 'include'
});
const { orderId, keyId } = await orderResponse.json();

// Open Razorpay checkout with orderId and keyId
```

---

## 🔄 Webhook Configuration

### Razorpay Webhook
**URL:** `https://your-domain.vercel.app/api/payment/webhook`  
**Event:** `payment.captured`  
**Secret:** Set in environment variable `RAZORPAY_WEBHOOK_SECRET`

### SendGrid Event Webhook
**URL:** `https://your-domain.vercel.app/api/sendgrid/webhook`  
**Events:**
- Delivered
- Bounce
- Dropped
- Open

---

## 📞 Support

For API issues:
1. Check request/response in browser DevTools
2. Review Vercel function logs
3. Verify environment variables
4. Check rate limits

---

**API Version:** 1.0  
**Last Updated:** 2024
