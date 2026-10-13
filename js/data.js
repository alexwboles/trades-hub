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

  /* --- Job checklist --------------------------------------------------------
   * Actionable steps per pipeline stage — the "run every job right" list.
   */
  var CHECKLIST = [
    { stage: 1, items: ["Describe the job in plain English and generate the quote", "Review line items, tax and deposit math", "Send the branded quote and set a follow-up reminder"] },
    { stage: 2, items: ["Turn the won quote into a materials takeoff", "Check waste factors and quantities against your measurements", "Print the supply-run checklist and stock the job"] },
    { stage: 3, items: ["Run the permit checker for the project type", "File applications early — track Not started → Applied → Approved", "Confirm fee totals and set expiry reminders"] },
    { stage: 4, items: ["Run the daily safety checklist and PPE walk-through", "Deliver this week's 5-minute toolbox talk", "Log any incidents the same day"] },
    { stage: 5, items: ["Confirm the assigned rig's maintenance is current", "Log fuel and check per-fill-up MPG", "Clear any overdue service flags before rolling out"] },
    { stage: 6, items: ["Capture photos, observations and client notes on site", "Generate the quote draft / punch list / follow-ups", "File the visit report and schedule the next follow-up"] }
  ];

  function jobChecklist() {
    return STAGES.map(function (st) {
      var entry = { stage: st.n, title: st.title, product: productBySlug(st.product), items: [] };
      for (var i = 0; i < CHECKLIST.length; i++) {
        if (CHECKLIST[i].stage === st.n) { entry.items = CHECKLIST[i].items; break; }
      }
      return entry;
    });
  }

  /* --- Build-your-stack quote ------------------------------------------------
   * Pick any subset; the quote tells you whether the Field-Ops Stack ($79/mo)
   * beats buying your picks separately. Honest both ways.
   */
  function quotePlan(slugs) {
    var picks = [];
    var seen = {};
    (slugs || []).forEach(function (slug) {
      var p = productBySlug(slug);
      if (p && !seen[slug]) { seen[slug] = true; picks.push(p); }
    });
    var separate = picks.reduce(function (s, p) { return s + p.price; }, 0);
    var stackCheaper = separate > BUNDLE_PRICE;
    return {
      picks: picks.map(function (p) { return p.slug; }),
      count: picks.length,
      separate: separate,
      effective: stackCheaper ? BUNDLE_PRICE : separate,
      bundleApplies: stackCheaper,
      savings: stackCheaper ? separate - BUNDLE_PRICE : 0,
      verdict: picks.length === 0
        ? "Pick at least one tool to see your quote."
        : stackCheaper
          ? "Take the Field-Ops Stack — all six for $79/mo beats your picks by $" + (separate - BUNDLE_PRICE) + "/mo."
          : "Buy your picks separately for $" + separate + "/mo — the stack only wins when your picks total more than $79."
    };
  }

  /* --- Time savings estimator ----------------------------------------------
   * Conservative admin-hours each tool saves per job. Used to estimate the
   * stack's monthly payoff from jobs/month and the owner's hourly rate.
   */
  var HOURS_SAVED_PER_JOB = {
    "quotely-ai": 1.5,
    "materiallist-ai": 1.0,
    "permitpilot-ai": 2.0,
    "safetycheck-ai": 0.75,
    "fleetlog-ai": 0.5,
    "sitevisit-ai": 1.25
  };
  function hoursSavedPerJob() {
    return PRODUCTS.reduce(function (s, p) { return s + (HOURS_SAVED_PER_JOB[p.slug] || 0); }, 0);
  }
  function estimateSavings(jobsPerMonth, hourlyRate) {
    jobsPerMonth = Math.max(0, +jobsPerMonth || 0);
    hourlyRate = Math.max(0, +hourlyRate || 0);
    var perJob = hoursSavedPerJob();
    var hours = jobsPerMonth * perJob;
    return {
      jobsPerMonth: jobsPerMonth,
      hourlyRate: hourlyRate,
      hoursPerJob: perJob,
      hoursSaved: Math.round(hours * 10) / 10,
      value: Math.round(hours * hourlyRate * 100) / 100
    };
  }

  /* --- Stack recommender ("which tools do I need?") -------------------------
   * answers: { headaches: [ids], size: "solo"|"crew"|"big", trade: id }
   * Returns the recommended product slugs, deduped, in pipeline order.
   */
  var HEADACHE_MAP = {
    "quotes": "quotely-ai",
    "materials": "materiallist-ai",
    "permits": "permitpilot-ai",
    "safety": "safetycheck-ai",
    "fleet": "fleetlog-ai",
    "followups": "sitevisit-ai"
  };
  var TRADE_MAP = {
    "roofing": ["safetycheck-ai", "quotely-ai"],
    "landscaping": ["fleetlog-ai", "quotely-ai"],
    "electrical": ["permitpilot-ai", "quotely-ai"],
    "plumbing": ["permitpilot-ai", "quotely-ai"],
    "hvac": ["permitpilot-ai", "materiallist-ai"],
    "general": ["quotely-ai", "materiallist-ai", "permitpilot-ai"],
    "cleaning": ["quotely-ai", "sitevisit-ai"]
  };
  var TRADE_LABELS = {
    "roofing": "Roofing", "landscaping": "Landscaping", "electrical": "Electrical",
    "plumbing": "Plumbing", "hvac": "HVAC", "general": "General contracting", "cleaning": "Cleaning"
  };
  var HEADACHE_LABELS = {
    "quotes": "Winning quotes and quote paperwork",
    "materials": "Supply runs and materials takeoffs",
    "permits": "Permit paperwork",
    "safety": "Safety compliance and incidents",
    "fleet": "Truck maintenance and fuel",
    "followups": "Lost follow-ups and repeat clients"
  };
  function recommend(answers) {
    answers = answers || {};
    var wanted = {};
    function add(slug) { wanted[slug] = true; }
    (answers.headaches || []).forEach(function (h) { if (HEADACHE_MAP[h]) add(HEADACHE_MAP[h]); });
    if (TRADE_MAP[answers.trade]) TRADE_MAP[answers.trade].forEach(add);
    if (answers.size === "big") { add("safetycheck-ai"); add("fleetlog-ai"); }
    else if (answers.size === "crew") { add("fleetlog-ai"); }
    return PRODUCTS.filter(function (p) { return wanted[p.slug]; }).map(function (p) { return p.slug; });
  }

  return {
    PRODUCTS: PRODUCTS,
    STAGES: STAGES,
    BUNDLE_PRICE: BUNDLE_PRICE,
    productUrl: productUrl,
    separateTotal: separateTotal,
    bundleSavings: bundleSavings,
    productBySlug: productBySlug,
    jobChecklist: jobChecklist,
    quotePlan: quotePlan,
    HEADACHE_LABELS: HEADACHE_LABELS,
    TRADE_LABELS: TRADE_LABELS,
    hoursSavedPerJob: hoursSavedPerJob,
    estimateSavings: estimateSavings,
    recommend: recommend
  };
});
