#!/usr/bin/env bash
# trades-hub smoke tests — quick structural + logic checks.
set -u
cd "$(dirname "$0")/.." || exit 1
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "PASS: $1"; }
bad()  { FAIL=$((FAIL+1)); echo "FAIL: $1"; }

# 1-7: required files exist
for f in index.html css/style.css js/data.js js/app.js README.md test/smoke.sh test/e2e.sh; do
  [ -f "$f" ] && ok "file exists: $f" || bad "missing file: $f"
done

# 8-9: JS syntax valid
for f in js/data.js js/app.js; do
  node --check "$f" >/dev/null 2>&1 && ok "node --check $f" || bad "syntax error in $f"
done

# 10: all 6 product slugs present in data.js
if grep -q "quotely-ai" js/data.js && grep -q "materiallist-ai" js/data.js \
   && grep -q "permitpilot-ai" js/data.js && grep -q "safetycheck-ai" js/data.js \
   && grep -q "fleetlog-ai" js/data.js && grep -q "sitevisit-ai" js/data.js; then
  ok "all 6 product slugs present"
else
  bad "missing product slug in data.js"
fi

# 11: removed slugs are gone from data.js
if grep -q "invoicepilot-ai\|reviewpilot-ai\|socialspark-ai" js/data.js; then
  bad "removed product slug still in data.js"
else
  ok "removed slugs are gone"
fi

# 12: data.js exports load and pipeline has exactly 6 stages
STAGES=$(node -e "const d=require('./js/data.js'); console.log(d.STAGES.length)")
[ "$STAGES" = "6" ] && ok "pipeline stages = 6" || bad "pipeline stages = $STAGES (want 6)"

# 13: bundle math 24+19+19+15+15+15 = 107
TOTAL=$(node -e "const d=require('./js/data.js'); console.log(d.separateTotal())")
[ "$TOTAL" = "107" ] && ok "separate total = \$107" || bad "separate total = \$$TOTAL (want 107)"

# 14: bundle price and savings — 79 and 28
node -e "
const d=require('./js/data.js');
if(d.BUNDLE_PRICE!==79) throw new Error('bundle '+d.BUNDLE_PRICE);
if(d.bundleSavings()!==28) throw new Error('savings '+d.bundleSavings());
" && ok "bundle price \$79, savings \$28" || bad "bundle price/savings wrong"

# 15: product URLs point at alexwboles
URL=$(node -e "const d=require('./js/data.js'); console.log(d.productUrl('sitevisit-ai'))")
[ "$URL" = "https://github.com/alexwboles/sitevisit-ai" ] && ok "productUrl correct" || bad "productUrl = $URL"

# 16: every stage references a real product slug
node -e "
const d=require('./js/data.js');
const slugs=new Set(d.PRODUCTS.map(p=>p.slug));
const badStages=d.STAGES.filter(s=>!slugs.has(s.product));
if(badStages.length){console.error(JSON.stringify(badStages));process.exit(1);}
" && ok "all stages reference real products" || bad "stage references unknown product"

# 17: index.html wires data.js + app.js
grep -q 'src="js/data.js"' index.html && grep -q 'src="js/app.js"' index.html \
  && ok "index.html wires both scripts" || bad "index.html missing script tags"

echo "---"
echo "smoke: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
