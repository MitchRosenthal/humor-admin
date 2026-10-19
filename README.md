# Humor Admin

An administration interface for a shared image-caption platform, built with Next.js, TypeScript, Supabase, and Tailwind CSS.

## Features

- Caption-rating statistics: voting coverage, average votes, score distribution, and most-voted captions.
- Image management and read-only views of user profiles and captions.
- Google sign-in with administrator authorization.

## Access and scope

The source is public, but the hosted application is **administrator-only**. Signing in with an arbitrary Google account does not grant access: the shared database must identify the account as a superadmin. This repository implements the admin application; the shared backend and caption-generation platform are separate services.

## Local development

```bash
npm install
cp .env.example .env.local
# Set the Supabase URL and anonymous key for an authorized project.
npm run dev
```

Open http://localhost:3000. Local use requires the expected shared database schema, Google OAuth configuration, and an authorized administrator account. Do not disable authorization checks to create a demo.

## Implementation

- `src/app/dashboard/page.tsx`: caption-rating statistics.
- `src/app/dashboard/images/`: image interface and server actions.
- `src/app/dashboard/users/`: profile listing.
- `src/app/dashboard/captions/`: caption listing.
- `src/middleware.ts`: authentication and administrator checks.

A fresh clone does not provision the shared backend or grant administrator access.
