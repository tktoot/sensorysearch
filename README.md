# SensorySearch MVP

A sensory-friendly venue and event discovery platform built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🔐 Authentication with Supabase (Email/Password, OAuth)
- 📝 Venue, Event, and Park submissions with photo uploads
- 👨‍💼 Admin moderation queue with approve/reject workflow
- 📊 Analytics tracking for clicks and submissions
- 📧 Email notifications via Resend
- 🎨 Sensory-friendly UI with accessibility features
- 📱 Mobile-first responsive design with iOS-style bottom navigation

## Local Development Setup

### Prerequisites

- Node.js 20.x (see `.nvmrc`)
- npm or yarn
- Supabase account
- Resend account (for email notifications)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd sensorysearch-mvp
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in the required values:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep secret!)
   - `RESEND_API_KEY` - Your Resend API key for sending emails
   - `BETA_NOTIFY_EMAIL` - Email address to receive submission notifications

4. **Set up Supabase**

   Run the SQL migration scripts in order:
   \`\`\`bash
   # In your Supabase SQL Editor, run:
   scripts/001-initial-schema.sql
   scripts/002-add-roles.sql
   # ... (run all scripts in order)
   scripts/016-setup-storage-and-rls.sql
   \`\`\`

   Create the storage bucket:
   - Go to Supabase Dashboard → Storage
   - Create a new bucket named `public-uploads`
   - Make it public
   - Set up RLS policies (see `scripts/016-setup-storage-and-rls.sql`)

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run export` - Export static site to `out/` directory
- `npm run lint` - Run ESLint

## Environment Variables

See `.env.example` for all required environment variables.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGc...` |
| `RESEND_API_KEY` | Resend API key | `re_xxx` |
| `BETA_NOTIFY_EMAIL` | Admin notification email | `admin@example.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BETA_ENABLED` | Enable beta mode | `true` |
| `NEXT_PUBLIC_BETA_FREE_MONTHS` | Free trial months | `3` |
| `NEXT_PUBLIC_UPLOAD_MAX_MB` | Max upload size (MB) | `5` |
| `NEXT_PUBLIC_UPLOAD_MAX_IMAGES` | Max images per submission | `5` |

## Testing Locally

### Test Image Uploads

1. Sign up for an account
2. Upgrade to organizer (free during beta)
3. Go to Submit → Venue/Event/Park
4. Upload 1-5 images (max 5MB each)
5. Fill out the form and submit
6. Check that images appear in Supabase Storage bucket `public-uploads`

### Test Email Notifications

1. Set `RESEND_API_KEY` and `BETA_NOTIFY_EMAIL` in `.env.local`
2. Submit a venue/event/park
3. Check the email inbox for `BETA_NOTIFY_EMAIL`
4. You should receive a notification with submission details

### Test Admin Moderation

1. Sign in with an admin email (see `ADMIN_EMAILS` in config)
2. Click the Admin tab in bottom navigation (mobile) or 3-dot menu (desktop)
3. View pending submissions
4. Approve or reject submissions
5. Check that status updates in database

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── upload/        # Image upload to Supabase Storage
│   │   ├── submissions/   # Venue/Event/Park submissions
│   │   ├── notify-admin/  # Email notifications
│   │   └── analytics/     # Click tracking
│   ├── admin/             # Admin dashboard
│   ├── discover/          # Main discovery page
│   ├── intro/             # Onboarding flow
│   ├── organizer/         # Organizer dashboard & submission forms
│   └── profile/           # User profile
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utilities and helpers
│   ├── supabase/         # Supabase clients
│   ├── config.ts         # App configuration
│   └── ...               # Other utilities
├── scripts/              # SQL migration scripts
└── public/               # Static assets
\`\`\`

## Troubleshooting

### "Invalid login credentials" error

- Make sure you've created an account first (use Sign Up mode on intro page)
- Check that Supabase auth is properly configured
- Verify environment variables are set correctly

### Image upload fails

- Check that `public-uploads` bucket exists in Supabase Storage
- Verify bucket is set to public
- Check RLS policies allow authenticated users to upload
- Ensure images are under 5MB and in supported formats (jpg, png, webp)

### Email notifications not sending

- Verify `RESEND_API_KEY` is set correctly
- Check that `BETA_NOTIFY_EMAIL` is a valid email address
- Check Resend dashboard for delivery status
- Look for errors in server logs

### Admin tab not showing

- Sign in with an email listed in `ADMIN_EMAILS` config
- Check that user role is set to 'admin' in database
- Clear browser cache and reload

### Build errors

- Run `npm install` to ensure all dependencies are installed
- Check that Node.js version matches `.nvmrc` (20.x)
- Clear `.next` directory: `rm -rf .next`
- Try `npm run build` again

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

1. Build the project: `npm run build`
2. Start the server: `npm run start`
3. Or export static site: `npm run export`

## License

MIT
\`\`\`

```text file=".nvmrc"
20
