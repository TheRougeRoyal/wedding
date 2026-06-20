# Wedding Guest Tracker

Track your wedding guests' train and flight journeys in real-time.

## Features

- **Train Tracking** — Live Indian Railways status via IRCTC API
- **Flight Tracking** — Real-time flight status via Aviationstack API
- **Guest Dashboard** — Search, filter, and sort guests
- **Reminders** — Set arrival reminders for each guest
- **Mobile-First** — Responsive design for phones and tablets

## Tech Stack

- [Next.js 14](https://nextjs.org/) (Pages Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) components
- [Lucide](https://lucide.dev/) icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local`:

```env
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=irctc1.p.rapidapi.com
AVIATIONSTACK_KEY=your_aviationstack_key
```

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/wedding-guest-tracker)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy
