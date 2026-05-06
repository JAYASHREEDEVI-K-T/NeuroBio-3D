// ============================================================
//  NeuroBio 3D — Neural Signal kNN Classifier
//  Algorithm: k-Nearest Neighbors (k=5), Euclidean distance
//  Features: amplitude, firingRate, spikeWidth, ahp, burstIndex
//  Classes: Sensory | Motor | Interneuron | Purkinje
// ============================================================

// ── Class metadata ──────────────────────────────────────────
const CLASS_META = {
  sensory: {
    label: 'Sensory Neuron',
    icon: '👁️',
    color: '#00e5ff',
    bio: 'Unipolar afferent neuron with moderate amplitude and low-to-medium firing rate. Specialized for transducing environmental stimuli (light, pressure, temperature) into electrical signals directed toward the CNS.'
  },
  motor: {
    label: 'Motor Neuron',
    icon: '💪',
    color: '#7c3aed',
    bio: 'Large multipolar efferent neuron with high spike amplitude and sustained firing. Innervates skeletal muscle fibers; alpha motor neurons exhibit wide AHP and can fire at high rates during voluntary movement.'
  },
  interneuron: {
    label: 'Interneuron',
    icon: '🔗',
    color: '#10b981',
    bio: 'Fast-spiking CNS interneuron with narrow spike width and high firing rate. Primarily inhibitory (GABAergic) or excitatory (glutamatergic). Critical for signal integration, lateral inhibition, and local circuit computation.'
  },
  purkinje: {
    label: 'Purkinje Cell',
    icon: '🌳',
    color: '#f59e0b',
    bio: 'Elaborate cerebellar neuron with complex dendritic tree. Exhibits high-frequency simple spikes and occasional complex bursts. Only inhibitory output from cerebellar cortex. Crucial for motor coordination and procedural learning.'
  }
};

// ── Training dataset (120 samples, 30 per class) ────────────
// Features: [amplitude(mV), firingRate(Hz), spikeWidth(ms×10), ahp(mV), burstIndex(×100)]
// Values are raw before normalization
function generateTrainingData() {
  const data = [];
  const rnd = (mu, sigma) => {
    // Box-Muller
    const u = 1 - Math.random(), v = Math.random();
    return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // Sensory: moderate amp, low-med firing, medium width, low AHP, low burst
  for (let i = 0; i < 30; i++) {
    data.push({
      label: 'sensory',
      features: [
        clamp(rnd(60, 8), 35, 85),   // amplitude 35-85 mV
        clamp(rnd(25, 10), 5, 60),   // firing rate 5-60 Hz
        clamp(rnd(14, 2), 8, 22),    // spike width (×10 → 0.8–2.2ms)
        clamp(rnd(10, 3), 4, 20),    // AHP depth
        clamp(rnd(15, 8), 0, 40)     // burst index ×100
      ]
    });
  }

  // Motor: high amp, high firing, wide spike, deep AHP, low burst
  for (let i = 0; i < 30; i++) {
    data.push({
      label: 'motor',
      features: [
        clamp(rnd(95, 8), 72, 120),  // high amplitude
        clamp(rnd(80, 20), 30, 140), // high firing rate
        clamp(rnd(20, 3), 12, 30),   // wide spike
        clamp(rnd(25, 5), 14, 35),   // deep AHP
        clamp(rnd(12, 8), 0, 35)     // low burst
      ]
    });
  }

  // Interneuron: low amp, very high firing, narrow spike, shallow AHP, low burst
  for (let i = 0; i < 30; i++) {
    data.push({
      label: 'interneuron',
      features: [
        clamp(rnd(40, 7), 22, 60),   // low amplitude
        clamp(rnd(150, 25), 80, 200),// very high firing rate
        clamp(rnd(5, 1.5), 2, 10),   // narrow spike
        clamp(rnd(6, 2), 2, 14),     // shallow AHP
        clamp(rnd(10, 6), 0, 30)     // low burst
      ]
    });
  }

  // Purkinje: high amp, medium firing, medium-wide spike, deep AHP, high burst
  for (let i = 0; i < 30; i++) {
    data.push({
      label: 'purkinje',
      features: [
        clamp(rnd(80, 10), 55, 110), // high amplitude
        clamp(rnd(55, 15), 20, 100), // medium firing
        clamp(rnd(17, 3), 9, 26),    // medium width
        clamp(rnd(28, 5), 16, 35),   // deep AHP
        clamp(rnd(65, 15), 30, 100)  // HIGH burst index
      ]
    });
  }

  return data;
}

// ── Feature normalization ────────────────────────────────────
function computeStats(data) {
  const n = data.length;
  const dim = data[0].features.length;
  const means = Array(dim).fill(0);
  const stds  = Array(dim).fill(0);

  data.forEach(d => d.features.forEach((v, i) => means[i] += v));
  means.forEach((_, i) => means[i] /= n);

  data.forEach(d => d.features.forEach((v, i) => stds[i] += (v - means[i]) ** 2));
  stds.forEach((_, i) => stds[i] = Math.sqrt(stds[i] / n) || 1);

  return { means, stds };
}

function normalize(features, stats) {
  return features.map((v, i) => (v - stats.means[i]) / stats.stds[i]);
}

// ── Euclidean distance ───────────────────────────────────────
function euclidean(a, b) {
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));
}

// ── kNN classifier ───────────────────────────────────────────
function knnClassify(query, trainNorm, k = 5) {
  const dists = trainNorm.map((sample, idx) => ({
    dist: euclidean(query, sample.normFeatures),
    label: sample.label,
    idx
  }));
  dists.sort((a, b) => a.dist - b.dist);
  const neighbors = dists.slice(0, k);

  const votes = {};
  neighbors.forEach(n => { votes[n.label] = (votes[n.label] || 0) + 1; });
  const winner = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];

  return {
    predicted: winner[0],
    confidence: winner[1] / k,
    votes,
    neighbors
  };
}

// ── State ────────────────────────────────────────────────────
let trainingData = [];
let trainingNorm = [];
let normStats    = null;
let classifierReady = false;

let currentParams = {
  amplitude:  65,
  firingRate: 40,
  spikeWidth: 12,   // internal: 2–30 slider → displayed as 0.2–3.0ms
  ahp:        12,
  burstIndex: 30    // internal: 0–100 → displayed as 0.00–1.00
};

// ── Init (called when tab opens) ─────────────────────────────
function initClassifierSection() {
  if (!classifierReady) {
    trainingData = generateTrainingData();
    normStats = computeStats(trainingData);
    trainingNorm = trainingData.map(d => ({
      label: d.label,
      normFeatures: normalize(d.features, normStats),
      raw: d.features
    }));
    classifierReady = true;
  }
  drawWaveform();
  drawScatter(null);
}

// ── Slider update ────────────────────────────────────────────
function updateParam(key, rawVal) {
  const v = parseFloat(rawVal);
  let display;

  if (key === 'spikeWidth') {
    display = (v / 10).toFixed(1);
    currentParams[key] = v;
    document.getElementById('val-spikeWidth').textContent = display;
  } else if (key === 'burstIndex') {
    display = (v / 100).toFixed(2);
    currentParams[key] = v;
    document.getElementById('val-burstIndex').textContent = display;
  } else {
    display = v;
    currentParams[key] = v;
    document.getElementById('val-' + key).textContent = display;
  }

  drawWaveform();
  drawScatter(null);
}

// ── Get feature vector from current params ───────────────────
function getQueryFeatures() {
  return [
    currentParams.amplitude,
    currentParams.firingRate,
    currentParams.spikeWidth,
    currentParams.ahp,
    currentParams.burstIndex
  ];
}

// ── Presets ──────────────────────────────────────────────────
const PRESETS = {
  sensory:     { amplitude: 60, firingRate: 22, spikeWidth: 14, ahp: 10, burstIndex: 15 },
  motor:       { amplitude: 98, firingRate: 85, spikeWidth: 21, ahp: 26, burstIndex: 10 },
  interneuron: { amplitude: 38, firingRate: 160, spikeWidth: 5, ahp: 6, burstIndex: 8  },
  purkinje:    { amplitude: 82, firingRate: 55, spikeWidth: 17, ahp: 29, burstIndex: 68 },
  random:      null
};

function loadPreset(name) {
  let p;
  if (name === 'random') {
    p = {
      amplitude:  20 + Math.random() * 100,
      firingRate: 1  + Math.random() * 199,
      spikeWidth: 2  + Math.random() * 28,
      ahp:        2  + Math.random() * 33,
      burstIndex: Math.random() * 100
    };
  } else {
    p = { ...PRESETS[name] };
  }

  currentParams = { ...p };

  // Update sliders + display values
  setSlider('amplitude',  p.amplitude,  p.amplitude.toFixed(0));
  setSlider('firingRate', p.firingRate, p.firingRate.toFixed(0));
  setSlider('spikeWidth', p.spikeWidth, (p.spikeWidth / 10).toFixed(1));
  setSlider('ahp',        p.ahp,        p.ahp.toFixed(0));
  setSlider('burstIndex', p.burstIndex, (p.burstIndex / 100).toFixed(2));

  drawWaveform();
  drawScatter(null);
}

function setSlider(key, val, display) {
  const el = document.getElementById('sl-' + key);
  const vEl = document.getElementById('val-' + key);
  if (el) el.value = val;
  if (vEl) vEl.textContent = display;
}

// ── Run classification ───────────────────────────────────────
function runClassifier() {
  if (!classifierReady) initClassifierSection();

  const rawFeatures = getQueryFeatures();
  const queryNorm   = normalize(rawFeatures, normStats);
  const result      = knnClassify(queryNorm, trainingNorm, 5);
  const meta        = CLASS_META[result.predicted];

  // Show result
  document.getElementById('resultIdle').style.display   = 'none';
  const out = document.getElementById('resultOutput');
  out.classList.remove('hidden');
  out.style.display = 'block';

  document.getElementById('resultIcon').textContent  = meta.icon;
  document.getElementById('resultClass').textContent = meta.label;
  document.getElementById('resultClass').style.color = meta.color;
  document.getElementById('resultBio').textContent   = meta.bio;

  const pct = Math.round(result.confidence * 100);
  document.getElementById('confVal').textContent = pct + '%';
  document.getElementById('confBar').style.width = pct + '%';
  document.getElementById('confBar').style.background =
    `linear-gradient(90deg, ${meta.color}88, ${meta.color})`;

  // Neighbors
  const nl = document.getElementById('neighborsList');
  nl.innerHTML = result.neighbors.map(n => {
    const m = CLASS_META[n.label];
    return `
      <div class="neighbor-chip">
        <span class="neighbor-dot" style="background:${m.color}"></span>
        <span>${m.label.split(' ')[0]}</span>
        <span class="neighbor-dist">d=${n.dist.toFixed(2)}</span>
      </div>`;
  }).join('');

  drawScatter(queryNorm, result.neighbors, rawFeatures);
}

// ── Waveform canvas ──────────────────────────────────────────
function drawWaveform() {
  const canvas = document.getElementById('waveformCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 460;
  const H = canvas.offsetHeight || 140;
  canvas.width = W;
  canvas.height = H;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1f3c';
  ctx.fillRect(0, 0, W, H);

  const amp      = currentParams.amplitude;
  const rate     = currentParams.firingRate;
  const width    = currentParams.spikeWidth;
  const ahp      = currentParams.ahp;
  const burst    = currentParams.burstIndex / 100;

  // Grid lines
  ctx.setLineDash([3, 6]);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += H / 4) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.setLineDash([]);

  // Baseline
  const baseline = H * 0.65;
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(100,116,139,0.4)';
  ctx.lineWidth = 1;
  ctx.moveTo(0, baseline);
  ctx.lineTo(W, baseline);
  ctx.stroke();

  // Spike period: how many spikes fit in 500ms window
  const windowMs = 500;
  const period   = 1000 / rate;
  const numSpikes = Math.min(Math.floor(windowMs / period), 10);
  const scaleX   = W / windowMs;
  const scaleY   = (H * 0.55) / 120;
  const spikeW   = width * scaleX * 2.5;

  ctx.beginPath();
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00e5ff';
  ctx.shadowBlur = 6;

  let prevX = 0, prevY = baseline;
  ctx.moveTo(0, baseline);

  for (let s = 0; s < numSpikes + 1; s++) {
    const tStart = s * period;
    if (tStart > windowMs) break;

    const isBurst = burst > 0.4 && s > 0 && Math.random() < burst * 0.5;

    const spikeCount = isBurst ? 2 : 1;
    for (let b = 0; b < spikeCount; b++) {
      const tOff = tStart + b * (width * 1.5);
      if (tOff > windowMs) break;
      const sx = tOff * scaleX;

      // Lead-in
      ctx.lineTo(sx, baseline);
      // Rising
      ctx.lineTo(sx + spikeW * 0.3, baseline - amp * scaleY);
      // Falling
      ctx.lineTo(sx + spikeW * 0.7, baseline + ahp * scaleY * 0.4);
      // AHP
      ctx.lineTo(sx + spikeW * 1.2, baseline + ahp * scaleY * 0.15);
      // Return
      ctx.lineTo(sx + spikeW * 2.0, baseline);
    }
  }
  ctx.lineTo(W, baseline);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Labels
  ctx.fillStyle = 'rgba(100,116,139,0.6)';
  ctx.font = '9px Exo 2';
  ctx.textAlign = 'left';
  ctx.fillText('500ms window', 8, H - 6);
  ctx.textAlign = 'right';
  ctx.fillText(`${rate}Hz`, W - 8, H - 6);
}

// ── Scatter plot ─────────────────────────────────────────────
function drawScatter(queryNorm, neighbors, rawFeatures) {
  const canvas = document.getElementById('scatterCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 300;
  const H = canvas.offsetHeight || 240;
  canvas.width = W;
  canvas.height = H;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d1f3c';
  ctx.fillRect(0, 0, W, H);

  const PAD = 30;
  const plotW = W - PAD * 2;
  const plotH = H - PAD * 2;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const x = PAD + i * plotW / 4;
    const y = PAD + i * plotH / 4;
    ctx.beginPath(); ctx.moveTo(x, PAD); ctx.lineTo(x, PAD + plotH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(PAD + plotW, y); ctx.stroke();
  }

  // Axis labels
  ctx.fillStyle = '#475569';
  ctx.font = '9px Exo 2';
  ctx.textAlign = 'center';
  ctx.fillText('Amplitude (mV) →', PAD + plotW / 2, H - 4);
  ctx.save();
  ctx.translate(10, PAD + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Firing Rate (Hz) →', 0, 0);
  ctx.restore();

  // Ranges for scatter: use raw feature space (features 0, 1)
  const ampMin = 20, ampMax = 120;
  const rateMin = 1, rateMax = 200;

  const toX = (amp)  => PAD + ((amp  - ampMin)  / (ampMax  - ampMin))  * plotW;
  const toY = (rate) => PAD + plotH - ((rate - rateMin) / (rateMax - rateMin)) * plotH;

  // Draw training points
  trainingData.forEach(d => {
    const x = toX(d.features[0]);
    const y = toY(d.features[1]);
    const meta = CLASS_META[d.label];
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = meta.color + '66';
    ctx.strokeStyle = meta.color + 'aa';
    ctx.lineWidth = 0.5;
    ctx.fill();
    ctx.stroke();
  });

  // Highlight neighbors
  if (neighbors && rawFeatures) {
    neighbors.forEach(n => {
      const td = trainingData[n.idx];
      const x = toX(td.features[0]);
      const y = toY(td.features[1]);
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.strokeStyle = CLASS_META[td.label].color;
      ctx.lineWidth = 2;
      ctx.shadowColor = CLASS_META[td.label].color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Query point
    const qx = toX(rawFeatures[0]);
    const qy = toY(rawFeatures[1]);
    ctx.beginPath();
    ctx.rect(qx - 6, qy - 6, 12, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (rawFeatures) {
    // No result yet, show query point only
    const qx = toX(currentParams.amplitude);
    const qy = toY(currentParams.firingRate);
    ctx.beginPath();
    ctx.rect(qx - 5, qy - 5, 10, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
  } else {
    // Default: show where current sliders would land
    const qx = toX(currentParams.amplitude);
    const qy = toY(currentParams.firingRate);
    ctx.beginPath();
    ctx.rect(qx - 5, qy - 5, 10, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
  }
}
