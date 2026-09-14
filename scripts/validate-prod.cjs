// Chrome comparison of the real original/candidate pages; no production writes.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { createServer } = require('./preview-prod.cjs');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const assert = (value, message) => { if (!value) throw new Error(message); };
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const allDimensions = [[1440,900],[1920,1080],[768,1024],[820,1180],[1024,768],[1180,820],[320,568],[390,844],[844,390],[767,1024],[1025,768],[1199,820],[1200,820],[900,500],[900,501]];
const selectedViewport = process.argv.find(arg => arg.startsWith('--viewport='))?.split('=')[1];
const selectedMotion = process.argv.find(arg => arg.startsWith('--motion='))?.split('=')[1];
const diagnostic = !!(selectedViewport || selectedMotion);
const dimensions = selectedViewport ? allDimensions.filter(size => size.join('x') === selectedViewport) : allDimensions;
assert(dimensions.length && (!selectedMotion || ['reduce','no-preference'].includes(selectedMotion)), 'Invalid viewport/motion');
const reportFile = diagnostic ? 'docs/production-diagnostic.json' : 'docs/production-validation.json';

// This function executes in the browser, for both independently loaded versions.
async function preparePage() {
  await document.fonts.ready;
  document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
  await Promise.all([...document.images].map(image => image.decode()));
  if (!window.gsap || !window.ScrollTrigger) throw Error('Missing animation libraries');
  // Complete section entrances identically; snapshots do not compare animation clocks.
  for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
    scrollTo({ top: y, behavior: 'instant' });
    ScrollTrigger.update();
    // Let IntersectionObserver receive this viewport before scrolling again.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    gsap.globalTimeline.getChildren().forEach(animation => animation.totalProgress(1));
    document.getAnimations().forEach(animation => { try { animation.finish(); } catch {} });
  }
  gsap.globalTimeline.getChildren().forEach(animation => animation.totalProgress(1));
  gsap.globalTimeline.pause();
  gsap.ticker.sleep();
  clearInterval(processTimer);
  document.getAnimations().forEach(animation => { try { animation.finish(); } catch {} });
  const freeze = document.createElement('style');
  freeze.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}';
  document.head.append(freeze);
  scrollTo({ top: 0, behavior: 'instant' });
  updateHeader();
  processGrid.scrollLeft = 0;
  processIndex = 0;
  await new Promise(resolve => setTimeout(resolve, 180));
  window.productionSnapshot = async () => {
    const encoder = new TextEncoder();
    const digest = async text => [...new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(text)))].map(b => b.toString(16).padStart(2, '0')).join('');
    return Promise.all([...document.querySelectorAll('html,body,body *')].map(async element => {
      const values = ['', '::before', '::after'].map(pseudo => {
        const style = getComputedStyle(element, pseudo || null);
        return [...style].sort().map(property => property + ':' + style.getPropertyValue(property)).join('\n');
      });
      const hash = await digest(values.join('\n---pseudo---\n'));
      return window.productionDetails ? { hash, values, element: element.tagName + '.' + element.className } : hash;
    }));
  };
  return { images: document.images.length, fonts: document.fonts.status, elements: document.querySelectorAll('html,body,body *').length };
}

function interactionChecks() {
  const checks = {};
  const check = (name, result) => { checks[name] = !!result; };
  check('libraries', !!window.gsap && !!window.ScrollTrigger);
  document.querySelector('.menu-toggle').click();
  check('menuOpen', nav.classList.contains('open') && menuToggle.getAttribute('aria-expanded') === 'true');
  document.querySelector('.menu-toggle').click();
  check('menuClose', !nav.classList.contains('open') && menuToggle.getAttribute('aria-expanded') === 'false');
  const close = () => document.querySelector('.whatsapp-modal-close').click();
  document.querySelectorAll('.js-whatsapp').forEach((button, index) => {
    button.click();
    check('whatsapp-' + index, whatsappModal.classList.contains('open') && whatsappModal.getAttribute('aria-hidden') === 'false');
    close();
    check('close-' + index, !whatsappModal.classList.contains('open') && whatsappModal.getAttribute('aria-hidden') === 'true');
  });
  document.querySelector('.js-whatsapp').click();
  whatsappOverlay.click();
  check('overlay', !whatsappModal.classList.contains('open') && whatsappModal.getAttribute('aria-hidden') === 'true');
  document.querySelector('.js-whatsapp').click();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  check('escape', !whatsappModal.classList.contains('open') && whatsappModal.getAttribute('aria-hidden') === 'true');
  concernCards.forEach((card, index) => {
    const button = card.querySelector('button'), answer = card.querySelector('.concern-description');
    button.click();
    check('cardOpen-' + index, card.classList.contains('open') && button.getAttribute('aria-expanded') === 'true' && answer.getAttribute('aria-hidden') === 'false');
    button.click();
    check('cardClose-' + index, !card.classList.contains('open') && button.getAttribute('aria-expanded') === 'false' && answer.getAttribute('aria-hidden') === 'true');
  });
  faqItems.forEach((item, index) => {
    const button = item.querySelector('button'), answer = item.querySelector(':scope > div');
    button.click();
    check('faqOpen-' + index, item.classList.contains('open') && button.getAttribute('aria-expanded') === 'true' && answer.getAttribute('aria-hidden') === 'false' && button.getAttribute('aria-controls') === answer.id);
    button.click();
    check('faqClose-' + index, !item.classList.contains('open') && button.getAttribute('aria-expanded') === 'false' && answer.getAttribute('aria-hidden') === 'true');
  });
  processIndex = 0;
  processNext.click();
  check('processNext', processIndex === 1);
  processPrev.click();
  check('processPrevious', processIndex === 0);
  clearInterval(processTimer);
  processGrid.scrollLeft = 0;
  check('whatsappDestinations', carolLink.href.includes('wa.me/551140407979?text=') && carolinaLink.href.includes('wa.me/5511913678621?text='));
  return checks;
}

async function compareComputedSnapshots(reference, capture) {
  const differencesFrom = snapshot => Array.from(
    { length: Math.max(reference.length, snapshot.length) }, (_, index) => index
  ).filter(index => {
    if (index >= reference.length || index >= snapshot.length) return true;
    return (snapshot[index].hash || snapshot[index]) !== (reference[index].hash || reference[index]);
  });
  let snapshot = await capture();
  const initialDifferences = differencesFrom(snapshot);
  let differences = initialDifferences;
  // Retry only a mismatching state, once, against the unchanged source snapshot.
  // The caller lets pending frame callbacks settle without replaying interactions,
  // navigating, or repeating other states/viewports. There is NO style tolerance:
  // every element/pseudo-element hash must match on retry, including element count.
  // Any remaining difference (even at a different index) still fails the case.
  // Keep the first mismatch in the report so a transient is never silently hidden.
  if (initialDifferences.length) {
    snapshot = await capture();
    differences = differencesFrom(snapshot);
  }
  return { snapshot, differences, initialDifferences, revalidated: initialDifferences.length > 0 };
}

async function main() {
  const root = path.resolve(__dirname, '..');
  process.chdir(root);
  const protectedFiles = ['index.html','privacidade.html','styles.css','styles.min.css','script.js','script.min.js','assets/css/bootstrap-talassa.css','assets/css/bootstrap-talassa.min.css','assets/js/gsap.min.js','assets/js/ScrollTrigger.min.js'];
  const before = Object.fromEntries(protectedFiles.map(file => [file, hash(file)]));
  const artifacts = fs.mkdtempSync(path.join(os.tmpdir(), 'talassa-production-'));
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const chrome = spawn(chromePath, ['--headless=new','--no-first-run','--hide-scrollbars','--remote-debugging-port=0','--user-data-dir=' + path.join(artifacts,'profile'),'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let launchError;
  chrome.on('error', error => { launchError = error; });
  let ws, call;
  const result = { diagnostic, protectedHashes: before, artifacts, dimensions, cases: [], screenshots: [], interactions: [], errors: [], networkErrors: [] };
  try {
    const portFile = path.join(artifacts, 'profile', 'DevToolsActivePort');
    for (let attempt = 0; attempt < 100 && !fs.existsSync(portFile); attempt++) { if (launchError) throw launchError; await delay(100); }
    assert(fs.existsSync(portFile), 'Chrome did not start');
    const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
    const pages = await (await fetch('http://127.0.0.1:' + port + '/json', { signal: AbortSignal.timeout(5000) })).json();
    ws = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
    await new Promise(resolve => { ws.onopen = resolve; });
    let id = 0, current = '';
    const pending = new Map();
    ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const task = pending.get(message.id);
        if (task) { pending.delete(message.id); message.error ? task.reject(Error(JSON.stringify(message.error))) : task.resolve(message.result); }
      } else if (message.method === 'Runtime.exceptionThrown' || (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error')) result.errors.push({ current, ...message });
      else if (message.method === 'Network.loadingFailed' || (message.method === 'Network.responseReceived' && message.params.response.status >= 400)) result.networkErrors.push({ current, ...message });
    };
    ws.onclose = () => { for (const task of pending.values()) task.reject(Error('Chrome connection closed')); pending.clear(); };
    call = (method, params = {}) => new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(requestId); reject(Error('Chrome timeout: ' + method + ' at ' + current)); }, 45000);
      const requestId = ++id;
      pending.set(requestId, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
      ws.send(JSON.stringify({ id: requestId, method, params }));
    });
    const evaluate = async expression => {
      const value = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (value.exceptionDetails) throw Error(JSON.stringify(value.exceptionDetails));
      return value.result.value;
    };
    await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
    await call('Network.setCacheDisabled', { cacheDisabled: true });
    await call('Emulation.setFocusEmulationEnabled', { enabled: true });
    const key = async (key, code, modifiers = 0) => {
      for (const type of ['keyDown', 'keyUp']) await call('Input.dispatchKeyEvent', { type, key, code: key, windowsVirtualKeyCode: code, modifiers });
    };
    assert(await (await fetch(base + '/')).text() === fs.readFileSync('index.html', 'utf8'), 'Default preview differs from production');
    result.browser = await call('Browser.getVersion');
    for (const [width, height] of dimensions) {
      for (const motion of selectedMotion ? [selectedMotion] : ['reduce','no-preference']) {
        const baseline = {};
        let baselineChecks;
        for (const minified of [false,true]) {
          current = `${width}x${height}/${motion}/${minified ? 'minified' : 'original'}`;
          console.log('Loading ' + current);
          await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
          await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: motion }] });
          await call('Page.navigate', { url: base + '/?minified=' + (minified ? '1' : '0') });
          for (let attempt = 0; attempt < 100; attempt++) {
            if (await evaluate('document.readyState === "complete" && typeof setupProcessCarousel === "function"')) break;
            await delay(100);
          }
          await evaluate('(' + preparePage.toString() + ')()');
          if (diagnostic) await evaluate('window.productionDetails = true');
          if (width === 1440 && motion === 'reduce' && !minified) {
            result.cssom = await evaluate(`(async()=>{const sheets=await Promise.all(['styles.css','styles.min.css'].map(async file=>{const sheet=new CSSStyleSheet();sheet.replaceSync(await(await fetch(file)).text());return [...sheet.cssRules].map(rule=>rule.cssText)}));return {rules:sheets[0].length,minifiedRules:sheets[1].length,identical:JSON.stringify(sheets[0])===JSON.stringify(sheets[1]),differences:sheets[0].flatMap((rule,i)=>rule===sheets[1][i]?[]:[{i,original:rule,minified:sheets[1][i]}]).slice(0,2)}})()`);
            // CSSOM preserves unresolved var() spelling (.06 versus 0.06).
            // The build compares canonical values; here also check rule and
            // property order without treating equivalent numeric spelling as a failure.
            result.cssom.structureIdentical = await evaluate(`(async()=>{function shape(rules){return [...rules].map(r=>({type:r.type,selector:r.selectorText,condition:r.conditionText,name:r.name,key:r.keyText,properties:r.style?[...r.style].map(p=>[p,r.style.getPropertyPriority(p),p.startsWith('--')?r.style.getPropertyValue(p):null]):null,children:r.cssRules?shape(r.cssRules):null}))}const sheets=await Promise.all(['styles.css','styles.min.css'].map(async file=>{const sheet=new CSSStyleSheet();sheet.replaceSync(await(await fetch(file)).text());return shape(sheet.cssRules)}));return JSON.stringify(sheets[0])===JSON.stringify(sheets[1])})()`);
            assert(result.cssom.structureIdentical, 'CSSOM rule/property order or custom properties changed');
          }
          const loaded = await evaluate('[...document.querySelectorAll("link[rel=stylesheet],script[src]")].map(e=>e.getAttribute("href")||e.getAttribute("src"))');
          assert(loaded.includes('assets/js/gsap.min.js') && loaded.includes('assets/js/ScrollTrigger.min.js'), 'Missing production libraries');
          assert(loaded.includes(minified ? 'styles.min.css' : 'styles.css') && loaded.includes(minified ? 'script.min.js' : 'script.js') && loaded.includes('assets/css/bootstrap-talassa' + (minified ? '.min' : '') + '.css'), 'Wrong preview references');
          const checks = await evaluate('(' + interactionChecks.toString() + ')()');
          assert(Object.values(checks).every(Boolean), current + ': interaction failure ' + JSON.stringify(checks));
          if (!minified) baselineChecks = checks;
          else assert(JSON.stringify(checks) === JSON.stringify(baselineChecks), 'Interaction mismatch');
          result.interactions.push({ current, checks });
          {
            // Native keyboard events exercise browser tab order, including both boundaries.
            await evaluate(`document.querySelector('[data-tracking-id="hero_agendar"]').click()`);
            await delay(80);
            assert(await evaluate('document.activeElement === whatsappClose && !whatsappModal.inert'), current + ': initial modal focus / inert');
            for (const [modifiers, expected] of [[8,'carolinaLink'],[8,'carolLink'],[8,'whatsappClose'],[0,'carolLink'],[0,'carolinaLink'],[0,'whatsappClose']]) {
              await key('Tab', 9, modifiers);
              assert(await evaluate('document.activeElement === ' + expected), current + ': modal Tab boundary');
            }
            await evaluate('lastWhatsappTrigger.focus()');
            assert(await evaluate('whatsappModal.contains(document.activeElement)'), current + ': background focus guard');
            await key('Escape', 27);
            assert(await evaluate('!whatsappModal.classList.contains("open") && whatsappModal.inert && document.activeElement === lastWhatsappTrigger'), current + ': Escape / focus return');
            for (const closeControl of ['whatsappClose', 'whatsappOverlay']) {
              await evaluate(`document.querySelector('[data-tracking-id="hero_agendar"]').click()`);
              await delay(80);
              await evaluate(closeControl + '.click()');
              assert(await evaluate('!whatsappModal.classList.contains("open") && whatsappModal.inert && document.activeElement === lastWhatsappTrigger'), current + ': ' + closeControl + ' / focus return');
            }
            const tracking = await evaluate(`(()=>{
              const ids=['header_agendar','hero_agendar','next_step_agendar','final_cta_agendar','footer_contact_whatsapp','footer_agendar'];
              const buttons=[...whatsappButtons];
              if(JSON.stringify(buttons.map(b=>b.dataset.trackingId).sort())!==JSON.stringify(ids.sort()))return false;
              for(const button of buttons){
                const start=window.dataLayer.length;button.click();
                for(const link of [carolLink,carolinaLink]){
                  link.addEventListener('click',event=>event.preventDefault(),{once:true});link.click();
                }
                const events=window.dataLayer.slice(start);
                if(events.length!==3||events[0].event!=='whatsapp_modal_open'||events[1].event!=='whatsapp_psychologist_click'||events[2].event!=='whatsapp_psychologist_click'||events[1].psychologist!=='carol_lobo'||events[2].psychologist!=='carolina_barbosa'||events.some(e=>e.cta_id!==button.dataset.trackingId))return false;
                whatsappClose.click();
                // This loop also dispatches synthetic clicks to the hidden mobile
                // header CTA. Focus return is checked above with the visible hero.
                if(window.dataLayer.length!==start+3||!whatsappModal.inert)return false;
              }return true;
            })()`);
            assert(tracking, current + ': tracking count / identifiers');
            result.interactions[result.interactions.length-1].keyboardAndTracking = true;
          }
          if (width === 390) {
            const autoplay = await evaluate(`(async()=>{processGrid.scrollLeft=0;processIndex=0;startProcessCarousel();await new Promise(r=>setTimeout(r,6300));clearInterval(processTimer);const index=processIndex;processGrid.scrollLeft=0;await new Promise(r=>setTimeout(r,200));return {index,reduced:reduceMotion.matches,valid:reduceMotion.matches?index===0:index===1}})()`);
            assert(autoplay.valid, current + ': autoplay / reduced motion');
            result.interactions[result.interactions.length-1].autoplay = autoplay;
          }
          // Exercise actual scroll listener (including the 120ms debounce).
          const carousel = await evaluate(`(async()=>{clearInterval(processTimer);processGrid.scrollLeft=processSteps[1].offsetLeft;await new Promise(r=>setTimeout(r,220));const expected=[...processSteps].map((s,i)=>({i,d:Math.abs(processGrid.scrollLeft-s.offsetLeft)})).sort((a,b)=>a.d-b.d)[0].i;const valid=processIndex===expected;processGrid.scrollLeft=0;await new Promise(r=>setTimeout(r,220));return valid})()`);
          assert(carousel, current + ': carousel scroll listener');
          const states = ['closed','scrolled',...(width < 1200 ? ['menu'] : []),'open','keyboard',...(width >= 1025 ? ['hover'] : [])];
          for (const state of states) {
            await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: width - 1, y: height - 1 });
            await evaluate(`(()=>{closeWhatsappModal();closeMobileMenu();document.querySelectorAll('.concern-card.open .concern-trigger,.faq-item.open button').forEach(b=>b.click());document.activeElement?.blur();scrollTo({top:${state === 'closed' ? 0 : 80},behavior:'instant'});if(${JSON.stringify(state)}==='menu')menuToggle.click();if(${JSON.stringify(state)}==='open'){document.querySelector('.concern-trigger').click();document.querySelector('.faq-item button').click();document.querySelector('.js-whatsapp').click();}clearInterval(processTimer);processGrid.scrollLeft=0;})()`);
            await delay(80);
            // A scroll can start a Web Animations reveal after preparePage.
            // Finish it and allow its onfinish cleanup before comparing clocks.
            await evaluate(`(async()=>{for(let i=0;i<2;i++){document.getAnimations().forEach(a=>{try{a.finish()}catch{}});await new Promise(r=>requestAnimationFrame(r));}await new Promise(r=>requestAnimationFrame(r));})()`);
            assert(await evaluate(`document.querySelector('.site-header').classList.contains('scrolled')===${state !== 'closed'}`), 'Header scroll state');
            if (state === 'keyboard') {
              await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
              await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
              await evaluate(`document.querySelector(${JSON.stringify(width < 1200 ? '.menu-toggle' : '.main-nav .js-whatsapp')}).focus({preventScroll:true})`);
              assert(await evaluate('document.activeElement.matches(":focus-visible")'), 'Keyboard focus not active');
            }
            if (state === 'hover') {
              const point = await evaluate('(()=>{const r=document.querySelector(".hero .btn").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()');
              await call('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
              assert(await evaluate('document.querySelector(".hero .btn").matches(":hover")'), 'Hover not active');
            }
            if (!minified) baseline[state] = await evaluate('productionSnapshot()');
            else {
              let captures = 0;
              const { snapshot, differences, initialDifferences, revalidated } = await compareComputedSnapshots(baseline[state], async () => {
                if (captures++) {
                  console.log(current + '/' + state + ': rechecking computed snapshot once');
                  await evaluate(`new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))`);
                }
                return evaluate('productionSnapshot()');
              });
              const details = diagnostic ? differences.slice(0,5).map(index => {
                const original = baseline[state][index], candidate = snapshot[index];
                if (!original || !candidate) return { index, original: original?.element, minified: candidate?.element, elementCountMismatch: true };
                return { element: candidate.element, changes: candidate.values.flatMap((value,pseudo)=>value.split('\n').flatMap((line,i)=>line===original.values[pseudo].split('\n')[i]?[]:[{pseudo,original:original.values[pseudo].split('\n')[i],minified:line}])) };
              }) : undefined;
              const revalidation = revalidated ? { initialDifferentElements: initialDifferences.length, initialSamples: initialDifferences.slice(0,10), repeatedDifferentElements: differences.length, transient: differences.length === 0 } : undefined;
              result.cases.push({ width, height, motion, state, elements: snapshot.length, differentElements: differences.length, samples: differences.slice(0,10), details, revalidation });
            }
            if (motion === 'reduce' && (state === 'closed' || state === 'menu' && [390,768,844].includes(width))) {
              const layout = await call('Page.getLayoutMetrics');
              const screenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: layout.cssContentSize.width, height: layout.cssContentSize.height, scale: 1 } });
              const key = width + 'x' + height + '-' + state;
              fs.writeFileSync(path.join(artifacts, key + (minified ? '-minified.png' : '-original.png')), Buffer.from(screenshot.data, 'base64'));
              if (!minified) baseline[key] = screenshot.data;
              else {
                let comparison = {
                  differentPixels: 0,
                  meaningfulPixels: 0,
                  relevantPixels: 0,
                  width: Buffer.from(screenshot.data, 'base64').readUInt32BE(16),
                  height: Buffer.from(screenshot.data, 'base64').readUInt32BE(20),
                  totalPixels: Buffer.from(screenshot.data, 'base64').readUInt32BE(16) * Buffer.from(screenshot.data, 'base64').readUInt32BE(20),
                  maxChannelDifference: 0,
                };

                if (baseline[key] !== screenshot.data) {
                  comparison = await evaluate(`(async()=>{
                    async function read(data){
                      const image = new Image();
                      image.src = 'data:image/png;base64,' + data;
                      await image.decode();

                      const canvas = document.createElement('canvas');
                      canvas.width = image.width;
                      canvas.height = image.height;

                      const context = canvas.getContext('2d');
                      context.drawImage(image, 0, 0);

                      return {
                        width: image.width,
                        height: image.height,
                        pixels: context.getImageData(
                          0,
                          0,
                          image.width,
                          image.height
                        ).data
                      };
                    }

                    const original = await read(${JSON.stringify(baseline[key])});
                    const minified = await read(${JSON.stringify(screenshot.data)});

                    if (
                      original.width !== minified.width ||
                      original.height !== minified.height
                    ) {
                      return {
                        differentPixels: -1,
                        meaningfulPixels: -1,
                        relevantPixels: -1,
                        totalPixels: 0,
                        maxChannelDifference: 255
                      };
                    }

                    let differentPixels = 0;
                    let meaningfulPixels = 0;
                    let relevantPixels = 0;
                    let maxChannelDifference = 0;

                    const totalPixels =
                      original.width * original.height;

                    /*
                    * Diferenças de até 1 nível RGB são consideradas
                    * ruído de rasterização/antialiasing do navegador.
                    */
                    const channelTolerance = 1;
                    // Independent Chrome renders differed chiefly in resampled photos:
                    // 1440x900 had 3081 pixels above 1, but only 117 above 4;
                    // repeating that viewport reduced the above-1 count to 110.
                    // Retain the raw/above-1 diagnostics. For the visual gate ignore
                    // at most 4/255 per channel (1.57%), and still allow only 0.01%
                    // of the full image above that threshold. No spatial alignment,
                    // resizing, image masking, or computed-style tolerance is used.
                    const visualChannelTolerance = 4;

                    for (
                      let index = 0;
                      index < original.pixels.length;
                      index += 4
                    ) {
                      const redDifference =
                        Math.abs(
                          original.pixels[index] -
                          minified.pixels[index]
                        );

                      const greenDifference =
                        Math.abs(
                          original.pixels[index + 1] -
                          minified.pixels[index + 1]
                        );

                      const blueDifference =
                        Math.abs(
                          original.pixels[index + 2] -
                          minified.pixels[index + 2]
                        );

                      const alphaDifference =
                        Math.abs(
                          original.pixels[index + 3] -
                          minified.pixels[index + 3]
                        );

                      const pixelDifference = Math.max(
                        redDifference,
                        greenDifference,
                        blueDifference,
                        alphaDifference
                      );

                      if (pixelDifference > 0) {
                        differentPixels++;
                      }

                      if (pixelDifference > channelTolerance) {
                        meaningfulPixels++;
                      }
                      if (pixelDifference > visualChannelTolerance) relevantPixels++;

                      if (pixelDifference > maxChannelDifference) {
                        maxChannelDifference = pixelDifference;
                      }
                    }

                    return {
                      differentPixels,
                      meaningfulPixels,
                      relevantPixels,
                      width: original.width,
                      height: original.height,
                      totalPixels,
                      maxChannelDifference
                    };
                  })()`);
                }

                result.screenshots.push({
                  key,
                  ...comparison
                });
              }
            }
          }
        }
        console.log(`${width}x${height} ${motion}: ${result.cases.filter(c=>c.width===width&&c.height===height&&c.motion===motion).reduce((n,c)=>n+c.differentElements,0)} computed differences`);
      }
    }
    result.privacy = [];
    for (const [width, height] of dimensions) {
      current = `privacidade/${width}x${height}`;
      await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
      await call('Page.navigate', { url: base + '/privacidade.html' });
      for (let attempt = 0; attempt < 100; attempt++) {
        if (await evaluate('document.readyState === "complete" && location.pathname === "/privacidade.html"')) break;
        await delay(100);
      }
      const checks = await evaluate(`(async()=>{
        await document.fonts.ready;
        const checks={rgbNavy:getComputedStyle(document.documentElement).getPropertyValue('--rgb-navy').trim()==='44, 47, 81',noOverflow:document.documentElement.scrollWidth<=innerWidth};
        const header=document.querySelector('.site-header');
        scrollTo({top:0,behavior:'instant'});
        await new Promise(r=>setTimeout(r,450));
        checks.headerTop=getComputedStyle(header).backgroundColor==='rgba(0, 0, 0, 0)'&&!header.classList.contains('scrolled');
        const back=document.querySelector('.back-link');
        const rect=back.getBoundingClientRect();
        checks.backVisible=getComputedStyle(back).visibility==='visible'&&rect.width>0&&rect.height>0&&rect.left>=0&&rect.right<=innerWidth;
        const home=getComputedStyle(document.querySelector('.privacy-back-home'));
        checks.homeLink=home.display==='block'&&home.color==='rgb(56, 127, 136)';
        const background=getComputedStyle(document.querySelector('.privacy-content')).backgroundImage;
        checks.background=innerWidth<=767?background.includes('fundo-faq-mobile.webp'):background.includes('fundo-psicologas.webp')&&!background.includes('fundo-faq-mobile.webp');
        scrollTo({top:100,behavior:'instant'});
        await new Promise(r=>setTimeout(r,450));
        checks.headerScrolled=header.classList.contains('scrolled')&&getComputedStyle(header).backgroundColor==='rgba(236, 228, 208, 0.96)';
        const buttons=[...document.querySelectorAll('.privacy-item button')];
        checks.accordions=buttons.length===11&&buttons.every(button=>{button.click();const opened=button.getAttribute('aria-expanded')==='true';button.click();return opened&&button.getAttribute('aria-expanded')==='false'});
        checks.localLinks=[...document.querySelectorAll('a[href]')].filter(a=>a.origin===location.origin).every(a=>a.pathname.endsWith('/index.html')||a.pathname===location.pathname);
        return checks;
      })()`);
      assert(Object.values(checks).every(Boolean), current + ': ' + JSON.stringify(checks));
      result.privacy.push({ width, height, checks });
    }
    for (const file of protectedFiles) assert(hash(file) === before[file], 'Protected file changed: ' + file);
    const screenshotToleranceRatio = 0.0001; // 0,01%

result.passed =
  result.cases.every(
    caseResult =>
      caseResult.differentElements === 0
  ) &&
  result.screenshots.every(
    screenshotResult => {
      if (
        !Number.isInteger(screenshotResult.relevantPixels) ||
        screenshotResult.relevantPixels < 0 ||
        screenshotResult.totalPixels <= 0
      ) {
        return false;
      }

      const meaningfulRatio =
        screenshotResult.relevantPixels /
        screenshotResult.totalPixels;

      return (
        meaningfulRatio <=
        screenshotToleranceRatio
      );
    }
  ) &&
  result.interactions.every(item => Object.values(item.checks).every(Boolean) && item.keyboardAndTracking === true) &&
  result.privacy.every(item => Object.values(item.checks).every(Boolean)) &&
  (!result.cssom || result.cssom.structureIdentical) &&
  !result.errors.length &&
  !result.networkErrors.length;
    fs.mkdirSync('docs', { recursive: true });
    fs.writeFileSync(reportFile, JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ passed: result.passed, cases: result.cases.length, screenshots: result.screenshots.length, errors: result.errors.length, networkErrors: result.networkErrors.length, artifacts }));
    assert(result.passed, 'Production comparison failed; see ' + reportFile);
  } catch (error) {
    result.passed = false;
    result.failure = error.message;
    fs.mkdirSync('docs', { recursive: true });
    fs.writeFileSync(reportFile, JSON.stringify(result, null, 2) + '\n');
    throw error;
  } finally {
    if (call && ws?.readyState === WebSocket.OPEN) { try { await call('Browser.close'); } catch {} }
    if (ws) ws.close();
    chrome.kill(); server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
