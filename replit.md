# NewsletterPro - Newsletter Management System

## Overview

NewsletterPro is a full-stack newsletter management application built with React, Express, and PostgreSQL. The system allows users to subscribe to newsletters via email or SMS, and provides admin functionality for managing subscribers, creating newsletters, and viewing analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### July 24, 2025 - Brand Redesign & Mobile-First Implementation
- **Complete UI/UX Rebrand**: Implemented new color palette based on user-provided design guidelines
  - Orange (#de6600) for primary CTAs and buttons
  - Light Orange (#fec682) for hero sections and highlights  
  - Mint (#b7e6d3) for section backgrounds and subtle dividers
  - Sage Green (#8ab184) for icons, badges, and secondary CTAs
  - Deep Navy (#003f5a) for headings, footer, and body text
- **Mobile-First Design**: Redesigned all components with mobile-first responsive approach
  - Mobile bottom navigation with icons
  - Responsive typography scaling (text-sm to text-base on larger screens)
  - Mobile-optimized cards and layouts (2-column grid on mobile, 4-column on desktop)
  - Touch-friendly button sizing with full-width on mobile
- **Enhanced Newsletter Delivery Transparency**: Added comprehensive delivery tracking and user education
  - Delivery status badges (✓ delivered, ⏳ pending, ✗ failed)
  - Informational panels explaining email delivery limitations
  - Enhanced toast notifications with delivery statistics
- **Consistent Brand Application**: Updated all pages (Dashboard, Newsletters, Subscribers, Subscription) with new design system

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state and forms with React Hook Form
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon serverless connection with WebSocket support

## Key Components

### Authentication System
- **Provider**: Replit OpenID Connect authentication
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **User Management**: Automatic user creation and profile management
- **Authorization**: Route-level protection for admin endpoints

### Newsletter Management
- **Subscriber Management**: Email and SMS subscription options with category preferences
- **Content Creation**: Rich newsletter creation with category targeting
- **Delivery System**: Email delivery via Resend/SendGrid and SMS via Twilio
- **Analytics**: Delivery tracking and engagement metrics

### UI/UX Components
- **Design System**: Consistent component library based on Radix UI primitives
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Form Handling**: Comprehensive form validation with Zod schemas
- **Toast Notifications**: User feedback for actions and errors

## Data Flow

### Subscription Flow
1. User visits landing page and selects subscription preferences
2. Form validation ensures required fields and contact method
3. Subscriber record created with category associations
4. Confirmation sent via selected communication method

### Newsletter Creation Flow
1. Admin creates newsletter with content and target categories
2. System validates content and category selections
3. Newsletter can be saved as draft or sent immediately
4. Delivery records track send status and engagement

### Authentication Flow
1. User initiates login via Replit Auth
2. OpenID Connect flow handles authentication
3. User profile created/updated in database
4. Session established with PostgreSQL storage
5. Protected routes check authentication status

## External Dependencies

### Communication Services
- **Email**: Resend (primary) with SendGrid fallback
- **SMS**: Twilio for text message delivery
- **Configuration**: Environment variables for API keys and endpoints

### Database Services
- **Primary**: Neon PostgreSQL serverless database
- **Connection**: @neondatabase/serverless with WebSocket support
- **Backup**: Standard PostgreSQL compatibility maintained

### Authentication Services
- **Provider**: Replit OpenID Connect
- **Session Storage**: PostgreSQL with automatic cleanup
- **Security**: Secure session cookies with configurable TTL

### Development Tools
- **Build**: Vite with React and TypeScript plugins
- **Linting**: TypeScript compiler for type checking
- **Development**: Hot module replacement and error overlay

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Assets**: Static files served from build output directory

### Environment Configuration
- **Development**: Local development with Vite dev server
- **Production**: Node.js server serving built assets
- **Database**: Environment-based connection string configuration
- **Secrets**: Environment variables for API keys and session secrets

### Scaling Considerations
- **Database**: Serverless PostgreSQL scales automatically
- **Application**: Stateless design allows horizontal scaling
- **Sessions**: Database-backed sessions support multiple instances
- **Assets**: Static files can be served via CDN if needed