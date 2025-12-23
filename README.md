# PromoSophia - Trade Promotion Management

A comprehensive SaaS solution for CPG companies to optimize trade promotion effectiveness using AI/ML and mathematical optimization algorithms.

The name "Promosophia" combines "Promo," a shortened form of "promotion," with "sophia," which is derived from the Greek word for "wisdom." This fusion suggests a platform that not only manages trade promotions but does so with intelligence and insight. The implication is that the software offers clear and transparent solutions, enhancing the effectiveness of marketing activities and advertisements through wise decision-making.

## 🚀 Features

- **Multi-tenant Architecture**: Complete tenant isolation for CPG companies
- **AI-Powered Optimization**: ML lift prediction + MILP allocation optimization
- **Real-time Dashboard**: Live KPIs and performance metrics
- **Promotion Lifecycle Management**: Complete CRUD with workflow states
- **Financial Management**: Deductions, claims, and P&L reporting
- **Data Integration**: CSV upload for POS and accounting data
- **Role-based Access Control**: Granular permissions for different user types

## 🛠 Tech Stack

- **Frontend**: Next.js 16.0.10, React 19, TypeScript, Tailwind CSS
- **Backend**: RT-Smarts API (agent-based architecture)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: StackAuth (JWT-based)
- **UI Components**: Shadcn/UI with Radix primitives
- **Charts**: Recharts
- **State Management**: React hooks + Context

## 📋 Prerequisites

- Node.js >= 18.17.0
- PostgreSQL >= 13
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd rts-tpm
npm install
```

### 2. Database Setup

```bash
# Set up PostgreSQL database
createdb rts-tpm

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Seed with sample data
npm run db:seed
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rts-tpm"

# StackAuth (get these from https://stack-auth.com)
STACK_PROJECT_ID=your-project-uuid-here
STACK_PUB_CLIENT_KEY=pck_your_publishable_client_key_here
STACK_SECRET_SERVER_KEY=ssk_your_secret_server_key_here

# Backend API
NEXT_PUBLIC_AGENT_URL=http://localhost:8000
BACKEND_API_KEY=your-backend-api-key

# Development
NODE_ENV=development
USE_MOCK_DATA=true
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication Setup

### StackAuth Configuration

1. Sign up at [stack-auth.com](https://stack-auth.com)
2. Create a new project
3. Configure authentication methods (email/password recommended)
4. Enable team management for multi-tenant support
5. Get your credentials from the dashboard

### Demo Accounts

For development, use these demo accounts:

- **Sarah Chen** (Revenue Manager): `s.chen@cpg-corp.com`
- **Mike Johnson** (Executive): `m.johnson@cpg-corp.com`
- **Lisa Rodriguez** (Finance): `l.rodriguez@cpg-corp.com`
- **David Kim** (Account Manager): `d.kim@cpg-corp.com`

Password for all demo accounts: `demo`

## 📊 Key Features

### Dashboard
- Real-time KPI tracking (ROI, spend, volume, deductions)
- Interactive charts with baseline vs promoted performance
- Company goals progress tracking
- AI-powered insights and recommendations

### Trade Promotions
- Complete promotion lifecycle management
- Workflow: Draft → Planned → Approved → Active → Completed
- Audit history and change tracking
- Bulk operations and filtering

### TPO Optimizer
- **ML Lift Prediction**: Historical data analysis for incremental lift modeling
- **MILP Optimization**: Mathematical optimization for budget allocation
- **Scenario Planning**: Compare multiple optimization strategies
- **Real-time Results**: Confidence scores and processing metrics

### Financial Management
- Deduction tracking and resolution workflow
- Claims management and settlement
- P&L reporting with accrual accounting
- Multi-currency support

### Data Integration
- CSV upload for POS data
- Accounting data integration (G/L entries)
- Validation and error handling
- Background processing for large files

## 🏗 Architecture

### Multi-tenant Design
- Complete data isolation by tenant
- Shared application logic with tenant context
- Scalable PostgreSQL schema with tenant_id foreign keys

### Security Features
- JWT-based authentication via StackAuth
- Role-based access control (RBAC)
- API key authentication for backend services
- Input validation and sanitization

### Performance Optimizations
- Server Components for initial page loads
- Streaming responses for real-time updates
- Database query optimization with Prisma
- Caching strategies for frequently accessed data

## 🔧 Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/UI components
│   └── ...               # Custom components
├── lib/                  # Utilities and configurations
├── hooks/               # Custom React hooks
└── types/               # TypeScript type definitions

prisma/
├── schema.prisma        # Database schema
└── seed.ts             # Database seeding
```

### Key Components

- **Authentication**: Modular auth system compatible with StackAuth
- **Dashboard**: Real-time metrics with Server Components
- **Promotions**: Complete CRUD with advanced filtering
- **Optimizer**: AI/ML optimization engine
- **Financials**: P&L and deduction management

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Set up PostgreSQL database (e.g., Neon, Supabase)
4. Deploy automatically on git push

### Environment Variables

Required for production:

```bash
DATABASE_URL=your-production-db-url
STACK_PROJECT_ID=your-stackauth-project-id
STACK_PUB_CLIENT_KEY=your-stackauth-client-key
STACK_SECRET_SERVER_KEY=your-stackauth-server-key
NEXT_PUBLIC_AGENT_URL=https://your-backend-api.com
BACKEND_API_KEY=your-backend-api-key
NODE_ENV=production
USE_MOCK_DATA=false
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is proprietary software. See LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

## 🔄 Version History

- **v0.1.0**: Initial release with core TPM functionality
- AI-powered optimization engine
- Multi-tenant architecture
- Real-time dashboard
- Complete promotion management
- Financial tracking and reporting