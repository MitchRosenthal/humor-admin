# Humor Admin

Admin dashboard for the Humor Project caption platform. Admins sign in with Google and manage the images, captions and LLM configuration behind the caption generator, and see how captions are being rated. Built for Columbia's Humor Project course (spring 2026).

## Features

- Google sign-in, with access limited to superadmins (checked in middleware and the dashboard layout)
- Stats overview: image, caption and vote counts, upvote/downvote split, and top-scoring captions
- Image management (add, edit, delete)
- Read-only views of captions, caption requests, humor flavors, prompt chains and LLM responses
- CRUD for LLM providers and models, humor mix, caption examples and terms
- Sign-up controls: allowed email domains and whitelisted emails

## Tech

Next.js 15 (App Router, server actions), React, TypeScript, Tailwind CSS, Supabase (Postgres, Auth, row-level security), deployed on Vercel.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL and keys
npm run dev
```
