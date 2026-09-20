# FindMatch

**Web-Based Lost-and-Found Management System Using Weighted Similarity Matching and Claim Verification**

FindMatch is a university Software Engineering final project for reporting lost and found belongings, reviewing Possible Matches through Weighted Similarity Matching, and completing Claim Verification securely.

## Core features

- Email/password authentication with protected user and administrator areas
- Lost-item and found-item reporting with Supabase Storage images
- Weighted Similarity Matching using category, brand, color, location, date, and description keywords
- Privacy-conscious item details and Claim Verification
- Administrator claim review and secure decision workflow
- User activity history with report editing and deletion safeguards

## Technology

- Next.js App Router with JavaScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, Row Level Security, and Storage

## Local development

Create `.env.local` with the public Supabase project values:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database setup

Review and apply the SQL files in `supabase/migrations` in filename order using the Supabase SQL Editor. The application does not require a service-role or secret key in client-side code.

## Validation

```bash
npm run lint
npm run build
```
