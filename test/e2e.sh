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

# Flow 7: jobChecklist — 6 stages, each with a real product and 3 action items
node -e "
const d=require('./js/data.js');
const c=d.jobChecklist();
if(c.length!==6) throw new Error('stages: '+c.length);
c.forEach(e=>{
  if(!e.product||!e.product.slug) throw new Error('stage '+e.stage+' missing product');
  if(!Array.isArray(e.items)||e.items.length!==3) throw new Error('stage '+e.stage+' items');
  e.items.forEach(it=>{ if(typeof it!=='string'||!it.length) throw new Error('empty item'); });
});
const titles=c.map(e=>e.title).join('|');
if(titles!=='Quote it|List the materials|Pull the permits|Keep the crew safe|Keep the trucks rolling|Document the visit') throw new Error('titles');
" && ok "jobChecklist: 6 stages x 3 action items" || bad "jobChecklist wrong"

# Flow 8: quotePlan — stack quote honest both ways
node -e "
const d=require('./js/data.js');
const all=d.PRODUCTS.map(p=>p.slug);
const q1=d.quotePlan(all);
if(q1.count!==6||q1.separate!==107) throw new Error('all: '+JSON.stringify(q1));
if(q1.bundleApplies!==true||q1.effective!==79||q1.savings!==28) throw new Error('bundle win');
const q2=d.quotePlan(['safetycheck-ai','fleetlog-ai']);
if(q2.bundleApplies!==false||q2.effective!==30||q2.savings!==0) throw new Error('separate win');
const q3=d.quotePlan(['quotely-ai','quotely-ai','nope']);
if(q3.count!==1||q3.separate!==24) throw new Error('dedupe');
if(d.quotePlan([]).count!==0) throw new Error('empty');
" && ok "quotePlan: stack wins on all-six, loses on two cheap picks" || bad "quotePlan wrong"

echo "---"
echo "e2e: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]

# Flow 5: recommender — headaches map to the right tools, pipeline order kept
node -e "
const d=require('./js/data.js');
const r=d.recommend({headaches:['quotes','permits'],size:'solo',trade:''});
if(JSON.stringify(r)!=='[\"quotely-ai\",\"permitpilot-ai\"]') throw new Error('headaches: '+r);
const r2=d.recommend({headaches:[],size:'big',trade:'roofing'});
if(r2.indexOf('safetycheck-ai')===-1||r2.indexOf('fleetlog-ai')===-1) throw new Error('big crew: '+r2);
const r3=d.recommend({headaches:['nonsense'],size:'solo',trade:'nonsense'});
if(r3.length!==0) throw new Error('unknown inputs should give nothing: '+r3);
const r4=d.recommend(null);
if(!Array.isArray(r4)||r4.length!==0) throw new Error('null answers should give []');
" && ok "recommend maps headaches/trade/size" || bad "recommend broken"

# Flow 6: estimator math — 12 jobs x 7.0 hrs at $75/hr
node -e "
const d=require('./js/data.js');
if(d.hoursSavedPerJob()!==7) throw new Error('per-job hours '+d.hoursSavedPerJob());
const s=d.estimateSavings(12,75);
if(s.hoursSaved!==84||s.value!==6300) throw new Error(JSON.stringify(s));
const z=d.estimateSavings(0,75);
if(z.hoursSaved!==0||z.value!==0) throw new Error('zero jobs should be zero');
const n=d.estimateSavings(-5,'abc');
if(n.jobsPerMonth!==0||n.hourlyRate!==0) throw new Error('bad input should clamp to 0');
" && ok "estimateSavings math + clamping" || bad "estimateSavings broken"

# Flow 7: trade + headache label tables cover the maps
node -e "
const d=require('./js/data.js');
const r=d.recommend({headaches:Object.keys(d.HEADACHE_LABELS),size:'solo',trade:''});
if(r.length!==6) throw new Error('all headaches should cover all 6 tools: '+r);
for(const t of Object.keys(d.TRADE_LABELS)){
  const rr=d.recommend({headaches:[],size:'solo',trade:t});
  if(!rr.length) throw new Error('trade '+t+' recommends nothing');
}
" && ok "label tables + trade map complete" || bad "label/trade maps incomplete"
