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
      '<div class="stage-detail-head"><span class="stage-num">' + st.n + "</span>" +
      "<h3>Stage " + st.n + ": " + esc(st.title) + "</h3></div>" +
      "<p>" + esc(st.blurb) + "</p>" +
      '<p class="stage-detail-tool">Powered by <strong>' + esc(p.name) + "</strong> — " + esc(p.tagline) + "</p>" +
      '<p class="stage-detail-next">Hands off to: <strong>' + esc(next.title) + "</strong> (stage " + next.n + ")</p>" +
      '<a class="btn" href="' + D.productUrl(st.product) + '" target="_blank" rel="noopener">View ' + esc(p.name) + " on GitHub</a>";
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
      '<span class="stage-num">' + st.n + "</span>" +
      '<span class="stage-title">' + esc(st.title) + "</span>" +
      '<span class="stage-blurb">' + esc(st.blurb) + "</span>" +
      '<span class="stage-tool">powered by ' + esc(p.name) + "</span>";
    card.addEventListener("click", function () { renderStageDetail(st.n); });
    pipe.appendChild(card);
    if (i < D.STAGES.length - 1) {
      var arrow = el("span", "stage-arrow", "&#8594;");
      arrow.setAttribute("aria-hidden", "true");
      pipe.appendChild(arrow);
    }
  });
  renderStageDetail(1);

  // --- product cards ---
  var grid = document.getElementById("products");
  D.PRODUCTS.forEach(function (p, i) {
    var card = el("article", "product", "");
    var feats = p.features.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    card.innerHTML =
      '<div class="product-step">Step ' + (i + 1) + " of 6</div>" +
      "<h3>" + esc(p.name) + "</h3>" +
      '<p class="tagline">' + esc(p.tagline) + "</p>" +
      "<ul>" + feats + "</ul>" +
      '<div class="product-foot">' +
        '<span class="price">$' + p.price + "/mo</span>" +
        '<a class="btn" href="' + D.productUrl(p.slug) + '" target="_blank" rel="noopener">View on GitHub</a>' +
      "</div>";
    grid.appendChild(card);
  });

  // --- bundle math ---
  var total = D.separateTotal();
  var box = document.getElementById("bundle-math");
  box.innerHTML =
    "<p>Separately: " +
    D.PRODUCTS.map(function (p) { return esc(p.name) + " $" + p.price; }).join(" + ") +
    " = <strong>$" + total + "/mo</strong></p>" +
    '<p>As the <strong>Trades Field-Ops Stack</strong>: <strong>$' + D.BUNDLE_PRICE + "/mo</strong> " +
    "— you save <strong>$" + D.bundleSavings() + "/mo</strong> and everything works as one pipeline.</p>";

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

  function renderChecklist() {
    var wrap = document.getElementById("checklist");
    wrap.innerHTML = "";
    D.jobChecklist().forEach(function (entry) {
      var block = el("div", "check-stage", "");
      block.innerHTML = '<h3><span class="stage-num">' + entry.stage + "</span> " + esc(entry.title) + "</h3>";
      var ul = el("ul", "check-items", "");
      entry.items.forEach(function (item, idx) {
        var key = entry.stage + ":" + idx;
        var li = el("li", "check-item", "");
        var label = document.createElement("label");
        var box = document.createElement("input");
        box.type = "checkbox";
        box.checked = !!checkedMap[key];
        box.addEventListener("change", function () {
          checkedMap[key] = box.checked;
          saveChecked(checkedMap);
          li.classList.toggle("done", box.checked);
        });
        var span = document.createElement("span");
        span.textContent = item;
        label.appendChild(box);
        label.appendChild(span);
        li.appendChild(label);
        if (box.checked) li.classList.add("done");
        ul.appendChild(li);
      });
      block.appendChild(ul);
      wrap.appendChild(block);
    });
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
  }
  renderBuilder();
})();
