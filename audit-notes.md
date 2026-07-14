# Jcee Labs Site Audit Notes

## Current Home.tsx Structure (Sections in order):
1. Background auroras
2. Sticky header (logo, nav: The Lab, Our Suite, AI Orchestration, FAQ, Enter Lab button)
3. Hero section (headline, description, CTA buttons, stats: 1st, 3, 100%)
4. B2B Services section (Custom Development - 3 value props)
5. Business Inquiry Form section
6. The Lab / Mission section (Vision & Philosophy - 3 pillars)
7. Products Showcase (7 tabs: VOW, Mirrored, Trucker$Dream | BidIndustrial, NicheFlow, APEX, Cellular Automata)
   - Each tab has full interactive content (chat demo, calculators, etc.)
8. AI Orchestration Pipeline section
9. Roadmap section (4 phases)
10. Newsletter / CTA section
11. Footer

## Issues Identified:
- Landing page is VERY long and cluttered (1100+ lines)
- Products section has 7 interactive tabs with full demos embedded
- BidIndustrial has a full calculator with 6 presets on the homepage
- Mirrored has a full live chat demo on the homepage
- NicheFlow has a full ROI calculator on the homepage
- All this belongs on individual product pages, not the landing page
- Navigation only uses anchor links (#), not proper page routes
- No Team/Leadership page exists
- "Enter Lab" button just goes to newsletter section

## What Each Product Page Already Has:
- /mirrored → Mirrored.tsx (full page with onboarding + chat)
- /vow → VowPage.tsx (full page)
- /truckers-dream → TruckersDreamPage.tsx (full page)
- /bid-industrial → BidIndustrialPage.tsx (full page)
- /nicheflow → NicheFloPage.tsx (full page)
- /apex → ApexPage.tsx (full page)
- /cellular-automata → CellularAutomataPage.tsx (full page)
- /faq → FAQ.tsx (full page)

## Plan for Simplified Landing Page:
1. Keep: Hero, brief product overview (cards linking to pages), B2B services, inquiry form, footer
2. Remove: Interactive product demos, full tab system, AI pipeline simulator, roadmap
3. Add: Clean nav with links to Products, Services, Team, FAQ
4. Add: Team/Leadership page

## Team Info:
- Jonathan Chadbourne - Founder/CEO/Lead Architect, 34, Dallas TX
- George Taylor - Partner/CSO, joined June 2026, sales/marketing/creative expertise
