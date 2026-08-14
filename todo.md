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

## Activation Steps (deferred)
- [x] Loops API activation remains intentionally deferred; it requires a future external signup and secret and is not needed for the current site update.

## Phase 13 — Custom Pricing Database & Admin Panel
- [x] Create database schema for materials table (trade, name, category, unit, unitPrice, supplier, partNumber, notes)
- [x] Create database schema for labor_rates table (trade, role, hourlyRate, overtimeRate, region, notes)
- [x] Run db:push to sync schema
- [x] Build tRPC CRUD procedures for materials and labor rates (admin-only)
- [x] Build admin pricing management UI at /admin/pricing with add/edit/delete for materials and labor
- [x] Connect BidIndustrial pricing API to read from database (falls back to baseline when empty)
- [x] Link from main Admin page to Pricing Admin
- [x] All 12 tests passing

## Phase 14 — SupplyChain App
- [x] Create SupplyChainPage.tsx with multi-agent logistics intelligence positioning
- [x] Add SupplyChain to homepage product grid
- [x] Add SupplyChain to SiteNav Products dropdown
- [x] Add /supplychain route to App.tsx
- [x] All 12 tests passing

## Phase 15 — Rename SupplyChain to Zhipz
- [x] Rename SupplyChainPage.tsx to ZhipzPage.tsx
- [x] Update all "SupplyChain" references to "Zhipz" in the product page
- [x] Update Home.tsx product card name to Zhipz
- [x] Update SiteNav Products dropdown to Zhipz
- [x] Update App.tsx route to /zhipz
- [x] All 12 tests passing

## Phase 16 — Zhipz Interactive Dashboard Section
- [x] Add interactive dashboard section to ZhipzPage.tsx showcasing proprietary algorithm
- [x] Display real-time data visualization (ports, risk scores, route predictions)
- [x] Emphasize proprietary/secret formula messaging
- [x] All 12 tests passing

## Phase 17 — VOW Page Rewrite (Ontological Architecture + EU AI Act)
- [x] Rewrite VowPage.tsx with formal ontological foundations (Continuant/Occurrent, Mereology, Subsumption, Deontic Logic)
- [x] Position VOW as EU AI Act compliance infrastructure (Articles 9, 11, 13, 14, 15 mapped)
- [x] Show how VOW powers other Jcee Labs products (Zhipz, APEX Media, Mirrored)
- [x] Added Scar Memory section with code example
- [x] Update homepage VOW card to reflect new positioning
- [x] All 12 tests passing

## Phase 18 — Mirrored True Identity + VOW Correction
- [x] Remove Mirrored from VOW "powered by" section (replaced with Trucker$Dream)
- [x] Rewrite Mirrored page: higher self, Hume AI emotional intelligence, voice-to-voice, daily check-ins, journals, philosophical programs
- [x] Emphasize: not a therapist, it's YOUR higher self; learns from patterns/memories/conversations
- [x] Include male/female voice-to-voice feature with waveform visualization and emotional intelligence persona by Jonathan Chadbourne
- [x] Added origin story section (first Jcee Labs project, doesn't use VOW)
- [x] Added medical disclaimer
- [x] Update homepage Mirrored card to match new positioning ("Your Higher Self")
- [x] All 12 tests passing

## Phase 19 — Professional Landing Page Redesign
- [x] Rewrite Home.tsx: clean, professional, no gimmicks — hero, brief mission, products grid, stop
- [x] Move Custom Development and Build Together to a dedicated /services page
- [x] Update SiteNav Services link to point to /services page
- [x] Update SiteFooter links accordingly
- [x] Add /services route to App.tsx
- [x] All tests passing

## Phase 20 — Hero Differentiation (Hybrid 1+3: VOW moat + solo-founder story)
- [x] Rewrite hero headline, subheading, and badge to reflect VOW-as-moat + solo-founder narrative
- [x] All tests passing

## Phase 21 — Rename Trucker$Dream to TrueRPM (Revenue Per Mile)
- [x] Rename all "Trucker$Dream" / "Truckers Dream" references to "TrueRPM" across Home.tsx, SiteNav, SiteFooter, App.tsx
- [x] Update TruckersDreamPage.tsx content to reflect TrueRPM branding and "Revenue Per Mile" positioning for owner-operators
- [x] Update VowPage.tsx reference (VOW powers TrueRPM)
- [x] Route renamed to /truerpm
- [x] All tests passing

## Phase 22 — Full Product Lineup Update (9 products)
- [x] Replace PRODUCTS array in Home.tsx with 9 products: VOW, Mirrored, TrueRPM, KlawNiche, FloCraft, Rooh, Revel, SOPForge, Babodie
- [x] Use exact copy from user spec for each product
- [x] Create product pages for new products: KlawNiche, FloCraft, Rooh, Revel, SOPForge, Babodie
- [x] Update App.tsx routes for all new products
- [x] Update SiteNav products dropdown
- [x] Update SiteFooter products column
- [x] Update Home.tsx footer products column
- [x] Remove old products no longer in lineup (NicheFlow, APEX Media, Magellan/Zhipz, BidIndustrial)
- [x] All tests passing

## Phase 23 — Products Section Wireframe Alignment
- [x] Update hero text: "Seven products" → "Nine products"
- [x] Update product statuses to match wireframe: VOW=BETA, Mirrored=BUILDING, TrueRPM=BUILDING, KlawNiche=BETA, FloCraft=BETA, Rooh=BETA, Revel=BUILDING, SOPForge=BETA, Babodie=BETA — WAITLIST
- [x] Add "Powered by VOW" badge to: VOW, FloCraft, Rooh, SOPForge, Babodie
- [x] Add status badge color coding: BETA=purple/indigo, BUILDING=amber/yellow, BETA — WAITLIST=pink
- [x] Update product card layout to 2-column grid matching wireframe
- [x] Add meta/category line to each card (Domain-specific language, App Store launch, etc.)
- [x] All tests passing

## Phase 24 — Separate Products Page & Static Landing
- [x] Create ProductsPage.tsx with full 9-product list (moved from Home.tsx)
- [x] Strip Home.tsx to hero-only static landing page (no products section)
- [x] Update "Explore Products" CTA to route to /products
- [x] Add /products route to App.tsx
- [x] Update SiteNav with "View All Products" link to /products
- [x] All tests passing

## Phase 25 — VOW Gold Color Update (site-wide)
- [x] Home.tsx — VOW link changed to gold (#d4a843)
- [x] SiteNav.tsx — VOW color changed to text-[#d4a843]
- [x] SiteFooter.tsx — VOW hover color changed to text-[#d4a843]
- [x] ProductsPage.tsx — VOW card border/bg, POWERED BY VOW label, badge, hero badge, hover borders, meta dot all changed to gold
- [x] ProductsPage.tsx — Status badge for generic "BETA" changed from purple to green (#34d399) to avoid confusion with VOW gold
- [x] ServicesPage.tsx — All purple references replaced with gold: hero badge, gradient text, card hover borders, icon containers, process step numbers, CTA button
- [x] VowPage.tsx — Already fully gold-themed (done in earlier phase)
- [x] All 12 tests passing

## Phase 26 — Rename Revel to Revel Industries
- [x] Update ProductsPage.tsx product name from "Revel" to "Revel Industries"
- [x] Update RevelPage.tsx page title/references from "Revel" to "Revel Industries"
- [x] Update SiteNav products dropdown
- [x] Update SiteFooter products column
- [x] Update Home.tsx if any reference exists (none found — no change needed)
- [x] All tests passing

## Phase 27 — Rename Revel Industries to Bourne Aire Industries
- [x] Update SiteNav.tsx
- [x] Update SiteFooter.tsx
- [x] Update ProductsPage.tsx
- [x] Update RevelPage.tsx hero title
- [x] All tests passing

## Phase 28 — Rename Rooh to Baus Time Media
- [x] Update SiteNav.tsx
- [x] Update SiteFooter.tsx
- [x] Update ProductsPage.tsx
- [x] Update RoohPage.tsx hero title + VowPage.tsx reference
- [x] All tests passing

## Phase 29 — Update FAQ Page
- [x] Remove outdated "BidIndustrial" question
- [x] Update FAQ questions and answers to reflect current 9-product lineup and VOW positioning
- [x] Ensure all product names match current names (Baus Time Media, Bourne Aire Industries, etc.)
- [x] All tests passing

## Phase 30 — Jcee Labs Brand Color System Overhaul
- [x] Home.tsx: Replace purple/teal with navy/silver palette (bg #080c18, text #e8ecf4, secondary #7a8aaa, accents #c0c8d8/#8ba4d8, buttons updated)
- [x] SiteNav.tsx: Replace purple accents with navy/silver, keep VOW gold
- [x] SiteFooter.tsx: Replace purple/teal with navy/silver
- [x] ProductsPage.tsx: Replace purple/teal with navy/silver, keep VOW gold only for VOW references
- [x] ServicesPage.tsx: Updated bg/cards/text to navy/silver, kept gold for VOW-specific elements
- [x] FAQ.tsx: Replace purple/teal with navy/silver
- [x] TeamPage.tsx: Replace purple/teal with navy/silver
- [x] Verify no purple/teal on parent brand pages (only on Mirrored.tsx product page)
- [x] All tests passing (12/12)

## Phase 31 — Subtle Hover Effects on Navy/Silver Buttons
- [x] Home.tsx: Enhance primary/secondary button hover (glow, slight lift, smooth transitions)
- [x] SiteNav.tsx: Enhance "Get in Touch" button hover
- [x] ServicesPage.tsx: Enhance CTA buttons hover
- [x] All tests passing

## Phase 32 — Mobile Responsive Polish
- [x] Home.tsx: Reduce hero heading size on mobile, tighten spacing, optimize background image
- [x] Home.tsx: Stack buttons vertically on mobile with full-width tap targets
- [x] SiteNav.tsx: Ensure mobile menu is well-spaced with good tap targets
- [x] ProductsPage.tsx: Single-column cards on mobile, tighter spacing
- [x] ServicesPage.tsx: Tighter spacing and readable cards on mobile
- [x] FAQ.tsx: Mobile-friendly accordion spacing
- [x] TeamPage.tsx: Mobile-optimized layout (already responsive)
- [x] SiteFooter.tsx: Mobile-friendly footer columns (2-col grid on mobile)
- [x] All tests passing (12/12)

## Phase 33 — Enhanced Mobile Navigation
- [x] Make SiteNav sticky (fixed top) on all screen sizes
- [x] Add smooth slide-out animation for mobile hamburger menu (right-side panel, 400ms ease-out)
- [x] Animated hamburger icon (transforms to X with rotation)
- [x] Body scroll lock when menu is open
- [x] Backdrop overlay with blur + click-to-close
- [x] Ensure backdrop blur and proper z-index for sticky header
- [x] CTA button at bottom of slide-out panel
- [x] All tests passing (12/12)

## Phase 34 — Desktop Hotdog Layout (Wide Horizontal)
- [x] ServicesPage: widen max-width on desktop, 2-col card grid for service/process cards, 3-col for VOW Difference and Why VOW
- [x] Home: widen hero max-width on desktop
- [x] ProductsPage: widen max-width, 3-col product card grid on desktop
- [x] FAQ: widen max-width on desktop, 2-col accordion layout
- [x] TeamPage: widen max-width on desktop
- [x] All tests passing (12/12)

## Phase 35 — Home Page Layout Cleanup
- [x] Remove separate TAGLINE and STATS sections from Home.tsx
- [x] Move two tagline sentences directly below the 3 buttons (Explore Products, Services, Meet the Team), centered on page

## Phase 36 — Copy Cleanup (No "first", no Python pitch, no ontology)
- [x] Remove "first" claims about VOW (e.g. "world's first") — ProductsPage, BabodiePage
- [x] Remove Python compilation as marketing pitch — Home, FAQ, ServicesPage
- [x] Replace "ontology/ontological" with "provable" language — VowPage, FloCraftPage, SOPForgePage, TeamPage, ServicesPage

## Phase 37 — Restructure Baus Time Media (Product → Internal Marketing Engine)
- [x] Remove Baus Time Media from ProductsPage product list
- [x] Update product count references (9→8) across Home, FAQ, TeamPage, SiteFooter
- [x] Create Blog page showing AI-generated blog posts + social media content (powered by Baus Time Media, human reviewed)
- [x] Add Blog to navigation (SiteNav desktop + mobile, SiteFooter)
- [x] Update FAQ to reflect Baus Time Media is internal marketing, not a product
- [x] Update VowPage to remove Baus Time Media product card

## Phase 38 — Remove NicheFlo & Babodie from Products (keep pages, stop advertising)
- [x] Remove NicheFlo from ProductsPage product list
- [x] Remove Babodie from ProductsPage product list
- [x] Remove NicheFlo and Babodie from SiteNav dropdown
- [x] Remove NicheFlo and Babodie from SiteFooter product links
- [x] Update product count to "6+" across Home, FAQ, TeamPage, SiteFooter, ProductsPage
- [x] Remove NicheFlo and Babodie from VowPage product grid (already removed previously)
- [x] Update FAQ product list answer

## Phase 39 — Restructure Products Lineup
- [x] Update Mirrored status to "App Store August 1st"
- [x] Re-add NicheFlo to ProductsPage
- [x] Remove Bourne Aire Industries from ProductsPage
- [x] Update SOPForge description to pilot program (3 companies testing)
- [x] Update product count to 5 across all pages
- [x] Update SiteNav dropdown with new product list
- [x] Update SiteFooter product links
- [x] Update FAQ product list and count
- [x] Update TeamPage references

## Phase 40 — Add Musaia to Products
- [x] Add Musaia to ProductsPage with full description and Music icon
- [x] Update product count to 6 across Home, FAQ, TeamPage, SiteFooter, ProductsPage
- [x] Add Musaia to SiteNav dropdown
- [x] Add Musaia to SiteFooter product links
- [x] Update FAQ product list and count
- [x] Update TeamPage references

## Phase 41 — Reposition VOW as Runtime (Execution Engine for AI-Native Software)
- [x] Update ProductsPage VOW card: "Domain-specific language" → "Intelligent execution engine"
- [x] Update ProductsPage VOW description with new positioning
- [x] Update Home.tsx: VOW language references → VOW Runtime references
- [x] Update FAQ item-2 (What is VOW?): language → runtime positioning
- [x] Update FAQ item-1 and item-4: language → runtime
- [x] Update TeamPage: VOW language references → VOW Runtime
- [x] Update SiteFooter: VOW language → VOW Runtime
- [x] Update ServicesPage: VOW language → VOW Runtime (headers and tag)
- [x] All 12 tests passing

## Phase 42 — Add VOW Language Technical Details
- [x] Update ProductsPage VOW description to include language + runtime details
- [x] Update FAQ item-1 and item-2 to include language technical specs
- [x] Update Home.tsx VOW description to mention language + runtime
- [x] Update TeamPage VOW references to include language aspect
- [x] All 12 tests passing

## Phase 43 — Update Product Status & Dates
- [x] Change Mirrored launch date: August 1st → August 7th
- [x] Update VOW status: BETA → IP Checking + Open Source (pilots dropping after)
- [x] Rename SOPForge to FORGEX across all pages (ProductsPage, SiteNav, SiteFooter, FAQ)
- [x] All 12 tests passing

## Phase 44 — Remove Products & Update Status
- [x] Remove NicheFlo (arbitration app) from ProductsPage, SiteNav, SiteFooter, FAQ
- [x] Remove FloCraft (logistics app) from ProductsPage, SiteNav, SiteFooter, FAQ
- [x] Remove Musaia from ProductsPage, SiteNav, SiteFooter, FAQ (moved to future 2027 builds)
- [x] TrueRPM status confirmed as BUILDING
- [x] Update product count from 6 to 3 (VOW, Mirrored, FORGEX, FORGEX) across all pages
- [x] Update FAQ product list with 2027 future builds note
- [x] All 12 tests passing


## Contact Email Update
- [x] Replace every visible old contact address with `support@jceelabs.com`
- [x] Verify the old address is absent and tests pass
- [x] Publish the verified update

## Phase 45 — Publish Research and Evidence Index v1.0 (Commit affd35cd)
- [x] Pull and verify commit affd35cdf10cac7c38f5bed600b891b9e3ee4ed5 from GitHub repo
- [x] Apply changes to published jcee-labs project while preserving domain configuration
- [x] Run test suite to verify 12/12 passing tests
- [x] Save checkpoint and publish site
- [x] Verify /research-evidence route, About menu, homepage link, Markdown download, and Charter route

# Current Request — GitHub Logo Update

- [x] Pull and apply GitHub commit 7381261364f2c342cca6df114781162df4e1b1ca from jonchadbourne21-rgb/jcee-labs-website
- [x] Run the full Vitest suite and confirm all tests pass
- [x] Verify the logo on the homepage, Charter page, Research & Evidence page, shared navigation, footer, and browser favicon
- [x] Save a checkpoint and publish without changing existing domains or deployment configuration

- [x] Add the official JCEE Labs favicon declaration to the Vite production entry file (`client/index.html`) so the browser receives the logo favicon

# Current Request — Publish GitHub Commit 068000f9

- [x] Inspect and verify GitHub commit 068000f9c704ab1f0ade4c6108eb928753e97e43
- [x] Apply the exact commit without changing current domains or deployment configuration
- [x] Run the full test suite and production build
- [x] Verify the live JCEE Labs deployment and preserved domains
- [x] Save a final checkpoint and report the publication result

# Current Request — Electric Cobalt Brand Update

- [x] Inspect and verify GitHub commit 42c293a6048ef00dacbe924613ec86b2bf1f2c63
- [x] Apply the exact commit without changing unrelated content, domains, or deployment configuration
- [x] Run the complete test suite and production build
- [x] Verify Electric Cobalt replaces the shared neon-lime signal treatment without turning all surfaces blue
- [x] Verify EVIDENCE OVER CLAIMS is fully visible at desktop, laptop, tablet, and mobile widths
- [x] Verify small cobalt text readability, navigation, routes, cube logo, and favicon
- [x] Publish a final checkpoint only after all validations pass

- [x] Correct the discovered 390px mobile horizontal overflow without changing copy or the supplied cobalt/footer design

- [x] Raise remaining small cobalt text on dark surfaces to the supplied readable cobalt value without changing the design or copy

# Current Request — Site-Wide Visual Hierarchy Update

- [x] Inspect and verify GitHub commit 906df6a04d07ac9633a8d75ee539b1133f2c6862
- [x] Apply the exact commit without rewriting content or changing domains/deployment configuration
- [x] Run the complete existing test suite and production build
- [x] Verify alternating black/white numbered chapters, Electric Cobalt signal, typography minimums, and cobalt footer
- [x] Verify readable text, contrast, navigation, routes, no horizontal overflow, and no clipping at desktop, laptop, tablet, and mobile widths
- [x] Publish a final checkpoint only after all validations pass

- [x] Correct the measured small footer text contrast on Electric Cobalt while preserving the cobalt surface, copy, and lockup design

# Current Request — VOW Terminal Visual Correction

- [x] Inspect and verify GitHub commit 40c0050099061bbe773e4a8f076c5c5ff4e82233
- [x] Apply the exact focused correction without changing unrelated content, chapter order, colors, navigation, logos, footer, domains, or deployment configuration
- [x] Run the complete existing test suite and production build
- [x] Verify the VOW terminal has a transparent/light background, dark mono command text, thin dark bottom rule, cobalt prompt/cursor, and no overflow or clipping
- [x] Publish a final checkpoint only after all validations pass

# Current Request — Remove JRP-001

- [x] Locate all JRP-001 routes, files, navigation references, and tests
- [x] Remove JRP-001 from the public site without changing JRP-000 or unrelated content
- [x] Run tests and production build and verify JRP-001 is absent while JRP-000 remains available
- [x] Save a checkpoint for the removal

- [x] Remove JRP-001 from the public site without changing JRP-000 or unrelated content
- [x] Run tests and production build and verify JRP-001 is absent while JRP-000 remains available

- [x] Remove the stale Jrp001 import left after synchronizing the remote research publication update

- [x] Restore the missing JRP-000 lazy import so the remaining publication route continues to render

- [x] Restore the missing JRP-000 lazy import so the remaining publication route continues to render

# Current Request — Scrollable Electric Cobalt Statement Bar

- [x] Make the mobile statement bar horizontally scrollable by touch without changing its copy or visual treatment
- [x] Run tests and production build
- [x] Verify mobile scroll behavior and desktop presentation
- [x] Save the update checkpoint

# Current Request — Mobile Wide-Surface Audit

- [x] Inventory remaining wide tables, data strips, grids, and overflow-prone surfaces across live routes
- [x] Apply the existing touch-scroll pattern only to affected mobile surfaces
- [x] Run tests and production build
- [x] Verify affected routes at mobile and desktop widths
- [x] Save the verified update checkpoint

- [x] Add touch-scrolling to the shared publication markdown table wrapper, which contains 720px-wide tables on mobile

- [x] Apply touch-scrolling to the shared publication markdown table wrapper, which contains 720px-wide tables on mobile
- [x] Verify JRP-000 publication layout at mobile and desktop widths without visible page clipping

# Current Request — Electric Cobalt Scrollbar Styling

- [x] Inspect existing horizontal-scroll selectors and scrollbar behavior
- [x] Apply Electric Cobalt scrollbar styling to the statement bar and publication-table surfaces
- [x] Run tests and production build
- [x] Verify scrollbar styling, overflow, and readability at mobile and desktop widths
- [x] Save the branded scrollbar update checkpoint

- [x] Verify rendered publication table scrollbar uses Electric Cobalt, thin sizing, horizontal overflow, and pan-x touch behavior

# Current Request — Mobile Wide-Table Scroll Cue

- [x] Inspect the publication table wrapper and choose a non-blocking mobile cue
- [x] Add a subtle edge shadow or gradient that indicates remaining horizontal content
- [x] Run tests and production build
- [x] Verify the cue at mobile and desktop widths without interfering with touch scrolling
- [x] Save the verified update checkpoint

- [x] Verify the desktop publication table has no unnecessary cue when it is not horizontally overflowing and retains pan-x touch behavior

- [x] Confirmed all five rendered publication table wrappers use the shared overflow surface and each table retains a 720px minimum width at desktop

# Current Request — Mobile Table Swipe Label

- [x] Inspect the publication table wrapper and choose a non-intrusive label placement
- [x] Add a mobile-only “SWIPE TO EXPLORE” label above wide publication tables
- [x] Run tests and production build
- [x] Verify label visibility, spacing, scrolling, and desktop preservation
- [x] Save the verified update checkpoint

- [x] Verify all five publication table wrappers remain intact and the SWIPE TO EXPLORE label is hidden on desktop

# Current Request — Obsidian Black + Neon Violet Color Scheme

- [x] Audit current signal color variable and all surfaces using Electric Cobalt
- [x] Replace signal with neon violet and ensure obsidian black backgrounds site-wide
- [x] Run tests and production build
- [x] Verify contrast, readability, scrollbar styling, and responsive behavior
- [x] Save the verified obsidian/neon-violet color scheme checkpoint

# Current Request — Dark-Mode Social Preview Image

- [x] Generate a 1200x630 dark-mode social preview image using obsidian black and neon violet
- [x] Upload the image and wire it into the site Open Graph and Twitter Card meta tags
- [x] Run tests and production build
- [x] Save the verified social preview checkpoint

# Current Request — Electric Green Color Swap

- [x] Replace all neon violet values with electric green across index.css, index.html, and publications.css
- [x] Regenerate the social preview image with the electric green palette
- [x] Run tests and production build
- [x] Save the verified electric green checkpoint
