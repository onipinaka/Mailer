# AI Marketer Platform

A comprehensive AI-powered marketing automation platform that transforms traditional email marketing into a full-featured marketing ecosystem with multi-channel campaigns, AI content generation, lead generation, workflow automation, and more.

## 🚀 Features

### 1. Multi-Channel Marketing
- **Email Marketing**: Bulk email campaigns with personalization and tracking
- **SMS Marketing**: Twilio-powered SMS campaigns with template support
- **WhatsApp Marketing**: WhatsApp Business API integration for bulk messaging

### 2. AI Content Generation
- Generate marketing copy for emails, social media, ads, blogs, and captions
- A/B testing with multiple content variations
- Support for OpenAI, Anthropic (Claude), and Google (Gemini)
- Customizable tone, goal, and target audience

### 3. Lead Generation
- Google Places API integration for legal business data extraction
- CRM functionality with lead scoring, tagging, and status tracking
- Support for categories: restaurants, hotels, lawyers, doctors, etc.
- Export leads to CSV

### 4. Workflow Automation
- Visual workflow builder with triggers and actions
- **Triggers**: New lead, email opened, link clicked, schedule, webhook
- **Actions**: Send email/SMS/WhatsApp, add tags, update lead, AI analysis, wait
- Example: New lead → Welcome email → Wait 1 day → WhatsApp follow-up

### 5. Social Media Management
- Multi-platform posting (Facebook, Instagram, Twitter, LinkedIn, TikTok)
- Post scheduling and status tracking
- Engagement metrics (likes, comments, shares, views)
- Media attachment support

### 6. Ad Campaign Management
- Create and manage paid ad campaigns
- Platforms: Meta Ads, Google Ads, LinkedIn Ads, TikTok Ads
- Advanced targeting (location, age, gender, interests)
- Budget management (daily/lifetime)
- Real-time metrics (impressions, clicks, conversions, CTR, CPC, CPA)

### 7. SEO Optimization Tools
- **Meta Tags**: AI-generated title, description, and keywords
- **Keyword Research**: Search volume and difficulty estimates
- **Content Optimization**: SEO score and recommendations
- **Heading Structure**: Optimized H1, H2, H3 suggestions
- **Schema Markup**: JSON-LD structured data generation

### 8. AI Chatbot Builder
- Build chatbots for multiple platforms (website, WhatsApp, Facebook, Instagram, Telegram)
- Customizable personality (tone, language, greetings)
- Flow-based responses with exact match, contains, or intent detection
- Actions: Send email, create lead, schedule callback, transfer to human
- Optional AI-powered responses using LLM

### 9. Creative Generation
- DALL-E 3 integration for visual asset creation
- **Asset Types**: Logos, banners, social media images, ad creatives, thumbnails
- Multiple sizes (square, portrait, landscape)
- Style customization (modern, professional, minimalist, etc.)

### 10. Analytics & Insights
- **Aggregated Dashboard**: Email, SMS, WhatsApp, social, ads, leads in one view
- **AI Insights Assistant**: Natural language queries about campaign performance
- **Real-time Metrics**: Open rates, click rates, engagement, conversions, ROI
- **Date Range Filtering**: Custom date range analytics

### 11. Integration Hub
- External platform connections (OAuth & API)
- Supported platforms: Meta Ads, Google Ads, Google Analytics, Mailchimp, HubSpot, Salesforce
- Secure credential storage with encryption
- Sync status tracking

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: JWT with httpOnly cookies
- **AI/ML**: OpenAI (GPT-4, DALL-E 3), Anthropic Claude, Google Gemini
- **Third-Party APIs**:
  - Twilio (SMS & WhatsApp)
  - Google Places API (Lead Generation)
  - SendGrid/Gmail/SMTP (Email)
  - Meta Graph API (Facebook/Instagram)
  - Twitter API v2
  - LinkedIn Marketing API
  - TikTok Business API

## 📦 Installation

1. Clone the repository
```bash
git clone <repo-url>
cd Mailer
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables (`.env.local`):
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-marketer

# Authentication
JWT_SECRET=your-secret-key-here

# AI Models (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Email (optional - can configure in Settings)
SENDGRID_API_KEY=...
GMAIL_USER=...
GMAIL_APP_PASSWORD=...

# SMS/WhatsApp (optional - can configure in Settings)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+...

# Lead Generation
GOOGLE_PLACES_API_KEY=...

# Server
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Settings (Credentials Management)
- `POST /api/settings/email-credentials` - Save email account
- `GET /api/settings/email-credentials` - List email accounts
- `POST /api/settings/sms-credentials` - Save SMS provider
- `GET /api/settings/sms-credentials` - List SMS providers
- `POST /api/settings/whatsapp-credentials` - Save WhatsApp provider
- `GET /api/settings/whatsapp-credentials` - List WhatsApp providers
- `POST /api/settings/ai-models` - Save AI model API key
- `GET /api/settings/ai-models` - List AI models

### Campaigns
- `POST /api/send` - Send email campaign
- `POST /api/sms/send` - Send SMS
- `POST /api/whatsapp/send` - Send WhatsApp message

### AI Content
- `POST /api/ai/generate-content` - Generate marketing content
  - Types: `email`, `social`, `ad`, `blog`, `caption`
  - Supports A/B testing with multiple variations

### Leads
- `POST /api/leads` - Generate leads from Google Places
- `GET /api/leads` - List leads with filters (status, tags)

### Workflows
- `POST /api/workflows` - Create automation workflow
- `GET /api/workflows` - List workflows

### Social Media
- `POST /api/social/posts` - Create/schedule social post
- `GET /api/social/posts` - List social posts

### Ads
- `POST /api/ads/campaigns` - Create ad campaign
- `GET /api/ads/campaigns` - List ad campaigns

### SEO
- `POST /api/seo/optimize` - Generate SEO optimizations
  - Types: `meta_tags`, `keywords`, `headings`, `content_optimization`, `schema_markup`

### Chatbots
- `POST /api/chatbots` - Create chatbot
- `GET /api/chatbots` - List chatbots

### Creative
- `POST /api/creative/generate` - Generate visual assets
  - Types: `logo`, `banner`, `social_media`, `ad_creative`, `thumbnail`

### Analytics
- `GET /api/analytics/aggregate` - Aggregated analytics across channels
- `POST /api/analytics/insights` - AI-powered insights from natural language

### Integrations
- `POST /api/integrations` - Connect external platform
- `GET /api/integrations` - List integrations
- `DELETE /api/integrations` - Remove integration

## 📊 Database Models

1. **User** - User accounts and authentication
2. **Campaign** - Email campaign records
3. **EmailCredential** - Saved email accounts (encrypted)
4. **SMSCredential** - SMS provider credentials (encrypted)
5. **WhatsAppCredential** - WhatsApp provider credentials (encrypted)
6. **AIModel** - AI model API keys (encrypted)
7. **Lead** - CRM leads with scoring and tags
8. **Workflow** - Automation workflows
9. **Integration** - External platform connections
10. **SocialPost** - Social media posts
11. **AdCampaign** - Paid advertising campaigns
12. **Chatbot** - AI chatbot configurations

## 🔐 Security

- All credentials encrypted with AES-256-GCM
- JWT-based authentication with httpOnly cookies
- CORS protection with origin validation
- Environment variable validation
- MongoDB connection security

## 🎨 UI Pages

1. **Dashboard** (`/dashboard`) - Overview with metrics
2. **Compose** (`/dashboard/compose-new`) - Multi-channel campaign creator
3. **Settings** (`/dashboard/settings`) - Credential management (4 tabs)
4. **Analytics** (`/dashboard/analytics`) - Campaign analytics
5. **Campaigns** (`/dashboard/campaigns`) - Campaign list

## 🚧 Future Enhancements

- [ ] Visual workflow builder UI
- [ ] Social media OAuth flows (Facebook, Twitter, LinkedIn)
- [ ] Real-time webhook handlers for workflows
- [ ] Campaign A/B testing UI
- [ ] Custom domain tracking
- [ ] Email template marketplace
- [ ] White-label options
- [ ] Team collaboration features
- [ ] Advanced reporting dashboards

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Built with ❤️ using Next.js, MongoDB, OpenAI, and Twilio**
