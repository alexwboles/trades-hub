#!/usr/bin/env bash
# trades-hub e2e tests — exercise the shared data logic end to end in Node.
set -u
cd "$(dirname "$0")/.." || exit 1
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "PASS: $1"; }
bad()  { FAIL=$((FAIL+1)); echo "FAIL: $1"; }

# Flow 1: pipeline tells the full story in order 1..6
node -e "
const d=require('./js/data.js');
const titles=d.STAGES.map(s=>s.n+':'+s.title).join('|');
const want='1:Quote it|2:List the materials|3:Pull the permits|4:Keep the crew safe|5:Keep the trucks rolling|6:Document the visit';
if(titles!==want){console.error('got: '+titles);process.exit(1);}
" && ok "pipeline story order 1-6 correct" || bad "pipeline story order wrong"

# Flow 2: bundle math — 107 separately, 79 bundle, 28 savings
node -e "
const d=require('./js/data.js');
if(d.separateTotal()!==107) throw new Error('total '+d.separateTotal());
if(d.BUNDLE_PRICE!==79) throw new Error('bundle '+d.BUNDLE_PRICE);
if(d.bundleSavings()!==28) throw new Error('savings '+d.bundleSavings());
" && ok "bundle math 107 / 79 / 28" || bad "bundle math wrong"

# Flow 3: product lookup by slug returns the right product
node -e "
const d=require('./js/data.js');
const p=d.productBySlug('fleetlog-ai');
if(!p||p.price!==15||p.name!=='FleetLog AI') throw new Error('lookup failed');
if(d.productBySlug('nope')!==null) throw new Error('unknown slug should be null');
" && ok "productBySlug lookup works" || bad "productBySlug broken"

# Flow 4: every product has 3 features and a valid price
node -e "
const d=require('./js/data.js');
if(d.PRODUCTS.length!==6) throw new Error('products: '+d.PRODUCTS.length);
for(const p of d.PRODUCTS){
  if(!Array.isArray(p.features)||p.features.length!==3) throw new Error(p.slug+' features');
  if(typeof p.price!=='number'||p.price<=0) throw new Error(p.slug+' price');
  if(!p.tagline||!p.name) throw new Error(p.slug+' copy');
}
" && ok "all 6 products have 3 features + price + copy" || bad "product data incomplete"

# Flow 5: each product owns exactly 1 stage, one stage per product
node -e "
const d=require('./js/data.js');
const counts={};
for(const s of d.STAGES) counts[s.product]=(counts[s.product]||0)+1;
for(const p of d.PRODUCTS){
  if(counts[p.slug]!==1) throw new Error(p.slug+' owns '+(counts[p.slug]||0)+' stages');
}
" && ok "each product owns exactly 1 stage" || bad "product stage mapping wrong"

# Flow 6: pipeline is a connected chain — stage N's product hands to stage N+1's
node -e "
const d=require('./js/data.js');
const chain={ 'quotely-ai':'materiallist-ai', 'materiallist-ai':'permitpilot-ai',
              'permitpilot-ai':'safetycheck-ai', 'safetycheck-ai':'fleetlog-ai',
              'fleetlog-ai':'sitevisit-ai', 'sitevisit-ai':'quotely-ai' };
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
