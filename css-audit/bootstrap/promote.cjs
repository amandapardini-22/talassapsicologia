// Registro reproduzível da promoção aprovada. Executar a partir da raiz.
const fs=require('fs'),sass=require('sass'),crypto=require('crypto'),zlib=require('zlib');
const before=require('./promotion-before.json');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
for(const [file,value] of Object.entries(before.hashes))if(file!=='index.html' && hash(file)!==value)throw Error('Protected file changed: '+file);
const expectedHtml=before.indexBefore.replace('href="assets/css/bootstrap-talassa-candidate.css"','href="assets/css/bootstrap-talassa.css"');
if(fs.readFileSync('index.html','utf8')!==expectedHtml)throw Error('Unexpected HTML change');
const options={logger:sass.Logger.silent};
const candidate=fs.readFileSync('assets/css/bootstrap-talassa-candidate.css','utf8');
const approved=sass.compile('scss/bootstrap-talassa-candidate.scss',{...options,style:'expanded'}).css+'\n';
const official=sass.compile('scss/bootstrap-talassa.scss',{...options,style:'expanded'}).css+'\n';
if(candidate!==approved || official!==candidate)throw Error('SCSS output differs from approved candidate');
fs.writeFileSync('assets/css/bootstrap-talassa.css',official);
const compressed=sass.compile('scss/bootstrap-talassa.scss',{...options,style:'compressed'}).css+'\n';
const approvedCompressed=sass.compile('scss/bootstrap-talassa-candidate.scss',{...options,style:'compressed'}).css+'\n';
if(compressed!==approvedCompressed)throw Error('Compressed build differs');
fs.writeFileSync('assets/css/bootstrap-talassa.min.css',compressed);
// The approved CSS contains only style rules and media wrappers (no keyframes).
const rules=(official.match(/[^{}]+\{[^{}]*\}/g)||[]).length;
if(rules!==186)throw Error('Unexpected rule count');
const result={officialBytes:Buffer.byteLength(official),officialGzipBytes:zlib.gzipSync(official).length,rules,officialEqualsCandidate:true,officialSha256:hash('assets/css/bootstrap-talassa.css'),candidateSha256:hash('assets/css/bootstrap-talassa-candidate.css'),compressedBytes:Buffer.byteLength(compressed),compressedEqualsApprovedBuild:true,protectedFilesUnchanged:true,htmlOnlyRestoredOfficialHref:true};
fs.writeFileSync('css-audit/bootstrap/promotion.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
