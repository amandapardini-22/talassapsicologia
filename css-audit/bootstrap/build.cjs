// Rebuild only the candidate; verify that the existing entrypoint is unchanged.
const fs=require('fs'),sass=require('sass'),crypto=require('crypto');
const dir='css-audit/bootstrap';
const baseline=JSON.parse(fs.readFileSync(dir+'/baseline-hashes.json','utf8'));
for(const file of ['index.html','styles.css','script.js','assets/css/bootstrap-talassa.css','assets/css/bootstrap-talassa.min.css','package.json','package-lock.json']){
 if(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==baseline[file])throw Error('Protected file changed: '+file);
}
const warnings=[];
const options={style:'expanded',logger:{warn:(message,details)=>warnings.push({message,deprecation:details.deprecation}),debug:()=>{}}};
const current=sass.compile('scss/bootstrap-talassa.scss',options).css+'\n';
if(current!==fs.readFileSync('assets/css/bootstrap-talassa.css','utf8'))throw Error('Existing SCSS build no longer reproduces current CSS');
const candidate=sass.compile('scss/bootstrap-talassa-candidate.scss',options).css+'\n';
sass.compileString(candidate,{syntax:'css',logger:sass.Logger.silent});
fs.writeFileSync('assets/css/bootstrap-talassa-candidate.css',candidate);
fs.writeFileSync(dir+'/build.json',JSON.stringify({bootstrap:require('bootstrap/package.json').version,sass:sass.info,baselineBuildIdentical:true,candidateBytes:Buffer.byteLength(candidate),warnings:[...new Set(warnings.map(w=>w.message))]},null,2));
console.log('Candidate compiled; baseline build identical; protected files unchanged. Bytes:',Buffer.byteLength(candidate));
