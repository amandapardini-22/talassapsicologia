const fs = require('node:fs');
const CleanCSS = require('clean-css');
const sass = require('sass');

// Numeric level 0 disables both optimization levels, preserving declarations,
// selectors, order, media queries and values. Do not enable URL rebasing/imports.
const source = fs.readFileSync('styles.css', 'utf8');
// Custom properties expose their whitespace through CSSOM. Preserve their raw
// values too, using the minifier's supported ignore directives.
const start = '/* clean-css ignore:start */';
const end = '/* clean-css ignore:end */';
if (source.includes(start) || source.includes(end)) throw new Error('Review existing clean-css directives');
const protectedSource = source.replace(/(--[\w-]+\s*:[^;{}]+;?)/g, (_, declaration) => start + declaration + end);
const output = new CleanCSS({ level: 0, rebase: false, inline: false }).minify(protectedSource);
if (output.errors.length || output.warnings.length) {
  throw new Error([...output.errors, ...output.warnings].join('\n'));
}
if (!output.styles) throw new Error('Empty CSS output');
const minified = output.styles.replaceAll(start, '').replaceAll(end, '') + '\n';
// Sass parses both as plain CSS. Equal canonical output checks selectors,
// declaration order, fallbacks, media queries, URLs, fonts and keyframes.
const options = { syntax: 'css', style: 'compressed', logger: sass.Logger.silent };
const canonical = sass.compileString(minified, options).css;
if (sass.compileString(source, options).css !== canonical) {
  throw new Error('Canonical CSS changed; review before generating a candidate');
}
// The existing Sass CSS serializer removes ordinary comments without touching
// quoted strings, data URLs or raw custom-property values. No SCSS evaluation.
fs.writeFileSync('styles.min.css', canonical + '\n');
