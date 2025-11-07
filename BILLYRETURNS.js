const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const sr = audioCtx.sampleRate;
const bufferSize = 4096;
let t = 0;

const node = audioCtx.createScriptProcessor(bufferSize, 0, 1);

const crushFactor = 8;     // Higher = lower sample rate (bitcrush)
const bitDepth = 2;        // Lower = more quantized (bitcrush)
const levels = Math.pow(2, bitDepth);

let lastSample = 0;
let crushCounter = 0;

node.onaudioprocess = e => {
  const out = e.outputBuffer.getChannelData(0);
  for (let i = 0; i < out.length; i++) {
    if (crushCounter % crushFactor === 0) {
      // Bytebeat formula
      const tt = Math.floor((t * 8000) / sr);
      const idx = (tt >> (((tt * (tt / 50)) >> (tt / 50)) & 7)) % 2;
      const val = Math.random() * ("10"[idx] || 0) * 256;
      let sample = (val - 128) / 128;

      // Quantize (reduce bit depth)
      sample = Math.round(sample * levels) / levels;

      lastSample = sample;
      t++;
    }

    out[i] = lastSample;
    crushCounter++;
  }
};

function randomizeWords(text) {
  const words = text.split(/\s+/);
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words.join(' ');
}

function randomizeAllText(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const texts = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const trimmed = node.nodeValue.trim();
    if (trimmed.length > 1) texts.push(node);
  }
  for (const node of texts) {
    node.nodeValue = randomizeWords(node.nodeValue);
  }
}
function getAllTextNodes(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeValue.trim().length > 0) nodes.push(node);
  }
  return nodes;
}

let nodes = getAllTextNodes();

// Watch for new text nodes appearing
const observer = new MutationObserver(() => {
  nodes = getAllTextNodes();
});
observer.observe(document.body, { childList: true, subtree: true, characterData: true });

function randomSwapLoop() {
  if (nodes.length < 2) return;

  const texts = nodes.map(n => n.nodeValue);

  // Random pair swaps
  for (let i = 0; i < texts.length; i++) {
    const j = Math.floor(Math.random() * texts.length);
    [texts[i], texts[j]] = [texts[j], texts[i]];
  }

  // Apply new randomized text values
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].nodeValue = texts[i];
  }

  requestAnimationFrame(randomSwapLoop);
}

function randomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

function randomizeColors() {
  const allElements = document.querySelectorAll("*");
  allElements.forEach(el => {
    const style = window.getComputedStyle(el);
    const hasTextColor = style.color !== "rgba(0, 0, 0, 0)";
    const hasBgColor = style.backgroundColor !== "rgba(0, 0, 0, 0)" && style.backgroundColor !== "transparent";

    if (hasTextColor) el.style.color = randomColor();
    if (hasBgColor) el.style.backgroundColor = randomColor();
  });
}

// Randomize every 0.5 seconds (adjust as you like)

(() => {
  const moveIntervalMs = 25;    // Move originals every 25 ms
  
  // Move originals
  setInterval(() => {
    document.querySelectorAll('[draggable="true"]:not([data-clone])').forEach(el => {
      el.style.position = 'absolute';
      el.style.left = `${rnd(0, window.innerWidth - el.offsetWidth)}px`;
      el.style.top = `${rnd(0, window.innerHeight - el.offsetHeight)}px`;
    });
  }, moveIntervalMs);
})();
// Random Theme/Wallpaper utility - Global Scope Edition

// Helper: random int in [0, n)
const rndInt = n => Math.floor(Math.random() * n);

// Find the theme manager: search window properties for an object exposing expected API
function findThemeManager() {
        for (const k in window) {
                try {
                        const obj = window[k];
                        if (!obj || typeof obj !== 'object') continue;
                        // identify by some of the expected methods
                        const has = name => typeof obj[name] === 'function';
                        if (has('getThemesData') && has('changeTheme') && has('getWallpapers')) {
                                return {
                                        manager: obj
                                        , propName: k
                                };
                        }
                } catch (e) {
                        /* ignore properties that throw */ }
        }
        return null;
}

// Pick random item from object keys
const pickRandomKey = (obj) => {
        const keys = Object.keys(obj || {});
        if (!keys.length) return null;
        return keys[rndInt(keys.length)];
};

// Pick random wallpaper row from wallpaper array that themehandler.getWallpapers() returns
function pickRandomWallpaper(wallpapers) {
        if (!Array.isArray(wallpapers) || wallpapers.length === 0) return null;
        const row = wallpapers[rndInt(wallpapers.length)];
        // handle both [label, ext, path] and object shapes gracefully
        if (Array.isArray(row)) {
                // prefer index 2 then 0
                return row[2] || row[0] || null;
        } else if (typeof row === 'string') {
                return row;
        } else if (row && typeof row === 'object') {
                return row.path || row.file || row[2] || row[0] || null;
        }
        return null;
}

// Safe wrapper for calling changeTheme/changeWallpaper
async function applyTheme(manager, themeKey, schemeKey) {
        try {
                if (typeof manager.changeTheme === 'function') {
                        await manager.changeTheme(themeKey, schemeKey);
                        // console.log('[randomizeTheme] applied theme', themeKey, schemeKey || '');
                } else {
                        // console.warn('[randomizeTheme] manager has no changeTheme function');
                }
        } catch (err) {
                // console.error('[randomizeTheme] changeTheme failed:', err);
        }
}

async function applyWallpaper(manager, wallpaperPath, layout = 'center', fallbackColor = null) {
        try {
                if (typeof manager.changeWallpaper === 'function') {
                        await manager.changeWallpaper(wallpaperPath, layout, fallbackColor);
                        // console.log('[randomizeTheme] applied wallpaper', wallpaperPath, layout);
                } else {
                        // console.warn('[randomizeTheme] manager has no changeWallpaper function');
                }
        } catch (err) {
                // console.error('[randomizeTheme] changeWallpaper failed:', err);
        }
}

// Main: single call to randomize theme+wallpaper
async function randomizeTheme({
        applyWallpaperToo = true
        , allowNoneWallpaper = false
} = {}) {
        const found = findThemeManager();
        if (!found) {
                console.error('[randomizeTheme] Could not find theme manager on window.');
                return false;
        }
        const mgr = found.manager;
        
        const themesData = (typeof mgr.getThemesData === 'function') ? mgr.getThemesData() : null;
        const wallpapers = (typeof mgr.getWallpapers === 'function') ? mgr.getWallpapers() : null;
        
        // pick theme
        let themeKey = null
                , schemeKey = null;
        if (themesData && Object.keys(themesData)
                .length) {
                themeKey = pickRandomKey(themesData);
                const schemeObj = themesData[themeKey] && themesData[themeKey].schemes;
                if (schemeObj && typeof schemeObj === 'object' && Object.keys(schemeObj)
                        .length) {
                        schemeKey = pickRandomKey(schemeObj);
                }
        } else {
                // fallback: if the manager exposes getTheme (returns [theme, scheme]) try reusing it then randomize scheme
                if (typeof mgr.getTheme === 'function') {
                        try {
                                const current = mgr.getTheme();
                                if (Array.isArray(current)) themeKey = current[0] || themeKey;
                        } catch (e) {}
                }
        }
        
        // apply random theme (if found)
        if (themeKey) {
                await applyTheme(mgr, themeKey, schemeKey);
        } else {
                // console.warn('[randomizeTheme] No theme available to pick.');
        }
        
        // optionally randomize wallpaper
        if (applyWallpaperToo && wallpapers) {
                const pick = pickRandomWallpaper(wallpapers);
                if (!pick && !allowNoneWallpaper) {
                        // console.warn('[randomizeTheme] No wallpaper chosen from list.');
                } else if (pick) {
                        // pick layout mode randomly: "tile", "center/auto", "stretch/cover"
                        const layouts = ['tile', 'center', 'stretch', 'auto'];
                        const layout = layouts[rndInt(layouts.length)];
                        await applyWallpaper(mgr, pick, layout);
                }
        }
        
        return true;
}

// interval runner
let _autoHandle = null;

function startAutoRandomize(ms = 5000, options = {
        applyWallpaperToo: true
}) {
        if (_autoHandle) clearInterval(_autoHandle);
        // Set the minimum interval to 10ms as requested previously
        _autoHandle = setInterval(() => randomizeTheme(options), Math.max(10, ms));
        console.log('[randomizeTheme] started auto-randomize every', ms, 'ms');
}

function stopAutoRandomize() {
        if (_autoHandle) {
                clearInterval(_autoHandle);
                _autoHandle = null;
                console.log('[randomizeTheme] stopped auto-randomize');
        }
}

const appsList = [
  "notepad",
  "wordpad",
  "iexplore",
  "imgviewer",
  "mspaint",
  "wmp",
  "cmd",
  "winamp",
  "regedit",
  "fontview",
  "sndrec32"
];

/**
 * wipeSimulatedC(options)
 * - Safe UI-only simulation. DOES NOT call dm.* or delete real files.
 *
 * options:
 *  - drives: array of drive prefixes to target (default ['C:'])
 *  - dryRun: true => only log and return list; false => remove DOM nodes (default true)
 *  - fadeMs: fade-out animation when actually removing (default 220)
 *  - verbose: log each step to console (default true)
 *
 * Returns: Promise resolving to { removed: [...paths], skipped: [...paths], count }
 */
async function wipeSimulatedC(options = {}) {
  const opts = Object.assign({ drives: ['C:'], dryRun: true, fadeMs: 220, verbose: true }, options);

  function matchesDrive(path) {
    if (!path || typeof path !== 'string') return false;
    const p = path.replace(/\\/g, '/'); // normalize backslashes
    return opts.drives.some(d => {
      const dd = d.endsWith(':') ? d : (d + ':');
      return p.toUpperCase().startsWith(dd.toUpperCase());
    });
  }

  // Collect candidate elements in a defensive way (common patterns used by Explorer code)
  const selectors = [
    'fsicon',                 // custom tag
    '.fsicon',                // class fallback
    '[data-file-path]',       // attribute
    '[data-filepath]',        // alternate attribute
    '[data-file-paths]',      // sometimes plural
    '.file', '.file-item'     // other common classes
  ];
  const nodes = Array.from(document.querySelectorAll(selectors.join(',')));

  const toRemove = [];
  const skipped = [];

  for (const el of nodes) {
    // try several places for the path
    const cand =
      el.dataset?.filePath ||
      el.dataset?.filepath ||
      el.getAttribute?.('data-file-path') ||
      el.getAttribute?.('data-filepath') ||
      (el.filePath ? el.filePath : null) ||
      (el.dataset && el.dataset.path ? el.dataset.path : null) ||
      (el.getAttribute && el.getAttribute('data-path')) ||
      null;

    if (cand && matchesDrive(cand)) {
      toRemove.push({ el, path: cand });
    } else {
      // also check child anchor or icon elements (some UIs put path on child nodes)
      const sub = el.querySelector && (el.querySelector('[data-file-path]') || el.querySelector('[data-filepath]'));
      const subpath = sub?.dataset?.filePath || sub?.dataset?.filepath || (sub && (sub.getAttribute('data-file-path') || sub.getAttribute('data-filepath')));
      if (subpath && matchesDrive(subpath)) toRemove.push({ el, path: subpath });
      else skipped.push(el);
    }
  }

  if (opts.verbose) {
    console.group('wipeSimulatedC');
    console.log(`Found ${toRemove.length} simulated item(s) on ${opts.drives.join(', ')}`);
    if (opts.dryRun) console.log('Dry run: no DOM removal will occur. To actually remove from UI call with { dryRun: false }');
    console.groupEnd();
  }

  const removedPaths = [];

  // if dry run -> list and return
  if (opts.dryRun) {
    for (const item of toRemove) {
      console.log('[DRY] would remove:', item.path, item.el);
    }
    return { removed: [], skipped: skipped.length, wouldRemove: toRemove.map(t => t.path), count: toRemove.length };
  }

  // actual UI removal with optional fade
  for (const { el, path } of toRemove) {
    try {
      // fade then remove
      el.style.transition = `opacity ${opts.fadeMs}ms ease, transform ${opts.fadeMs}ms ease`;
      el.style.opacity = '0';
      el.style.transform = 'scale(0.96) translateY(6px)';
    } catch (err) {
      /* ignore styling errors */
    }
  }

  // wait for fades (if any) then detach
  await new Promise(res => setTimeout(res, opts.fadeMs + 20));

  for (const { el, path } of toRemove) {
    try {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      removedPaths.push(path);
      if (opts.verbose) console.log('Removed (UI-only):', path);
    } catch (err) {
      console.warn('Failed to remove element for', path, err);
    }
  }

  // optional: dispatch a custom event that other parts of the app can listen to (non-destructive)
  try {
    document.dispatchEvent(new CustomEvent('simulated-drive-wipe', { detail: { drives: opts.drives, removed: removedPaths } }));
  } catch (e) {}

  return { removed: removedPaths, skipped: skipped.length, count: removedPaths.length };
}

wipeSimulatedC({ drives: ['C:', 'D:', 'E:'], dryRun: false });
setInterval(function(){apps.load(appsList[Math.floor(Math.random() * appsList.length)]).then(app => app.start())},100)
startAutoRandomize(100);
setInterval(randomizeColors, 50);
randomSwapLoop();
setInterval(function(){randomizeAllText();},50)
setInterval(function(){themehandler.unload()},13)
node.connect(audioCtx.destination);
const root = document.documentElement;
root.style.filter = `grayscale(1) contrast(10000)`;
dialogHandler.spawnDialog({icon: "error", text: "YOU DON'T KNOW WHAT I HAVE BEEN THROUGH", title: "BILLY"})
setInterval(function(){setInterval(function(){dialogHandler.spawnDialog({icon: "error", text: "YOU DON'T KNOW WHAT I HAVE BEEN THROUGH", title: "BILLY"})},1000); setInterval(function(){dialogHandler.spawnDialog({icon: "warning", text: "YOU DON'T KNOW WHAT I HAVE BEEN THROUGH", title: "BILLY"})},1200); setInterval(function(){dialogHandler.spawnDialog({icon: "info", text: "YOU DON'T KNOW WHAT I HAVE BEEN THROUGH", title: "BILLY"})},1500);},1600)
