# Tariff Gift App

A Next.js + Supabase web application where users sign in with Google, view tariff plans, apply for gifts, and activate approved gifts via email codes.

## Live Demo

[https://tariff-gift-app-ktz4.vercel.app](https://tariff-gift-app-ktz4.vercel.app)

## Test Admin Credentials
Email: admin@tariffapp.com

Password: 112233
## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database & Auth:** Supabase (PostgreSQL + RLS)
- **Authentication:** Google OAuth (users) + Email/Password (admin)
- **Email:** Nodemailer + Gmail SMTP
- **Telegram:** Telegram Bot API (webhook)
- **Styling:** Tailwind CSS v4

## Features

### User Flow
- Sign in with Google
- View active tariff cards on home page
- Buy a tariff (mocked payment)
- Apply for a gift for selected tariff
- Receive activation code via email after approval
- Activate gift with the code
- Access success page with active tariff or gift

### Admin Panel (`/admin`)
- Email/password login (separate from user login)
- Create and manage tariff cards (name, price, 1-12 months)
- Activate/deactivate tariffs
- View and manage gift applications (approve/reject)
- Telegram bot integration (approve/reject via Telegram)
- Notification audit log

### Telegram Bot
- Admin saves bot token in admin panel
- Admin marks themselves as approver via `/start`
- Bot sends gift application notifications with Approve/Reject buttons
- Approve → generates activation code → sends email
- All notifications logged with sent/failed status

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project
- Google OAuth credentials
- Gmail account with App Password
- Telegram bot (via @BotFather)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Murod-2909/tariff-gift-app.git
cd tariff-gift-app
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run database migrations in Supabase SQL Editor:
   - Copy and run the SQL from `supabase/schema.sql`

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

- `profiles` — user profiles with admin flag
- `tariffs` — tariff plans created by admin
- `user_tariffs` — purchased or gift-activated tariffs
- `gift_applications` — gift requests with status tracking
- `admin_settings` — Telegram bot configuration
- `telegram_audit_log` — Telegram notification history
- `email_audit_log` — email sending history

## Business Rules

- Users sign in with Google only
- Admin signs in with email/password only
- One pending gift application per user (enforced by DB unique index)
- Activation code can only be used once
- User cannot activate more than one gift
- Success page accessible only with active tariff or gift
- All business rules enforced server-side
- Telegram bot token never exposed to client
