// trades-hub data — UMD: works in browser and Node (tests exercise this file).
// 4 products forming the trades pipeline: quote -> invoice -> paid -> reviewed -> discovered.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TradesHubData = factory();
})(typeof self !== "undefined" ? self : this, function () {
  var PRODUCTS = [
    {
      slug: "quotely-ai",
      name: "Quotely AI",
      tagline: "Describe the job, get a professional quote in seconds.",
      price: 24,
      features: [
        "Plain-English job description turns into itemized line items with realistic 2026 pricing",
        "Professional branded quotes with Q-numbering, tax and deposit math, print-to-PDF",
        "Follow-up reminders and win/loss tracking so no quote goes cold"
      ]
    },
    {
      slug: "invoicepilot-ai",
      name: "InvoicePilot AI",
      tagline: "Invoice the job, then get paid without the awkward chase.",
      price: 19,
      features: [
        "One-click invoices from won quotes with tax, discounts and aging dashboard",
        "Three escalating reminder drafts — gentle, firm, final — that stay polite for you",
        "Overdue alerts so late payers never slip through the cracks"
      ]
    },
    {
      slug: "reviewpilot-ai",
      name: "ReviewPilot AI",
      tagline: "Turn happy customers into 5-star reviews on autopilot.",
      price: 29,
      features: [
        "Shareable review-ask page with QR code for the job site or the invoice",
        "AI reply drafter in three tones, with service-recovery mode for bad reviews",
        "14-day anti-nag protection so you never pester the same customer twice"
      ]
    },
    {
      slug: "socialspark-ai",
      name: "SocialSpark AI",
      tagline: "One finished job becomes a week of social posts.",
      price: 19,
      features: [
        "Describe one job and get seven themed posts — reveal, behind-the-scenes, pro tip, more",
        "Three tones per post with trade-specific hashtags and best-time-to-post guidance",
        "Copy-to-clipboard and mark-as-posted tracking for the whole week"
      ]
    }
  ];

  // The 5-stage pipeline. invoicepilot-ai honestly owns two stages
  // (bill it + get paid via dunning), so it appears twice.
  var STAGES = [
    { n: 1, title: "Win the job", product: "quotely-ai", blurb: "A fast, professional quote wins the work before the competition calls back." },
    { n: 2, title: "Bill it", product: "invoicepilot-ai", blurb: "The won quote becomes a clean invoice in one click." },
    { n: 3, title: "Get paid", product: "invoicepilot-ai", blurb: "Polite, escalating reminders chase late payers so you don't have to." },
    { n: 4, title: "Get reviewed", product: "reviewpilot-ai", blurb: "Right after the paid invoice, ask for the review while the job is fresh." },
    { n: 5, title: "Get discovered", product: "socialspark-ai", blurb: "Show the finished work all week — the next customer finds you." }
  ];

  var BUNDLE_PRICE = 59;

  function productUrl(slug) { return "https://github.com/alexwboles/" + slug; }
  function separateTotal() { return PRODUCTS.reduce(function (s, p) { return s + p.price; }, 0); }
  function bundleSavings() { return separateTotal() - BUNDLE_PRICE; }
  function productBySlug(slug) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].slug === slug) return PRODUCTS[i];
    return null;
  }

  return {
    PRODUCTS: PRODUCTS,
    STAGES: STAGES,
    BUNDLE_PRICE: BUNDLE_PRICE,
    productUrl: productUrl,
    separateTotal: separateTotal,
    bundleSavings: bundleSavings,
    productBySlug: productBySlug
  };
});
