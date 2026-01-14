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
const gl = canvas.getContext("webgl");

const fidelityInput = document.getElementById("fidelity");
const kInput = document.getElementById("kValue");
const motionReadout = document.getElementById("motionReadout");
const regimeReadout = document.getElementById("regimeReadout");
const entropyReadout = document.getElementById("entropyReadout");
const coherenceReadout = document.getElementById("coherenceReadout");
const flowReadout = document.getElementById("flowReadout");
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

const targetCanvas = document.createElement("canvas");
const targetCtx = targetCanvas.getContext("2d");
targetCanvas.width = TARGET_SIZE;
targetCanvas.height = TARGET_SIZE;

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

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
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

    if (f < 0.02) {
      float r = hash12(p + u_seed * 17.0 + floor(u_time * 60.0));
      float g = hash12(p + u_seed * 31.0 + floor(u_time * 60.0) + 11.0);
      float b = hash12(p + u_seed * 47.0 + floor(u_time * 60.0) + 23.0);
      gl_FragColor = vec4(vec3(r, g, b), 1.0);
      return;
    }

    float maxRadius = min(u_res.x, u_res.y) * 0.45;
    float radiusPx = mix(0.0, maxRadius, pow(n, 1.8));
    float zoneSize = mix(1.0, 32.0, pow(n, 1.2));

    vec2 zone = floor(p / zoneSize);
    vec2 zoneDir = randUnitVec(zone + u_seed * 3.7);
    float zoneMag = radiusPx * (0.6 + 0.4 * hash12(zone + u_seed * 9.1));

    vec2 microDir = randUnitVec(p + u_seed * 13.3);
    float microMag = radiusPx * 0.25 * hash12(p + zone * 7.7 + u_seed * 5.5);

    float timeAmp = pow(n, 2.2);
    float t = floor(u_time * (20.0 + 80.0 * timeAmp));
    vec2 timeDir = randUnitVec(zone + t + u_seed * 2.0);
    float timeMag = radiusPx * 0.15 * timeAmp;

    vec2 offsetPx = zoneDir * zoneMag + microDir * microMag + timeDir * timeMag;
    vec2 sampleP = p + offsetPx;
    vec2 uv = fract(sampleP / u_res);

    vec3 col = texture2D(u_image, uv).rgb;
    float sat = mix(1.0, 0.0, pow(n, 1.6));
    col = adjustSaturation(col, sat);

    float j = (hash12(p + u_seed * 101.0 + t) - 0.5) * 0.35 * pow(n, 1.3);
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
    seed: gl.getUniformLocation(glProgram, "u_seed")
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
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    TARGET_SIZE,
    TARGET_SIZE,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );
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

  const fidelity = clamp(Number.parseFloat(fidelityInput.value), 0, 1);
  const noiseAmount = 1 - fidelity;
  const timeAmp = noiseAmount ** 2.2;
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
  targetCtx.clearRect(0, 0, TARGET_SIZE, TARGET_SIZE);
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
  addMessage(inputText.value);
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

const defaultImage = new Image();
defaultImage.onload = () => {
  drawTargetToCanvas(defaultImage);
  targetPreview.src = "default.png";
};
defaultImage.src = "default.png";

BOOTSTRAP_TOKENS.forEach((token) => addMessage(token));
buildClusters();
negativeOutput.textContent = NEGATIVE_PROMPT;
promptOutput.textContent = "";
manualPrompt.value = DEFAULT_OVERRIDE_PROMPT;
generatePrompt();

requestAnimationFrame(renderFrame);
