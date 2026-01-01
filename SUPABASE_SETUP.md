# Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name:** Sentinel Fraud Detection
   - **Database Password:** (generate strong password - save it!)
   - **Region:** Choose closest to Kerala (Singapore or Mumbai)
5. Wait for project to initialize (~2 minutes)

## Step 2: Get API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 3: Add to Environment Variables

Create `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the schema from `supabase/schema.sql`
4. Click **Run**

## Step 5: Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable:
   - ✅ Email
   - ✅ Phone (optional, for OTP)
3. Configure email templates if needed

## Done! 🎉

Your backend is now ready. The app will automatically connect when you add the environment variables.
