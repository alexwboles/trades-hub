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

  // --- pipeline ---
  var pipe = document.getElementById("pipeline");
  D.STAGES.forEach(function (st, i) {
    var p = D.productBySlug(st.product);
    var card = el("a", "stage", "");
    card.href = D.productUrl(st.product);
    card.target = "_blank";
    card.rel = "noopener";
    card.innerHTML =
      '<span class="stage-num">' + st.n + "</span>" +
      '<span class="stage-title">' + esc(st.title) + "</span>" +
      '<span class="stage-blurb">' + esc(st.blurb) + "</span>" +
      '<span class="stage-tool">powered by ' + esc(p.name) + "</span>";
    pipe.appendChild(card);
    if (i < D.STAGES.length - 1) {
      var arrow = el("span", "stage-arrow", "&#8594;");
      arrow.setAttribute("aria-hidden", "true");
      pipe.appendChild(arrow);
    }
  });

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
})();
