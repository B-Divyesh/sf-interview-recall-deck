import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

async function files(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await files(full));
    else if (!entry.name.endsWith('.map') && entry.name !== 'sw.js' && entry.name !== 'staticwebapp.config.json') out.push('/' + relative('dist', full).replaceAll('\\\\', '/'));
  }
  return out;
}

const assets = await files('dist');
const stamp = (await readFile('dist/index.html', 'utf8')).match(/assets\/(.+?)\.js/)?.[1] ?? Date.now().toString();
const source = `const CACHE='recall-deck-${stamp}';
const SHELL=${JSON.stringify(assets)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>Promise.all(SHELL.map(url=>fetch(new Request(url,{cache:'reload'})).then(response=>{if(!response.ok)throw new Error('Precache failed: '+url);return cache.put(url,response)})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(async()=>await caches.match(event.request,{ignoreVary:true})||await caches.match('/index.html',{ignoreVary:true})||await caches.match('/offline.html',{ignoreVary:true})));return;
  }
  event.respondWith(caches.match(event.request,{ignoreVary:true}).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response})));
});`;
await writeFile('dist/sw.js', source);
