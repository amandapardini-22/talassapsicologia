const fs=require('fs');
const inventory=require('./inventory.json');
const files=['index.html','styles.css','assets/css/bootstrap-talassa.css','script.js'];
const sources=Object.fromEntries(files.map(f=>[f,fs.readFileSync(f,'utf8')]));
if(fs.existsSync('css-audit/styles.before.css') && fs.readFileSync('css-audit/styles.before.css','utf8')!==sources['styles.css'])throw Error('Preserving original audit baseline: working CSS has changed.');
function blocks(text){
 const result=[];let start=0,depth=0,quote='',comment=false,escape=false;
 for(let i=0;i<text.length;i++){
  const c=text[i],n=text[i+1];
  if(comment){if(c==='*'&&n==='/'){comment=false;i++;if(depth===0)start=i+1;}continue;}
  if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote='';continue;}
  if(c==='/'&&n==='*'){comment=true;i++;continue;}
  if(c==='"'||c==="'"){quote=c;continue;}
  if(c==='{')depth++;
  if(c==='}'&&--depth===0){let a=start;while(/\s/.test(text[a]))a++;result.push({start:a,end:i+1,text:text.slice(a,i+1),line:text.slice(0,a).split('\n').length});start=i+1;}
 }
 if(depth||quote||comment)throw Error('Unbalanced CSS');return result;
}
const css=sources['styles.css'];
const inline=sources['index.html'].match(/<style>([\s\S]*?)<\/style>/)[1];
const normalize=s=>s.replace(/\s+/g,' ').trim();
const criticalBlocks=blocks(inline);
const removed=blocks(css).filter(b=>/^@(font-face|keyframes)\b/.test(b.text)&&criticalBlocks.some(c=>normalize(c.text)===normalize(b.text)));
const after=removed.slice().reverse().reduce((s,b)=>s.slice(0,b.start)+s.slice(b.end),css);
fs.writeFileSync('css-audit/styles.before.css',css);
fs.writeFileSync('css-audit/styles.proposed.css',after);
const plan={beforeBytes:Buffer.byteLength(css),afterBytes:Buffer.byteLength(after),removedLines:css.split('\n').length-after.split('\n').length,removed:removed.map(b=>({line:b.line,bytes:Buffer.byteLength(b.text),text:b.text})),hashes:Object.fromEntries(files.map(f=>[f,require('crypto').createHash('sha256').update(sources[f]).digest('hex')])),bootstrap:{bytes:Buffer.byteLength(sources[files[2]]),rules:inventory.sheets[0].rules.length,unmatchedRules:inventory.sheets[0].rules.filter(r=>r.count===0).length,unmatchedSerializedBytes:inventory.sheets[0].rules.filter(r=>r.count===0).reduce((n,r)=>n+Buffer.byteLength(r.css),0)},duplicateCriticalBlocks:inventory.sheets[2].rules.filter(r=>inventory.sheets[1].rules.some(c=>JSON.stringify([r.context,r.css])===JSON.stringify([c.context,c.css]))).length};
fs.writeFileSync('css-audit/plan.json',JSON.stringify(plan,null,2));
console.log(JSON.stringify(plan,null,2));
