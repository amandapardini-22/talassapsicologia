const fs = require('fs');
const http = require('http');
const {spawn} = require('child_process');
const path = require('path');
const delay = ms => new Promise(r=>setTimeout(r,ms));
async function main(){
 const server=http.createServer((req,res)=>{const p=path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));try{res.setHeader('Content-Type',p.endsWith('.css')?'text/css':p.endsWith('.js')?'text/javascript':p.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(p));}catch{res.statusCode=404;res.end();}}).listen(8765,'127.0.0.1');
 const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--remote-debugging-port=9228','--user-data-dir='+path.join(process.env.TEMP,'talassa-css-audit-profile'),'about:blank'],{windowsHide:true,stdio:'ignore'});
 let ws;
 try {
 let pages;for(let i=0;i<40;i++){try{pages=await(await fetch('http://127.0.0.1:9228/json')).json();break;}catch{await delay(250);}}
 ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
 let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}};
 const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await call('Page.enable');await call('Page.navigate',{url:'http://127.0.0.1:8765/'});await delay(1500);
 const inventory=await evaluate(`(()=>{
 const classes=[...new Set([...document.querySelectorAll('[class]')].flatMap(e=>[...e.classList]))].sort();
 const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
 const sheets=[...document.styleSheets].map(s=>{const rules=[];function walk(list,context=[]){for(const r of list){if(r.selectorText){let count=null;const relaxed=r.selectorText.replace(/::[\\w-]+(?:\\([^)]*\\))?/g,'').replace(/:(hover|focus-visible|focus-within|focus|active|visited)\\b/g,'').replace(/\\.(open|scrolled)\\b/g,'');try{count=document.querySelectorAll(relaxed).length;}catch{}rules.push({selector:r.selectorText,context,css:r.cssText,count});}else if(r.cssRules && r.type!==7)walk(r.cssRules,[...context,r.conditionText||r.name||r.cssText.split('{')[0]]);else rules.push({context,css:r.cssText,type:r.type});}}walk(s.cssRules);return {file:s.href||'critical-inline',rules};});return {classes,ids,sheets};})()`);
 fs.mkdirSync('css-audit',{recursive:true});fs.writeFileSync('css-audit/inventory.json',JSON.stringify(inventory,null,2));
 console.log(JSON.stringify(inventory.sheets.map(s=>({file:s.file,rules:s.rules.length,unmatched:s.rules.filter(r=>r.count===0).length})),null,2));
 if(process.argv.includes('--validate')||process.argv.includes('--retry')){
  const retry=process.argv.includes('--retry');
  const before=fs.readFileSync('css-audit/styles.before.css','utf8'),after=fs.readFileSync('css-audit/styles.proposed.css','utf8');
  const interaction=await evaluate(`(()=>{const result={};document.querySelector('.js-whatsapp').click();result.modalOpen=document.querySelector('.whatsapp-modal').classList.contains('open');document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));result.modalClosed=!document.querySelector('.whatsapp-modal').classList.contains('open');document.querySelector('.menu-toggle').click();result.menu=document.querySelector('.main-nav').classList.contains('open');document.querySelector('.concern-trigger').click();result.card=document.querySelector('.concern-card').classList.contains('open');document.querySelector('.faq-item button').click();result.faq=document.querySelector('.faq-item').classList.contains('open');return result;})()`);
  await evaluate(`window.auditBefore=${JSON.stringify(before)};window.auditAfter=${JSON.stringify(after)};window.auditLink=[...document.querySelectorAll('link')].find(e=>e.getAttribute('href')==='styles.css');window.auditLink.disabled=true;window.auditStyle=document.createElement('style');document.head.append(auditStyle);window.auditFreeze=document.createElement('style');auditFreeze.textContent='*,*::before,*::after{transition:none!important;animation-play-state:paused!important}';document.head.append(auditFreeze);`);
  const results=[];
  for(const [width,height] of [[1440,900],[1920,1080],[768,1024],[820,1180],[1024,768],[1180,820],[320,568],[390,844],[844,390],[767,1024],[1025,768],[1199,820],[1200,820],[900,500],[900,501]]){
   await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
   for(const motion of ['reduce','no-preference']){
    await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:motion}]});
    for(const open of [false,true]){
     if(retry && !(width===820 && height===1180 && motion==='reduce' && open===false))continue;
     if(retry){await delay(150);await evaluate('gsap.globalTimeline.pause();gsap.ticker.sleep()');}
     const result=await evaluate(`(async()=>{
      document.querySelectorAll('.main-nav,.whatsapp-modal,.concern-card,.faq-item').forEach(e=>e.classList.toggle('open',${open}));document.querySelector('.site-header').classList.toggle('scrolled',${open});
      document.getAnimations().forEach(a=>{try{a.finish()}catch{};a.cancel()});
      const elements=[...document.querySelectorAll('body,body *')];
      function snapshot(){return elements.map(e=>['','::before','::after'].map(p=>{const s=getComputedStyle(e,p||null);return Array.from(s).map(k=>[k,s.getPropertyValue(k)]);}));}
      auditStyle.textContent=auditBefore;void document.body.offsetHeight;await document.fonts.ready;const first=snapshot();
      auditStyle.textContent=auditAfter;void document.body.offsetHeight;await document.fonts.ready;const second=snapshot();
      const differences=[];for(let i=0;i<first.length;i++)for(let p=0;p<3;p++)for(let k=0;k<first[i][p].length;k++)if(first[i][p][k][1]!==second[i][p][k][1])differences.push({element:i,tag:elements[i].tagName,classes:elements[i].getAttribute('class'),pseudo:p,property:first[i][p][k][0],before:first[i][p][k][1],after:second[i][p][k][1]});
      return {elements:elements.length,differenceCount:differences.length,samples:differences.slice(0,20)};
     })()`);
     results.push({width,height,motion,open,...result});
    }
   }
  }
  if(retry){const previous=JSON.parse(fs.readFileSync('css-audit/validation.json','utf8'));fs.writeFileSync('css-audit/validation.retry-'+Date.now()+'.json',JSON.stringify(previous,null,2));for(const result of results){const i=previous.results.findIndex(r=>r.width===result.width&&r.height===result.height&&r.motion===result.motion&&r.open===result.open);previous.results[i]=result;}previous.retryNote='Repeated 820x1180/reduce/closed after settling media events, pausing GSAP and forcing layout before awaiting font readiness for each stylesheet; prior results retained.';fs.writeFileSync('css-audit/validation.json',JSON.stringify(previous,null,2));}
  else fs.writeFileSync('css-audit/validation.json',JSON.stringify({interaction,results},null,2));console.log('Validation',results.length,'cases; differences:',results.reduce((n,r)=>n+r.differenceCount,0),'interactions:',interaction);
 }
 }finally{if(ws)ws.close();chrome.kill();server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
