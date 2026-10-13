# Redesign Audit — trades-hub ("The Job Board")
Date: 2026-10-13 · Worker: batch-hubs

## Competitors researched
1. **ServiceTitan** — field-service platform: dispatch board, job pipeline (schedule → dispatch → complete → invoice), technician mobile workflows, per-trade views.
2. **ServiceTrade / commercial field-service tools** — job documentation focus: post-job summaries with photos, compliance checklists, customer-facing reports.
3. **Home Depot Pro Desk / trade marketplaces** — rugged, high-contrast, trade-first language; bulk pricing and job-lot thinking.

## Visual gaps (current state)
- Generic light theme, blue accents — could be any SaaS; nothing says "job site".
- Pipeline is a row of small buttons with arrows — ServiceTitan's dispatch board has real visual weight: job cards, statuses, progress.
- Product cards are plain; "Step N of 6" is a tiny label, not a job-ticket identity.
- No trade vernacular in the visual language — everything is polite SaaS copy in polite SaaS boxes.

## Functional gaps (vs competitors)
- **Pipeline detail is thin.** Clicking a stage shows text; a job board would show the handoff (what comes in, what goes out) and the tool that owns it.
- Checklist exists (great) but is visually plain; print stylesheet is untested visually.
- Estimator exists but is a loose pair of inputs.
- Recommender exists but the result is plain text + a button.

## Flow gaps
- Quote → materials → permits → safety → fleet → site visit reads as a list; the flywheel ("site visit feeds the next quote") is one line of text.
- No sense of "where am I in the job" — a progress-rail metaphor would carry the pipeline.

## Plan (this redesign)
1. **Identity: "The Job Board"** — job-site whiteboard. Dark asphalt (#1b1d20) shell, paper job tickets, one safety-orange accent (#e8590c). Condensed uppercase headlines, stencil-like micro-labels, hazard-stripe accents (thin, tasteful). Sharp corners.
2. **Job progress rail:** the 6 stages as a horizontal rail with numbered job tickets; active stage highlighted; handoff arrows; flywheel return noted.
3. **Stage detail as a work order:** work-order panel — stage number, title, blurb, "crew" (the tool), "hands off to" next stage, View on GitHub.
4. **Job checklist** as a punch-list board with progress count ("4 of 18 done"), print-friendly.
5. **Estimator** as a bid console: jobs/mo + hourly rate → hours back + dollar value vs $79/mo stack.
6. **Recommender** as "which tools do I need?" intake form with a result card that loads picks into the builder.

## Preserved (must not regress)
- index.html IDs: stage-detail, checklist-section, checklist, reset-checklist, print-checklist, builder, pick-list, quote, finder, finder-form, headache-opts, trade-sel, finder-result, estimator, est-jobs, est-rate, est-result (+ app, pipeline, products, bundle-math, year from app.js).
- Clickable 6-stage pipeline + detail; 6 product cards (step, name, tagline, features, price, GitHub); bundle math ($107 → $79, save $28); persisted job checklist + reset + print; stack builder + quote + copy-quote summary; headache/trade/size recommender → load into builder; savings estimator (estimateSavings).
