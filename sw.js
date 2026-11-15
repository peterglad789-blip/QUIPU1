/* QUIPU service worker: keeps the app usable when the link to Earth drops. */
const VER='quipu-v6-1';
const SHELL='quipu-shell-'+VER, LIBS='quipu-libs-'+VER, DATA='quipu-data-v1', TILES='quipu-tiles-v1', PHOTOS='quipu-photos-v1';
const LIB_URLS=[
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
  'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js'];
const CAP={[TILES]:2500,[PHOTOS]:300,[DATA]:200};

self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const s=await caches.open(SHELL);await Promise.all(['./','./index.html'].map(u=>s.add(u).catch(()=>{})));
  const l=await caches.open(LIBS);await Promise.all(LIB_URLS.map(u=>l.add(new Request(u,{mode:'cors'})).catch(()=>{})));
  self.skipWaiting();})());});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const keep=[SHELL,LIBS,DATA,TILES,PHOTOS];
  for(const k of await caches.keys())if(!keep.includes(k))await caches.delete(k);await self.clients.claim();})());});

const isTile=u=>/\/mmgis-maps\/.+\/\d+\/\d+\/\d+\.(png|jpg)$/.test(u.pathname)||/trek\.nasa\.gov\/tiles\//.test(u.href);
const isPhoto=u=>/mars2020-raw-images|msl-raw-images/.test(u.pathname);
const isData=u=>/\.json$/.test(u.pathname)&&/nasa\.gov/.test(u.host)||/\/rss\/api\//.test(u.pathname)||/dsn\/data\/dsn\.xml/.test(u.pathname)||/api\.nasa\.gov/.test(u.host)||/maps\/location\/api/.test(u.pathname);
const isLib=u=>/unpkg\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.host);
function keyFor(req){const u=new URL(req.url);u.searchParams.delete('r');return new Request(u.href);}

async function trim(name){const c=await caches.open(name);const keys=await c.keys();const cap=CAP[name];if(cap&&keys.length>cap){for(const k of keys.slice(0,keys.length-cap))await c.delete(k);}}
async function cacheFirst(req,name){const c=await caches.open(name);const hit=await c.match(req,{ignoreVary:true});if(hit)return hit;
  const res=await fetch(req);if(res&&(res.ok||res.type==='opaque')){c.put(req,res.clone()).then(()=>trim(name)).catch(()=>{});}return res;}
async function networkFirst(req,name,timeoutMs){const c=await caches.open(name);const key=keyFor(req);
  try{const res=await (timeoutMs?Promise.race([fetch(req),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),timeoutMs))]):fetch(req));
    if(res&&res.ok){c.put(key,res.clone()).then(()=>trim(name)).catch(()=>{});}return res;}
  catch(err){const hit=await c.match(key,{ignoreVary:true,ignoreSearch:false});if(hit){const h=new Headers(hit.headers);h.set('X-Quipu-Cache','offline-copy');return new Response(await hit.blob(),{status:200,headers:h});}throw err;}}

self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;let u;try{u=new URL(req.url);}catch(err){return;}
  if(u.origin===self.location.origin){if(req.mode==='navigate'||/index\.html$|\/$/.test(u.pathname)){e.respondWith(networkFirst(req,SHELL,3000).catch(()=>caches.match('./index.html')));}return;}
  if(isLib(u)){e.respondWith(cacheFirst(req,LIBS));return;}
  if(isTile(u)){e.respondWith(cacheFirst(req,TILES));return;}
  if(isPhoto(u)){e.respondWith(cacheFirst(req,PHOTOS));return;}
  if(isData(u)){e.respondWith(networkFirst(req,DATA));return;}});

self.addEventListener('message',e=>{if(!e.data||e.data.type!=='stats')return;e.waitUntil((async()=>{const out={};
  for(const n of [SHELL,LIBS,DATA,TILES,PHOTOS]){try{out[n]=(await (await caches.open(n)).keys()).length;}catch(err){out[n]=0;}}
  e.source&&e.source.postMessage({type:'stats',caches:out,version:VER});})());});
