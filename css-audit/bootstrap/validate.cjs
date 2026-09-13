// Execute from the repository root: node css-audit/bootstrap/validate.cjs
// Local preview: node css-audit/bootstrap/validate.cjs --serve
const fs=require('fs'),path=require('path'),http=require('http'),crypto=require('crypto'),zlib=require('zlib');
const {spawn}=require('child_process');
const output='css-audit/bootstrap';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const original='assets/css/bootstrap-talassa.css',candidate='assets/css/bootstrap-talassa-candidate.css';
const root=process.cwd();
const mime={'.css':'text/css','.js':'text/javascript','.html':'text/html','.svg':'image/svg+xml','.avif':'image/avif','.webp':'image/webp','.woff2':'font/woff2','.png':'image/png'};
function serve(req,res){
 try{
  const url=new URL(req.url,'http://127.0.0.1:8766');
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  let body=fs.readFileSync(file);
  if(path.basename(file)==='index.html' && url.searchParams.get('bootstrap')==='candidate')body=Buffer.from(body.toString().replace('href="'+original+'"','href="'+candidate+'"'));
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(body);
 }catch{res.writeHead(404);res.end();}
}
function hashes(){const recorded=JSON.parse(fs.readFileSync(output+'/baseline-hashes.json','utf8'));const results={};for(const [file,hash] of Object.entries(recorded)){if(file==='scss/bootstrap-talassa.scss')continue;results[file]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')===hash;}if(Object.values(results).some(x=>!x))throw Error('Protected file changed');return results;}
async function main(){
 const menuOnly=process.argv.includes('--menu');
 const evidence=output+'/'+(menuOnly?'menu-validation.json':'validation.json');
 const protectedFiles=hashes();
 const server=http.createServer(serve).listen(8766,'127.0.0.1');
 if(process.argv.includes('--serve')){console.log('Original: http://127.0.0.1:8766/\nCandidate: http://127.0.0.1:8766/?bootstrap=candidate');return;}
 const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--hide-scrollbars','--remote-debugging-port=9229','--user-data-dir='+path.join(process.env.TEMP,'talassa-bootstrap-audit-profile'),'about:blank'],{windowsHide:true,stdio:'ignore'});
 let ws,call;
 try{
  let pages;for(let i=0;i<40;i++){try{pages=await(await fetch('http://127.0.0.1:9229/json',{signal:AbortSignal.timeout(1000)})).json();break;}catch{await delay(250);}}
  if(!pages)throw Error('Chrome did not start');
  ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}};
  call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await call('Page.enable');await call('Runtime.enable');
  const errors=[];const originalMessage=ws.onmessage;ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params);originalMessage(e);};
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await call('Page.navigate',{url:'http://127.0.0.1:8766/'});await delay(1000);
  await evaluate(`(async()=>{await document.fonts.ready;[...document.images].forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));window.bsOriginal=[...document.querySelectorAll('link')].find(e=>e.getAttribute('href')===${JSON.stringify(original)});window.bsOriginalCSS=await(await fetch(${JSON.stringify(original)})).text();window.bsCandidateCSS=await(await fetch(${JSON.stringify(candidate)})).text();window.bsOriginalSheet=bsOriginal.sheet;window.bsCandidateSheet=new CSSStyleSheet();bsCandidateSheet.replaceSync(bsCandidateCSS);window.bsTestStyle=document.createElement('style');bsTestStyle.textContent=bsOriginalCSS;bsOriginal.after(bsTestStyle);bsOriginalSheet.disabled=true;})()`);
  const inventory=await evaluate(`(()=>{
   function rules(sheet){const list=[];function walk(rs,context=[]){for(const r of rs){if(r.selectorText)list.push({selector:r.selectorText,context,css:r.cssText});else if(r.cssRules)walk(r.cssRules,[...context,r.conditionText||r.name]);}}walk(sheet.cssRules);return list;}
   const before=rules(bsOriginalSheet),after=rules(bsCandidateSheet);const key=r=>JSON.stringify([r.context,r.css]);const kept=new Set(after.map(key)),all=new Set(before.map(key));const removed=before.filter(r=>!kept.has(key(r))),changed=after.filter(r=>!all.has(key(r)));
   const htmlClasses=[...new Set([...document.querySelectorAll('[class]')].flatMap(e=>[...e.classList]))].sort();
   const cssClasses=[...new Set(before.flatMap(r=>[...r.selector.matchAll(/\\.([a-zA-Z_][\\w-]*)/g)].map(m=>m[1])))];
   const candidateClasses=[...new Set(after.flatMap(r=>[...r.selector.matchAll(/\\.([a-zA-Z_][\\w-]*)/g)].map(m=>m[1])))];
   return {beforeRules:before.length,afterRules:after.length,htmlClasses,referencedBootstrapClassTokens:htmlClasses.filter(c=>cssClasses.includes(c)),bootstrapClasses:htmlClasses.filter(c=>candidateClasses.includes(c)),kept:after,removed,changed};
  })()`);
  fs.writeFileSync(output+'/inventory.json',JSON.stringify(inventory,null,2));
  if(inventory.changed.length)throw Error('Candidate changes/adds rule declarations: '+JSON.stringify(inventory.changed.slice(0,3)));
  const metrics={original:{bytes:fs.statSync(original).size,gzip:zlib.gzipSync(fs.readFileSync(original)).length,rules:inventory.beforeRules},candidate:{bytes:fs.statSync(candidate).size,gzip:zlib.gzipSync(fs.readFileSync(candidate)).length,rules:inventory.afterRules}};
  metrics.rawReductionPercent=100*(1-metrics.candidate.bytes/metrics.original.bytes);metrics.gzipReductionPercent=100*(1-metrics.candidate.gzip/metrics.original.gzip);
  fs.writeFileSync(output+'/metrics.json',JSON.stringify(metrics,null,2));console.log('Metrics',JSON.stringify(metrics));
  await evaluate(`window.bsRemoved=${JSON.stringify(inventory.removed)};window.bsSelect=which=>{bsTestStyle.textContent=which==='candidate'?bsCandidateCSS:bsOriginalCSS;void document.body.offsetHeight;if(getComputedStyle(document.documentElement).getPropertyValue('--bs-breakpoint-lg').trim()!=='1025px')throw Error('Bootstrap stylesheet not applied');};window.bsSnapshot=()=>{const elements=[...document.querySelectorAll('html,body,body *')];return elements.map(e=>['','::before','::after'].map(p=>{const s=getComputedStyle(e,p||null);return [...s].sort().map(k=>k+':'+s.getPropertyValue(k)).join('\\n')}));};window.bsDiff=(a,b)=>{const result=[];for(let e=0;e<a.length;e++)for(let p=0;p<3;p++)if(a[e][p]!==b[e][p]){const x=a[e][p].split('\\n'),y=b[e][p].split('\\n');result.push({element:e,pseudo:p,changes:x.filter((v,i)=>v!==y[i]).map((v,i)=>({before:v,after:y.find(w=>w.split(':')[0]===v.split(':')[0])}))});}return result;};`);
  const results=[],screenshots=[],interactions=[];
  const dimensions=[[1440,900],[1920,1080],[768,1024],[820,1180],[1024,768],[1180,820],[320,568],[390,844],[844,390],[767,1024],[1025,768],[1199,820],[1200,820],[900,500],[900,501]];
  for(const [width,height] of dimensions){
   if(menuOnly && width>=1200)continue;
   await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
   await delay(100);
   for(const state of (menuOnly?['menu','menu-scrolled']:['closed','open','keyboard'])){
    await evaluate(`(()=>{window.scrollTo({top:0,behavior:'instant'});document.querySelectorAll('.open').forEach(e=>e.classList.remove('open'));document.querySelector('.site-header').classList.remove('scrolled');document.activeElement?.blur();const state=${JSON.stringify(state)};if(state.startsWith('menu')){document.querySelector('.menu-toggle').click();if(state==='menu-scrolled'){window.scrollTo({top:80,behavior:'instant'});updateHeader();}}else if(state!=='closed'){document.querySelector('.concern-trigger').click();document.querySelector('.faq-item button').click();document.querySelector('.js-whatsapp').click();window.scrollTo({top:80,behavior:'instant'});updateHeader();}clearInterval(processTimer);})()`);
    if(state==='keyboard'){
     await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
     await evaluate(`document.querySelector(${JSON.stringify(width<1200?'.menu-toggle':'.main-nav .js-whatsapp')}).focus({preventScroll:true})`);
    }
    await delay(50);
    const result=await evaluate(`(()=>{bsSelect('original');const before=bsSnapshot();bsSelect('candidate');const after=bsSnapshot();const differences=bsDiff(before,after);const referencedRemoved=bsRemoved.filter(r=>{try{return document.querySelector(r.selector.replace(/::[\\w-]+/g,''))!==null}catch{return false}}).map(r=>r.selector);return {elements:before.length,differentElements:differences.length,samples:differences.slice(0,5),removedMatchingSelectors:referencedRemoved,focusVisible:document.activeElement.matches(':focus-visible'),openMenu:document.querySelector('.main-nav').classList.contains('open'),openModal:document.querySelector('.whatsapp-modal').classList.contains('open'),scrolled:document.querySelector('.site-header').classList.contains('scrolled')};})()`);
    results.push({width,height,state,...result});
    if(state==='closed'||(state==='menu'&&[768,390,844].includes(width))){
     const full=state==='closed'&&[1440,768,390,844].includes(width);
     const shot={width,height,fullPage:full};
     const capture=async which=>{await evaluate(`bsSelect(${JSON.stringify(which)})`);const layout=await call('Page.getLayoutMetrics');const clip=full?{x:0,y:0,width:layout.cssContentSize.width,height:layout.cssContentSize.height,scale:1}:undefined;const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:full,...(clip?{clip}:{})});fs.mkdirSync(output+'/screenshots',{recursive:true});fs.writeFileSync(output+'/screenshots/'+width+'x'+height+(menuOnly?'-menu':'')+'-'+which+'.png',Buffer.from(r.data,'base64'));return r.data;};
     const a=await capture('original'),b=await capture('candidate');
     if(a===b){shot.differentPixels=0;}else{
      Object.assign(shot,await evaluate(`(async()=>{async function read(data){const i=new Image();i.src='data:image/png;base64,'+data;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(i,0,0);return {width:i.width,height:i.height,data:ctx.getImageData(0,0,i.width,i.height).data};}const a=await read(${JSON.stringify(a)}),b=await read(${JSON.stringify(b)});if(a.width!==b.width||a.height!==b.height)return {differentPixels:-1,sizeMismatch:true};let n=0;for(let i=0;i<a.data.length;i+=4)if(a.data[i]!==b.data[i]||a.data[i+1]!==b.data[i+1]||a.data[i+2]!==b.data[i+2]||a.data[i+3]!==b.data[i+3])n++;return {differentPixels:n};})()`));
     }
     screenshots.push(shot);
    }
   }
   for(const which of ['original','candidate']){
    interactions.push({width,height,which,...await evaluate(`(()=>{bsSelect(${JSON.stringify(which)});document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));const escape=!document.querySelector('.whatsapp-modal').classList.contains('open');document.querySelector('.js-whatsapp').click();document.querySelector('.whatsapp-modal-overlay').click();const overlay=!document.querySelector('.whatsapp-modal').classList.contains('open');document.querySelector('.js-whatsapp').click();document.querySelector('.whatsapp-modal-close').click();const close=!document.querySelector('.whatsapp-modal').classList.contains('open');return {escape,overlay,close};})()`)});
   }
   fs.writeFileSync(evidence,JSON.stringify({protectedFiles,results,screenshots,interactions,errors},null,2));
   console.log(width+'x'+height+': computed differences='+results.filter(r=>r.width===width&&r.height===height).reduce((n,r)=>n+r.differentElements,0)+', pixel differences='+(screenshots.find(r=>r.width===width&&r.height===height)?.differentPixels??'not captured'));
  }
  hashes();console.log('DONE',results.length,'computed-style cases;',screenshots.length,'screenshot pairs;',results.reduce((n,r)=>n+r.differentElements,0),'different element/pseudo pairs.');
 }finally{if(call){try{await call('Browser.close')}catch{}}if(ws)ws.close();chrome.kill();server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
