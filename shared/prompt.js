// Prompt building module - handles tokenization, prompt building, and constants

const STYLE_SPINE =
  "abstract, non-figurative, atmospheric field texture, wabi-sabi restraint, imperfect continuity, subdued palette, soft film grain, natural diffusion, quiet contrast, no subjects, no objects, no readable symbols";
const NON_LITERAL_RULES =
  "evoke the mood of these words without depicting them; no literal landscapes, no plants, no animals, no people, no buildings, no readable text; no recognizable objects, no icons, no symbols, no signage; non-illustrative, non-narrative, no scene, no horizon";
const NEGATIVE_PROMPT =
  "literal objects, landscapes, plants, animals, people, buildings, faces, text, letters, typography, logos, icons, signage, symbols, illustration, cartoon, horizon";
const DEFAULT_OVERRIDE_PROMPT = `${STYLE_SPINE}
evoke motion as temperature and pressure: slow drift, faint stutter; mood is subdued, introspective; surface feels wet grit, salt haze; light is late glow, soft diffusion; color suggests muted persimmon warmth, cool shadow; modifiers: (slow drift:1.12), (wet grit:1.04), (late glow:1.00)
${NON_LITERAL_RULES}`;

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

class PromptBuilder {
  constructor() {
    this.reservoir = new Map();
    this.messages = [];
    this.maxMessages = 120;
    this.decayRate = 0.00035;
    this.clusters = [];
    this.lastPrompt = "";
    this.lastNegative = NEGATIVE_PROMPT;

    // Initialize with bootstrap tokens
    this.initializeBootstrapTokens();
  }

  initializeBootstrapTokens() {
    BOOTSTRAP_TOKENS.forEach((token) => this.addMessage(token));
  }

  tokenize(text) {
    return (text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length >= 2 && !STOPWORDS.has(word));
  }

  addMessage(text) {
    const tokens = this.tokenize(text);
    if (!tokens.length) {
      return;
    }
    const now = Date.now();
    this.messages.push({ tokens, timestamp: now });
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }
    tokens.forEach((token) => {
      const entry = this.reservoir.get(token) || { count: 0, lastSeen: now };
      entry.count += 1;
      entry.lastSeen = now;
      this.reservoir.set(token, entry);
    });
  }

  getDecayedCount(word, now = Date.now()) {
    const entry = this.reservoir.get(word);
    if (!entry) {
      return 0;
    }
    return entry.count * Math.exp(-this.decayRate * (now - entry.lastSeen));
  }

  vectorizeMessages(items) {
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

  distance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i += 1) {
      const d = a[i] - b[i];
      sum += d * d;
    }
    return Math.sqrt(sum);
  }

  meanVector(vectors, size) {
    const mean = new Array(size).fill(0);
    vectors.forEach((vec) => {
      for (let i = 0; i < size; i += 1) {
        mean[i] += vec[i];
      }
    });
    return mean.map((value) => value / Math.max(1, vectors.length));
  }

  kMeans(vectors, k) {
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
          const dist = this.distance(vec, centroid);
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
          centroids[i] = this.meanVector(clusterVectors, dimension);
        }
      }
    }
    return assignments;
  }

  hashToUnit(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 1000) / 1000;
  }

  buildClusters(k = 1) {
    const kTarget = Math.max(1, Number.parseInt(k, 10) || 1);
    if (!this.messages.length) {
      this.clusters = [];
      return [];
    }
    const { vocab, vectors } = this.vectorizeMessages(this.messages);
    const kFinal = Math.min(kTarget, vectors.length);
    const assignments = this.kMeans(vectors, kFinal);
    const clusterBuckets = new Array(kFinal).fill(0).map(() => []);
    const clusterTermScores = new Array(kFinal).fill(0).map(() => new Map());

    this.messages.forEach((message, idx) => {
      const bucket = assignments[idx];
      clusterBuckets[bucket].push(message);
      message.tokens.forEach((token) => {
        const termMap = clusterTermScores[bucket];
        termMap.set(token, (termMap.get(token) || 0) + 1);
      });
    });

    this.clusters = clusterBuckets.map((bucket, idx) => {
      const termMap = clusterTermScores[idx];
      const topTerms = [...termMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([term]) => term);
      return {
        size: bucket.length,
        terms: topTerms,
        index: idx,
        seed: this.hashToUnit(topTerms.join(""))
      };
    });

    return this.clusters;
  }

  addBucket(bucket, phrase, weight) {
    bucket.set(phrase, (bucket.get(phrase) || 0) + weight);
  }

  addBucketList(bucket, phrases, weight) {
    phrases.forEach((phrase) => this.addBucket(bucket, phrase, weight));
  }

  pickTop(bucket, count, fallback) {
    const items = [...bucket.entries()].sort((a, b) => b[1] - a[1]);
    const selected = items.slice(0, count);
    if (!selected.length && fallback?.length) {
      return fallback.map((phrase, index) => ({ phrase, weight: fallback.length - index }));
    }
    return selected.map(([phrase, weight]) => ({ phrase, weight }));
  }

  buildMoodLine({ affect, motion, material, light, color, place }, weighted) {
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

  buildMoodPrompt(weightedTokens) {
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
        this.addBucket(buckets.affect, AFFECT_MAP.get(token), weight);
        return;
      }
      if (MOTION_MAP.has(token)) {
        this.addBucket(buckets.motion, MOTION_MAP.get(token), weight);
        return;
      }
      if (MATERIAL_MAP.has(token)) {
        this.addBucket(buckets.material, MATERIAL_MAP.get(token), weight);
        return;
      }
      if (LIGHT_MAP.has(token)) {
        this.addBucket(buckets.light, LIGHT_MAP.get(token), weight);
        return;
      }
      if (COLOR_MAP.has(token)) {
        this.addBucketList(buckets.color, COLOR_MAP.get(token), weight);
        return;
      }
      if (PLACE_MAP.has(token)) {
        this.addBucketList(buckets.place, PLACE_MAP.get(token), weight);
      }
    });

    const affect = this.pickTop(buckets.affect, 2, ["subdued", "introspective"]);
    const motion = this.pickTop(buckets.motion, 2, ["slow drift", "faint stutter"]);
    const material = this.pickTop(buckets.material, 2, ["wet grit", "salt haze"]);
    const light = this.pickTop(buckets.light, 2, ["late glow", "soft diffusion"]);
    const color = this.pickTop(buckets.color, 2, ["muted warmth", "cool shadow"]);
    const place = this.pickTop(buckets.place, 1, []);

    const selected = [...affect, ...motion, ...material, ...light, ...color, ...place];
    const maxWeight = Math.max(1, ...selected.map((item) => item.weight));
    const weighted = selected.slice(0, 8).map((item) => {
      const normalized = item.weight / maxWeight;
      const weight = Math.min(1.6, 0.8 + normalized * 0.8);
      return `(${item.phrase}:${weight.toFixed(2)})`;
    });

    const moodLine = this.buildMoodLine(
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

  buildPromptFromWords(words) {
    const tokens = this.tokenize(words);
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
    return this.buildMoodPrompt(weightedTokens);
  }

  generatePrompt() {
    const now = Date.now();
    const terms = [];
    this.clusters.forEach((cluster) => {
      cluster.terms.slice(0, 5).forEach((term) => {
        if (!terms.includes(term)) {
          terms.push(term);
        }
      });
    });
    const limited = terms.slice(0, 30);
    const weightedTokens = limited.map((term) => ({
      token: term,
      weight: this.getDecayedCount(term, now)
    }));

    this.lastPrompt = this.buildMoodPrompt(weightedTokens);
    this.lastNegative = NEGATIVE_PROMPT;
    return this.lastPrompt;
  }

  getClusters() {
    return this.clusters;
  }

  getPrompt() {
    return this.lastPrompt;
  }

  getNegative() {
    return this.lastNegative;
  }

  setPrompt(prompt) {
    this.lastPrompt = prompt;
  }

  setNegative(negative) {
    this.lastNegative = negative;
  }
}

export {
  PromptBuilder,
  STYLE_SPINE,
  NON_LITERAL_RULES,
  NEGATIVE_PROMPT,
  DEFAULT_OVERRIDE_PROMPT,
  BOOTSTRAP_TOKENS,
  STOPWORDS,
  AFFECT_MAP,
  MOTION_MAP,
  MATERIAL_MAP,
  LIGHT_MAP,
  COLOR_MAP,
  PLACE_MAP
};
