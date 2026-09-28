# Trades Growth Stack — trades-hub

One honest pipeline for tradespeople: **Win the job → Bill it → Get paid → Get reviewed → Get discovered.**

Four independent AI micro-products that genuinely belong together — each earns its keep alone, and together they compound:

| Step | Product | What it does | Price idea |
|------|---------|--------------|------------|
| 1. Quote | [quotely-ai](https://github.com/alexwboles/quotely-ai) | Describe the job, get a professional quote in seconds | $24/mo |
| 2–3. Invoice + get paid | [invoicepilot-ai](https://github.com/alexwboles/invoicepilot-ai) | Invoicing plus polite late-payment nudges | $19/mo |
| 4. Reviews | [reviewpilot-ai](https://github.com/alexwboles/reviewpilot-ai) | Review ask page + QR + AI reply drafter | $29/mo |
| 5. Discovery | [socialspark-ai](https://github.com/alexwboles/socialspark-ai) | One job photo → a week of social posts | $19/mo |

**The connections:** a won quote in Quotely becomes an invoice in InvoicePilot; a paid invoice triggers the ReviewPilot ask; a 5-star review plus a job photo feeds SocialSpark; new followers become new Quotely quotes. The flywheel spins.

**Bundle math:** $24 + $19 + $29 + $19 = $91/mo separately → **$59/mo as the Trades Growth Stack** (pricing idea; each tool is sold independently today).

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
