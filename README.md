# mencari

A job application tracker for fresh graduates and active job seekers.

Built with Next.js 14, TypeScript, TailwindCSS, ShadcnUI, and Supabase.

## Tech Stack

- **Frontend** — Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- **State** — Zustand
- **Backend** — Next.js API Routes
- **Database & Auth** — Supabase (PostgreSQL + Row Level Security)
- **Deployment** — Vercel

## Features

- Google login via Supabase Auth
- Add and manage job applications
- Track stages: Applied → Interview → Offer / Rejected
- Personal notes per application
- Dashboard with stats and response rate
- Export applications to CSV

## Getting Started

### Prerequisites

- Node.js v18.17+
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/yourusername/mencari.git
cd mencari
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

This project is deployed on Vercel. Add the environment variables above in your Vercel project settings under **Settings → Environment Variables**.

## License

MIT