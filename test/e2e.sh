#!/usr/bin/env bash
# trades-hub e2e tests — exercise the shared data logic end to end in Node.
set -u
cd "$(dirname "$0")/.." || exit 1
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "PASS: $1"; }
bad()  { FAIL=$((FAIL+1)); echo "FAIL: $1"; }

# Flow 1: pipeline tells the full story in order 1..5
node -e "
const d=require('./js/data.js');
const titles=d.STAGES.map(s=>s.n+':'+s.title).join('|');
const want='1:Win the job|2:Bill it|3:Get paid|4:Get reviewed|5:Get discovered';
if(titles!==want){console.error('got: '+titles);process.exit(1);}
" && ok "pipeline story order 1-5 correct" || bad "pipeline story order wrong"

# Flow 2: bundle math — 91 separately, 59 bundle, 32 savings
node -e "
const d=require('./js/data.js');
if(d.separateTotal()!==91) throw new Error('total '+d.separateTotal());
if(d.BUNDLE_PRICE!==59) throw new Error('bundle '+d.BUNDLE_PRICE);
if(d.bundleSavings()!==32) throw new Error('savings '+d.bundleSavings());
" && ok "bundle math 91 / 59 / 32" || bad "bundle math wrong"

# Flow 3: product lookup by slug returns the right product
node -e "
const d=require('./js/data.js');
const p=d.productBySlug('reviewpilot-ai');
if(!p||p.price!==29||p.name!=='ReviewPilot AI') throw new Error('lookup failed');
if(d.productBySlug('nope')!==null) throw new Error('unknown slug should be null');
" && ok "productBySlug lookup works" || bad "productBySlug broken"

# Flow 4: every product has 3 features and a valid price
node -e "
const d=require('./js/data.js');
for(const p of d.PRODUCTS){
  if(!Array.isArray(p.features)||p.features.length!==3) throw new Error(p.slug+' features');
  if(typeof p.price!=='number'||p.price<=0) throw new Error(p.slug+' price');
  if(!p.tagline||!p.name) throw new Error(p.slug+' copy');
}
" && ok "all 4 products have 3 features + price + copy" || bad "product data incomplete"

# Flow 5: invoicepilot honestly owns two stages (bill it + get paid)
node -e "
const d=require('./js/data.js');
const inv=d.STAGES.filter(s=>s.product==='invoicepilot-ai');
if(inv.length!==2) throw new Error('invoicepilot stages: '+inv.length);
" && ok "invoicepilot owns exactly 2 stages" || bad "invoicepilot stage mapping wrong"

# Flow 6: pipeline is a connected chain — stage N's product hands to stage N+1's
node -e "
const d=require('./js/data.js');
const chain={ 'quotely-ai':'invoicepilot-ai', 'invoicepilot-ai':'reviewpilot-ai',
              'reviewpilot-ai':'socialspark-ai', 'socialspark-ai':'quotely-ai' };
for(let i=0;i<d.STAGES.length-1;i++){
  const a=d.STAGES[i].product, b=d.STAGES[i+1].product;
  if(a!==b && chain[a]!==b) throw new Error('broken handoff '+a+' -> '+b);
}
// last stage loops back to first (flywheel)
const last=d.STAGES[d.STAGES.length-1].product, first=d.STAGES[0].product;
if(chain[last]!==first) throw new Error('flywheel does not loop');
" && ok "pipeline handoffs form a connected flywheel" || bad "pipeline handoffs broken"

echo "---"
echo "e2e: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
