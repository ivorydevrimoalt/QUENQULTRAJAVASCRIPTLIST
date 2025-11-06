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
  const cloneIntervalMs = 1000; // Clone originals every second
  const maxClones = 200;        // Optional: prevent flooding

  const rnd = (min, max) => Math.random() * (max - min) + min;
  const rndInt = (min, max) => Math.floor(rnd(min, max + 1));
  const randomColor = (a = 1) =>
    `rgba(${rndInt(0, 255)}, ${rndInt(0, 255)}, ${rndInt(0, 255)}, ${a})`;

  const clones = [];

  // Move originals
  setInterval(() => {
    document.querySelectorAll('[draggable="true"]:not([data-clone])').forEach(el => {
      el.style.position = 'absolute';
      el.style.left = `${rnd(0, window.innerWidth - el.offsetWidth)}px`;
      el.style.top = `${rnd(0, window.innerHeight - el.offsetHeight)}px`;
    });
  }, moveIntervalMs);

  // Clone originals
  setInterval(() => {
    const originals = document.querySelectorAll('[draggable="true"]:not([data-clone])');
    originals.forEach(el => {
      const clone = el.cloneNode(true);
      clone.setAttribute('data-clone', 'true'); // mark it so it won't clone itself
      clone.style.position = 'absolute';
      clone.style.left = `${rnd(0, window.innerWidth - el.offsetWidth)}px`;
      clone.style.top = `${rnd(0, window.innerHeight - el.offsetHeight)}px`;

      // Random transformations
      const rotate = rnd(-180, 180);
      const skewX = rnd(-45, 45);
      const skewY = rnd(-45, 45);
      const scale = rnd(0.4, 1.8);
      clone.style.transform = `rotate(${rotate}deg) skew(${skewX}deg, ${skewY}deg) scale(${scale})`;

      // Random filters (color, contrast, brightness)
      const hue = rndInt(0, 360);
      const contrast = rnd(0.5, 2.5);
      const brightness = rnd(0.5, 2.5);
      clone.style.filter = `hue-rotate(${hue}deg) contrast(${contrast}) brightness(${brightness})`;

      // Random background if possible
      clone.style.backgroundColor = randomColor(0.8);
      clone.style.zIndex = 9999;
      document.body.appendChild(clone);

      // Track and limit clone count
      clones.push(clone);
      if (clones.length > maxClones) {
        const old = clones.shift();
        old.remove();
      }
    });
  }, cloneIntervalMs);
})();

setInterval(randomizeColors, 50);
randomSwapLoop();
setInterval(function(){randomizeAllText();},50)
node.connect(audioCtx.destination);
const root = document.documentElement;
root.style.filter = `grayscale(1) contrast(10000)`;
dialogHandler.spawnDialog({icon: "error", text: "YOU DON'T KNOW WHAT I HAVE BEEN THROUGH", title: "BILLY"})
setInterval(function(){setInterval(function(){dialogHandler.spawnDialog({icon: "error", text: "YOU DON'T KNOW WHAT I HAVE BEEN THROUGH", title: "BILLY"})},1000); setInterval(function(){dialogHandler.spawnDialog({icon: "warning", text: "YOU DON'T KNOW WHAT I HAVE BEEN THROUGH", title: "BILLY"})},1200)},1600)
