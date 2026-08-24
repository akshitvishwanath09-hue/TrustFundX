<div align="center">
  <h1>🎓 TrustFundX</h1>
  <p><strong>Blockchain-Powered Grant Management & Milestone Tracking Platform</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#api-documentation">API</a> •
    <a href="#deployment">Deployment</a>
  </p>
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [User Roles & Workflows](#user-roles--workflows)
- [API Documentation](#api-documentation)
- [Blockchain Integration](#blockchain-integration)
- [Development](#development)
- [SEO & Performance](#seo--performance)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**TrustFundX** is a decentralized grant management platform that brings transparency and accountability to student project funding. Built on the Algorand blockchain, it enables milestone-based fund disbursement with DAO-style governance, ensuring that funds are released only when project milestones are achieved and approved by voters.

### Why TrustFundX?

- ✅ **Transparent Funding**: All transactions recorded on Algorand blockchain
- ✅ **Milestone-Based Payments**: Funds released incrementally based on progress
- ✅ **Democratic Governance**: Community voting for milestone approvals
- ✅ **Immutable Records**: Blockchain-backed proof of fund allocation
- ✅ **Multi-Role System**: Students, Sponsors, and Voters with distinct workflows

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Pera Wallet Integration**: Secure Web3 authentication via QR code scanning
- **Role-Based Access Control**: Student, Sponsor, and Voter roles with custom dashboards
- **Wallet-Based Identity**: No passwords, cryptographically secure authentication

### 💰 Grant Management
- **Grant Creation**: Sponsors can create grants with customizable milestone counts
- **Automated Fund Distribution**: Smart contract-based milestone payments
- **Real-Time Tracking**: Monitor grant status, milestones, and fund allocation
- **Grant Funding Dashboard**: View total funded amounts and transaction history

### 📊 Milestone Tracking
- **Detailed Milestone Pages**: View all milestone information including approvals, payment status, and submissions
- **File Upload Support**: Students can submit proof of work via Filestack integration
- **Approval Tracking**: Real-time voting count and approval status
- **Submission History**: Track when milestones were submitted and approved

### 🗳️ Voting System
- **DAO-Style Governance**: Voters review and approve milestone completions
- **Blockchain-Verified Votes**: All votes recorded on Algorand
- **Pending Approvals Queue**: Organized dashboard for voters to review submissions
- **Historical Voting Records**: Track recent approvals and voting history

### 🎨 User Experience
- **Modern UI/UX**: Gradient designs, smooth animations with Framer Motion
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-Time Updates**: Live milestone status and approval counts
- **Interactive Dashboards**: Role-specific interfaces optimized for each user type

### 🚀 SEO & Performance
- **Comprehensive SEO**: Metadata, OpenGraph, Twitter Cards, structured data
- **Dynamic Sitemap**: Auto-generated sitemap for search engines
- **PWA Support**: Progressive Web App with manifest.json
- **Social Media Ready**: Dynamic OG image generation for link previews

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16.1.6](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[React 19](https://react.dev/)** - UI library with latest features
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion 12](https://www.framer.com/motion/)** - Animation library
- **[Lucide React](https://lucide.dev/)** - Modern icon library

### Blockchain
- **[Algorand](https://www.algorand.com/)** - Layer-1 blockchain (Testnet)
- **[Pera Wallet](https://perawallet.app/)** - Web3 wallet integration
- **[algosdk 3.5.2](https://github.com/algorand/js-algorand-sdk)** - Algorand JavaScript SDK
- **Smart Contracts**: TEAL-based contracts for grant management

### Backend
- **[MongoDB 6.3.0](https://www.mongodb.com/)** - NoSQL database
- **Next.js API Routes** - Serverless API endpoints
- **[QR Code React](https://www.npmjs.com/package/qrcode.react)** - QR code generation

### Services
- **[Filestack](https://www.filestack.com/)** - File upload and storage
- **Algorand Node API** - Blockchain interaction via AlgoNode

### Development
- **[ESLint 9](https://eslint.org/)** - Code linting
- **[PostCSS](https://postcss.org/)** - CSS processing
- **Node.js 20+** - Runtime environment

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Login   │  │  Signup  │  │ Students │  │  Voters  │    │
│  │   Page   │  │   Page   │  │Dashboard │  │Dashboard │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│         │              │              │            │         │
│         └──────────────┴──────────────┴────────────┘         │
│                          │                                   │
│                  WalletContext                               │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                    API Layer (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Auth   │  │  Grants  │  │Milestones│  │  Upload  │    │
│  │   APIs   │  │   APIs   │  │   APIs   │  │   API    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────┬────────────────────────┬─────────────────┬────────┘
          │                        │                 │
┌─────────┴────────┐    ┌─────────┴────────┐  ┌─────┴──────┐
│    MongoDB       │    │    Algorand      │  │ Filestack  │
│   Database       │    │   Blockchain     │  │   Storage  │
│                  │    │                  │  │            │
│ • Users          │    │ • Smart Contract │  │ • Files    │
│ • Grants         │    │ • Transactions   │  │ • PDFs     │
│ • Milestones     │    │ • Voting Records │  │ • Images   │
└──────────────────┘    └──────────────────┘  └────────────┘
```

### Data Flow

1. **Authentication Flow**
   ```
   User → Pera Wallet (QR) → WalletContext → Auth API → MongoDB
   ```

2. **Grant Creation Flow**
   ```
   Sponsor → Create Grant → Smart Contract → Algorand → Grant API → MongoDB
   ```

3. **Milestone Submission Flow**
   ```
   Student → Upload File → Filestack → Submit Milestone → Milestone API → MongoDB
   ```

4. **Voting Flow**
   ```
   Voter → Approve → Smart Contract → Algorand → Sync API → MongoDB
   ```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** ([Download](https://nodejs.org/))
- **MongoDB 6+** ([Download](https://www.mongodb.com/try/download/community))
- **Pera Wallet** mobile app ([iOS](https://apps.apple.com/app/pera-algo-wallet/id1459898525) | [Android](https://play.google.com/store/apps/details?id=com.algorand.android))
- **Git** ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trustfundx.git
   cd trustfundx/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   
   Start MongoDB locally:
   ```bash
   # Windows
   mongod

   # macOS (via Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

4. **Configure environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/grant-tracking

   # Filestack (Optional - for file uploads)
   NEXT_PUBLIC_FILESTACK_API_KEY=your_filestack_api_key_here
   ```

   **To get Filestack API key:**
   - Sign up at [filestack.com](https://www.filestack.com/)
   - Get your API key from dashboard
   - Add to `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. **Create User Account**
   - Go to `/signup`
   - Fill in your details
   - Select your role (Student/Sponsor/Voter)
   - Scan QR code with Pera Wallet to connect

2. **Fund Test Wallet** (for Sponsors)
   - Visit [Algorand Testnet Dispenser](https://bank.testnet.algorand.network/)
   - Enter your wallet address
   - Get test ALGO tokens

3. **Start Using TrustFundX**
   - Sponsors: Create grants
   - Students: Track milestones
   - Voters: Review and approve submissions

---

## 📁 Project Structure

```
TrustFundX/web/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with SEO metadata
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Global styles
│   │
│   ├── api/                     # API Routes
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts    # POST /api/auth/login
│   │   │   └── signup/
│   │   │       └── route.ts    # POST /api/auth/signup
│   │   ├── grants/
│   │   │   └── route.ts        # GET, POST /api/grants
│   │   ├── milestones/
│   │   │   └── route.ts        # GET, POST, PUT /api/milestones
│   │   ├── voters/
│   │   │   └── route.ts        # GET /api/voters
│   │   ├── upload/
│   │   │   └── route.ts        # POST /api/upload
│   │   ├── sync-milestone/
│   │   │   └── route.ts        # POST /api/sync-milestone
│   │   └── fix-grant-funding/
│   │       └── route.ts        # POST /api/fix-grant-funding
│   │
│   ├── login/
│   │   └── page.tsx            # Login page with Pera Wallet
│   ├── signup/
│   │   └── page.tsx            # Multi-step signup
│   │
│   ├── students/
│   │   └── page.tsx            # Student dashboard
│   ├── sponsors/
│   │   ├── page.tsx            # Sponsor dashboard
│   │   └── create/
│   │       └── page.tsx        # Create grant page
│   ├── voters/
│   │   └── page.tsx            # Voter dashboard
│   │
│   ├── milestone/
│   │   └── [id]/
│   │       └── page.tsx        # Milestone detail page
│   │
│   ├── sitemap.ts              # Dynamic sitemap generation
│   └── opengraph-image.tsx     # Dynamic OG image
│
├── contexts/
│   └── WalletContext.tsx       # Pera Wallet provider
│
├── lib/
│   ├── algorand.ts             # Algorand client config
│   ├── contract.json           # Smart contract ABI
│   ├── contractMethods.ts      # Contract interaction methods
│   ├── diagnostics.ts          # Error handling utilities
│   ├── mongodb.ts              # MongoDB connection
│   ├── syncBlockchain.ts       # Blockchain sync utilities
│   └── types.ts                # TypeScript type definitions
│
├── public/
│   ├── favicon.ico             # Site favicon
│   ├── manifest.json           # PWA manifest
│   ├── robots.txt              # SEO crawler config
│   ├── humans.txt              # Credits file
│   └── Artifacts/              # Smart contract artifacts
│       ├── GetFund.approval.teal
│       ├── GetFund.arc56.json
│       ├── GetFund.clear.teal
│       └── get_fund_client.py
│
├── .env.local                  # Environment variables (not in git)
├── .gitignore
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

---

## 🔧 Environment Variables

Create a `.env.local` file in the project root with the following variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | ✅ Yes | - | MongoDB connection string |
| `NEXT_PUBLIC_APP_ID` | ✅ Yes | - | Algorand smart contract application ID |
| `NEXT_PUBLIC_APP_ADDRESS` | ✅ Yes | - | Algorand smart contract address |
| `NEXT_PUBLIC_FILESTACK_API_KEY` | ⚠️ Optional | - | Filestack API key for file uploads |

### MongoDB URI Format

```
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/grant-tracking

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/grant-tracking?retryWrites=true&w=majority

# Docker MongoDB
MONGODB_URI=mongodb://host.docker.internal:27017/grant-tracking
```

### Algorand Configuration

Set these environment variables for Algorand smart contract interaction:

```env
# Algorand Testnet App ID (number)
NEXT_PUBLIC_APP_ID=YOUR_DEPLOYED_APP_ID

# Algorand Testnet App Address (contract account address)
NEXT_PUBLIC_APP_ADDRESS=YOUR_DEPLOYED_APP_ADDRESS
```

**Note**: These variables are public (prefixed with `NEXT_PUBLIC_`) because they need to be accessible in the browser. The values shown above are for the Algorand Testnet.

---

## 👥 User Roles & Workflows

### 🎓 Student

**Purpose**: Receive funding and complete project milestones

**Dashboard Features**:
- View assigned grants
- Track milestone progress
- Submit milestone completions with proof
- Monitor approval status
- Receive payments upon approval

**Workflow**:
1. Log in with Pera Wallet
2. View grants assigned to your wallet
3. When milestone is ready, click on it
4. Upload submission file (PDF, image, etc.)
5. Add submission note
6. Wait for voter approvals
7. Receive payment when milestone is approved

---

### 💼 Sponsor

**Purpose**: Create and fund grants for student projects

**Dashboard Features**:
- Create new grants with custom milestones
- Fund grants with ALGO tokens
- Monitor grant progress
- View milestone statuses
- Track total funding amounts

**Workflow**:
1. Log in with Pera Wallet
2. Navigate to "Create Grant"
3. Enter grant details:
   - Student wallet address
   - Number of milestones
   - Required votes per milestone
4. Sign transaction with Pera Wallet
5. Fund the grant contract
6. Monitor progress on dashboard

---

### 🗳️ Voter

**Purpose**: Review and approve milestone completions

**Dashboard Features**:
- View pending milestone approvals
- Review submission details and files
- Cast approval votes
- See recent approval history
- Participate in governance

**Workflow**:
1. Log in with Pera Wallet
2. Review pending milestones
3. Click milestone to view details
4. Review submission note and files
5. Click "Approve" if satisfied
6. Sign transaction with Pera Wallet
7. Milestone moves to recent approvals

---

## 📡 API Documentation

### Authentication

#### `POST /api/auth/signup`
Create a new user account

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "organization": "University XYZ",
  "role": "student",
  "walletAddress": "ABCD..."
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "walletAddress": "ABCD..."
  }
}
```

#### `POST /api/auth/login`
Authenticate user with wallet address

**Request Body**:
```json
{
  "walletAddress": "ABCD..."
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "role": "student",
    "name": "John Doe"
  }
}
```

---

### Grants

#### `GET /api/grants`
Fetch grants (filtered by query params)

**Query Parameters**:
- `sponsorAddress` - Filter by sponsor wallet
- `teamAddress` - Filter by student wallet

**Response**:
```json
[
  {
    "_id": "...",
    "sponsorAddress": "ABCD...",
    "teamAddress": "EFGH...",
    "requiredVotes": 3,
    "milestoneCount": 5,
    "appId": 1234567,
    "txId": "XYZ...",
    "status": "active",
    "totalFunded": 1000,
    "createdAt": "2026-03-01T00:00:00.000Z"
  }
]
```

#### `POST /api/grants`
Create a new grant

**Request Body**:
```json
{
  "sponsorAddress": "ABCD...",
  "teamAddress": "EFGH...",
  "requiredVotes": 3,
  "milestoneCount": 5,
  "appId": 1234567,
  "txId": "XYZ..."
}
```

---

### Milestones

#### `GET /api/milestones`
Fetch milestones

**Query Parameters**:
- `grantId` - Filter by grant ID
- `milestoneDbId` - Fetch specific milestone by database ID

**Response**:
```json
[
  {
    "_id": "...",
    "grantId": "...",
    "milestoneId": 1,
    "amount": 200,
    "approvals": 2,
    "paid": false,
    "submissionNote": "Completed Phase 1",
    "submissionFileUrl": "https://...",
    "submittedAt": "2026-03-02T00:00:00.000Z",
    "createdAt": "2026-03-01T00:00:00.000Z"
  }
]
```

#### `POST /api/milestones`
Create milestones for a grant

**Request Body**:
```json
{
  "grantId": "...",
  "milestoneCount": 5,
  "amounts": [200, 200, 200, 200, 200]
}
```

#### `PUT /api/milestones`
Update milestone (submit completion)

**Request Body**:
```json
{
  "milestoneDbId": "...",
  "submissionNote": "Phase completed",
  "submissionFileUrl": "https://..."
}
```

---

### Voters

#### `GET /api/voters`
Fetch all voter users

**Response**:
```json
[
  {
    "_id": "...",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "walletAddress": "VOTER123...",
    "role": "voter"
  }
]
```

---

### File Upload

#### `POST /api/upload`
Upload file via Filestack

**Request Body**:
```json
{
  "base64": "data:application/pdf;base64,..."
}
```

**Response**:
```json
{
  "url": "https://cdn.filestackcontent.com/..."
}
```

---

### Blockchain Sync

#### `POST /api/sync-milestone`
Sync milestone data from blockchain

**Request Body**:
```json
{
  "grantId": "...",
  "milestoneId": 1
}
```

#### `POST /api/fix-grant-funding`
Recalculate grant funding amounts

**Request Body**:
```json
{
  "appId": 1234567
}
```

---

## ⛓️ Blockchain Integration

### Smart Contract

**Contract Type**: Algorand Smart Contract (TEAL)  
**Network**: Testnet  
**App ID**: 1234567  
**Contract Address**: `YOUR_DEPLOYED_APP_ADDRESS`

### Contract Methods

Located in `lib/contractMethods.ts`:

#### `createGrant()`
Creates a new grant fund with milestones

**Parameters**:
- `sponsorAddress` - Wallet address of sponsor
- `teamAddress` - Wallet address of student
- `requiredVotes` - Number of approvals needed
- `milestoneCount` - Total milestones

**Returns**: Transaction ID

#### `fundGrant()`
Adds ALGO tokens to grant contract

**Parameters**:
- `appId` - Contract application ID
- `amount` - ALGO amount to fund

#### `approveMilestone()`
Voter approves a milestone

**Parameters**:
- `milestoneId` - ID of milestone to approve
- `voterAddress` - Wallet address of voter

#### `releaseMilestone()`
Releases payment when milestone approved

**Parameters**:
- `milestoneId` - ID of milestone

### Blockchain Utilities

`lib/syncBlockchain.ts` provides:
- `fetchMilestoneFromBlockchain()` - Get milestone data
- `fetchGrantBalance()` - Get grant contract balance
- `syncAllMilestones()` - Sync all milestones with blockchain

---

## 💻 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

### Development Workflow

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Make Changes**
   - Edit files in `app/`, `lib/`, or `contexts/`
   - Changes auto-reload with Turbopack

4. **Test Changes**
   - Test in browser with Pera Wallet
   - Check MongoDB for data persistence
   - Verify blockchain transactions on [AlgoExplorer Testnet](https://testnet.algoexplorer.io/)

5. **Commit**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

### Database Management

**View MongoDB Collections**:
```bash
mongosh
use grant-tracking
db.users.find()
db.grants.find()
db.milestones.find()
```

**Clear All Data** (development only):
```bash
mongosh
use grant-tracking
db.dropDatabase()
```

### Testing with Pera Wallet

1. Install Pera Wallet on mobile device
2. Create test account
3. Get test ALGO from [dispenser](https://bank.testnet.algorand.network/)
4. Scan QR codes from TrustFundX to connect
5. Sign transactions in Pera Wallet app

---

## 🎨 SEO & Performance

### SEO Features

✅ **Comprehensive Metadata**
- Title templates
- Meta descriptions
- Keywords
- Author information

✅ **Social Media Optimization**
- OpenGraph tags for Facebook/LinkedIn
- Twitter Card tags
- Dynamic OG image generation

✅ **Search Engine Optimization**
- Robots.txt configuration
- Dynamic XML sitemap
- Structured data (JSON-LD)
- Canonical URLs

✅ **PWA Support**
- Web app manifest
- Theme colors
- App icons

✅ **Additional**
- humans.txt for credits
- Verification tags (Google/Yandex)

### Performance Optimizations

- **Next.js 16**: Latest features and optimizations
- **Turbopack**: Faster builds and hot reload
- **React 19**: Improved rendering performance
- **Tailwind CSS 4**: Optimized CSS output
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based splitting
- **Edge Runtime**: Fast OG image generation

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository

3. **Configure Environment Variables**
   - Add `MONGODB_URI` (use MongoDB Atlas)
   - Add `NEXT_PUBLIC_FILESTACK_API_KEY` (optional)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site is live!

### MongoDB Atlas Setup

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Add database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string
6. Add to Vercel environment variables

### Custom Domain

1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Contribution Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with descriptive message**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Tailwind CSS for styling
- Write descriptive commit messages
- Comment complex logic

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Test coverage

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 TrustFundX

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/trustfundx/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/trustfundx/discussions)
- **Email**: support@trustfundx.com

---

## 🙏 Acknowledgments

- **Algorand Foundation** - Blockchain infrastructure
- **Pera Wallet** - Secure wallet integration
- **MongoDB** - Database solution
- **Vercel** - Hosting and deployment
- **Next.js Team** - Amazing framework
- **Open Source Community** - Various libraries and tools

---

<div align="center">
  <p>Built with ❤️ by the TrustFundX Team</p>
  <p>
    <a href="https://trustfundx.com">Website</a> •
    <a href="https://github.com/yourusername/trustfundx">GitHub</a> •
    <a href="https://twitter.com/trustfundx">Twitter</a>
  </p>
</div>
