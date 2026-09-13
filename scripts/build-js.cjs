// Formatting only: preserve identifiers, scopes, expressions and event order.
const fs = require('node:fs');
const { minify } = require('terser');

async function main() {
  const source = fs.readFileSync('script.js', 'utf8');
  const options = { compress: false, mangle: false, format: { comments: /^!|@preserve|@license|@cc_on/i } };
  const result = await minify(source, options);
  if (!result.code) throw new Error('Empty JavaScript output');
  const canonical = { ...options, format: { beautify: true, comments: false } };
  const before = await minify(source, canonical);
  const after = await minify(result.code, canonical);
  if (before.code !== after.code) throw new Error('JavaScript structure changed');
  fs.writeFileSync('script.min.js', result.code + '\n');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
