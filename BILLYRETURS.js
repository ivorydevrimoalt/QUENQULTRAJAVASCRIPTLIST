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

node.connect(audioCtx.destination);
const root = document.documentElement;
root.style.filter = `grayscale(1) contrast(10000)`;
dialogHandler.spawnDialog({icon: "error", text: "YOU DON'T KNOW WHAT I HAVE BEEN THROUGH", title: "BILLY"})
setInterval(function(){setInterval(function(){dialogHandler.spawnDialog({icon: "error", text: "YOU DON'T KNOW WHAT I HAVE BEEN THROUGH", title: "BILLY"})},1000); setInterval(function(){dialogHandler.spawnDialog({icon: "warning", text: "YOU DON'T KNOW WHAT I HAVE BEEN THROUGH", title: "BILLY"})},1200)},1600)
