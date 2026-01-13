const BASE_PROMPT =
  "abstract, non-figurative, organic field texture, subdued tones, imperfect continuity, wabi-sabi restraint, atmospheric, film grain";
const NEGATIVE_PROMPT =
  "text, letters, typography, logo, map, buildings, faces, characters, icons, signage, illustration, cartoon";
const DEFAULT_OVERRIDE_PROMPT =
  "abstract, non-figurative, organic field texture, subdued tones, imperfect continuity, wabi-sabi restraint, atmospheric, film grain, (bay:0.84), (salt:0.84), (haze:0.84), (late:0.84), (traffic:0.84), (glow:0.85), (wet:0.84), (pavement:0.84), (slow:0.84), (currents:0.84), (sirens:0.80), (ladder:0.80), (basin:0.80)";

const TARGET_SIZE = 512;

const BOOTSTRAP_TOKENS = [
  "heat",
  "tide",
  "bridge",
  "rent",
  "sprawl",
  "storm",
  "asphalt",
  "night",
  "humidity",
  "bay",
  "mangrove",
  "marina",
  "stripmall",
  "sand",
  "salt",
  "skyline",
  "neon",
  "lagoon",
  "palm",
  "swell",
  "road",
  "tar",
  "rain",
  "light",
  "haze",
  "shell",
  "bayou",
  "air",
  "canal",
  "mosquito",
  "gulf",
  "dock",
  "ice",
  "shade",
  "dusk",
  "glow",
  "cargo",
  "lantern",
  "oxide",
  "concrete",
  "pier",
  "current",
  "ferry",
  "sirens",
  "street",
  "marsh",
  "cicada",
  "dry",
  "swamp",
  "skiff",
  "shipyard",
  "lot",
  "smog",
  "rail",
  "seawall",
  "foam",
  "basin",
  "glare",
  "brine",
  "ripples",
  "drift",
  "thrum",
  "overpass",
  "quay",
  "spray",
  "damp",
  "coast",
  "jetty",
  "rust",
  "motel",
  "sunset",
  "wake",
  "island",
  "pulse",
  "barge",
  "eddy",
  "breeze",
  "conduit",
  "delta",
  "silt",
  "spill",
  "tarmac",
  "gutter",
  "drizzle",
  "plume",
  "vapor",
  "mirror",
  "shore",
  "levee",
  "channel",
  "glimmer",
  "sump",
  "grain",
  "tint",
  "pool",
  "curl",
  "bracket",
  "thicket",
  "sediment",
  "ladder",
  "glitch",
  "static"
];

const STOPWORDS = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "doing",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "itself",
  "just",
  "me",
  "more",
  "most",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "now",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "she",
  "should",
  "so",
  "some",
  "such",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "with",
  "would",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves"
]);

const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");

const fidelityInput = document.getElementById("fidelity");
const kInput = document.getElementById("kValue");
const motionReadout = document.getElementById("motionReadout");
const inputText = document.getElementById("inputText");
const submitText = document.getElementById("submitText");
const simulateBurst = document.getElementById("simulateBurst");
const generatePromptBtn = document.getElementById("generatePrompt");
const copyPromptBtn = document.getElementById("copyPrompt");
const promptBlock = document.getElementById("promptBlock");
const manualPrompt = document.getElementById("manualPrompt");
const targetImageInput = document.getElementById("targetImageInput");
const targetPreview = document.getElementById("targetPreview");
const clearTargetImageBtn = document.getElementById("clearTargetImage");
const promptOutput = document.getElementById("promptOutput");
const negativeOutput = document.getElementById("negativeOutput");
const promptTimestamp = document.getElementById("promptTimestamp");
const currentK = document.getElementById("currentK");
const clusterSizesEl = document.getElementById("clusterSizes");
const tokenCountEl = document.getElementById("tokenCount");
const clusterDetails = document.getElementById("clusterDetails");

const reservoir = new Map();
const messages = [];
const maxMessages = 120;
const decayRate = 0.00035;

const outputCanvas = document.createElement("canvas");
const outputCtx = outputCanvas.getContext("2d", { willReadFrequently: true });
outputCanvas.width = TARGET_SIZE;
outputCanvas.height = TARGET_SIZE;

const workCanvas = document.createElement("canvas");
const workCtx = workCanvas.getContext("2d", { willReadFrequently: true });
workCanvas.width = TARGET_SIZE;
workCanvas.height = TARGET_SIZE;

const targetCanvas = document.createElement("canvas");
const targetCtx = targetCanvas.getContext("2d");
targetCanvas.width = TARGET_SIZE;
targetCanvas.height = TARGET_SIZE;

let targetImageReady = false;
let targetImageUrl = null;
let targetLevels = [];
let gradientField = null;
let noiseFieldA = null;
let noiseFieldB = null;
let stateFieldA = null;
let stateFieldB = null;
let outputImageData = outputCtx.createImageData(TARGET_SIZE, TARGET_SIZE);
let maxGradient = 1;

let clusters = [];
let lastPrompt = "";
let lastNegative = NEGATIVE_PROMPT;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 2 && !STOPWORDS.has(word));
}

function addMessage(text) {
  const tokens = tokenize(text);
  if (!tokens.length) {
    return;
  }
  const now = Date.now();
  messages.push({ tokens, timestamp: now });
  if (messages.length > maxMessages) {
    messages.shift();
  }
  tokens.forEach((token) => {
    const entry = reservoir.get(token) || { count: 0, lastSeen: now };
    entry.count += 1;
    entry.lastSeen = now;
    reservoir.set(token, entry);
  });
}

function getDecayedCount(word, now) {
  const entry = reservoir.get(word);
  if (!entry) {
    return 0;
  }
  return entry.count * Math.exp(-decayRate * (now - entry.lastSeen));
}

function vectorizeMessages(items) {
  const vocab = new Map();
  items.forEach((item) => {
    item.tokens.forEach((token) => {
      if (!vocab.has(token)) {
        vocab.set(token, vocab.size);
      }
    });
  });
  const vectors = items.map((item) => {
    const vec = new Array(vocab.size).fill(0);
    item.tokens.forEach((token) => {
      const index = vocab.get(token);
      vec[index] += 1;
    });
    const magnitude = Math.sqrt(vec.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vec.map((value) => value / magnitude);
  });
  return { vocab, vectors };
}

function distance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

function meanVector(vectors, size) {
  const mean = new Array(size).fill(0);
  vectors.forEach((vec) => {
    for (let i = 0; i < size; i += 1) {
      mean[i] += vec[i];
    }
  });
  return mean.map((value) => value / Math.max(1, vectors.length));
}

function kMeans(vectors, k) {
  if (!vectors.length) {
    return [];
  }
  const dimension = vectors[0].length;
  const centroids = [];
  const used = new Set();
  while (centroids.length < k) {
    const index = Math.floor(Math.random() * vectors.length);
    if (!used.has(index)) {
      centroids.push([...vectors[index]]);
      used.add(index);
    }
  }
  let assignments = new Array(vectors.length).fill(0);
  for (let iter = 0; iter < 6; iter += 1) {
    assignments = vectors.map((vec) => {
      let best = 0;
      let bestDist = Infinity;
      centroids.forEach((centroid, idx) => {
        const dist = distance(vec, centroid);
        if (dist < bestDist) {
          bestDist = dist;
          best = idx;
        }
      });
      return best;
    });
    for (let i = 0; i < k; i += 1) {
      const clusterVectors = vectors.filter((_, idx) => assignments[idx] === i);
      if (clusterVectors.length) {
        centroids[i] = meanVector(clusterVectors, dimension);
      }
    }
  }
  return assignments;
}

function hashToUnit(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

function buildClusters() {
  const kTarget = Math.max(1, Number.parseInt(kInput.value, 10) || 1);
  if (!messages.length) {
    clusters = [];
    return;
  }
  const { vocab, vectors } = vectorizeMessages(messages);
  const k = Math.min(kTarget, vectors.length);
  const assignments = kMeans(vectors, k);
  const clusterBuckets = new Array(k).fill(0).map(() => []);
  const clusterTermScores = new Array(k).fill(0).map(() => new Map());

  messages.forEach((message, idx) => {
    const bucket = assignments[idx];
    clusterBuckets[bucket].push(message);
    message.tokens.forEach((token) => {
      const termMap = clusterTermScores[bucket];
      termMap.set(token, (termMap.get(token) || 0) + 1);
    });
  });

  clusters = clusterBuckets.map((bucket, idx) => {
    const termMap = clusterTermScores[idx];
    const topTerms = [...termMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([term]) => term);
    return {
      size: bucket.length,
      terms: topTerms,
      index: idx,
      seed: hashToUnit(topTerms.join(""))
    };
  });

  renderClusterDebug(k);
}

function renderClusterDebug(k) {
  currentK.textContent = String(k);
  clusterSizesEl.textContent = clusters.map((cluster) => cluster.size).join(", ");
  tokenCountEl.textContent = String(reservoir.size);
  clusterDetails.innerHTML = "";
  clusters.forEach((cluster, idx) => {
    const item = document.createElement("div");
    item.className = "cluster-item";
    item.textContent = `Cluster ${idx + 1}: ${cluster.terms.join(", ")}`;
    clusterDetails.appendChild(item);
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function initFields() {
  const total = TARGET_SIZE * TARGET_SIZE;
  noiseFieldA = new Float32Array(total);
  noiseFieldB = new Float32Array(total);
  stateFieldA = new Float32Array(total);
  stateFieldB = new Float32Array(total);
  for (let i = 0; i < total; i += 1) {
    const seed = Math.random();
    noiseFieldA[i] = seed;
    noiseFieldB[i] = seed;
    stateFieldA[i] = seed;
    stateFieldB[i] = seed;
  }
}

function buildPyramid() {
  const blurLevels = [0, 3, 8, 18];
  targetLevels = blurLevels.map((radius) => {
    workCtx.clearRect(0, 0, TARGET_SIZE, TARGET_SIZE);
    workCtx.filter = radius ? `blur(${radius}px)` : "none";
    workCtx.drawImage(targetCanvas, 0, 0, TARGET_SIZE, TARGET_SIZE);
    workCtx.filter = "none";
    const imageData = workCtx.getImageData(0, 0, TARGET_SIZE, TARGET_SIZE);
    const luminance = new Float32Array(TARGET_SIZE * TARGET_SIZE);
    const data = imageData.data;
    for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      luminance[p] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    return { data, luminance };
  });
}

function computeGradient() {
  const level = targetLevels[0];
  if (!level) {
    gradientField = null;
    return;
  }
  const yData = level.luminance;
  const total = TARGET_SIZE * TARGET_SIZE;
  const gx = new Float32Array(total);
  const gy = new Float32Array(total);
  const tx = new Float32Array(total);
  const ty = new Float32Array(total);
  const mag = new Float32Array(total);
  maxGradient = 0.0001;

  for (let y = 0; y < TARGET_SIZE; y += 1) {
    for (let x = 0; x < TARGET_SIZE; x += 1) {
      const idx = y * TARGET_SIZE + x;
      const x0 = Math.max(0, x - 1);
      const x1 = Math.min(TARGET_SIZE - 1, x + 1);
      const y0 = Math.max(0, y - 1);
      const y1 = Math.min(TARGET_SIZE - 1, y + 1);

      const y00 = yData[y0 * TARGET_SIZE + x0];
      const y01 = yData[y0 * TARGET_SIZE + x];
      const y02 = yData[y0 * TARGET_SIZE + x1];
      const y10 = yData[y * TARGET_SIZE + x0];
      const y12 = yData[y * TARGET_SIZE + x1];
      const y20 = yData[y1 * TARGET_SIZE + x0];
      const y21 = yData[y1 * TARGET_SIZE + x];
      const y22 = yData[y1 * TARGET_SIZE + x1];

      const gxVal = -y00 + y02 - 2 * y10 + 2 * y12 - y20 + y22;
      const gyVal = y00 + 2 * y01 + y02 - y20 - 2 * y21 - y22;
      gx[idx] = gxVal;
      gy[idx] = gyVal;
      const magnitude = Math.hypot(gxVal, gyVal);
      mag[idx] = magnitude;
      if (magnitude > maxGradient) {
        maxGradient = magnitude;
      }
      const txVal = -gyVal;
      const tyVal = gxVal;
      const tMag = Math.hypot(txVal, tyVal) || 1;
      tx[idx] = txVal / tMag;
      ty[idx] = tyVal / tMag;
    }
  }

  gradientField = { gx, gy, tx, ty, mag };
}

function rebuildTargetData() {
  buildPyramid();
  computeGradient();
  initFields();
}

function wrapCoord(value, max) {
  let v = value % max;
  if (v < 0) {
    v += max;
  }
  return v;
}

function sampleField(field, x, y) {
  const size = TARGET_SIZE;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = wrapCoord(x0 + 1, size);
  const y1 = wrapCoord(y0 + 1, size);
  const fx = x - x0;
  const fy = y - y0;

  const x0w = wrapCoord(x0, size);
  const y0w = wrapCoord(y0, size);
  const idx00 = y0w * size + x0w;
  const idx10 = y0w * size + x1;
  const idx01 = y1 * size + x0w;
  const idx11 = y1 * size + x1;

  const v00 = field[idx00];
  const v10 = field[idx10];
  const v01 = field[idx01];
  const v11 = field[idx11];
  const vx0 = lerp(v00, v10, fx);
  const vx1 = lerp(v01, v11, fx);
  return lerp(vx0, vx1, fy);
}

function updateNoiseField(fidelity, motionScale) {
  if (!gradientField) {
    return;
  }
  const { tx, ty, mag } = gradientField;
  const size = TARGET_SIZE;
  const total = size * size;
  const advectStrength = 1.6 * motionScale;
  const injectStrength = 0.08 * (1 - fidelity);

  for (let i = 0; i < total; i += 1) {
    const x = i % size;
    const y = Math.floor(i / size);
    const magNorm = mag[i] / maxGradient;
    const flowScale = advectStrength * (0.4 + magNorm);
    const dx = tx[i] * flowScale;
    const dy = ty[i] * flowScale;
    const sample = sampleField(noiseFieldA, x - dx, y - dy);
    const injected = sample + (Math.random() - 0.5) * injectStrength;
    noiseFieldB[i] = clamp(injected, 0, 1);
  }

  [noiseFieldA, noiseFieldB] = [noiseFieldB, noiseFieldA];
}

function updateStateField(fidelity) {
  if (!targetLevels.length) {
    return;
  }
  const maxIndex = targetLevels.length - 1;
  const coarseIndex = clamp(Math.round((1 - fidelity) * maxIndex), 0, maxIndex);
  const coarseY = targetLevels[coarseIndex].luminance;
  const detailY = targetLevels[0].luminance;
  const baseStep = 0.01 + fidelity * 0.06;
  const detailStep = fidelity * fidelity * 0.05;

  const total = TARGET_SIZE * TARGET_SIZE;
  for (let i = 0; i < total; i += 1) {
    let state = stateFieldA[i];
    state += baseStep * (coarseY[i] - state);
    if (detailStep > 0.001) {
      state += detailStep * (detailY[i] - state);
    }
    stateFieldB[i] = clamp(state, 0, 1);
  }

  const diffusion = (1 - Math.min(1, Math.abs(fidelity - 0.5) * 2)) * 0.12;
  if (diffusion > 0.01 && gradientField) {
    const { tx, ty } = gradientField;
    const size = TARGET_SIZE;
    for (let i = 0; i < total; i += 1) {
      const x = i % size;
      const y = Math.floor(i / size);
      const dx = tx[i] * 1.2;
      const dy = ty[i] * 1.2;
      const a = sampleField(stateFieldB, x + dx, y + dy);
      const b = sampleField(stateFieldB, x - dx, y - dy);
      const avg = (a + b) * 0.5;
      stateFieldA[i] = lerp(stateFieldB[i], avg, diffusion);
    }
  } else {
    [stateFieldA, stateFieldB] = [stateFieldB, stateFieldA];
  }
}

function licNoise(x, y, tx, ty) {
  const tapCount = 5;
  let sum = 0;
  let weight = 0;
  for (let i = -2; i <= 2; i += 1) {
    const offset = i * 1.2;
    const sample = sampleField(noiseFieldA, x + tx * offset, y + ty * offset);
    const w = 1 - Math.abs(i) / tapCount;
    sum += sample * w;
    weight += w;
  }
  return sum / weight;
}

function renderFrame() {
  const fidelity = Number.parseFloat(fidelityInput.value);
  const motionScale = (1 - fidelity) ** 2;
  motionReadout.textContent = motionScale.toFixed(3);

  if (!noiseFieldA || !stateFieldA) {
    initFields();
  }

  if (targetImageReady && targetLevels.length) {
    updateNoiseField(fidelity, motionScale);
    updateStateField(fidelity);

    const maxIndex = targetLevels.length - 1;
    const colorIndex = clamp(Math.round((1 - fidelity) * maxIndex), 0, maxIndex);
    const level = targetLevels[colorIndex];
    const baseData = level.data;
    const baseY = level.luminance;
    const total = TARGET_SIZE * TARGET_SIZE;
    const grainMix = 0.08 + (1 - fidelity) * 0.35;
    const { tx, ty } = gradientField || { tx: null, ty: null };

    for (let i = 0; i < total; i += 1) {
      const x = i % TARGET_SIZE;
      const y = Math.floor(i / TARGET_SIZE);
      const tX = tx ? tx[i] : 1;
      const tY = ty ? ty[i] : 0;
      const lic = licNoise(x, y, tX, tY);
      const grainDetail = (lic - 0.5) * 2;
      const yOut = clamp(stateFieldA[i] + grainDetail * grainMix, 0, 1);

      const dataIndex = i * 4;
      const r = baseData[dataIndex];
      const g = baseData[dataIndex + 1];
      const b = baseData[dataIndex + 2];
      const ratio = yOut / (baseY[i] + 0.001);
      outputImageData.data[dataIndex] = clamp(r * ratio, 0, 255);
      outputImageData.data[dataIndex + 1] = clamp(g * ratio, 0, 255);
      outputImageData.data[dataIndex + 2] = clamp(b * ratio, 0, 255);
      outputImageData.data[dataIndex + 3] = 255;
    }
  } else {
    const total = TARGET_SIZE * TARGET_SIZE;
    for (let i = 0; i < total; i += 1) {
      const value = clamp(stateFieldA[i] + (noiseFieldA[i] - 0.5) * 0.4, 0, 1);
      const dataIndex = i * 4;
      const gray = Math.floor(value * 255);
      outputImageData.data[dataIndex] = gray;
      outputImageData.data[dataIndex + 1] = gray;
      outputImageData.data[dataIndex + 2] = gray;
      outputImageData.data[dataIndex + 3] = 255;
    }
  }

  outputCtx.putImageData(outputImageData, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(outputCanvas, 0, 0, canvas.width, canvas.height);

  requestAnimationFrame(renderFrame);
}

function generatePrompt() {
  const now = Date.now();
  const terms = [];
  clusters.forEach((cluster) => {
    cluster.terms.slice(0, 5).forEach((term) => {
      if (!terms.includes(term)) {
        terms.push(term);
      }
    });
  });
  const limited = terms.slice(0, 30);
  const weights = limited.map((term) => getDecayedCount(term, now));
  const maxWeight = Math.max(1, ...weights);
  const weightedTerms = limited.map((term, idx) => {
    const normalized = Math.sqrt(weights[idx]) / Math.sqrt(maxWeight);
    const weight = Math.min(1.8, Math.max(0.8, 0.8 + normalized));
    return `(${term}:${weight.toFixed(2)})`;
  });

  lastPrompt = [BASE_PROMPT, ...weightedTerms].join(", ");
  lastNegative = NEGATIVE_PROMPT;

  promptBlock.value = `PROMPT:\n${lastPrompt}\n\nNEGATIVE:\n${lastNegative}`;
  promptOutput.textContent = lastPrompt;
  negativeOutput.textContent = lastNegative;
  promptTimestamp.textContent = new Date().toLocaleTimeString();
}

function copyPrompt() {
  const manualValue = manualPrompt.value.trim();
  const promptText = manualValue.length ? manualValue : lastPrompt;
  const combined = `PROMPT:\n${promptText}\n\nNEGATIVE:\n${lastNegative}`;
  navigator.clipboard.writeText(combined).catch(() => {
    // Clipboard may be blocked; ignore.
  });
}

function drawTargetToCanvas(image) {
  const scale = Math.max(TARGET_SIZE / image.width, TARGET_SIZE / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const dx = (TARGET_SIZE - drawWidth) / 2;
  const dy = (TARGET_SIZE - drawHeight) / 2;
  targetCtx.clearRect(0, 0, TARGET_SIZE, TARGET_SIZE);
  targetCtx.drawImage(image, dx, dy, drawWidth, drawHeight);
  targetImageReady = true;
  rebuildTargetData();
}

function handleTargetImage(file) {
  if (!file) {
    return;
  }
  if (targetImageUrl) {
    URL.revokeObjectURL(targetImageUrl);
  }
  targetImageUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    drawTargetToCanvas(image);
    targetPreview.src = targetImageUrl;
  };
  image.src = targetImageUrl;
}

function clearTargetImage() {
  targetCtx.clearRect(0, 0, TARGET_SIZE, TARGET_SIZE);
  targetImageReady = false;
  targetLevels = [];
  gradientField = null;
  initFields();
  targetPreview.src = "";
  if (targetImageUrl) {
    URL.revokeObjectURL(targetImageUrl);
    targetImageUrl = null;
  }
  targetImageInput.value = "";
}

function simulateBurstMessages() {
  const samples = [
    "glow over wet pavement and slow currents",
    "salt haze and late traffic around the bay",
    "humid midnight drift with rusted rails",
    "storm residue settling into asphalt",
    "dawn heat rising through concrete channels",
    "soft glare bouncing off seawalls",
    "brine mist and distant freight pulses",
    "neon reflections on pooling water"
  ];
  for (let i = 0; i < 12; i += 1) {
    const sample = samples[Math.floor(Math.random() * samples.length)];
    addMessage(sample);
  }
  buildClusters();
}

submitText.addEventListener("click", () => {
  addMessage(inputText.value);
  inputText.value = "";
  buildClusters();
});

simulateBurst.addEventListener("click", simulateBurstMessages);

generatePromptBtn.addEventListener("click", generatePrompt);
copyPromptBtn.addEventListener("click", copyPrompt);

kInput.addEventListener("change", buildClusters);
targetImageInput.addEventListener("change", (event) => {
  handleTargetImage(event.target.files[0]);
});
clearTargetImageBtn.addEventListener("click", clearTargetImage);

BOOTSTRAP_TOKENS.forEach((token) => addMessage(token));
buildClusters();
negativeOutput.textContent = NEGATIVE_PROMPT;
promptOutput.textContent = "";
manualPrompt.value = DEFAULT_OVERRIDE_PROMPT;
generatePrompt();

requestAnimationFrame(renderFrame);
