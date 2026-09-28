# Trades Field-Ops Stack — trades-hub

One honest pipeline for tradespeople: **run the job right** — quote it, stock it, permit it, keep the crew safe, keep the trucks rolling, document the visit.

Six independent AI micro-products that genuinely belong together — each earns its keep alone, and together they cover the whole job:

| Step | Product | What it does | Price idea |
|------|---------|--------------|------------|
| 1. Quote it | [quotely-ai](https://github.com/alexwboles/quotely-ai) | Describe the job, get a professional quote in seconds | $24/mo |
| 2. List the materials | [materiallist-ai](https://github.com/alexwboles/materiallist-ai) | Materials list builder: job materials with quantities and costs | $19/mo |
| 3. Pull the permits | [permitpilot-ai](https://github.com/alexwboles/permitpilot-ai) | Permit tracker: applications, inspections and approvals | $19/mo |
| 4. Keep the crew safe | [safetycheck-ai](https://github.com/alexwboles/safetycheck-ai) | Job-site safety checklists and incident logging | $15/mo |
| 5. Keep the trucks rolling | [fleetlog-ai](https://github.com/alexwboles/fleetlog-ai) | Fleet log: vehicles, maintenance and mileage | $15/mo |
| 6. Document the visit | [sitevisit-ai](https://github.com/alexwboles/sitevisit-ai) | Site visit reports: photos, notes and follow-ups | $15/mo |

**The connections:** a won quote in Quotely becomes a takeoff in MaterialList; the specced job gets its permits checked in PermitPilot before work starts; approved permits mean the crew rolls out under SafetyCheck checklists and toolbox talks; safe crews ride safe trucks under FleetLog's maintenance watch; you document the job on site with SiteVisit; and SiteVisit's quote draft feeds the next Quotely quote. The flywheel spins.

**Bundle math:** $24 + $19 + $19 + $15 + $15 + $15 = $107/mo separately → **$79/mo as the Trades Field-Ops Stack** (pricing idea; each tool is sold independently today).

## Run it

Pure static site — no build, no dependencies, no keys:

```sh
# just open it
open index.html
# or serve it
npx serve .
# or
python3 -m http.server 8000
```

## Tests

```sh
bash test/smoke.sh
bash test/e2e.sh
```

Both must be green. Standing rule: fix any bug found, no approvals needed.
