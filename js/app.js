// trades-hub app: renders pipeline, product cards, connections, bundle math.
(function () {
  "use strict";
  var D = window.TradesHubData;
  if (!D) { document.getElementById("app").textContent = "Data failed to load."; return; }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // --- pipeline (click a stage for details) ---
  var pipe = document.getElementById("pipeline");
  var detail = document.getElementById("stage-detail");
  var activeStage = 0;

  function renderStageDetail(n) {
    activeStage = n;
    var st = D.STAGES[n - 1];
    var p = D.productBySlug(st.product);
    var next = D.STAGES[n % D.STAGES.length]; // flywheel: stage 6 feeds stage 1
    detail.innerHTML =
      '<p class="workorder-kicker">Work order — stage ' + st.n + " of 6</p>" +
      "<h3>" + esc(st.title) + "</h3>" +
      "<p>" + esc(st.blurb) + "</p>" +
      '<div class="workorder-meta">' +
        '<div class="wo-item"><b>The crew</b><span>' + esc(p.name) + " — " + esc(p.tagline) + "</span></div>" +
        '<div class="wo-item"><b>Hands off to</b><span>' + esc(next.title) + " (stage " + next.n + ")</span></div>" +
        '<div class="wo-item"><b>Repo</b><a href="' + D.productUrl(st.product) + '" target="_blank" rel="noopener">View ' + esc(p.name) + " on GitHub</a></div>" +
      "</div>";
    var stages = pipe.querySelectorAll(".stage");
    Array.prototype.forEach.call(stages, function (s, i) {
      if (s.classList) s.classList.toggle("active", i === n - 1);
    });
  }

  D.STAGES.forEach(function (st, i) {
    var p = D.productBySlug(st.product);
    var card = el("button", "stage", "");
    card.type = "button";
    card.setAttribute("aria-label", "Stage " + st.n + ": " + st.title + " — show details");
    card.innerHTML =
      '<span class="stage-num">Stage ' + st.n + "</span>" +
      '<span class="stage-title">' + esc(st.title) + "</span>" +
      '<span class="stage-tool">' + esc(p.name) + "</span>";
    card.addEventListener("click", function () { renderStageDetail(st.n); });
    pipe.appendChild(card);
  });
  renderStageDetail(1);

  // --- product cards ---
  var grid = document.getElementById("products");
  D.PRODUCTS.forEach(function (p, i) {
    var card = el("article", "product-card", "");
    var feats = p.features.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    card.innerHTML =
      '<p class="product-step">Step ' + (i + 1) + " of 6</p>" +
      "<h3>" + esc(p.name) + "</h3>" +
      '<p class="product-tagline">' + esc(p.tagline) + "</p>" +
      '<ul class="product-features">' + feats + "</ul>" +
      '<div class="product-foot">' +
        '<span class="product-price">$' + p.price + "/mo</span>" +
        '<a class="product-link" href="' + D.productUrl(p.slug) + '" target="_blank" rel="noopener">View on GitHub &rarr;</a>' +
      "</div>";
    grid.appendChild(card);
  });

  // --- bundle math ---
  var total = D.separateTotal();
  var box = document.getElementById("bundle-math");
  box.innerHTML =
    '<div class="bundle-row"><span>Separately <em style="font-style:normal;display:block;font-size:.8rem;color:var(--muted)">' +
    D.PRODUCTS.map(function (p) { return esc(p.name) + " $" + p.price; }).join(" + ") +
    "</em></span><strong>$" + total + "/mo</strong></div>" +
    '<div class="bundle-row bundle-total"><span>As the Trades Field-Ops Stack</span><strong>$' + D.BUNDLE_PRICE + "/mo</strong></div>" +
    '<div class="bundle-save">You save $' + D.bundleSavings() + "/mo</div>";

  // --- year ---
  document.getElementById("year").textContent = new Date().getFullYear();

  // --- job checklist (persisted in localStorage) ---
  var CL_KEY = "trades-hub-checklist";
  function loadChecked() {
    try {
      var raw = localStorage.getItem(CL_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function saveChecked(map) {
    try { localStorage.setItem(CL_KEY, JSON.stringify(map)); } catch (e) { /* private mode */ }
  }
  var checkedMap = loadChecked();

  function checklistTotals() {
    var done = 0, all = 0;
    D.jobChecklist().forEach(function (entry) {
      entry.items.forEach(function (item, idx) {
        all++;
        if (checkedMap[entry.stage + ":" + idx]) done++;
      });
    });
    return { done: done, all: all };
  }
  function renderChecklistProgress() {
    var prog = document.getElementById("checklist-progress");
    if (!prog) return;
    var t = checklistTotals();
    var pct = t.all ? Math.round((t.done / t.all) * 100) : 0;
    prog.innerHTML = "Punch list: " + t.done + " of " + t.all + " done" +
      '<span class="bar"><i style="width:' + pct + '%"></i></span>';
  }
  function renderChecklist() {
    var wrap = document.getElementById("checklist");
    wrap.innerHTML = "";
    D.jobChecklist().forEach(function (entry) {
      var block = el("div", "check-group", "");
      block.innerHTML = '<h3 class="check-group-title"><span class="stage-num">Stage ' + entry.stage + "</span> " + esc(entry.title) + "</h3>";
      entry.items.forEach(function (item, idx) {
        var key = entry.stage + ":" + idx;
        var label = el("label", "check-item", "");
        var box = document.createElement("input");
        box.type = "checkbox";
        box.checked = !!checkedMap[key];
        var stageTag = document.createElement("span");
        stageTag.className = "check-stage";
        stageTag.textContent = "S" + entry.stage;
        var span = document.createElement("span");
        span.className = "check-label";
        span.textContent = item;
        label.appendChild(box);
        label.appendChild(stageTag);
        label.appendChild(span);
        if (box.checked) label.classList.add("done");
        box.addEventListener("change", function () {
          checkedMap[key] = box.checked;
          saveChecked(checkedMap);
          label.classList.toggle("done", box.checked);
          renderChecklistProgress();
        });
        block.appendChild(label);
      });
      wrap.appendChild(block);
    });
    renderChecklistProgress();
  }
  renderChecklist();

  document.getElementById("reset-checklist").addEventListener("click", function () {
    checkedMap = {};
    saveChecked(checkedMap);
    renderChecklist();
  });
  document.getElementById("print-checklist").addEventListener("click", function () {
    window.print();
  });

  // --- build-your-stack quote ---
  function renderBuilder() {
    var list = document.getElementById("pick-list");
    D.PRODUCTS.forEach(function (p) {
      var label = document.createElement("label");
      label.className = "pick";
      var box = document.createElement("input");
      box.type = "checkbox";
      box.value = p.slug;
      box.checked = true;
      box.addEventListener("change", renderQuote);
      var nm = document.createElement("span");
      nm.className = "pick-name";
      nm.textContent = p.name;
      var pr = document.createElement("span");
      pr.className = "pick-price";
      pr.textContent = "$" + p.price + "/mo";
      label.appendChild(box);
      label.appendChild(nm);
      label.appendChild(pr);
      list.appendChild(label);
    });
    renderQuote();
  }
  function renderQuote() {
    var boxes = document.querySelectorAll("#pick-list input[type=checkbox]:checked");
    var slugs = Array.prototype.map.call(boxes, function (b) { return b.value; });
    var q = D.quotePlan(slugs);
    var box = document.getElementById("quote");
    box.innerHTML = "";
    box.appendChild(el("div", "quote-line", q.count + " picked · separately $" + q.separate + "/mo"));
    if (q.count > 0) {
      box.appendChild(el("div", "quote-line", "Field-Ops Stack (all six): $" + D.BUNDLE_PRICE + "/mo"));
      box.appendChild(el("p", "quote-verdict" + (q.bundleApplies ? " bundle-wins" : ""), q.verdict));
    } else {
      box.appendChild(el("p", "quote-verdict", q.verdict));
    }
    // copy quote summary to clipboard
    var copyBtn = el("button", "copy-quote-btn copy-quote", "Copy quote summary");
    copyBtn.type = "button";
    copyBtn.addEventListener("click", function () { copyQuote(q); });
    box.appendChild(copyBtn);
  }
  function copyQuote(q) {
    var lines = ["Trades Field-Ops Stack quote"];
    q.picks.forEach(function (slug) {
      var p = D.productBySlug(slug);
      lines.push("- " + p.name + " ($" + p.price + "/mo)");
    });
    lines.push("Separately: $" + q.separate + "/mo");
    if (q.bundleApplies) {
      lines.push("Field-Ops Stack: $" + D.BUNDLE_PRICE + "/mo (you save $" + q.savings + "/mo)");
    }
    lines.push(q.verdict);
    var text = lines.join("\n");
    function done(btn) {
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = "Copy quote summary"; }, 1500);
    }
    var btn = document.querySelector(".copy-quote");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(btn); }, function () { done(btn); });
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) { /* clipboard unavailable */ }
      document.body.removeChild(ta);
      done(btn);
    }
  }
  renderBuilder();

  // --- stack recommender: which tools do I need? ---
  var finderForm = document.getElementById("finder-form");
  if (finderForm) {
    var optsWrap = document.getElementById("headache-opts");
    Object.keys(D.HEADACHE_LABELS).forEach(function (key) {
      var label = document.createElement("label");
      label.className = "opt";
      var box = document.createElement("input");
      box.type = "checkbox";
      box.value = key;
      label.appendChild(box);
      label.appendChild(document.createTextNode(" " + D.HEADACHE_LABELS[key]));
      optsWrap.appendChild(label);
    });
    var tradeSel = document.getElementById("trade-sel");
    var none = document.createElement("option");
    none.value = "";
    none.textContent = "Choose a trade…";
    tradeSel.appendChild(none);
    Object.keys(D.TRADE_LABELS).forEach(function (key) {
      var o = document.createElement("option");
      o.value = key;
      o.textContent = D.TRADE_LABELS[key];
      tradeSel.appendChild(o);
    });
    finderForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var headaches = Array.prototype.map.call(
        optsWrap.querySelectorAll("input[type=checkbox]:checked"),
        function (b) { return b.value; }
      );
      var size = finderForm.querySelector("input[name=size]:checked");
      var picks = D.recommend({
        headaches: headaches,
        size: size ? size.value : "solo",
        trade: tradeSel.value
      });
      var res = document.getElementById("finder-result");
      res.innerHTML = "";
      if (!picks.length) {
        res.appendChild(el("p", "finder-empty", "Nothing matched — tick at least one headache above and try again."));
        return;
      }
      var names = picks.map(function (s) { return D.productBySlug(s).name; });
      res.appendChild(el("p", "finder-verdict",
        "Start with <strong>" + names.length + " tool" + (names.length > 1 ? "s" : "") + "</strong>: " +
        esc(names.join(", ")) + "."));
      var apply = el("button", "btn", "Load these into the quote builder");
      apply.type = "button";
      apply.addEventListener("click", function () {
        var boxes = document.querySelectorAll("#pick-list input[type=checkbox]");
        Array.prototype.forEach.call(boxes, function (b) {
          b.checked = picks.indexOf(b.value) !== -1;
        });
        renderQuote();
        document.getElementById("builder").scrollIntoView({ behavior: "smooth" });
      });
      res.appendChild(apply);
    });
  }

  // --- savings estimator ---
  var estJobs = document.getElementById("est-jobs");
  var estRate = document.getElementById("est-rate");
  var estResult = document.getElementById("est-result");
  if (estJobs && estRate && estResult) {
    function renderEstimate() {
      var s = D.estimateSavings(estJobs.value, estRate.value);
      if (s.jobsPerMonth <= 0) {
        estResult.textContent = "Enter your jobs per month to see the math.";
        return;
      }
      var verdict = s.value >= D.BUNDLE_PRICE
        ? '<span class="est-good">Pays for itself ' + Math.round(s.value / D.BUNDLE_PRICE * 10) / 10 + "x over.</span>"
        : "Not yet at these numbers — try more jobs or a higher rate.";
      estResult.innerHTML =
        "The stack gives back about <strong>" + s.hoursSaved + " admin hours a month</strong>" +
        " — worth roughly <strong>$" + s.value.toLocaleString("en-US") + "</strong> at $" + s.hourlyRate + "/hr. " +
        "The Field-Ops Stack costs <strong>$" + D.BUNDLE_PRICE + "/mo</strong>.<br>" + verdict;
    }
    estJobs.addEventListener("input", renderEstimate);
    estRate.addEventListener("input", renderEstimate);
    renderEstimate();
  }
})();
