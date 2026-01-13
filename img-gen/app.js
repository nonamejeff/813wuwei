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
const grainIntensityInput = document.getElementById("grainIntensity");
const kInput = document.getElementById("kValue");
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

const baseCanvas = document.createElement("canvas");
const baseCtx = baseCanvas.getContext("2d");
baseCanvas.width = 300;
baseCanvas.height = 300;

const noiseCanvas = document.createElement("canvas");
const noiseCtx = noiseCanvas.getContext("2d");
noiseCanvas.width = 160;
noiseCanvas.height = 160;

const targetCanvas = document.createElement("canvas");
const targetCtx = targetCanvas.getContext("2d");
targetCanvas.width = TARGET_SIZE;
targetCanvas.height = TARGET_SIZE;

let targetImageReady = false;
let targetImageUrl = null;

let clusters = [];
let lastPrompt = "";
let lastNegative = NEGATIVE_PROMPT;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const grainScale = 0.5;
  noiseCanvas.width = Math.max(1, Math.floor(canvas.width * grainScale));
  noiseCanvas.height = Math.max(1, Math.floor(canvas.height * grainScale));
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
  generateBaseTexture();
}

function generateBaseTexture() {
  baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
  baseCtx.fillStyle = "rgba(5, 6, 8, 0.9)";
  baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
  baseCtx.globalCompositeOperation = "lighter";

  clusters.forEach((cluster, idx) => {
    const weight = cluster.size / Math.max(1, messages.length);
    const px = hashToUnit(`${idx}-x`) * baseCanvas.width;
    const py = hashToUnit(`${idx}-y`) * baseCanvas.height;
    const radius = 80 + weight * 120;
    const gradient = baseCtx.createRadialGradient(px, py, radius * 0.1, px, py, radius);
    const hue = 180 + idx * 35;
    gradient.addColorStop(0, `hsla(${hue}, 60%, 55%, ${0.4 + weight})`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    baseCtx.fillStyle = gradient;
    baseCtx.beginPath();
    baseCtx.arc(px, py, radius, 0, Math.PI * 2);
    baseCtx.fill();

    baseCtx.globalAlpha = 0.2 + weight * 0.4;
    baseCtx.fillStyle = `hsla(${hue + 40}, 40%, 50%, 0.4)`;
    for (let i = 0; i < 6; i += 1) {
      const offset = Math.sin((i + 1) * 1.7 + cluster.seed * Math.PI * 2) * 18;
      baseCtx.beginPath();
      baseCtx.ellipse(
        px + offset,
        py - offset,
        radius * (0.5 + i * 0.08),
        radius * (0.2 + i * 0.04),
        cluster.seed * Math.PI,
        0,
        Math.PI * 2
      );
      baseCtx.fill();
    }
    baseCtx.globalAlpha = 1;
  });

  baseCtx.globalCompositeOperation = "source-over";
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

function updateNoise() {
  const intensity = Number.parseFloat(grainIntensityInput.value);
  const imageData = noiseCtx.createImageData(noiseCanvas.width, noiseCanvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const base = 110 + intensity * 40;
    const range = 80 + intensity * 120;
    const value = Math.max(0, Math.min(255, base + (Math.random() - 0.5) * range));
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }
  noiseCtx.putImageData(imageData, 0, 0);
}

function drawTargetCoherence(t, fidelity) {
  if (!targetImageReady) {
    return;
  }
  const alignmentStrength = Math.max(0, Math.min(1, fidelity));
  const instability = Math.max(0, (fidelity - 0.8) / 0.2);
  const displacementAmp = 6 + fidelity * 18 + instability * 28;
  const displacementSpeed = 0.4 + fidelity * 1.6 + instability * 2.8;
  const stripHeight = Math.max(2, Math.round(8 - fidelity * 5));
  const targetWidth = targetCanvas.width;
  const targetHeight = targetCanvas.height;
  const yScale = targetHeight / canvas.height;

  ctx.save();
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = 0.18 + alignmentStrength * 0.6;
  ctx.imageSmoothingEnabled = true;

  for (let y = 0; y < canvas.height; y += stripHeight) {
    const ySource = y * yScale;
    const sourceHeight = stripHeight * yScale;
    const phase = y * 0.03 + t * displacementSpeed;
    const wobble = Math.sin(phase) + Math.sin(phase * 0.6 + t * 0.4);
    const jitter = (Math.random() - 0.5) * instability * displacementAmp * 0.6;
    const dx = wobble * displacementAmp + jitter;
    const dy = Math.cos(phase * 0.8) * displacementAmp * 0.2 + jitter * 0.2;
    ctx.drawImage(
      targetCanvas,
      0,
      ySource,
      targetWidth,
      sourceHeight,
      dx,
      y + dy,
      canvas.width,
      stripHeight + 1
    );
  }

  ctx.restore();
}

function renderFrame(time) {
  const t = time * 0.001;
  const fidelity = Number.parseFloat(fidelityInput.value);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const warp = fidelity * 12;
  const offsetX = Math.sin(t * 0.6) * warp + Math.sin(t * 1.4) * 6;
  const offsetY = Math.cos(t * 0.5) * warp + Math.sin(t * 1.1) * 4;
  const scale = 1 + fidelity * 0.03 * Math.sin(t * 0.7);
  const blurAmount = (1 - fidelity) * 6;

  ctx.save();
  ctx.filter = `blur(${blurAmount}px)`;
  ctx.globalAlpha = 0.2 + fidelity * 0.8;
  ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
  ctx.scale(scale, scale);
  ctx.drawImage(
    baseCanvas,
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );
  ctx.restore();

  drawTargetCoherence(t, fidelity);

  updateNoise();
  ctx.save();
  ctx.globalAlpha = 0.25 + Number.parseFloat(grainIntensityInput.value) * 0.55;
  ctx.globalCompositeOperation = "screen";
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(noiseCanvas, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.04 + (1 - fidelity) * 0.06;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  for (let y = 0; y < canvas.height; y += 3) {
    ctx.fillRect(0, y, canvas.width, 1);
  }
  ctx.restore();

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
