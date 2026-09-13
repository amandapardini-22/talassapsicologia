const fs=require('fs'),crypto=require('crypto'),sass=require('sass');
const dir='css-audit/bootstrap';
const inventory=require('./inventory.json');
const baseline=require('../inventory.json').sheets[0].rules;
function assert(test,message){if(!test)throw Error(message);}
const hashes=require('./baseline-hashes.json');
for(const [file,hash] of Object.entries(hashes))if(file!=='scss/bootstrap-talassa.scss')assert(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')===hash,'Protected file changed: '+file);
const options={style:'expanded',logger:sass.Logger.silent};
for(const [entry,css] of [['scss/bootstrap-talassa.scss','assets/css/bootstrap-talassa.css'],['scss/bootstrap-talassa-candidate.scss','assets/css/bootstrap-talassa-candidate.css']])assert(sass.compile(entry,options).css+'\n'===fs.readFileSync(css,'utf8'),'Build differs: '+entry);
const key=r=>JSON.stringify([r.context,r.css]);let last=-1;
for(const r of inventory.kept){const i=baseline.findIndex(b=>key(b)===key(r));assert(i>last,'Rule differs or relative order changed: '+r.selector);last=i;}
assert(inventory.changed.length===0,'Changed declarations');
assert(inventory.bootstrapClasses.length===26,'Unexpected necessary class count');
const main=require('./validation.json'),menu=require('./menu-validation.json');
assert(main.results.length===45 && menu.results.length===24,'Incomplete viewport/state matrix');
for(const run of [main,menu]){
 assert(run.errors.length===0,'Browser JS error');
 assert(run.results.every(r=>r.differentElements===0 && r.removedMatchingSelectors.length===0),'Computed styles or removed selector check failed');
 assert(run.screenshots.every(r=>r.differentPixels===0),'Pixel comparison failed');
 assert(run.interactions.every(r=>r.escape && r.overlay && r.close),'Modal interaction check failed');
}
assert(main.results.filter(r=>r.state==='keyboard').every(r=>r.focusVisible),'Keyboard focus not exercised');
assert(main.results.filter(r=>r.state!=='closed').every(r=>r.openModal && r.scrolled),'Modal/scroll states not exercised');
assert(menu.results.every(r=>r.openMenu && r.scrolled===(r.state==='menu-scrolled')),'Menu states not exercised');
assert(main.screenshots.length===15 && menu.screenshots.length===3,'Missing screenshots');
const result={protectedFilesUnchanged:true,baselineBuildIdentical:true,candidateBuildIdentical:true,unchangedRulesInOriginalOrder:inventory.kept.length,necessaryBootstrapClasses:inventory.bootstrapClasses,computedStyleCases:main.results.length+menu.results.length,screenshotPairs:main.screenshots.length+menu.screenshots.length,differentComputedElementPseudoPairs:0,differentPixels:0,browserErrors:0};
fs.writeFileSync(dir+'/verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
