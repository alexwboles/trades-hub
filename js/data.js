// trades-hub data — UMD: works in browser and Node (tests exercise this file).
// 6 products forming the field-ops pipeline: quote -> materials -> permits ->
// safety -> fleet -> site visit documentation. One stage per product, in order.
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
      slug: "materiallist-ai",
      name: "MaterialList AI",
      tagline: "Job description in, store-ready materials list out.",
      price: 19,
      features: [
        "Plain-English job description turns into a takeoff: item, quantity, unit, line total",
        "Waste factors and a buy-as-you-go checklist, quantities auto-scaled from your sizes",
        "Save named lists and print a checkbox checklist for the supply run"
      ]
    },
    {
      slug: "permitpilot-ai",
      name: "PermitPilot AI",
      tagline: "Which permits does your project need? Know before you start.",
      price: 19,
      features: [
        "Permit checker marks every permit Likely needed, Possibly needed, or Probably not — in plain language",
        "Application pipeline: Not started → Applied → Approved, with document checklists per permit",
        "Fee estimates with live project totals plus expiry reminders so permits never lapse"
      ]
    },
    {
      slug: "safetycheck-ai",
      name: "SafetyCheck AI",
      tagline: "Job-site safety checklists and incident logging that crews actually use.",
      price: 15,
      features: [
        "Trade-specific daily and weekly checklists plus a PPE checklist to tick off while gearing up",
        "Rotating 52-week toolbox-talk generator — a fresh 5-minute topic every week",
        "Incident log with severity stats and one-click CSV export"
      ]
    },
    {
      slug: "fleetlog-ai",
      name: "FleetLog AI",
      tagline: "The fleet log: vehicles, maintenance and mileage in one notebook.",
      price: 15,
      features: [
        "Vehicle and equipment log with fuel tracking and automatic per-fill-up MPG",
        "Maintenance schedules with overdue and due-soon alerts so oil changes never slip",
        "True cost-per-mile calculator plus chronological service history per vehicle"
      ]
    },
    {
      slug: "sitevisit-ai",
      name: "SiteVisit AI",
      tagline: "Site visit reports: photos, notes and follow-ups.",
      price: 15,
      features: [
        "Structured visit form — client, address, trade, observations, photo notes",
        "One click turns the visit into a quote draft, a punch list, and dated follow-ups",
        "Every visit saved with its work product; printable summary for the office"
      ]
    }
  ];

  // The 6-stage field-ops pipeline — one stage per product, in job order.
  var STAGES = [
    { n: 1, title: "Quote it", product: "quotely-ai", blurb: "A fast, professional quote wins the work before the competition calls back." },
    { n: 2, title: "List the materials", product: "materiallist-ai", blurb: "The quoted job becomes a store-ready materials list — quantities and costs, nothing forgotten." },
    { n: 3, title: "Pull the permits", product: "permitpilot-ai", blurb: "Know exactly which permits the job needs and track every application, inspection and approval." },
    { n: 4, title: "Keep the crew safe", product: "safetycheck-ai", blurb: "Daily checklists, toolbox talks and incident logging keep the crew — and the business — protected." },
    { n: 5, title: "Keep the trucks rolling", product: "fleetlog-ai", blurb: "Vehicles, maintenance and mileage in one fleet log, so no rig misses its service." },
    { n: 6, title: "Document the visit", product: "sitevisit-ai", blurb: "Photos, notes and follow-ups from every site visit — saved, printed, and ready to quote from." }
  ];

  var BUNDLE_PRICE = 79;

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
