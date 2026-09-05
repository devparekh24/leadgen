# 🦎 SaaSquatch Leads — AI-Powered Lead Intelligence Dashboard

> Built to enhance the [SaaSquatch Leads](https://www.saasquatchleads.com/) lead generation platform

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs)
![Express](https://img.shields.io/badge/Express.js-4.x-black?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)

---

## 🎯 What I Built

An **AI-Powered Lead Intelligence Dashboard** — a full-stack tool that goes beyond simple scraping to deliver **actionable, scored leads** for B2B sales teams. It combines:

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Lead Scraper** | Search businesses by industry, location, and keywords with multi-source data aggregation |
| 🧠 **AI Lead Scoring** | Automatically scores and ranks leads 0-100 by acquisition fit using a weighted algorithm |
| 📊 **Analytics Dashboard** | Interactive charts showing score distribution, industry breakdown, and revenue insights |
| ✉️ **AI Email Generator** | Generate personalized cold outreach emails with tone and template controls |
| 📥 **Export Engine** | One-click CSV/Excel export with filtered columns |

### Why This Feature?

The challenge asked for a tool that "could help a company in the most effective way possible." Lead scraping alone is commoditized — the real value is **knowing which leads to pursue first**. The AI scoring engine transforms raw data into prioritized action, reducing time-to-qualified-lead by focusing sales teams on Hot (80+) leads.

This aligns directly thesis: **practical AI solutions that improve decision-making and create lasting value**.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js Frontend                  │
│  ┌──────────┐ ┌───────────┐ ┌────────────────────┐  │
│  │  Search   │ │   Lead    │ │    Analytics       │  │
│  │  Panel    │ │   Table   │ │    Dashboard       │  │
│  └────┬─────┘ └─────┬─────┘ └────────┬───────────┘  │
│       │              │                │              │
│       └──────────────┴────────────────┘              │
│                      │ HTTP/REST                     │
└──────────────────────┼───────────────────────────────┘
                       │
┌──────────────────────┼───────────────────────────────┐
│              Node.js Backend                          │
│  ┌──────────┐ ┌──────────┐ ┌───────────────────────┐ │
│  │ Scraper  │ │  Scorer  │ │   Email Generator     │ │
│  │ Service  │ │  Engine  │ │   (AI + Templates)    │ │
│  └────┬─────┘ └────┬─────┘ └───────────┬───────────┘ │
│       │             │                   │             │
│       └─────────────┴───────────────────┘             │
│                     │                                 │
│              ┌──────┴──────┐                          │
│              │   SQLite    │                          │
│              │   Database  │                          │
│              └─────────────┘                          │
└───────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14, React 18, TypeScript | Matches SaaSquatch's stack; SSR; modern React patterns |
| **Styling** | Vanilla CSS with CSS Custom Properties | Full control over premium dark-mode aesthetic |
| **Backend** | Node.js, Express, TypeScript | High performance, unified JS/TS ecosystem |
| **Database** | PostgreSQL + Prisma ORM | Type-safe database queries and migrations |
| **AI** | OpenAI GPT-4o-mini (optional) | Lead scoring rationale + email generation |
| **Charts** | Recharts | Lightweight, composable, dark-theme ready |
| **Export** | SheetJS (xlsx) | Industry-standard CSV/Excel generation |
| **Icons** | Lucide React | Consistent, beautiful icon set |

### Data Storage Strategy
- **Development**: SQLite — zero-config, file-based, perfect for demos
- **Production**: PostgreSQL on Supabase/Railway — swap via `DATABASE_URL`
- **Caching**: In-memory lead cache reduces redundant API calls

### Hosting Architecture
- **Frontend**: Vercel (static + SSR, free tier)
- **Backend**: Railway / Render (Node.js API, free tier)
- **Database**: Render PostgreSQL

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/leadgen-scraping-tool.git
cd leadgen-scraping-tool
```

### 2. Start the Backend
```bash
cd backend
npm install
npm run dev
```
The API will be available at `http://localhost:8000`

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The dashboard will be available at `http://localhost:3000`

### 4. (Optional) Configure API Keys
```bash
cp .env.example .env
# Edit .env and add your OpenAI key for AI-powered features
# The tool works without any API keys using built-in mock data and templates
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/scrape` | Search and scrape leads by industry, location, keywords |
| `GET` | `/api/leads` | Retrieve all saved leads with optional filters |
| `POST` | `/api/score` | AI-score a batch of leads |
| `POST` | `/api/email/generate` | Generate personalized outreach email |
| `GET` | `/api/export?format=csv` | Export leads to CSV or Excel |
| `GET` | `/api/analytics` | Dashboard analytics data |
| `DELETE` | `/api/leads/{id}` | Delete a lead |

---

## 🎨 UX Design Decisions

1. **Dark Mode First** — Matches SaaSquatch's design language; reduces eye strain for power users who spend hours in the dashboard
2. **Glassmorphism Cards** — Semi-transparent cards with backdrop blur create visual depth hierarchy
3. **Score Color Coding** — Instant visual triage: 🟢 Hot (80+), 🟡 Warm (50-79), 🔴 Cold (<50)
4. **Progressive Disclosure** — Search → Results → Details → Email is a guided workflow that reduces cognitive load
5. **One-Click Actions** — Score, email, and export are always one click away
6. **Responsive Layout** — Full dashboard on desktop, stacked panels on mobile

---

## 🧠 AI Scoring Formula

```
Score = (0.30 × Revenue Fit)
      + (0.25 × Employee Fit)
      + (0.20 × Industry Match)
      + (0.15 × Web Presence)
      + (0.10 × Recency Bonus)
```

Each factor is normalized to 0-100 and combined into a weighted composite score:
- **Revenue Fit**: How well the company's estimated revenue matches the target range ($1M-$10M sweet spot)
- **Employee Fit**: Alignment with ideal company size (10-100 employees for SMB acquisitions)
- **Industry Match**: Whether the industry is in the high-value acquisition vertical list
- **Web Presence**: Signals like having a website, Google reviews, social profiles
- **Recency Bonus**: Freshness of the data (newer = more reliable)

---

## 📁 Project Structure

```
leadgen-scraping-tool/
├── backend/
│   ├── src/
│   │   ├── server.ts           # Express application entry
│   │   ├── db.ts               # Database connection
│   │   ├── services/
│   │       ├── scraper.ts      # Lead scraping engine
│   │       ├── scorer.ts       # AI scoring engine
│   │       └── email.ts        # Email generation
│   ├── package.json            # Node dependencies
│   └── prisma/                 # Prisma schema & migrations
│       └── schema.prisma       # Database schema definition
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Dashboard page
│   │   │   ├── layout.tsx      # Root layout
│   │   │   └── globals.css     # Complete design system
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── SearchPanel.tsx
│   │   │   ├── LeadTable.tsx
│   │   │   ├── AnalyticsPanel.tsx
│   │   │   ├── EmailGenerator.tsx
│   │   │   ├── ScoreBadge.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── lib/
│   │       └── api.ts          # API client
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔮 Future Enhancements (Beyond 5-Hour Scope)

- **CRM Integration**: Direct push to HubSpot/Salesforce via webhooks
- **Multi-Source Enrichment**: LinkedIn, Crunchbase, ZoomInfo APIs
- **Automated Pipeline Alerts**: Slack/email notifications for high-score leads
- **Team Collaboration**: Shared lead pools with assignment and status tracking
- **A/B Email Testing**: Test multiple outreach variations per lead segment

---
