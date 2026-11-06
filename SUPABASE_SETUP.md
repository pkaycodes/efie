# Connecting Efie to Supabase

Efie stays on GitHub Pages. Supabase adds the shared database and photo storage.

Until these steps are done, the site automatically falls back to browser storage,
so nothing breaks.

## 1. Create the project

1. Go to [database.new](https://database.new) and sign in with GitHub or email.
2. Create a project named `efie`. Choose the free plan and the region closest to
   Ghana (for example `eu-west-1` or `eu-central-1`).
3. Wait for the database to finish provisioning.

No card is required for the free plan.

## 2. Create the tables and photo bucket

1. In the Supabase dashboard, open **SQL Editor**.
2. Create a new query, paste the contents of
   [`supabase/schema.sql`](schema.sql), and click **Run**.

This creates:

- `listings` — shared property posts
- `saved_listings` — each visitor's shortlist
- `listing-photos` — a public photo bucket
- Row-level security policies so people can only edit or delete their own data

## 3. Allow anonymous visitors

1. Open **Authentication -> Providers**.
2. Enable **Anonymous sign-ins**.

Efie does not require an account. Each browser silently gets an anonymous
Supabase user so it can own its posts and shortlist.

## 4. Add the keys

1. Open **Project Settings -> API**.
2. Copy the **Project URL** and the **anon public** key.
3. Create a `.env.local` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

The anon key is meant to be shipped in the browser. Never use the
`service_role` key in the frontend.

## 5. Build and publish

```bash
npm run build
```

Deploy the generated `dist` folder to the `gh-pages` branch as usual.

## Checking it worked

- Post a listing in one browser.
- Open the site in a private window or on another device.
- The listing and its photos should appear there too.
- The landlord dashboard should only show listings created by that browser.

## Free plan notes

- The free plan includes 500 MB of database storage and 1 GB of photo storage.
- Projects pause after about one week without activity. Opening the site wakes
  the project again, but the first request may be slow.
- Anonymous users count towards the monthly active user allowance.
