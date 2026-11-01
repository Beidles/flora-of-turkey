const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const source=read('compositae.html'),page=read('compositae_multiaccess.html');
const payload=(html,id)=>JSON.parse(html.match(new RegExp('<script[^>]*id=["\']'+id+'["\'][^>]*>([\\s\\S]*?)</script>'))[1]);
const tree=payload(page,'keydata'),original=payload(source,'keydata'),provenance=payload(page,'provenancedata');
assert.deepEqual(tree,original,'Source characters and destinations must remain exact');
assert.equal(Object.keys(tree).length,174);assert.deepEqual(Object.keys(payload(page,'labelsdata')),Object.keys(tree));
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),provenance.sha256);
const ctx=vm.createContext({});vm.runInContext(page.match(/<script id="engine">([\s\S]*?)<\/script>/)[1],ctx);
const routes=ctx.makeRoutes(tree),names=rs=>[...new Set(rs.map(r=>r.genus))].sort();
assert.equal(routes.length,175);assert.equal(new Set(routes.map(r=>r.label)).size,132);assert.equal(names(routes).length,129);
// Independent oracle follows only source edges; unrelated selections are never tested.
function oracle(answers,node='S1'){
 if(node.startsWith('!'))return [node.slice(1).replace(/ \(.*$/,'')];
 const choices=tree[node].choices;return answers[node]===undefined?choices.flatMap(c=>oracle(answers,c[1])):oracle(answers,choices[answers[node]][1]);
}
function expectOracle(a){assert.deepEqual(names(ctx.filterRoutes(routes,a)),[...new Set(oracle(a))].sort());}
expectOracle({});
for(const route of routes){
 const forward=Object.fromEntries(route.trail),reverse=Object.fromEntries([...route.trail].reverse());
 assert.deepEqual(names(ctx.filterRoutes(routes,forward)),[route.genus]);
 assert.deepEqual(names(ctx.filterRoutes(routes,forward)),names(ctx.filterRoutes(routes,reverse)),'Order independence');
 // Every partial observation from this route must retain its genus.
 for(let i=0;i<route.trail.length;i++)assert(names(ctx.filterRoutes(routes,Object.fromEntries(route.trail.slice(i)))).includes(route.genus));
}
for(const n of Object.keys(tree))for(const i of [0,1])expectOracle({[n]:i});
const unknownRoute=routes.find(r=>r.genus==='Taraxacum');assert.equal(unknownRoute.answers.F23,undefined);assert(ctx.compatible(unknownRoute,{F23:0}));assert(ctx.compatible(unknownRoute,{F23:1}));
// Do not manufacture a match by pooling state values from separate routes.
const repeated=[{genus:'Example',answers:{x:0,y:0}},{genus:'Example',answers:{x:1,y:1}}];
assert.equal(ctx.filterRoutes(repeated,{x:0,y:1}).length,0);
// Multi-route source genera keep their qualified source labels.
assert(routes.some(r=>r.label==='Cirsium (section Epitrachys)'&&r.genus==='Cirsium'));
assert.equal(new Set(routes.filter(r=>r.genus==='Centaurea').map(r=>r.label)).size,3);
let seed=132;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const ids=Object.keys(tree);
for(let trial=0;trial<500;trial++){
 const a={};for(let j=0;j<12;j++)a[ids[Math.floor(random()*ids.length)]]=random()<.5?0:1;
 expectOracle(a);const old=new Set(names(ctx.filterRoutes(routes,a)));a.S1=0;
 // Only adding a new observation, not changing one, is guaranteed monotonic.
 const b={};Object.entries(a).slice(0,-1).forEach(([n,i])=>b[n]=i);
 const broad=new Set(names(ctx.filterRoutes(routes,b)));for(const genus of names(ctx.filterRoutes(routes,a)))assert(broad.has(genus));
}
// All generated links point to existing source anchors.
for(const n of ids)assert(source.includes('id="row-'+n+'"'));
assert(page.includes("'compositae.html#row-'+n"));
const newLink='<a href="compositae_multiaccess.html">🌼 NEW — Compositae (Asteraceae) Lucid-style genus key — choose any feature (preliminary)</a>';
const index=read('index.html');assert.equal(index.split(newLink).length,2);assert(index.includes('href="compositae.html"'));
const originalIndexHash='bf71026eed0f1aa8c438291f8ebd91ec64f7d5ced60b7c61b638c80b160329a3';
assert.equal(crypto.createHash('sha256').update(index.replace(newLink,'')).digest('hex'),originalIndexHash,'Homepage must differ by only the added link');
// The app is self-contained: no external scripts, data fetches or CDN dependency.
assert(!/<script[^>]+src=/.test(page));assert(!/\bfetch\(/.test(page));
for(const match of page.matchAll(/<script id="(?:engine|app)">([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
console.log('PASS: exact source data; all 175 routes; 129 genera; arbitrary answer order; unknowns; repeated genera; 500 mixed selections; source anchors; one-link homepage change; standalone JavaScript.');
