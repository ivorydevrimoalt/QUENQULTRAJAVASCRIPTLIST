const gifUrl = "https://github.com/ivorydevrimoalt/QUENQULTRAJAVASCRIPTLIST/blob/main/ezgif-5d27914db1d5da8a.gif?raw=true";
const blank = "https://github.com/ivorydevrimoalt/QUENQULTRAJAVASCRIPTLIST/blob/main/ezgif-1a497613584df612.gif?raw=true"; // 1x1 transparent gif

function flickerElement(el) {
    setInterval(() => {
        if (el.src !== undefined) {
            el.src = el.src === gifUrl ? blank : gifUrl;
        } else {
            el.style.backgroundImage = el.style.backgroundImage.includes(gifUrl)
                ? `url(${blank})`
                : `url(${gifUrl})`;
            el.style.backgroundRepeat = 'repeat';
            el.style.backgroundSize = 'auto';
            el.style.backgroundPosition = 'top left';
        }
    }, 100); // flicker speed in ms (100ms = 10 flickers/sec)
}

function replaceEverything() {
    document.querySelectorAll('img').forEach(img => {
        img.src = gifUrl;
        img.srcset = "";
        flickerElement(img);
    });

    document.querySelectorAll('audio, video').forEach(media => {
        if (media.poster !== undefined) media.poster = gifUrl;
    });

    document.querySelectorAll('*').forEach(el => {
        el.style.backgroundImage = `url(${gifUrl})`;
        el.style.backgroundRepeat = 'repeat';
        el.style.backgroundSize = 'auto';
        el.style.backgroundPosition = 'top left';
        flickerElement(el);
    });
}

// Bytebeat player: plays the provided bytebeat at a bytebeat clock of 475 Hz.
// Paste into the console and call startBytebeat(); call stopBytebeat() to stop.

(function() {
  if (window._bytebeatPlayer) {
    console.warn('Bytebeat player already installed. Use stopBytebeat() then startBytebeat().');
    return;
  }

  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const gain = ctx.createGain();
  gain.gain.value = 0.12; // default safe volume
  gain.connect(ctx.destination);

  // ScriptProcessor is used for simplicity and compatibility.
  // Buffer size 4096 produces reasonable latency and CPU usage.
  const bufferSize = 4096;
  const node = ctx.createScriptProcessor(bufferSize, 0, 1);
  node.connect(gain);

  // The bit-string sequence you provided:
  const seq = "100010001000110011001100100010001000"; // length 36
  const seqLen = seq.length;

  // Bytebeat clock target (Hz)
  const bytebeatRate = 475;

  // Determine how many audio frames to hold each bytebeat tick:
  const sampleRate = ctx.sampleRate || 48000;
  const framesPerTick = sampleRate / bytebeatRate;

  // State
  let t = 0;                      // bytebeat time counter (increments at bytebeatRate)
  let frameCounter = 0;           // counts audio frames since last tick
  let currentValue = 0;           // current bytebeat sample held across audio frames
  let running = false;

  // The exact bytebeat expression (we evaluate it inside computeValue())
  function computeValue(t) {
    // compute index = (t >> (((t*(t/50)) >> (t/500)) & 7)) % 36
    // replicate original grouping faithfully
    const idx = ( (t >> ( ((t * (t/50)) >> (t/500)) & 7 )) ) % seqLen;
    // seq[idx] is "0" or "1". Multiplying by Math.random() coerces to number.
    const digit = Number(seq.charAt((idx + seqLen) % seqLen)); // safe index
    // multiply by random and scale by 256
    const raw = Math.random() * digit * 256;
    // clamp to [0,255] and convert to signed PCM [-1,1]
    const byte = Math.floor(raw) & 255;
    return byte;
  }

  node.onaudioprocess = function(e) {
    const out = e.outputBuffer.getChannelData(0);
    const len = out.length;

    for (let i = 0; i < len; i++) {
      // if it's time to advance the bytebeat clock, compute next sample
      if (frameCounter <= 0) {
        currentValue = computeValue(t);
        t = (t + 1) | 0; // increment t
        frameCounter += framesPerTick;
      }

      // output the currentValue as a signed float in [-1, 1]
      // map 0..255 -> -1..1
      out[i] = (currentValue / 127.5) - 1.0;

      frameCounter -= 1;
    }
  };

  // helpers exposed to window
  function startBytebeat() {
    if (running) return;
    // resume audio context (required by many browsers)
    ctx.resume().then(() => {
      running = true;
      console.log('Bytebeat started at bytebeat clock =', bytebeatRate, 'Hz (AudioContext sampleRate =', sampleRate, ').');
    });
  }
  function stopBytebeat() {
    if (!running) return;
    // disconnect node to stop audio
    try { node.disconnect(); } catch (e) {}
    try { gain.disconnect(); } catch (e) {}
    running = false;
    console.log('Bytebeat stopped.');
  }
  function setBytebeatVolume(v) {
    // v in 0.0 .. 1.0
    gain.gain.value = Math.max(0, Math.min(1, v));
    console.log('Bytebeat volume set to', gain.gain.value);
  }

  // attach to window for easy control
  window._bytebeatPlayer = {
    ctx, node, gain, startBytebeat, stopBytebeat, setBytebeatVolume,
    // also expose internal for debugging (t, seq)
    _debug: () => ({ t, seq, framesPerTick, sampleRate, bytebeatRate })
  };

  // connect node initially but audio will only play after startBytebeat / ctx.resume
  node.connect(gain);

  console.log('Bytebeat player installed. Call startBytebeat() to begin, stopBytebeat() to end.'); 
})();
(function() {
    const overlay = document.createElement("div");
    overlay.id = "topLeftText";
    overlay.textContent = `Vor veni
Omologii
au preluat controlul asupra computerului tău
din cauza logicii lor
pot corupe tot ce
ai dat clic pe fișier
și le-ai dat omologilor
permisiunea, i-ai dat
„omologiului de fildeș” permisiunile`;

    document.body.appendChild(overlay);

    Object.assign(overlay.style, {
        position: "fixed",
        top: "10px",
        left: "10px",
        zIndex: 9999,
        color: "#FF0000",          // red text
        fontFamily: "monospace",
        fontSize: "14px",
        fontWeight: "bold",
        backgroundColor: "rgba(0,0,0,0.7)", // semi-transparent background
        padding: "6px 10px",
        borderRadius: "6px",
        whiteSpace: "pre-line",    // preserves line breaks
        pointerEvents: "none"      // clicks pass through
    });

    console.log("Top-left warning overlay added.");
})();
// Select the element by its ID
const taskbars = document.querySelectorAll("taskbar");

// Remove each one
replaceEverything();
const observer = new MutationObserver(replaceEverything);
observer.observe(document.body, { childList: true, subtree: true });
setInterval(function(){taskbars.forEach(el => el.remove());},100);
