#!/usr/bin/env bash
# trades-hub smoke tests — quick structural + logic checks.
set -u
cd "$(dirname "$0")/.." || exit 1
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "PASS: $1"; }
bad()  { FAIL=$((FAIL+1)); echo "FAIL: $1"; }

# 1-4: required files exist
for f in index.html css/style.css js/data.js js/app.js README.md test/smoke.sh test/e2e.sh; do
  [ -f "$f" ] && ok "file exists: $f" || bad "missing file: $f"
done

# 5-6: JS syntax valid
for f in js/data.js js/app.js; do
  node --check "$f" >/dev/null 2>&1 && ok "node --check $f" || bad "syntax error in $f"
done

# 7: all 4 product slugs present in data.js
if grep -q "quotely-ai" js/data.js && grep -q "invoicepilot-ai" js/data.js \
   && grep -q "reviewpilot-ai" js/data.js && grep -q "socialspark-ai" js/data.js; then
  ok "all 4 product slugs present"
else
  bad "missing product slug in data.js"
fi

# 8: data.js exports load and pipeline has exactly 5 stages
STAGES=$(node -e "const d=require('./js/data.js'); console.log(d.STAGES.length)")
[ "$STAGES" = "5" ] && ok "pipeline stages = 5" || bad "pipeline stages = $STAGES (want 5)"

# 9: bundle math 24+19+29+19 = 91
TOTAL=$(node -e "const d=require('./js/data.js'); console.log(d.separateTotal())")
[ "$TOTAL" = "91" ] && ok "separate total = \$91" || bad "separate total = \$$TOTAL (want 91)"

# 10: product URLs point at alexwboles
URL=$(node -e "const d=require('./js/data.js'); console.log(d.productUrl('quotely-ai'))")
[ "$URL" = "https://github.com/alexwboles/quotely-ai" ] && ok "productUrl correct" || bad "productUrl = $URL"

# 11: every stage references a real product slug
node -e "
const d=require('./js/data.js');
const slugs=new Set(d.PRODUCTS.map(p=>p.slug));
const badStages=d.STAGES.filter(s=>!slugs.has(s.product));
if(badStages.length){console.error(JSON.stringify(badStages));process.exit(1);}
" && ok "all stages reference real products" || bad "stage references unknown product"

# 12: index.html wires data.js + app.js
grep -q 'src="js/data.js"' index.html && grep -q 'src="js/app.js"' index.html \
  && ok "index.html wires both scripts" || bad "index.html missing script tags"

echo "---"
echo "smoke: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
