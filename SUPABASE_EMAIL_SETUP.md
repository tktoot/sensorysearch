# Supabase Email Configuration

## Problem
New users are not receiving confirmation emails after signing up.

## Solution
Configure Supabase email settings in your Supabase dashboard.

## Steps

### 1. Enable Email Confirmation (Recommended for Production)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Settings**
4. Under **Email Auth**, ensure these settings:
   - ✅ **Enable email confirmations** - ON (for production)
   - ✅ **Enable email change confirmations** - ON
   - ✅ **Secure email change** - ON

### 2. Configure Email Templates

1. In **Authentication** → **Email Templates**
2. Customize the **Confirm signup** template:
   - Subject: "Confirm your SensorySearch account"
   - Body: Include your branding and a clear call-to-action

### 3. For Development/Testing: Disable Email Confirmation

If you want to test without email confirmation during development:

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**:
   - ❌ **Enable email confirmations** - OFF (development only!)
3. Users will be able to sign in immediately without confirming their email

### 4. Configure SMTP (Optional - For Custom Email Provider)

By default, Supabase uses their email service (limited to 3 emails/hour in free tier).

For production, configure your own SMTP:

1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Enter your SMTP credentials (e.g., SendGrid, AWS SES, Resend)

### 5. Test Email Delivery

1. Sign up with a test email
2. Check inbox and spam folder
3. Verify the confirmation link works
4. Check Supabase logs: **Authentication** → **Logs**

## Current Setup

- Email confirmation: **ENABLED** (default)
- Redirect URL: `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` or `/discover`
- Admin notifications: Sent to `BETA_NOTIFY_EMAIL` (tktoot1@yahoo.com)

## Troubleshooting

### Emails not arriving?

1. **Check spam folder** - Supabase emails often go to spam
2. **Check Supabase logs** - Look for email delivery errors
3. **Verify email provider** - Some providers block automated emails
4. **Check rate limits** - Free tier has 3 emails/hour limit
5. **Try a different email** - Some domains block Supabase emails

### Want to skip email confirmation during beta?

Set in Supabase Dashboard:
- Authentication → Settings → Email Auth → **Disable** "Enable email confirmations"

This allows users to sign in immediately without confirming their email.

## Environment Variables

Ensure these are set in your `.env.local`:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/discover
BETA_NOTIFY_EMAIL=tktoot1@yahoo.com
