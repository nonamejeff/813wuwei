const STYLE_SPINE =
  "abstract, non-figurative, atmospheric field texture, wabi-sabi restraint, imperfect continuity, subdued palette, soft film grain, natural diffusion, quiet contrast, no subjects, no objects, no readable symbols";
const NON_LITERAL_RULES =
  "evoke the mood of these words without depicting them; no literal landscapes, no plants, no animals, no people, no buildings, no readable text; no recognizable objects, no icons, no symbols, no signage; non-illustrative, non-narrative, no scene, no horizon";
const NEGATIVE_PROMPT =
  "literal objects, landscapes, plants, animals, people, buildings, faces, text, letters, typography, logos, icons, signage, symbols, illustration, cartoon, horizon";
const DEFAULT_OVERRIDE_PROMPT = `${STYLE_SPINE}
evoke motion as temperature and pressure: slow drift, faint stutter; mood is subdued, introspective; surface feels wet grit, salt haze; light is late glow, soft diffusion; color suggests muted persimmon warmth, cool shadow; modifiers: (slow drift:1.12), (wet grit:1.04), (late glow:1.00)
${NON_LITERAL_RULES}`;

const DEFAULT_TARGET_SIZE = 512;
const DEFAULT_IMAGE_SIZE = "1536x1024";
const STATE_POLL_MS = 5000;
const WORKER_URL = "https://img-gen-backend.nnjeff-prod.workers.dev";

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
const AFFECT_MAP = new Map([
  ["morose", "subdued morose"],
  ["tender", "tender"],
  ["anxious", "anxious"],
  ["calm", "calm"],
  ["bleak", "bleak"],
  ["warm", "warm"],
  ["quiet", "quiet"],
  ["introspective", "introspective"],
  ["soft", "soft"],
  ["hushed", "hushed"]
]);
const MOTION_MAP = new Map([
  ["drift", "slow drift"],
  ["surge", "gentle surge"],
  ["tremor", "faint tremor"],
  ["movement", "subtle motion"],
  ["motion", "subtle motion"],
  ["slow", "slow drift"],
  ["stutter", "occasional stutter"],
  ["flow", "soft flow"],
  ["pulse", "distant pulse"],
  ["thrum", "low thrum"],
  ["curl", "soft curl"],
  ["eddy", "subtle eddy"]
]);
const MATERIAL_MAP = new Map([
  ["haze", "salt haze"],
  ["salt", "salt haze"],
  ["grit", "fine grit"],
  ["wet", "wet sheen"],
  ["paper", "paper fiber"],
  ["silt", "silted texture"],
  ["grain", "fine grain"],
  ["brine", "briny moisture"],
  ["smog", "smudged haze"],
  ["fog", "soft fog"]
]);
const LIGHT_MAP = new Map([
  ["late", "late glow"],
  ["dusk", "dusk light"],
  ["neon", "neon bleed"],
  ["glow", "soft glow"],
  ["overcast", "overcast diffusion"],
  ["shadow", "low shadow"],
  ["twilight", "twilight wash"]
]);
const COLOR_MAP = new Map([
  ["persimmon", ["muted persimmon orange", "warm fruit-skin hue"]],
  ["pampas", ["dry straw-beige", "soft fibrous texture"]]
]);
const PLACE_MAP = new Map([
  ["bay", ["brackish", "coastal humidity", "tidal"]],
  ["traffic", ["distant mechanical pulse", "urban hum"]],
  ["sirens", ["thin high-frequency tension", "alertness"]]
]);

const canvas = document.getElementById("field");
const gl = canvas.getContext("webgl");
const screenSize = {
  width: window.innerWidth,
  height: window.innerHeight
};

const sensitivityInput = document.getElementById("sensitivity");
const fidelitySlider = document.getElementById("fidelitySlider");
const userWordsInput = document.getElementById("userWords");
const sendWordsBtn = document.getElementById("sendWordsBtn");
const promptOut = document.getElementById("promptOut");
const kInput = document.getElementById("kValue");
const motionReadout = document.getElementById("motionReadout");
const regimeReadout = document.getElementById("regimeReadout");
const entropyReadout = document.getElementById("entropyReadout");
const coherenceReadout = document.getElementById("coherenceReadout");
const flowReadout = document.getElementById("flowReadout");
const rateReadout = document.getElementById("rateReadout");
const emaRateReadout = document.getElementById("emaRateReadout");
const targetFidelityReadout = document.getElementById("targetFidelityReadout");
const currentFidelityReadout = document.getElementById("currentFidelityReadout");
const devTools = document.getElementById("devTools");
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
const generateImageBtn = document.getElementById("generateImageBtn");
const imageSizeSelect = document.getElementById("imageSize");
const imageStatus = document.getElementById("imageStatus");
const generatedImage = document.getElementById("generatedImage");
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

const targetCanvas = document.createElement("canvas");
const targetCtx = targetCanvas.getContext("2d");
targetCanvas.width = DEFAULT_TARGET_SIZE;
targetCanvas.height = DEFAULT_TARGET_SIZE;

let targetImageReady = false;
let targetImageUrl = null;
let frameCounter = 0;
let noiseSeed = 1;
let glProgram = null;
let glUniforms = null;
let glBuffers = null;
let targetTexture = null;

let clusters = [];
let lastPrompt = "";
let lastNegative = NEGATIVE_PROMPT;
let lastSeenUpdatedAt = -1;
let lastSharedImageUrl = null;
let hasBackendState = false;
let fidelity = 0;
let targetFidelity = 0;
let isEditingPrompt = false;
let isProgrammaticFidelityUpdate = false;
let hasAppliedBackendFidelity = false;
let hasAppliedUserFidelity = false;
let lastSyncErrorMessage = "";
let lastSyncErrorAt = 0;

const FIDELITY_MIN = 0;
const FIDELITY_MAX = 1;
const FIDELITY_SCALE = 100;
const SYNC_ERROR_COOLDOWN_MS = 5000;

const devEnabled = new URLSearchParams(window.location.search).get("dev") === "1";

if (devTools) {
  devTools.style.display = devEnabled ? "flex" : "none";
}

function updatePromptEditingState() {
  const active = document.activeElement;
  isEditingPrompt = active === promptOut || active === userWordsInput;
}

if (promptOut) {
  promptOut.addEventListener("focus", updatePromptEditingState);
  promptOut.addEventListener("blur", updatePromptEditingState);
}

if (userWordsInput) {
  userWordsInput.addEventListener("focus", updatePromptEditingState);
  userWordsInput.addEventListener("blur", updatePromptEditingState);
}

if (fidelitySlider) {
  fidelitySlider.min = "0";
  fidelitySlider.max = String(FIDELITY_SCALE);
  fidelitySlider.step = "1";
}

function resize() {
  screenSize.width = window.innerWidth;
  screenSize.height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  const nextWidth = Math.max(1, Math.floor(screenSize.width * dpr));
  const nextHeight = Math.max(1, Math.floor(screenSize.height * dpr));
  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
  }
  canvas.style.width = `${screenSize.width}px`;
  canvas.style.height = `${screenSize.height}px`;
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

function motionCurve(value) {
  return Math.log2(1 + 7 * value) / Math.log2(8);
}

function normalizeFidelityValue(value) {
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return numeric / FIDELITY_SCALE;
}

function denormalizeFidelityValue(value) {
  return value * FIDELITY_SCALE;
}

function updateFidelityReadouts() {
  if (devEnabled) {
    if (targetFidelityReadout) {
      targetFidelityReadout.textContent = targetFidelity.toFixed(3);
    }
    if (currentFidelityReadout) {
      currentFidelityReadout.textContent = fidelity.toFixed(3);
    }
  }
}

function dispatchFidelityEvents() {
  if (!fidelitySlider) {
    return;
  }
  isProgrammaticFidelityUpdate = true;
  fidelitySlider.dispatchEvent(new Event("input", { bubbles: true }));
  fidelitySlider.dispatchEvent(new Event("change", { bubbles: true }));
  isProgrammaticFidelityUpdate = false;
}

function setFidelitySliderValue(value) {
  if (!fidelitySlider) {
    return;
  }
  const nextValue = String(value);
  const didChange = fidelitySlider.value !== nextValue;
  fidelitySlider.value = nextValue;
  if (didChange) {
    dispatchFidelityEvents();
  }
}

function setFidelityUI(value, source) {
  const normalized = normalizeFidelityValue(value);
  if (!Number.isFinite(normalized)) {
    return;
  }
  const clamped = clamp(normalized, FIDELITY_MIN, FIDELITY_MAX);
  targetFidelity = clamped;
  fidelity = clamped;
  if (source !== "slider") {
    setFidelitySliderValue(denormalizeFidelityValue(clamped));
  }
  updateFidelityReadouts();
  if (source === "backend") {
    hasAppliedBackendFidelity = true;
  } else if (source === "slider" || source === "local") {
    hasAppliedUserFidelity = true;
  }
}

function addBucket(bucket, phrase, weight) {
  bucket.set(phrase, (bucket.get(phrase) || 0) + weight);
}

function addBucketList(bucket, phrases, weight) {
  phrases.forEach((phrase) => addBucket(bucket, phrase, weight));
}

function pickTop(bucket, count, fallback) {
  const items = [...bucket.entries()].sort((a, b) => b[1] - a[1]);
  const selected = items.slice(0, count);
  if (!selected.length && fallback?.length) {
    return fallback.map((phrase, index) => ({ phrase, weight: fallback.length - index }));
  }
  return selected.map(([phrase, weight]) => ({ phrase, weight }));
}

function buildMoodLine({ affect, motion, material, light, color, place }, weighted) {
  const parts = [];
  if (motion.length) {
    parts.push(`evoke motion as temperature and pressure: ${motion.join(", ")}`);
  }
  if (affect.length) {
    parts.push(`mood is ${affect.join(", ")}`);
  }
  if (material.length) {
    parts.push(`surface feels ${material.join(", ")}`);
  }
  if (light.length) {
    parts.push(`light is ${light.join(", ")}`);
  }
  if (color.length) {
    parts.push(`color suggests ${color.join(", ")}`);
  }
  if (place.length) {
    parts.push(`air carries ${place.join(", ")}`);
  }
  if (weighted.length) {
    parts.push(`modifiers: ${weighted.join(", ")}`);
  }
  return parts.join("; ");
}

function buildMoodPrompt(weightedTokens) {
  const buckets = {
    affect: new Map(),
    motion: new Map(),
    material: new Map(),
    light: new Map(),
    color: new Map(),
    place: new Map()
  };

  weightedTokens.forEach(({ token, weight }) => {
    if (AFFECT_MAP.has(token)) {
      addBucket(buckets.affect, AFFECT_MAP.get(token), weight);
      return;
    }
    if (MOTION_MAP.has(token)) {
      addBucket(buckets.motion, MOTION_MAP.get(token), weight);
      return;
    }
    if (MATERIAL_MAP.has(token)) {
      addBucket(buckets.material, MATERIAL_MAP.get(token), weight);
      return;
    }
    if (LIGHT_MAP.has(token)) {
      addBucket(buckets.light, LIGHT_MAP.get(token), weight);
      return;
    }
    if (COLOR_MAP.has(token)) {
      addBucketList(buckets.color, COLOR_MAP.get(token), weight);
      return;
    }
    if (PLACE_MAP.has(token)) {
      addBucketList(buckets.place, PLACE_MAP.get(token), weight);
    }
  });

  const affect = pickTop(buckets.affect, 2, ["subdued", "introspective"]);
  const motion = pickTop(buckets.motion, 2, ["slow drift", "faint stutter"]);
  const material = pickTop(buckets.material, 2, ["wet grit", "salt haze"]);
  const light = pickTop(buckets.light, 2, ["late glow", "soft diffusion"]);
  const color = pickTop(buckets.color, 2, ["muted warmth", "cool shadow"]);
  const place = pickTop(buckets.place, 1, []);

  const selected = [...affect, ...motion, ...material, ...light, ...color, ...place];
  const maxWeight = Math.max(1, ...selected.map((item) => item.weight));
  const weighted = selected
    .slice(0, 8)
    .map((item) => {
      const normalized = item.weight / maxWeight;
      const weight = Math.min(1.6, 0.8 + normalized * 0.8);
      return `(${item.phrase}:${weight.toFixed(2)})`;
    });

  const moodLine = buildMoodLine(
    {
      affect: affect.map((item) => item.phrase),
      motion: motion.map((item) => item.phrase),
      material: material.map((item) => item.phrase),
      light: light.map((item) => item.phrase),
      color: color.map((item) => item.phrase),
      place: place.map((item) => item.phrase)
    },
    weighted
  );

  return `${STYLE_SPINE}\n${moodLine}\n${NON_LITERAL_RULES}`;
}

function buildPromptFromWords(words) {
  const tokens = tokenize(words);
  if (!tokens.length) {
    return "";
  }
  const counts = new Map();
  tokens.forEach((token) => {
    counts.set(token, (counts.get(token) || 0) + 1);
  });
  const weightedTokens = [...counts.entries()].map(([token, weight]) => ({
    token,
    weight
  }));
  return buildMoodPrompt(weightedTokens);
}

function updatePromptDisplay({ updatePromptOut = true } = {}) {
  if (promptBlock) {
    promptBlock.value = `PROMPT:\n${lastPrompt}\n\nNEGATIVE:\n${lastNegative}`;
  }
  if (promptOutput) {
    promptOutput.textContent = lastPrompt;
  }
  if (negativeOutput) {
    negativeOutput.textContent = lastNegative;
  }
  if (promptTimestamp) {
    promptTimestamp.textContent = new Date().toLocaleTimeString();
  }
  if (promptOut && updatePromptOut) {
    promptOut.value = lastPrompt;
  }
}

function setTargetCanvasSize(width, height) {
  const nextWidth = Math.max(1, Math.floor(width));
  const nextHeight = Math.max(1, Math.floor(height));
  if (targetCanvas.width === nextWidth && targetCanvas.height === nextHeight) {
    return;
  }
  targetCanvas.width = nextWidth;
  targetCanvas.height = nextHeight;
}

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform sampler2D u_image;
  uniform vec2 u_res;
  uniform float u_fidelity;
  uniform float u_time;
  uniform float u_seed;
  uniform vec2 u_tex_res;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  vec2 randUnitVec(vec2 p) {
    float a = hash12(p) * 6.28318530718;
    return vec2(cos(a), sin(a));
  }

  float luminance(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
  }

  vec3 adjustSaturation(vec3 c, float sat) {
    float l = luminance(c);
    return mix(vec3(l), c, sat);
  }

  void main() {
    vec2 p = gl_FragCoord.xy;
    float f = clamp(u_fidelity, 0.0, 1.0);
    float n = 1.0 - f;
    float motion = log2(1.0 + 7.0 * n) / log2(8.0);

    if (f < 0.02) {
      float r = hash12(p + u_seed * 17.0 + floor(u_time * 60.0));
      float g = hash12(p + u_seed * 31.0 + floor(u_time * 60.0) + 11.0);
      float b = hash12(p + u_seed * 47.0 + floor(u_time * 60.0) + 23.0);
      gl_FragColor = vec4(vec3(r, g, b), 1.0);
      return;
    }

    float maxRadius = min(u_res.x, u_res.y) * 0.35;
    float radiusPx = mix(0.0, maxRadius, pow(motion, 1.4));
    float timeAmp = pow(motion, 1.15);
    float t = u_time * (4.0 + 12.0 * timeAmp);
    vec2 timeDir = randUnitVec(p + u_seed * 2.0 + vec2(t, t * 1.3));
    float timeMag = radiusPx * 0.1 * timeAmp;

    vec2 sampleP = p + timeDir * timeMag;
    vec2 uv = sampleP / u_res;
    float screenAspect = u_res.x / u_res.y;
    float texAspect = u_tex_res.x / u_tex_res.y;
    vec2 coverScale = vec2(1.0);
    if (screenAspect > texAspect) {
      coverScale.y = screenAspect / texAspect;
    } else {
      coverScale.x = texAspect / screenAspect;
    }
    uv = (uv - 0.5) / coverScale + 0.5;
    uv = clamp(uv, 0.0, 1.0);

    vec2 texel = uv * u_tex_res;
    float zoneSize = mix(1.0, 12.0, pow(motion, 1.3));
    vec2 zone = floor(texel / zoneSize);
    vec2 zoneDir = randUnitVec(zone + u_seed * 3.7);
    float zoneMag = radiusPx * (0.6 + 0.4 * hash12(zone + u_seed * 9.1));

    vec2 microDir = randUnitVec(texel + u_seed * 13.3);
    float microMag = radiusPx * 0.25 * hash12(texel + zone * 7.7 + u_seed * 5.5);

    vec2 offsetPx = zoneDir * zoneMag + microDir * microMag;
    vec2 sampleUv = (sampleP + offsetPx) / u_res;
    sampleUv = (sampleUv - 0.5) / coverScale + 0.5;
    sampleUv = clamp(sampleUv, 0.0, 1.0);

    vec3 col = texture2D(u_image, sampleUv).rgb;
    float sat = mix(1.0, 0.2, pow(motion, 1.1));
    col = adjustSaturation(col, sat);

    float j = (hash12(texel + u_seed * 101.0 + t) - 0.5) * 0.2 * pow(motion, 1.1);
    col = clamp(col + j, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${info}`);
  }
  return shader;
}

function createProgram(vertexSource, fragmentSource) {
  const program = gl.createProgram();
  const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${info}`);
  }
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  return program;
}

function initWebGL() {
  if (!gl || glProgram) {
    return;
  }
  glProgram = createProgram(VERTEX_SHADER, FRAGMENT_SHADER);
  glUniforms = {
    position: gl.getAttribLocation(glProgram, "a_position"),
    image: gl.getUniformLocation(glProgram, "u_image"),
    resolution: gl.getUniformLocation(glProgram, "u_res"),
    fidelity: gl.getUniformLocation(glProgram, "u_fidelity"),
    time: gl.getUniformLocation(glProgram, "u_time"),
    seed: gl.getUniformLocation(glProgram, "u_seed"),
    textureResolution: gl.getUniformLocation(glProgram, "u_tex_res")
  };

  glBuffers = {
    quad: gl.createBuffer()
  };
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers.quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  targetTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, targetTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  updateTargetTexture();
}

function updateTargetTexture() {
  if (!gl || !targetTexture) {
    return;
  }
  gl.bindTexture(gl.TEXTURE_2D, targetTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    targetCanvas
  );
}

function renderFrame(time) {
  if (!gl) {
    return;
  }
  initWebGL();

  const noiseAmount = 1 - fidelity;
  const timeAmp = motionCurve(noiseAmount);
  const regime =
    fidelity < 0.3 ? "ENTROPY" : fidelity < 0.85 ? "SCRAMBLE" : "HIGH";

  motionReadout.textContent = timeAmp.toFixed(3);
  regimeReadout.textContent = regime;
  entropyReadout.textContent = noiseAmount.toFixed(3);
  coherenceReadout.textContent = fidelity.toFixed(3);
  flowReadout.textContent = "true";

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.useProgram(glProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffers.quad);
  gl.enableVertexAttribArray(glUniforms.position);
  gl.vertexAttribPointer(glUniforms.position, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, targetTexture);
  gl.uniform1i(glUniforms.image, 0);
  gl.uniform2f(glUniforms.resolution, canvas.width, canvas.height);
  gl.uniform1f(glUniforms.fidelity, fidelity);
  gl.uniform1f(glUniforms.time, (time || 0) * 0.001);
  gl.uniform1f(glUniforms.seed, noiseSeed);
  gl.uniform2f(glUniforms.textureResolution, targetCanvas.width, targetCanvas.height);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  frameCounter += 1;
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
  const weightedTokens = limited.map((term) => ({
    token: term,
    weight: getDecayedCount(term, now)
  }));

  lastPrompt = buildMoodPrompt(weightedTokens);
  lastNegative = NEGATIVE_PROMPT;
  updatePromptDisplay();
}

function copyPrompt() {
  const manualValue = manualPrompt.value.trim();
  const promptText = manualValue.length ? manualValue : lastPrompt;
  const combined = `PROMPT:\n${promptText}\n\nNEGATIVE:\n${lastNegative}`;
  navigator.clipboard.writeText(combined).catch(() => {
    // Clipboard may be blocked; ignore.
  });
}

function setImageStatus(message) {
  if (!imageStatus) {
    return;
  }
  imageStatus.textContent = message || "—";
}

function setSyncError(message) {
  const nextMessage = message || "Image sync failed.";
  const now = Date.now();
  if (nextMessage === lastSyncErrorMessage && now - lastSyncErrorAt < SYNC_ERROR_COOLDOWN_MS) {
    return;
  }
  lastSyncErrorMessage = nextMessage;
  lastSyncErrorAt = now;
  setImageStatus(nextMessage);
}

function applySharedImage(imageUrl) {
  const nextUrl = typeof imageUrl === "string" ? imageUrl : "";
  if (!nextUrl) {
    if (lastSharedImageUrl) {
      lastSharedImageUrl = null;
      if (generatedImage) {
        generatedImage.removeAttribute("src");
      }
    }
    return;
  }
  if (nextUrl === lastSharedImageUrl) {
    return;
  }

  lastSharedImageUrl = nextUrl;

  if (generatedImage) {
    generatedImage.src = nextUrl;
  }
  const image = new Image();
  image.onload = () => {
    drawTargetToCanvas(image);
  };
  image.src = nextUrl;
  setImageStatus("Image synced.");
}

function normalizeSharedState(data) {
  return {
    prompt: typeof data?.prompt === "string" ? data.prompt : "",
    image_data_url: typeof data?.image_data_url === "string" ? data.image_data_url : "",
    image_url: typeof data?.image_url === "string" ? data.image_url : "",
    updated_at: Number.isFinite(data?.updated_at) ? data.updated_at : 0,
    fidelity: Number.isFinite(data?.fidelity) ? data.fidelity : null,
    size: typeof data?.size === "string" ? data.size : ""
  };
}

function applyStateToUI(state) {
  const updatedAt = Number.isFinite(state?.updated_at) ? state.updated_at : 0;
  if (updatedAt >= 0) {
    hasBackendState = true;
  }
  lastSeenUpdatedAt = Math.max(lastSeenUpdatedAt, updatedAt);

  const imageUrl = state?.image_data_url || state?.image_url || "";
  applySharedImage(imageUrl);
  if (typeof state?.prompt === "string") {
    lastPrompt = state.prompt.trim();
    lastNegative = NEGATIVE_PROMPT;
    updatePromptDisplay({ updatePromptOut: true });
  }
  if (Number.isFinite(state?.fidelity)) {
    setFidelityUI(state.fidelity, "backend");
  }
  if (state?.size && imageSizeSelect && document.activeElement !== imageSizeSelect) {
    imageSizeSelect.value = state.size;
  }
  return true;
}

async function syncSharedState() {
  try {
    const response = await fetch(`${WORKER_URL}/v1/state`, {
      method: "GET",
      cache: "no-store"
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error || "Image sync failed.";
      setSyncError(message);
      return;
    }
    const state = normalizeSharedState(data);
    applyStateToUI(state);
    lastSyncErrorMessage = "";
  } catch (error) {
    setSyncError(error?.message || "Image sync failed.");
  }
}

async function hydrateFidelityFromBackend() {
  if (!fidelitySlider) {
    return;
  }
  try {
    const response = await fetch(`${WORKER_URL}/v1/state`, {
      method: "GET",
      cache: "no-store"
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      const state = normalizeSharedState(data);
      if (Number.isFinite(state?.fidelity)) {
        applyStateToUI(state);
        return;
      }
    }
  } catch (error) {
    // Ignore initial load failures.
  }
}

function scheduleInitialFidelityLoad() {
  const run = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        hydrateFidelityFromBackend();
      }, 0);
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
}

async function sendWords() {
  const words = userWordsInput ? userWordsInput.value.trim() : "";

  if (!words) {
    setImageStatus("Enter a few words to build a prompt.");
    return;
  }

  if (sendWordsBtn) {
    sendWordsBtn.disabled = true;
  }
  const localPrompt = buildPromptFromWords(words);
  if (localPrompt) {
    lastPrompt = localPrompt;
    lastNegative = NEGATIVE_PROMPT;
    updatePromptDisplay();
    setImageStatus("Updating prompt…");
  } else {
    setImageStatus("Sending words…");
  }

  try {
    const response = await fetch(`${WORKER_URL}/v1/prompt/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ words })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error || "Failed to aggregate words.";
      throw new Error(message);
    }

    const state = normalizeSharedState(data);
    applyStateToUI(state);
    setImageStatus("Prompt updated.");
  } catch (error) {
    setImageStatus(error?.message || "Failed to aggregate words.");
  } finally {
    if (sendWordsBtn) {
      sendWordsBtn.disabled = false;
    }
  }
}

async function generateImage() {
  const promptText = promptOut?.value.trim() || lastPrompt;
  const size = imageSizeSelect ? imageSizeSelect.value : DEFAULT_IMAGE_SIZE;

  if (!promptText) {
    setImageStatus("Add or generate a prompt first.");
    return;
  }

  if (generateImageBtn) {
    generateImageBtn.disabled = true;
  }
  setImageStatus("Generating image…");

  try {
    const response = await fetch(`${WORKER_URL}/v1/img-gen`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ size })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error || "Image generation failed.";
      throw new Error(message);
    }
    const state = normalizeSharedState(data);
    applyStateToUI(state);
    setImageStatus("Image ready.");
  } catch (error) {
    setImageStatus(error?.message || "Image generation failed.");
  } finally {
    if (generateImageBtn) {
      generateImageBtn.disabled = false;
    }
  }
}

function drawTargetToCanvas(image) {
  setTargetCanvasSize(image.width, image.height);
  targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  targetCtx.drawImage(image, 0, 0);
  targetImageReady = true;
  updateTargetTexture();
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
  setTargetCanvasSize(DEFAULT_TARGET_SIZE, DEFAULT_TARGET_SIZE);
  targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  targetImageReady = false;
  updateTargetTexture();
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
  bumpSeed();
}

function bumpSeed() {
  noiseSeed = (noiseSeed + 1) % 10000;
}

submitText.addEventListener("click", () => {
  const text = inputText.value.trim();
  if (!text) {
    return;
  }
  addMessage(text);
  inputText.value = "";
  buildClusters();
  bumpSeed();
});

simulateBurst.addEventListener("click", simulateBurstMessages);

generatePromptBtn.addEventListener("click", generatePrompt);
copyPromptBtn.addEventListener("click", copyPrompt);

kInput.addEventListener("change", buildClusters);
targetImageInput.addEventListener("change", (event) => {
  handleTargetImage(event.target.files[0]);
});
clearTargetImageBtn.addEventListener("click", clearTargetImage);
if (generateImageBtn) {
  generateImageBtn.addEventListener("click", generateImage);
}
if (sendWordsBtn) {
  sendWordsBtn.addEventListener("click", sendWords);
}

const defaultImage = new Image();
defaultImage.onload = () => {
  if (!hasBackendState) {
    drawTargetToCanvas(defaultImage);
    targetPreview.src = "default.png";
  }
};
defaultImage.src = "default.png";

BOOTSTRAP_TOKENS.forEach((token) => addMessage(token));
buildClusters();
negativeOutput.textContent = NEGATIVE_PROMPT;
if (!hasBackendState) {
  promptOutput.textContent = "";
  manualPrompt.value = DEFAULT_OVERRIDE_PROMPT;
  generatePrompt();
}

scheduleInitialFidelityLoad();

syncSharedState();
setInterval(syncSharedState, STATE_POLL_MS);

requestAnimationFrame(renderFrame);
