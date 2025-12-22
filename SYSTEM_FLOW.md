# CalmSeek System Flow Documentation

## Overview
This document explains how the complete submission-to-approval flow works in CalmSeek.

## Form Submission Flow

### 1. User Submits Venue or Event
- User fills out form at `/organizer/submit/venue` or `/organizer/submit/event`
- Form includes: title, description, address, sensory attributes, images
- All submissions are **FREE** (no payment required)
- PhotoUploader component handles image uploads to Supabase Storage

### 2. Submission API (`/api/submissions/route.ts`)
- Receives form data from client
- Validates required fields
- Inserts into `listings` table with `status='pending'`
- Sends email notification to admin (tktoot1@yahoo.com) via Resend
- Returns success response

### 3. Admin Review (`/admin` page)
- Only accessible to users with emails in `ADMIN_EMAILS` config
- Fetches all listings from Supabase with real-time data
- Shows tabs: Pending, Approved, Rejected
- Each pending listing shows full details with images

### 4. Admin Actions
- **Approve**: Calls `/api/admin/approve` → sets `status='approved'`, sends approval email
- **Reject**: Calls `/api/admin/reject` → sets `status='rejected'`, sends rejection email with optional reason

### 5. Public Display
- **Discover Page** (`/discover`): Fetches `status='approved'` listings, shows both venues and events
- **Events Page** (`/events`): Fetches `status='approved'` AND `type='event'` listings
- **Venues**: Displayed on discover page under "Venues" tab
- **Events**: Displayed on both discover and events pages

## Database Schema

### `listings` table
\`\`\`sql
- id (uuid, primary key)
- type (text: 'venue' | 'event' | 'park')
- title (text)
- description (text)
- address (text)
- city (text)
- state (text)
- zip (text)
- website (text, nullable)
- email (text, nullable)
- phone (text, nullable)
- images (text[], Supabase storage URLs)
- status (text: 'pending' | 'approved' | 'rejected')
- sensory_features (text[], e.g., ['lowNoise', 'gentleLighting'])
- event_date (date, nullable - only for events)
- event_start_time (text, nullable - only for events)
- organizer_email (text, nullable)
- submitted_at (timestamp)
- reviewed_at (timestamp, nullable)
\`\`\`

## Email Notifications (via Resend)

1. **New Submission**: Sent to admin when form is submitted
2. **Approval**: Sent to organizer when admin approves
3. **Rejection**: Sent to organizer when admin rejects (with reason)
4. **Advertise Form**: Sent to admin when advertise form is submitted

All emails sent to: `tktoot1@yahoo.com`

## Key Configuration

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `POSTGRES_URL`: Database connection string
- `RESEND_API_KEY`: Email service API key
- `ADMIN_EMAILS`: ["tktoot1@yahoo.com", "tktut1@yahoo.com"]
- `NEXT_PUBLIC_BILLING_ENABLED`: false (all submissions are free)

### Admin Access
- Admin panel visible only to emails in `ADMIN_EMAILS`
- Admin tab appears in bottom navigation for admin users
- Badge shows in profile for admin users

## Image Upload Flow

1. User selects images in PhotoUploader component
2. Images uploaded to Supabase Storage bucket
3. Storage URLs saved to `listings.images` array
4. Images displayed in admin panel and public pages

## Mock Data Status

- Mock data arrays in `lib/mock-data.ts` are now EMPTY
- All pages fetch from Supabase database
- No fallback to mock data

## Troubleshooting

### Admin panel not showing listings
1. Check browser console for `[v0] ADMIN_FETCH` logs
2. Verify Supabase connection is successful
3. Confirm user email is in `ADMIN_EMAILS`
4. Check listings table in Supabase has pending items

### Submissions not appearing
1. Check `/api/submissions` route is working
2. Verify Supabase insert is successful
3. Check email notification was sent
4. Refresh admin panel with refresh button

### Images not uploading
1. Check Supabase Storage bucket exists (`public-uploads`)
2. Verify RLS policies allow public insert
3. Check browser console for upload errors
4. Ensure `NEXT_PUBLIC_SUPABASE_URL` is set

## Current Status

✅ All mock data removed
✅ Discover page fetches from Supabase
✅ Events page fetches from Supabase  
✅ Admin dashboard has full approve/reject functionality
✅ Email notifications working
✅ Photo upload integrated
✅ All submissions are FREE (no payment required)
✅ Seamless submission flow (no organizer account redirect)
