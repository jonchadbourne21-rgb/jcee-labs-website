# Jcee Labs Website TODO

## Phase 1 — Initial Build
- [x] Initialize web project scaffold
- [x] Design Ethereal Glassmorphism dark theme (Syne + Plus Jakarta Sans + Space Mono)
- [x] Build full Home.tsx landing page with hero, lab vision, products, pipeline, roadmap, newsletter, footer
- [x] Build separate FAQ.tsx page at /faq route
- [x] Generate and upload hero, Mirrored, and BidIndustrial visual assets
- [x] Rename Musaia → BidIndustrial across all pages and assets
- [x] Performance optimization: reduce heavy blur layers, GPU-accelerated gradients
- [x] Push codebase to GitHub repo: jonchadbourne21-rgb/Snyapset

## Phase 2 — Full-Stack Features
- [x] Upgrade project to full-stack (web-db-user) with tRPC + database
- [x] Add `leads` table to Drizzle schema and push migration
- [x] Add `insertLead` and `getAllLeads` query helpers to server/db.ts
- [x] Build `leads.subscribe` tRPC procedure (public, with owner notification)
- [x] Build `leads.list` tRPC procedure (admin-only)
- [x] Build `mirrored.reflect` tRPC procedure (real LLM-powered AI reflection chat)
- [x] Build Interactive Mirrored Chat Simulator on Home.tsx (live chat UI, starter prompts, streaming feel)
- [x] Build BidIndustrial Industry Presets (6 presets: HVAC, Electrical, Plumbing, General Contracting, Mechanical, Commercial Build-Out)
- [x] Connect lead capture form to real tRPC backend with loading state and duplicate handling
- [x] Write and pass all vitest unit tests (12 tests across 2 test files)

## Pending / Future
- [ ] Admin dashboard page to view and export captured leads
- [ ] Connect BidIndustrial presets to real industry pricing data API
- [ ] Mirrored App full product page with onboarding flow
- [ ] BidIndustrial full product page with detailed feature breakdown
- [ ] Email marketing integration (Mailchimp / Loops) for lead nurturing
- [ ] Privacy Policy and Terms of Service pages
