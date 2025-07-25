# NewsDrip 📧⚡

> **The Gist. No Fluff.** - A modern newsletter management platform that delivers personalized content experiences with cutting-edge design and user-centric preferences.

![NewsDrip Logo](https://img.shields.io/badge/NewsDrip-Newsletter%20Management-ef4444?style=for-the-badge&logo=lightning&logoColor=white)

[![Live Demo](https://img.shields.io/badge/Live-Demo-ef4444?style=for-the-badge)](https://your-replit-url.replit.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)

## ✨ Features

### 🎯 **Core Functionality**
- **Smart Subscription Management** - Multi-channel subscription with email and SMS options
- **Category-Based Preferences** - Granular content preferences with dynamic filtering
- **Token-Based Security** - Secure preference management without admin login required
- **Professional Email Templates** - Morning Brew-style newsletter design with NewsDrip branding
- **Real-Time Analytics** - Comprehensive delivery tracking and engagement metrics
- **Admin Dashboard** - Complete management interface for newsletters and subscribers

### 🚀 **Advanced Features**
- **Dynamic Token-Based Authentication** - Secure unsubscribe and preference management
- **Multi-Domain Support** - Dynamic URL generation for deployed environments
- **Rate Limiting** - API protection with tiered rate limits (100/15min general, 10/15min sensitive)
- **Security Headers** - Complete CSP, HSTS, and security header implementation
- **Input Sanitization** - Comprehensive XSS prevention and data validation
- **Mobile-First Design** - Responsive interface optimized for all devices

## 🏗️ Technology Stack

### **Frontend**
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** with custom design system and dark theme
- **Radix UI** + **shadcn/ui** for accessible, consistent components
- **TanStack Query** for intelligent server state management
- **React Hook Form** + **Zod** for robust form validation
- **Wouter** for lightweight client-side routing

### **Backend**
- **Node.js** + **Express.js** with TypeScript
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** (Neon serverless) for reliable data storage
- **Replit Auth** with OpenID Connect integration
- **SendGrid** for email delivery with Resend fallback
- **Twilio** for SMS notifications
- **Helmet.js** for comprehensive security headers

### **Infrastructure**
- **Database**: Neon PostgreSQL with WebSocket support
- **Authentication**: Replit OpenID Connect with session management
- **Email**: SendGrid (primary) with automatic failover
- **SMS**: Twilio integration for text notifications
- **Deployment**: Replit with automatic scaling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or use Neon)
- SendGrid API key
- Twilio credentials (optional, for SMS)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/newsdrip.git
   cd newsdrip
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SENDGRID_API_KEY=your_sendgrid_api_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_phone
   SESSION_SECRET=your_session_secret
   REPLIT_DOMAINS=localhost:5000
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5000` to see your NewsDrip instance in action! 🎉

## 📚 Usage Guide

### For Subscribers

1. **Subscribe** - Choose your preferred categories and delivery method (email/SMS)
2. **Manage Preferences** - Use the secure token-based preference management via email links
3. **Unsubscribe** - One-click unsubscribe with confirmation email

### For Administrators

1. **Dashboard** - Overview of subscribers, newsletters, and delivery analytics
2. **Subscriber Management** - View, search, and manage subscriber database
3. **Newsletter Creation** - Rich editor with category targeting and preview
4. **Analytics** - Detailed delivery stats, engagement metrics, and performance insights

## 🔧 Configuration

### Email Setup
NewsDrip supports multiple email providers with automatic failover:

```typescript
// Primary: SendGrid
SENDGRID_API_KEY=your_sendgrid_key

// Fallback: Resend (configure in dashboard)
RESEND_API_KEY=your_resend_key
```

### SMS Configuration
Enable SMS notifications with Twilio:

```typescript
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Security Configuration
Built-in security features:

- **Rate Limiting**: 100 requests/15min (general), 10 requests/15min (sensitive)
- **CSP Headers**: Prevents XSS and code injection
- **HTTPS Enforcement**: HSTS with secure cookies
- **Input Validation**: Zod schemas for all user inputs

## 📊 API Reference

### Public Endpoints

#### Subscribe to Newsletter
```http
POST /api/subscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+1234567890",
  "categories": [1, 2, 3],
  "preferredMethod": "email"
}
```

#### Update Preferences
```http
POST /api/preferences/:token
Content-Type: application/json

{
  "categories": [1, 3],
  "preferredMethod": "email"
}
```

### Admin Endpoints (Authenticated)

#### Get Subscribers
```http
GET /api/admin/subscribers
Authorization: Bearer <session-token>
```

#### Create Newsletter
```http
POST /api/admin/newsletters
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "title": "Weekly Update",
  "subject": "This Week's Highlights",
  "content": "<html>Newsletter content</html>",
  "categories": [1, 2]
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Replit Deployment (Recommended)
1. Import your repository to Replit
2. Configure environment variables in Secrets
3. Click "Deploy" to create your production instance
4. Your app will be available at `https://your-app.replit.app`

### Manual Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Start the server: `npm start`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- TypeScript for type safety
- Prettier for formatting
- ESLint for code quality
- Conventional commits for clear history

## 📈 Roadmap

- [ ] **Advanced Analytics** - Click tracking and engagement heatmaps
- [ ] **Template Builder** - Drag-and-drop newsletter editor
- [ ] **A/B Testing** - Subject line and content optimization
- [ ] **Automation** - Scheduled newsletters and drip campaigns
- [ ] **Integrations** - Zapier, WordPress, and social media connectors
- [ ] **White Label** - Custom branding options for agencies

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Replit** - For the amazing development platform
- **shadcn/ui** - For the beautiful component library
- **Radix UI** - For accessible primitives
- **Tailwind CSS** - For the utility-first CSS framework
- **Morning Brew** - Design inspiration for email templates

## 📞 Support

- 📧 **Email**: support@newsdrip.com
- 💬 **Discord**: [Join our community](https://discord.gg/newsdrip)
- 📖 **Documentation**: [docs.newsdrip.com](https://docs.newsdrip.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/newsdrip/issues)

---

<div align="center">

**Built with ❤️ by the NewsDrip Team**

[Website](https://newsdrip.com) • [Demo](https://demo.newsdrip.com) • [Documentation](https://docs.newsdrip.com)

</div>