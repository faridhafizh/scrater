# SCRATER 📈

**Automated Consumer Goods Trend Engine & Intelligence Platform**

[![Bun](https://img.shields.io/badge/Bun-1.2+-black?style=flat-square&logo=bun)](https://bun.sh/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-e0234e?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18.2-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.10-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌟 Overview

**Scrater** is an end-to-end trend tracking and product intelligence platform for consumer goods. It automatically extracts, normalizes, and analyzes trending products across e-commerce marketplaces and social channels. The system aggregates real-time signals, calculates popularity trend scores, and generates executive-ready PDF reports with embedded data visualizations.

---

## ✨ Key Features

- 🕷️ **Multi-Source Web Scraping**: Connectors for marketplace and social trends with automated cron scheduling and manual trigger controls.
- 📊 **Real-time Trend Intelligence**: Calculates custom trend scores based on price, rating, reviews, and popularity signals across product categories.
- 📄 **Executive PDF Generation**: Server-side Puppeteer rendering generates downloadable PDF reports with summary metrics, charts, and top-ranked items.
- 💻 **Modern Interactive Dashboard**: High-performance React dashboard featuring interactive charts (Recharts), instant searching, filtering, and live job status monitoring.
- ⚡ **Powered by Bun**: Ultra-fast execution, package management, and script running across backend and frontend workspaces.

---

## 🏗️ Tech Stack & Architecture

### Backend (`backend/`)
- **Runtime & Manager**: [Bun](https://bun.sh/)
- **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
- **Database**: SQLite managed with [Prisma ORM](https://www.prisma.io/)
- **Task Scheduling**: `@nestjs/schedule` (Cron jobs)
- **Web Extraction**: Puppeteer, Axios, Cheerio
- **Testing**: Jest, `ts-jest`

### Frontend (`frontend/`)
- **Framework**: [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
- **State & Data Fetching**: TanStack React Query v5
- **Styling**: Tailwind CSS & Lucide Icons
- **Data Visualization**: Recharts

---

## 📁 Repository Structure

```
scrater/
├── package.json              # Root workspace definition & Bun scripts
├── bun.lock                  # Bun lockfile
├── backend/                  # NestJS API server
│   ├── prisma/               # Database schema & migrations
│   └── src/
│       ├── jobs/             # Scheduler & scraping background tasks
│       ├── reports/          # Puppeteer HTML-to-PDF report generator
│       ├── scrapers/         # Marketplace & social scrapers
│       ├── sources/          # Scrape source management
│       ├── trends/           # Trend scoring & dashboard analytics
│       └── main.ts           # NestJS entry point
└── frontend/                 # Vite + React dashboard
    └── src/
        ├── App.tsx           # Dashboard UI tabs & components
        ├── api.ts            # Axios API client functions
        └── main.tsx          # React application entry point
```

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or higher)
- Node.js v18+ (optional/recommended for native Puppeteer bindings)

### Installation

Clone the repository and install dependencies using **Bun**:

```bash
git clone https://github.com/your-org/scrater.git
cd scrater
bun install
```

---

## 🛠️ Available Scripts

All tasks can be executed directly from the project root using Bun:

| Script | Command | Description |
| :--- | :--- | :--- |
| **Build All** | `bun run build` | Compiles both backend and frontend applications. |
| **Start Backend** | `bun run start:backend` | Starts the NestJS dev server with auto-reload. |
| **Start Frontend** | `bun run start:frontend` | Starts the Vite dev server for the React UI. |
| **Run Tests** | `bun run test` | Executes backend unit and integration test suites. |

---

## 📡 API Overview

The NestJS backend exposes RESTful endpoints under `/api`:

### Sources (`/api/sources`)
- `GET /api/sources` - List all configured scraper sources.
- `PATCH /api/sources/:id` - Update source enablement and schedule.
- `POST /api/sources/:id/run` - Trigger an immediate manual extraction job.

### Trends (`/api/trends`)
- `GET /api/trends` - Query trending goods with category/source filters and search.
- `GET /api/trends/stats` - Summary dashboard metrics and category breakdown.

### Reports (`/api/reports`)
- `GET /api/reports` - List all generated PDF reports.
- `POST /api/reports/generate` - Trigger asynchronous PDF report creation.
- `GET /api/reports/:id/download` - Stream generated PDF file.

---

## 📄 License

This project is licensed under the MIT License.
