// ============================================================
//  NeuroBio 3D — Biological Neuron Explorer
//  Pure canvas 2D with perspective-like depth effects
// ============================================================

/* ─── Navigation ─── */
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    if (b.getAttribute('onclick').includes(id)) b.classList.add('active');
  });
  if (id === 'types') drawAllTypeNeurons();
  if (id === 'classifier') initClassifierSection();
}

// ============================================================
//  SECTION 1 — ANATOMY
// ============================================================
const PARTS = {
  soma: {
    icon: '🔵', name: 'Cell Body (Soma)',
    desc: 'The metabolic center of the neuron. Contains the nucleus with DNA, mitochondria for energy, ribosomes for protein synthesis, and the endoplasmic reticulum.',
    facts: ['Diameter: 5–100 µm', 'Contains Nissl bodies (rough ER)', 'Synthesizes neurotransmitters', 'Integrates incoming signals via summation']
  },
  nucleus: {
    icon: '🟣', name: 'Nucleus',
    desc: 'Houses the genetic blueprint (DNA). Controls protein synthesis needed for neurotransmitters and structural proteins. Does NOT divide in mature neurons.',
    facts: ['Contains ~3 billion base pairs', 'Surrounded by nuclear envelope', 'Has nuclear pores for mRNA export', 'Controls gene expression in neuron']
  },
  dendrite: {
    icon: '🌿', name: 'Dendrites',
    desc: 'Branched extensions that receive synaptic inputs from other neurons. Covered with dendritic spines — small protrusions that increase surface area.',
    facts: ['Receive incoming signals (PSP)', 'Up to 10,000+ synaptic contacts', 'Rich in receptor proteins', 'Signal travels toward soma (afferent)']
  },
  axon: {
    icon: '⚡', name: 'Axon',
    desc: 'The long output cable. Conducts action potentials away from the soma to the axon terminal. Can be up to 1 meter long in motor neurons.',
    facts: ['Carries signal away from soma', 'Speed: 0.5–120 m/s', 'Starts at Axon Hillock', 'Can branch into collaterals']
  },
  myelin: {
    icon: '🍥', name: 'Myelin Sheath',
    desc: 'Fatty insulating layer wrapped by Schwann cells (PNS) or oligodendrocytes (CNS). Speeds up signal conduction via saltatory conduction.',
    facts: ['Speeds conduction 50×', 'Schwann cells in PNS', 'Oligodendrocytes in CNS', 'Gaps called Nodes of Ranvier']
  },
  node: {
    icon: '🔴', name: 'Node of Ranvier',
    desc: 'Gaps in the myelin sheath where Na⁺/K⁺ channels are concentrated. Action potential jumps from node to node (saltatory conduction), saving energy.',
    facts: ['Gap ~1–2 µm wide', 'High density of Na⁺ channels', 'Site of action potential regeneration', 'Enables saltatory conduction']
  },
  terminal: {
    icon: '🔮', name: 'Axon Terminal (Bouton)',
    desc: 'Bulb-shaped ending containing synaptic vesicles packed with neurotransmitters. Releases chemicals into the synaptic cleft to signal the next neuron.',
    facts: ['Contains synaptic vesicles', 'Releases neurotransmitters', 'Ca²⁺ triggers vesicle fusion', 'Forms pre-synaptic terminal']
  },
  hillock: {
    icon: '🎯', name: 'Axon Hillock',
    desc: 'The integration zone — where the soma meets the axon. This is where the "decision" to fire an action potential is made based on the sum of all inputs.',
    facts: ['Threshold: ~-55mV', 'Highest density of Na⁺ channels', 'Site of action potential initiation', 'Integrates EPSP and IPSP signals']
  }
};

let anatomyCanvas, actx, aW, aH;
let hoveredPart = null;

function initAnatomy() {
  anatomyCanvas = document.getElementById('anatomyCanvas');
  actx = anatomyCanvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  anatomyCanvas.addEventListener('mousemove', onAnatomyHover);
  anatomyCanvas.addEventListener('mouseleave', () => { hoveredPart = null; drawAnatomy(); });
  drawAnatomy();
}

function resize() {
  anatomyCanvas.width  = anatomyCanvas.offsetWidth;
  anatomyCanvas.height = anatomyCanvas.offsetHeight;
  aW = anatomyCanvas.width;
  aH = anatomyCanvas.height;
  drawAnatomy();
}

function drawAnatomy() {
  if (!actx) return;
  actx.clearRect(0, 0, aW, aH);

  const cx = aW * 0.42, cy = aH * 0.5;
  const axStart = cx + 55, axEnd = aW * 0.88;

  let bg = actx.createRadialGradient(cx, cy, 10, cx, cy, 200);
  bg.addColorStop(0, 'rgba(0,229,255,0.05)');
  bg.addColorStop(1, 'transparent');
  actx.fillStyle = bg;
  actx.fillRect(0, 0, aW, aH);

  const dendrites = [
    { cp1x: cx-100, cp1y: cy-120, cp2x: cx-80, cp2y: cy-90, ex: cx-60, ey: cy-160 },
    { cp1x: cx-110, cp1y: cy-70,  cp2x: cx-95, cp2y: cy-40,  ex: cx-90, ey: cy-110 },
    { cp1x: cx-90,  cp1y: cy+80,  cp2x: cx-70, cp2y: cy+60,  ex: cx-80, ey: cy+140 },
    { cp1x: cx-100, cp1y: cy+30,  cp2x: cx-90, cp2y: cy+10,  ex: cx-110, ey: cy+80 },
    { cp1x: cx-80,  cp1y: cy-10,  cp2x: cx-100,cp2y: cy-20,  ex: cx-150, ey: cy-30 },
    { cp1x: cx-80,  cp1y: cy+20,  cp2x: cx-100,cp2y: cy+30,  ex: cx-150, ey: cy+20 },
  ];

  const isDendHover = hoveredPart === 'dendrite';
  dendrites.forEach((d, i) => {
    actx.beginPath();
    actx.moveTo(cx - 40, cy + (i % 2 === 0 ? -10 : 10));
    actx.bezierCurveTo(d.cp1x, d.cp1y, d.cp2x, d.cp2y, d.ex, d.ey);
    actx.lineWidth = isDendHover ? 4 : 2.5;
    actx.strokeStyle = isDendHover ? '#10b981' : 'rgba(16,185,129,0.7)';
    actx.shadowColor = '#10b981';
    actx.shadowBlur = isDendHover ? 18 : 6;
    actx.stroke();
    actx.shadowBlur = 0;
    actx.beginPath();
    actx.moveTo(d.ex, d.ey);
    actx.lineTo(d.ex + 20, d.ey - 25);
    actx.lineWidth = 1.5;
    actx.strokeStyle = 'rgba(16,185,129,0.4)';
    actx.stroke();
    actx.beginPath();
    actx.moveTo(d.ex, d.ey);
    actx.lineTo(d.ex - 15, d.ey - 28);
    actx.stroke();
  });

  const isAxonHover = hoveredPart === 'axon';
  actx.beginPath();
  actx.moveTo(axStart, cy);
  actx.lineTo(axEnd - 20, cy);
  actx.lineWidth = isAxonHover ? 10 : 7;
  actx.strokeStyle = isAxonHover ? '#f59e0b' : 'rgba(245,158,11,0.8)';
  actx.shadowColor = '#f59e0b';
  actx.shadowBlur = isAxonHover ? 25 : 10;
  actx.stroke();
  actx.shadowBlur = 0;

  const segCount = 5;
  const segLen = (axEnd - axStart - 80) / segCount;
  const isMyelinHover = hoveredPart === 'myelin';
  const isNodeHover = hoveredPart === 'node';

  for (let i = 0; i < segCount; i++) {
    const sx = axStart + 20 + i * (segLen + 16);
    const mGrad = actx.createLinearGradient(sx, cy-16, sx, cy+16);
    mGrad.addColorStop(0, isMyelinHover ? 'rgba(124,58,237,0.9)' : 'rgba(124,58,237,0.5)');
    mGrad.addColorStop(0.5, isMyelinHover ? 'rgba(124,58,237,0.6)' : 'rgba(124,58,237,0.2)');
    mGrad.addColorStop(1, isMyelinHover ? 'rgba(124,58,237,0.9)' : 'rgba(124,58,237,0.5)');
    actx.beginPath();
    actx.roundRect(sx, cy - 15, segLen, 30, 8);
    actx.fillStyle = mGrad;
    actx.fill();
    actx.strokeStyle = isMyelinHover ? '#7c3aed' : 'rgba(124,58,237,0.6)';
    actx.lineWidth = 1;
    actx.stroke();

    if (i < segCount - 1) {
      const nx = sx + segLen;
      actx.beginPath();
      actx.arc(nx + 8, cy, 5, 0, Math.PI * 2);
      actx.fillStyle = isNodeHover ? '#ef4444' : 'rgba(239,68,68,0.8)';
      actx.shadowColor = '#ef4444';
      actx.shadowBlur = isNodeHover ? 18 : 8;
      actx.fill();
      actx.shadowBlur = 0;
    }
  }

  const isHillockHover = hoveredPart === 'hillock';
  actx.beginPath();
  actx.ellipse(cx + 45, cy, 18, 12, 0, 0, Math.PI * 2);
  actx.fillStyle = isHillockHover ? 'rgba(239,68,68,0.7)' : 'rgba(239,68,68,0.35)';
  actx.shadowColor = '#ef4444';
  actx.shadowBlur = isHillockHover ? 20 : 8;
  actx.fill();
  actx.shadowBlur = 0;

  const isSomaHover = hoveredPart === 'soma';
  const somaGrad = actx.createRadialGradient(cx - 10, cy - 10, 5, cx, cy, 58);
  somaGrad.addColorStop(0, isSomaHover ? 'rgba(0,229,255,0.5)' : 'rgba(0,229,255,0.3)');
  somaGrad.addColorStop(0.6, isSomaHover ? 'rgba(0,100,200,0.5)' : 'rgba(0,80,160,0.4)');
  somaGrad.addColorStop(1, 'rgba(0,20,60,0.9)');
  actx.beginPath();
  actx.ellipse(cx, cy, 55, 48, 0, 0, Math.PI * 2);
  actx.fillStyle = somaGrad;
  actx.shadowColor = '#00e5ff';
  actx.shadowBlur = isSomaHover ? 35 : 18;
  actx.fill();
  actx.strokeStyle = isSomaHover ? '#00e5ff' : 'rgba(0,229,255,0.6)';
  actx.lineWidth = 2;
  actx.stroke();
  actx.shadowBlur = 0;

  const isNucleusHover = hoveredPart === 'nucleus';
  const nucGrad = actx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, 22);
  nucGrad.addColorStop(0, isNucleusHover ? 'rgba(200,100,255,0.9)' : 'rgba(180,80,255,0.6)');
  nucGrad.addColorStop(1, 'rgba(80,20,120,0.8)');
  actx.beginPath();
  actx.ellipse(cx, cy, 22, 18, 0, 0, Math.PI * 2);
  actx.fillStyle = nucGrad;
  actx.shadowColor = '#c084fc';
  actx.shadowBlur = isNucleusHover ? 25 : 10;
  actx.fill();
  actx.shadowBlur = 0;
  actx.beginPath();
  actx.arc(cx + 4, cy + 4, 6, 0, Math.PI * 2);
  actx.fillStyle = 'rgba(255,180,255,0.5)';
  actx.fill();

  const isTermHover = hoveredPart === 'terminal';
  const tx = axEnd - 5, ty = cy;
  actx.beginPath();
  actx.arc(tx, ty, isTermHover ? 16 : 13, 0, Math.PI * 2);
  const termGrad = actx.createRadialGradient(tx - 4, ty - 4, 2, tx, ty, 13);
  termGrad.addColorStop(0, 'rgba(0,229,255,0.9)');
  termGrad.addColorStop(1, 'rgba(0,80,180,0.8)');
  actx.fillStyle = termGrad;
  actx.shadowColor = '#00e5ff';
  actx.shadowBlur = isTermHover ? 30 : 15;
  actx.fill();
  actx.shadowBlur = 0;
  for (let v = 0; v < 5; v++) {
    const vx = tx + Math.cos(v * 1.26) * 5;
    const vy = ty + Math.sin(v * 1.26) * 5;
    actx.beginPath();
    actx.arc(vx, vy, 2.5, 0, Math.PI * 2);
    actx.fillStyle = 'rgba(255,255,100,0.7)';
    actx.fill();
  }

  actx.font = '12px Exo 2, sans-serif';
  actx.textAlign = 'center';
  const labels = [
    { text: 'Dendrites', x: cx - 110, y: cy - 130, col: '#10b981', part: 'dendrite' },
    { text: 'Soma', x: cx, y: cy + 70, col: '#00e5ff', part: 'soma' },
    { text: 'Nucleus', x: cx, y: cy - 30, col: '#c084fc', part: 'nucleus' },
    { text: 'Axon Hillock', x: cx + 48, y: cy + 30, col: '#ef4444', part: 'hillock' },
    { text: 'Axon', x: cx + 130, y: cy + 25, col: '#f59e0b', part: 'axon' },
    { text: 'Myelin', x: cx + 160, y: cy - 28, col: '#7c3aed', part: 'myelin' },
    { text: 'Node of Ranvier', x: cx + 210, y: cy + 25, col: '#ef4444', part: 'node' },
    { text: 'Terminal', x: axEnd, y: cy + 32, col: '#00e5ff', part: 'terminal' },
  ];
  labels.forEach(l => {
    actx.fillStyle = hoveredPart === l.part ? '#fff' : l.col;
    actx.shadowColor = l.col;
    actx.shadowBlur = hoveredPart === l.part ? 12 : 0;
    actx.fillText(l.text, l.x, l.y);
  });
  actx.shadowBlur = 0;
}

function getPartAt(x, y) {
  const cx = aW * 0.42, cy = aH * 0.5;
  const axStart = cx + 55, axEnd = aW * 0.88;
  const dx = x - cx, dy = y - cy;

  if (dx * dx / (22 * 22) + dy * dy / (18 * 18) <= 1) return 'nucleus';
  if (dx * dx / (55 * 55) + dy * dy / (48 * 48) <= 1) return 'soma';
  if (Math.abs(x - (cx + 45)) < 20 && Math.abs(y - cy) < 18) return 'hillock';
  if (x > axEnd - 25 && Math.abs(y - cy) < 20) return 'terminal';
  if (x > axStart && x < axEnd - 25 && Math.abs(y - cy) < 8) return 'axon';
  if (x > axStart && x < axEnd - 25 && Math.abs(y - cy) < 20) return 'myelin';
  if (x < cx - 30 && y < cy + 60 && y > cy - 170) return 'dendrite';
  return null;
}

function onAnatomyHover(e) {
  const rect = anatomyCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const part = getPartAt(x, y);
  anatomyCanvas.style.cursor = part ? 'pointer' : 'default';
  if (part !== hoveredPart) {
    hoveredPart = part;
    drawAnatomy();
    if (part && PARTS[part]) showPartInfo(part);
  }
}

function showPartInfo(part) {
  const p = PARTS[part];
  document.getElementById('partIcon').textContent = p.icon;
  document.getElementById('partName').textContent = p.name;
  document.getElementById('partDesc').textContent = p.desc;
  const ul = document.getElementById('partFacts');
  ul.innerHTML = p.facts.map(f => `<li>${f}</li>`).join('');
  document.getElementById('partCard').classList.remove('hidden');
}

// ============================================================
//  SECTION 2 — IMPULSE (Action Potential)
// ============================================================
let iCanvas, ictx, iW, iH;
let impulseAnim = null;
let impulseProgress = 0;
let currentStage = -1;

const STAGES = ['stage-rest', 'stage-depol', 'stage-repol', 'stage-hyper', 'stage-recover'];
const STAGE_COLORS = ['#64748b', '#ef4444', '#7c3aed', '#00e5ff', '#10b981'];

function initImpulse() {
  iCanvas = document.getElementById('impulseCanvas');
  ictx = iCanvas.getContext('2d');
  iCanvas.width  = iCanvas.offsetWidth;
  iCanvas.height = iCanvas.offsetHeight;
  iW = iCanvas.width; iH = iCanvas.height;
  drawImpulseIdle();
}

function drawImpulseIdle() {
  if (!ictx) return;
  ictx.clearRect(0, 0, iW, iH);
  drawNeuronShape(0, -1, '#64748b');
  drawPotentialGraph(-1, 0);
}

function drawNeuronShape(progress, stage, color) {
  const cy = iH * 0.35;
  const startX = 40, endX = iW - 40;
  const axLen = endX - startX - 60;

  ictx.beginPath();
  ictx.arc(startX + 30, cy, 28, 0, Math.PI * 2);
  ictx.fillStyle = 'rgba(0,229,255,0.15)';
  ictx.fill();
  ictx.strokeStyle = 'rgba(0,229,255,0.5)';
  ictx.lineWidth = 2;
  ictx.stroke();
  ictx.fillStyle = '#00e5ff';
  ictx.font = '10px Exo 2';
  ictx.textAlign = 'center';
  ictx.fillText('Soma', startX + 30, cy + 44);

  for (let i = 0; i < axLen; i++) {
    const xpos = startX + 60 + i;
    const frac = i / axLen;
    let col = 'rgba(245,158,11,0.5)';
    if (progress > 0 && frac <= progress) {
      const stageIdx = Math.floor(progress * 5);
      col = STAGE_COLORS[Math.min(stageIdx, 4)];
    }
    ictx.fillStyle = col;
    ictx.fillRect(xpos, cy - 7, 1, 14);
  }

  ictx.fillStyle = '#f59e0b';
  ictx.font = '10px Exo 2';
  ictx.textAlign = 'center';
  ictx.fillText('Axon', startX + 60 + axLen / 2, cy - 18);

  ictx.beginPath();
  ictx.arc(endX - 20, cy, 18, 0, Math.PI * 2);
  ictx.fillStyle = progress >= 1 ? 'rgba(0,229,255,0.4)' : 'rgba(0,229,255,0.1)';
  ictx.fill();
  ictx.strokeStyle = 'rgba(0,229,255,0.6)';
  ictx.lineWidth = 2;
  ictx.stroke();
  ictx.fillStyle = '#00e5ff';
  ictx.font = '9px Exo 2';
  ictx.textAlign = 'center';
  ictx.fillText('Terminal', endX - 20, cy + 35);

  if (progress > 0 && progress < 1) {
    const bx = startX + 60 + progress * axLen;
    const stageIdx = Math.min(Math.floor(progress * 5), 4);
    ictx.beginPath();
    ictx.arc(bx, cy, 10, 0, Math.PI * 2);
    ictx.fillStyle = STAGE_COLORS[stageIdx];
    ictx.shadowColor = STAGE_COLORS[stageIdx];
    ictx.shadowBlur = 20;
    ictx.fill();
    ictx.shadowBlur = 0;

    ictx.fillStyle = '#fff';
    ictx.font = 'bold 9px Exo 2';
    ictx.textAlign = 'center';
    if (stageIdx === 1) ictx.fillText('Na⁺→', bx, cy - 18);
    if (stageIdx === 2) ictx.fillText('K⁺←', bx, cy - 18);
  }
}

function drawPotentialGraph(stage, progress) {
  const gx = 40, gy = iH * 0.58, gw = iW - 80, gh = iH * 0.30;

  ictx.fillStyle = 'rgba(13,31,60,0.8)';
  ictx.fillRect(gx, gy, gw, gh);
  ictx.strokeStyle = 'rgba(0,229,255,0.2)';
  ictx.lineWidth = 1;
  ictx.strokeRect(gx, gy, gw, gh);

  const midY = gy + gh * 0.7;
  ictx.setLineDash([4, 4]);
  ictx.strokeStyle = 'rgba(255,255,255,0.15)';
  ictx.beginPath();
  ictx.moveTo(gx, midY);
  ictx.lineTo(gx + gw, midY);
  ictx.stroke();
  ictx.setLineDash([]);

  ictx.fillStyle = '#64748b';
  ictx.font = '10px Exo 2';
  ictx.textAlign = 'right';
  ictx.fillText('+40mV', gx - 4, gy + gh * 0.1);
  ictx.fillText('0mV', gx - 4, midY);
  ictx.fillText('-70mV', gx - 4, gy + gh * 0.92);
  ictx.fillText('Time →', gx + gw, gy + gh - 4);

  ictx.beginPath();
  ictx.strokeStyle = '#00e5ff';
  ictx.lineWidth = 2;
  ictx.shadowColor = '#00e5ff';
  ictx.shadowBlur = 8;
  const pts = [];
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    let v;
    if (t < 0.1)  v = -70;
    else if (t < 0.25) v = -70 + (t - 0.1) / 0.15 * 110;
    else if (t < 0.45) v = 40 - (t - 0.25) / 0.2 * 120;
    else if (t < 0.6)  v = -80 + (t - 0.45) / 0.15 * 10;
    else               v = -70;
    const px = gx + t * gw;
    const py = midY - ((v + 70) / 130) * gh * 0.85;
    pts.push({ x: px, y: py, t, v });
  }
  const drawUpTo = stage < 0 ? 0.05 : Math.min(progress * 0.9 + 0.05, 1);
  pts.forEach((p, i) => {
    if (p.t > drawUpTo) return;
    i === 0 ? ictx.moveTo(p.x, p.y) : ictx.lineTo(p.x, p.y);
  });
  ictx.stroke();
  ictx.shadowBlur = 0;

  ictx.fillStyle = '#00e5ff';
  ictx.font = '11px Orbitron, sans-serif';
  ictx.textAlign = 'left';
  ictx.fillText('Membrane Potential (mV)', gx + 8, gy + 16);
}

function startImpulse() {
  if (impulseAnim) return;
  const speed = parseFloat(document.getElementById('impulseSpeed').value);
  impulseProgress = 0;
  currentStage = -1;
  STAGES.forEach(s => document.getElementById(s).classList.remove('active-stage'));

  impulseAnim = setInterval(() => {
    impulseProgress += 0.004 * speed;
    if (impulseProgress >= 1) {
      impulseProgress = 1;
      clearInterval(impulseAnim);
      impulseAnim = null;
    }
    const stageIdx = Math.min(Math.floor(impulseProgress * 5), 4);
    if (stageIdx !== currentStage) {
      currentStage = stageIdx;
      STAGES.forEach(s => document.getElementById(s).classList.remove('active-stage'));
      if (STAGES[stageIdx]) document.getElementById(STAGES[stageIdx]).classList.add('active-stage');
    }
    ictx.clearRect(0, 0, iW, iH);
    drawNeuronShape(impulseProgress, currentStage, STAGE_COLORS[currentStage] || '#64748b');
    drawPotentialGraph(currentStage, impulseProgress);
  }, 16);
}

function resetImpulse() {
  if (impulseAnim) clearInterval(impulseAnim);
  impulseAnim = null;
  impulseProgress = 0;
  currentStage = -1;
  STAGES.forEach(s => document.getElementById(s).classList.remove('active-stage'));
  if (ictx) drawImpulseIdle();
}

// ============================================================
//  SECTION 3 — SYNAPSE
// ============================================================
let sCanvas, sctx, sW, sH;
let synapseAnim = null;
let synapseProgress = 0;
let vesicles = [];

function initSynapse() {
  sCanvas = document.getElementById('synapseCanvas');
  sctx = sCanvas.getContext('2d');
  sCanvas.width  = sCanvas.offsetWidth;
  sCanvas.height = sCanvas.offsetHeight;
  sW = sCanvas.width; sH = sCanvas.height;
  initVesicles();
  drawSynapse(0);
}

function initVesicles() {
  vesicles = [];
  const cx = sW / 2;
  for (let i = 0; i < 12; i++) {
    vesicles.push({
      x: cx - 60 + Math.random() * 80,
      y: sH * 0.28 - 30 + Math.random() * 50,
      r: 7 + Math.random() * 4,
      tx: cx - 20 + Math.random() * 40,
      ty: sH * 0.5,
      released: false,
      speed: 0.5 + Math.random() * 0.5,
      px: 0, py: 0,
      bound: false,
    });
  }
}

function drawSynapse(progress) {
  if (!sctx) return;
  sctx.clearRect(0, 0, sW, sH);
  const cx = sW / 2;

  const preGrad = sctx.createRadialGradient(cx, sH * 0.28, 10, cx, sH * 0.28, 80);
  preGrad.addColorStop(0, 'rgba(0,229,255,0.25)');
  preGrad.addColorStop(1, 'rgba(0,40,100,0.6)');
  sctx.beginPath();
  sctx.ellipse(cx, sH * 0.22, 120, 75, 0, 0, Math.PI * 2);
  sctx.fillStyle = preGrad;
  sctx.fill();
  sctx.strokeStyle = 'rgba(0,229,255,0.6)';
  sctx.lineWidth = 2;
  sctx.stroke();

  sctx.fillStyle = '#00e5ff';
  sctx.font = '12px Orbitron';
  sctx.textAlign = 'center';
  sctx.fillText('Pre-synaptic Terminal', cx, sH * 0.08);

  sctx.fillStyle = 'rgba(100,116,139,0.15)';
  sctx.fillRect(cx - 130, sH * 0.44, 260, sH * 0.11);
  sctx.strokeStyle = 'rgba(100,116,139,0.3)';
  sctx.setLineDash([6, 4]);
  sctx.strokeRect(cx - 130, sH * 0.44, 260, sH * 0.11);
  sctx.setLineDash([]);
  sctx.fillStyle = '#64748b';
  sctx.font = '10px Exo 2';
  sctx.fillText('Synaptic Cleft (~20nm)', cx, sH * 0.5);

  const postGrad = sctx.createLinearGradient(cx, sH * 0.55, cx, sH * 0.88);
  postGrad.addColorStop(0, 'rgba(124,58,237,0.3)');
  postGrad.addColorStop(1, 'rgba(60,0,120,0.6)');
  sctx.beginPath();
  sctx.ellipse(cx, sH * 0.72, 130, 90, 0, 0, Math.PI * 2);
  sctx.fillStyle = postGrad;
  sctx.fill();
  sctx.strokeStyle = 'rgba(124,58,237,0.6)';
  sctx.lineWidth = 2;
  sctx.stroke();

  sctx.fillStyle = '#7c3aed';
  sctx.font = '12px Orbitron';
  sctx.textAlign = 'center';
  sctx.fillText('Post-synaptic Neuron', cx, sH * 0.92);

  for (let r = 0; r < 8; r++) {
    const rx = cx - 100 + r * 28;
    const ry = sH * 0.555;
    sctx.beginPath();
    sctx.rect(rx, ry, 10, 14);
    sctx.fillStyle = progress > 0.7 && Math.abs(rx - cx) < 90 ? '#10b981' : 'rgba(124,58,237,0.5)';
    sctx.fill();
    sctx.strokeStyle = 'rgba(124,58,237,0.8)';
    sctx.lineWidth = 1;
    sctx.stroke();
  }

  vesicles.forEach((v, i) => {
    let x = v.x, y = v.y;
    let alpha = 1;
    if (progress > 0.2 + i * 0.02) {
      const frac = Math.min((progress - 0.2 - i * 0.02) / 0.5, 1);
      x = v.x + (v.tx - v.x) * frac;
      y = v.y + (v.ty - v.y) * frac;
      alpha = frac > 0.95 ? 0 : 1;
    }
    if (alpha > 0) {
      sctx.beginPath();
      sctx.arc(x, y, v.r, 0, Math.PI * 2);
      sctx.fillStyle = `rgba(255,220,50,${alpha * 0.85})`;
      sctx.shadowColor = '#fde047';
      sctx.shadowBlur = 10;
      sctx.fill();
      sctx.shadowBlur = 0;
    }
    if (progress > 0.5 && i < 6) {
      const dotX = cx - 80 + i * 28 + Math.sin(progress * 10 + i) * 5;
      const dotY = sH * 0.48 + Math.cos(progress * 8 + i) * 8;
      sctx.beginPath();
      sctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      sctx.fillStyle = 'rgba(253,224,71,0.9)';
      sctx.shadowColor = '#fde047';
      sctx.shadowBlur = 8;
      sctx.fill();
      sctx.shadowBlur = 0;
    }
  });

  const steps = ['syn1','syn2','syn3','syn4','syn5'];
  steps.forEach(s => document.getElementById(s).classList.remove('active-step'));
  if (progress > 0.05) document.getElementById('syn1').classList.add('active-step');
  if (progress > 0.25) document.getElementById('syn2').classList.add('active-step');
  if (progress > 0.45) document.getElementById('syn3').classList.add('active-step');
  if (progress > 0.65) document.getElementById('syn4').classList.add('active-step');
  if (progress > 0.85) document.getElementById('syn5').classList.add('active-step');
}

function fireSynapse() {
  if (synapseAnim) return;
  synapseProgress = 0;
  initVesicles();
  const steps = ['syn1','syn2','syn3','syn4','syn5'];
  steps.forEach(s => document.getElementById(s).classList.remove('active-step'));

  synapseAnim = setInterval(() => {
    synapseProgress += 0.006;
    if (synapseProgress >= 1) {
      synapseProgress = 1;
      clearInterval(synapseAnim);
      synapseAnim = null;
    }
    drawSynapse(synapseProgress);
  }, 16);
}

function resetSynapse() {
  if (synapseAnim) clearInterval(synapseAnim);
  synapseAnim = null;
  synapseProgress = 0;
  initVesicles();
  const steps = ['syn1','syn2','syn3','syn4','syn5'];
  steps.forEach(s => document.getElementById(s).classList.remove('active-step'));
  drawSynapse(0);
}

// ============================================================
//  SECTION 4 — NEURON TYPES
// ============================================================
function drawAllTypeNeurons() {
  drawSensory();
  drawMotor();
  drawInterneuron();
  drawPurkinje();
}

function drawSensory() {
  const c = document.getElementById('sensoryCanvas');
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 220, 160);
  ctx.beginPath(); ctx.arc(110, 80, 22, 0, Math.PI*2);
  ctx.fillStyle='rgba(0,229,255,0.2)'; ctx.fill();
  ctx.strokeStyle='#00e5ff'; ctx.lineWidth=2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(88,80); ctx.lineTo(20,80);
  ctx.strokeStyle='rgba(0,229,255,0.7)'; ctx.lineWidth=2.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(132,80); ctx.lineTo(200,80);
  ctx.strokeStyle='rgba(0,229,255,0.7)'; ctx.lineWidth=2.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(110,80,5,0,Math.PI*2);
  ctx.fillStyle='#00e5ff'; ctx.fill();
  ctx.fillStyle='#00e5ff'; ctx.font='9px Exo 2'; ctx.textAlign='center';
  ctx.fillText('Receptor', 35, 72);
  ctx.fillText('→ CNS', 186, 72);
}

function drawMotor() {
  const c = document.getElementById('motorCanvas');
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 220, 160);
  ctx.beginPath(); ctx.arc(60, 80, 26, 0, Math.PI*2);
  ctx.fillStyle='rgba(124,58,237,0.2)'; ctx.fill();
  ctx.strokeStyle='#7c3aed'; ctx.lineWidth=2; ctx.stroke();
  const angles = [-120,-90,-60,-150,-160];
  angles.forEach(a => {
    const rad = a * Math.PI / 180;
    ctx.beginPath(); ctx.moveTo(60,80);
    ctx.lineTo(60 + Math.cos(rad)*50, 80 + Math.sin(rad)*50);
    ctx.strokeStyle='rgba(124,58,237,0.6)'; ctx.lineWidth=2; ctx.stroke();
  });
  ctx.beginPath(); ctx.moveTo(86,80); ctx.lineTo(200,80);
  ctx.strokeStyle='rgba(124,58,237,0.8)'; ctx.lineWidth=3; ctx.stroke();
  for (let i=0;i<3;i++) {
    ctx.fillStyle='rgba(124,58,237,0.3)';
    ctx.fillRect(95+i*36, 74, 26, 12);
  }
  ctx.beginPath(); ctx.arc(200,80,10,0,Math.PI*2);
  ctx.fillStyle='rgba(124,58,237,0.6)'; ctx.fill();
  ctx.fillStyle='#7c3aed'; ctx.font='9px Exo 2'; ctx.textAlign='center';
  ctx.fillText('Muscle', 200, 100);
}

function drawInterneuron() {
  const c = document.getElementById('interneuronCanvas');
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 220, 160);
  ctx.beginPath(); ctx.arc(110, 80, 20, 0, Math.PI*2);
  ctx.fillStyle='rgba(16,185,129,0.2)'; ctx.fill();
  ctx.strokeStyle='#10b981'; ctx.lineWidth=2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(90,80); ctx.lineTo(20,80);
  ctx.strokeStyle='rgba(16,185,129,0.7)'; ctx.lineWidth=2.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(130,80); ctx.lineTo(200,80);
  ctx.strokeStyle='rgba(16,185,129,0.7)'; ctx.lineWidth=2.5; ctx.stroke();
  [[20,80],[200,80]].forEach(([px,py]) => {
    ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+10,py-15);
    ctx.strokeStyle='rgba(16,185,129,0.4)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px-10,py-15);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px,py+18);
    ctx.stroke();
  });
  ctx.fillStyle='#10b981'; ctx.font='9px Exo 2'; ctx.textAlign='center';
  ctx.fillText('Input', 20, 108); ctx.fillText('Output', 200, 108);
}

function drawPurkinje() {
  const c = document.getElementById('purkinjeCanvas');
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 220, 160);
  ctx.beginPath(); ctx.arc(110, 120, 14, 0, Math.PI*2);
  ctx.fillStyle='rgba(245,158,11,0.25)'; ctx.fill();
  ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2; ctx.stroke();
  function branch(x, y, angle, len, depth) {
    if (depth === 0 || len < 5) return;
    const ex = x + Math.cos(angle)*len;
    const ey = y + Math.sin(angle)*len;
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(ex,ey);
    ctx.strokeStyle=`rgba(245,158,11,${0.3+depth*0.12})`;
    ctx.lineWidth=depth*0.7;
    ctx.stroke();
    branch(ex, ey, angle - 0.45, len*0.65, depth-1);
    branch(ex, ey, angle + 0.45, len*0.65, depth-1);
  }
  branch(110, 106, -Math.PI/2, 30, 5);
  ctx.beginPath(); ctx.moveTo(110,134); ctx.lineTo(110,155);
  ctx.strokeStyle='rgba(245,158,11,0.7)'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='#f59e0b'; ctx.font='9px Exo 2'; ctx.textAlign='center';
  ctx.fillText('Purkinje Cell', 110, 155);
}

// ============================================================
//  INIT
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  initAnatomy();
  const origShow = showSection;
  window.showSection = function(id) {
    origShow(id);
    if (id === 'impulse' && !ictx)  initImpulse();
    if (id === 'synapse' && !sctx)  initSynapse();
    if (id === 'types')              drawAllTypeNeurons();
    if (id === 'classifier')        initClassifierSection();
  };
  window.addEventListener('resize', () => {
    if (iCanvas) { iCanvas.width=iCanvas.offsetWidth; iCanvas.height=iCanvas.offsetHeight; iW=iCanvas.width; iH=iCanvas.height; drawImpulseIdle(); }
    if (sCanvas) { sCanvas.width=sCanvas.offsetWidth; sCanvas.height=sCanvas.offsetHeight; sW=sCanvas.width; sH=sCanvas.height; drawSynapse(0); }
  });
});
