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

## Phase 8 — Mirrored App Full Product Page
- [x] Redesign Mirrored.tsx with glassmorphism and Jcee Labs branding
- [x] Build 3-step onboarding modal with progress indicator
- [x] Integrate live chat demo with real LLM reflection (tRPC)
- [x] Add 4-feature showcase grid
- [x] Add "How It Works" section with 4-step flow
- [x] Add CTA section and responsive footer
- [x] All 12 tests passing, zero TypeScript errors

## Pending / Future
- [x] Admin dashboard page to view and export captured leads
- [x] Connect BidIndustrial presets to real industry pricing data API (infrastructure built, baseline data active, live API ready when PRICING_API_KEY configured)
- [x] BidIndustrial full product page with detailed feature breakdown
- [x] Email marketing integration (Loops infrastructure built, auto-syncs when LOOPS_API_KEY configured)
- [x] Privacy Policy and Terms of Service pages

## Phase 3 — Performance & Copy Fixes
- [x] Fix copy: add "LLC" after all "HOWM HOLDINGS" instances in Home.tsx (header tagline + roadmap section)
- [x] Performance: lazy-load FAQ and NotFound routes via React.lazy + Suspense in App.tsx
- [x] Performance: reduce aurora blur radii (100-120px → 70-90px) and add will-change/translateZ(0) for GPU compositing
- [x] Performance: add fetchPriority="high" + decoding="async" + explicit width/height to hero image
- [x] Performance: remove animate-pulse from static Cpu icon in hero
- [x] Performance: make Google Fonts non-render-blocking (media=print swap trick)
- [x] Performance: add prefers-reduced-motion CSS rule to index.css
- [x] Performance: add glass-panel CSS class with mobile backdrop-filter:none fallback
- [x] Performance: apply content-visibility:auto to below-fold sections (lab, products, pipeline, roadmap)
- [x] Performance: remove unused framer-motion package from bundle (~120KB saved)
- [x] Performance: reduce font weight variants loaded from Google Fonts (fewer network requests)
- [x] Performance: optimize FAQ page aurora divs (500px/120px blur → 350px/80px)

## Phase 4 — UI Fixes & Logo
- [x] Fix scroll position: add window.scrollTo(0, 0) on route change in App.tsx
- [x] Replace logo: upload new 3D geometric logo and replace all JL badge instances in header, footer, and FAQ page

## Phase 5 — B2B Services & Inquiry Form
- [x] Add B2B Services section to Home.tsx with headline and 3 value props (Speed, Quality, Efficiency)
- [x] Create business_inquiries table in Drizzle schema with all required fields
- [x] Run pnpm db:push to migrate database
- [x] Add insertBusinessInquiry and getAllBusinessInquiries helpers to server/db.ts
- [x] Create business.submitInquiry tRPC procedure with validation and owner notification
- [x] Create business.list admin-only tRPC procedure
- [x] Build BusinessInquiryForm component with form fields and validation
- [x] Integrate BusinessInquiryForm into Home.tsx after Services section
- [x] Style form with glassmorphism (glass-panel class) to match site design
- [x] Add success state UI to form with emoji and thank you message

## Phase 6 — Small Business Mission & NicheFlow Launch
- [x] Update Vision & Philosophy section to emphasize small business empowerment and determination
- [x] Add NicheFlow as third product showcase with ROI metrics and industry templates
- [x] Create NicheFlow tab in products section with description and features
- [x] Build NicheFlow ROI Calculator widget showing time saved, cost reduction, annual ROI
- [x] Add "Why Small Businesses Choose NicheFlow" value prop section
- [x] Update product suite description to include SOP automation
- [x] Add NicheFlow button to footer products list
- [x] Rename uSOP to NicheFlow throughout all references

## Phase 7 — VOW Rebranding & Trucker$Dream Launch
- [x] Rename QorePage.tsx → VowPage.tsx and update all references
- [x] Update VOW positioning: PaaS/new coding language, open-source soon
- [x] Create Trucker$DreamPage.tsx with owner-operator load optimization positioning
- [x] Update Home.tsx to feature VOW, Mirrored, Trucker$Dream as primary tabs
- [x] Keep other products (NicheFlo, APEX, BidIndustrial, Cellular Automata) as secondary tabs
- [x] Update all route references in App.tsx
- [x] Update footer product links to reflect new lineup
- [x] Run all tests and verify zero errors
- [x] Reorder tabs: VOW, Mirrored, Trucker$Dream first with visual separator
- [x] Add flex-wrap to tabs for responsive wrapping

## Phase 9 — Site Refinement & Team Page
- [x] Audit and simplify landing page (remove clutter, clean sections)
- [x] Improve navigation: proper top nav with links to product pages and team
- [x] Ensure each product has its own page (already have routes, just improve nav)
- [x] Create Team/Leadership page (Jonathan Chadbourne + George Taylor)
- [x] Remove any mock/fake data (only real API connections)
- [x] Make navigation smooth and business-professional
- [x] Polish overall layout and organization
- [x] All pages use shared SiteNav + SiteFooter for consistent navigation
- [x] All 12 tests passing, zero TypeScript errors

## Phase 10 — Admin Dashboard & Legal Pages
- [x] Build Admin Dashboard page at /admin with authentication gate
- [x] Display leads table with email, source, date columns
- [x] Display business inquiries table with name, company, email, message, date
- [x] Add CSV export functionality for leads and inquiries
- [x] Create Privacy Policy page at /privacy
- [x] Create Terms of Service page at /terms
- [x] Add Privacy/Terms links to SiteFooter
- [x] Add /admin, /privacy, /terms routes to App.tsx
- [x] All tests passing

## Phase 11 — APEX Media Positioning Update
- [x] Update ApexPage.tsx with real positioning: multi-agent autonomous content creator, market watcher, adaptive social media/blog engine
- [x] Update APEX product card on Home.tsx to match new positioning
- [x] Rename to "APEX Media" across all references (SiteNav, Home.tsx, ApexPage.tsx)

## Phase 12 — BidIndustrial Product Page, Pricing API, & Loops Integration
- [x] BidIndustrial full product page with 6 industry presets, 8 features, how-it-works, pricing data section
- [x] Pricing API infrastructure (server/pricingApi.ts) with baseline data for 6 trades, ready for live API
- [x] Loops email marketing integration (server/emailMarketing.ts) — auto-syncs leads and inquiries when configured
- [x] BidIndustrial tRPC router (bidIndustrial.getPricing, bidIndustrial.getTrades)
- [x] All 12 tests passing

## Activation Steps (when ready)
- [ ] Sign up at https://loops.so and add LOOPS_API_KEY to environment secrets
- [ ] Connect a pricing data provider and add PRICING_API_KEY + PRICING_API_URL to environment secrets

## Phase 13 — Custom Pricing Database & Admin Panel
- [x] Create database schema for materials table (trade, name, category, unit, unitPrice, supplier, partNumber, notes)
- [x] Create database schema for labor_rates table (trade, role, hourlyRate, overtimeRate, region, notes)
- [x] Run db:push to sync schema
- [x] Build tRPC CRUD procedures for materials and labor rates (admin-only)
- [x] Build admin pricing management UI at /admin/pricing with add/edit/delete for materials and labor
- [x] Connect BidIndustrial pricing API to read from database (falls back to baseline when empty)
- [x] Link from main Admin page to Pricing Admin
- [x] All 12 tests passing
