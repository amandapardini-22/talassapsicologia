const fs=require('fs'),crypto=require('crypto'),sass=require('sass');
const plan=require('./plan.json');
const before=fs.readFileSync('css-audit/styles.before.css','utf8');
const after=fs.readFileSync('css-audit/styles.proposed.css','utf8');
const html=fs.readFileSync('index.html','utf8');
const inline=html.match(/<style>([\s\S]*?)<\/style>/)[1];
const js=fs.readFileSync('script.js','utf8');
const a=require('./inventory.json');
const strings=[...js.matchAll(/"([^"\r\n]+)"/g)].map(m=>m[1]);
const repeated=[];
for(const [file,text] of [['styles.css',before],['critical-inline',inline],['assets/css/bootstrap-talassa.css',fs.readFileSync('assets/css/bootstrap-talassa.css','utf8')]]){
 for(const match of text.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' ')).matchAll(/([^{}]+)\{([^{}]*)\}/g)){
  const props=new Map();for(const declaration of match[2].split(';')){const colon=declaration.indexOf(':');if(colon<0)continue;const property=declaration.slice(0,colon).trim(),value=declaration.slice(colon+1).trim();if(props.has(property))repeated.push({file,selector:match[1].trim(),property,previous:props.get(property),value});props.set(property,value);}
 }
}
fs.writeFileSync('css-audit/repeated-properties.json',JSON.stringify(repeated,null,2));console.log('Repeated property candidates:',JSON.stringify(repeated));
fs.writeFileSync('css-audit/state-map.json',JSON.stringify({htmlClasses:a.classes,htmlAndRuntimeIds:a.ids,dynamicClasses:['open','scrolled'],javascriptSelectorStrings:[...new Set(strings.filter(x=>/^[.#:]|^button$|^a$/.test(x)))],keyframes:a.sheets[2].rules.filter(r=>r.type===7).map(r=>r.css),mediaContexts:[...new Set(a.sheets[2].rules.flatMap(r=>r.context))]},null,2));
function assert(test,message){if(!test)throw Error(message);}
for(const f of ['index.html','script.js','assets/css/bootstrap-talassa.css'])assert(crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')===plan.hashes[f],f+' changed');
let expected=before;
for(const block of plan.removed){assert(inline.replace(/\s+/g,' ').includes(block.text.replace(/\s+/g,' ')),'Missing inline definition');assert(expected.split(block.text).length===2,'Ambiguous removal');expected=expected.replace(block.text,'');}
assert(expected===after,'Unexpected change');
assert([before,after].includes(fs.readFileSync('styles.css','utf8')),'Working CSS differs from both audited versions');
for(const css of [before,after,inline,fs.readFileSync('assets/css/bootstrap-talassa.css','utf8')])sass.compileString(css,{syntax:'css',logger:sass.Logger.silent});
for(const name of ['talassa-button-sheen','talassa-button-sheen-auto']){assert(inline.includes('@keyframes '+name),'Missing keyframe');assert(after.includes('animation: '+name+' '),'Missing animation reference');}
const searches=Object.fromEntries(['index.html','script.js','styles.css','assets/css/bootstrap-talassa.css'].map(f=>{const text=fs.readFileSync(f,'utf8');return [f,Object.fromEntries(['montserrat-400.woff2','montserrat-600.woff2','cormorant-garamond-600.woff2','talassa-button-sheen','talassa-button-sheen-auto'].map(term=>[term,text.split('\n').flatMap((line,i)=>line.includes(term)?[i+1]:[])]))];}));
fs.writeFileSync('css-audit/final-search.json',JSON.stringify(searches,null,2));
console.log('PASS: CSS syntax, exact five-block diff, inline definitions, keyframe references, unchanged HTML/JS/Bootstrap.');
if(process.argv.includes('--apply')){
 const v=require('./validation.json');assert(v.results.length===60 && v.results.every(r=>r.differenceCount===0),'Computed styles differ');assert(Object.values(v.interaction).every(Boolean),'Interaction check failed');assert(fs.readFileSync('styles.css','utf8')===before,'Working CSS changed since audit');fs.writeFileSync('styles.css',after);console.log('Applied five-block cleanup.');
}
