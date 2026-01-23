const MAX_PROMPT_LENGTH = 4000;
const ALLOWED_SIZES = new Set(["512x512", "1024x1024", "1024x1536", "1536x1024"]);
const MAX_WORD_ENTRIES = 50;
const GLOBAL_STATE_KEY = "global_state";
const SEND_TIMESTAMPS_KEY = "send_timestamps";
const ALLOWED = new Set([
  "https://www.813wuwei.com",
  "https://813wuwei.com",
  "http://localhost:3000"
]);
// "Failed to fetch" in browser often means CORS preflight blocked; OPTIONS must return 204 with CORS headers.
function corsHeaders(req) {
  const origin = req.headers.get("Origin") || "";
  const h = new Headers();
  if (ALLOWED.has(origin)) {
    h.set("Access-Control-Allow-Origin", origin);
    h.set("Vary", "Origin");
  }
  h.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  h.set("Access-Control-Allow-Headers", "Content-Type");
  return h;
}
// prompt_sessions aggregates prompt inputs only; using it for shared image state
// caused desync because it never stored the canonical image payload.
const DEFAULT_FIDELITY = 0;
// Storing base64 image blobs in Durable Object SQLite triggered SQLITE_TOOBIG,
// so the DO now stores only small metadata and image keys/URLs.
const DEFAULT_GLOBAL_STATE = {
  aggregated_tokens: [],
  prompt: "",
  fidelity: DEFAULT_FIDELITY,
  size: "1024x1024",
  image_key: null,
  updated_at: 0
};
// NOTE: Do not store global image state in-memory; per-worker isolates reset often
// and are not shared across regions, so memory state diverges between clients.
// Durable Objects now hold canonical state with optional KV snapshots for durability.
const STYLE_SPINE =
  "abstract, non-figurative, atmospheric field texture, wabi-sabi restraint, imperfect continuity, subdued palette, soft film grain, natural diffusion, quiet contrast, no subjects, no objects, no readable symbols";
const NON_LITERAL_RULES =
  "evoke the mood of these words without depicting them; no literal landscapes, no plants, no animals, no people, no buildings, no readable text; no recognizable objects, no icons, no symbols, no signage; non-illustrative, non-narrative, no scene, no horizon";
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

function jsonResponse(status, body, corsHeaderSource, extraHeaders) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (corsHeaderSource) {
    if (corsHeaderSource instanceof Headers) {
      corsHeaderSource.forEach((value, key) => headers.set(key, value));
    } else {
      Object.entries(corsHeaderSource).forEach(([key, value]) => headers.set(key, value));
    }
  }
  if (extraHeaders) {
    Object.entries(extraHeaders).forEach(([key, value]) => headers.set(key, value));
  }
  return new Response(JSON.stringify(body), { status, headers });
}

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0"
};

function normalizeSendTimestamps(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((entry) => Number.isFinite(entry))
    .map((entry) => Math.floor(entry))
    .filter((entry) => entry > 0);
}

function normalizeFidelity(value) {
  if (!Number.isFinite(value)) {
    return DEFAULT_GLOBAL_STATE.fidelity;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeImageValue(value) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeImageKey(value) {
  return normalizeImageValue(value);
}

function normalizeGlobalState(state, fallbackUpdatedAt = 0) {
  return {
    aggregated_tokens: Array.isArray(state?.aggregated_tokens)
      ? state.aggregated_tokens.filter((t) => typeof t === "string").slice(-200)
      : [],
    prompt: typeof state?.prompt === "string" ? state.prompt.slice(0, 4000) : "",
    fidelity: normalizeFidelity(state?.fidelity),
    size: typeof state?.size === "string" ? state.size : DEFAULT_GLOBAL_STATE.size,
    image_key: normalizeImageKey(state?.image_key),
    updated_at: Number.isFinite(state?.updated_at) ? state.updated_at : fallbackUpdatedAt
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

async function loadState(storage, env) {
  const stored = await storage.get(GLOBAL_STATE_KEY);
  if (!stored && env?.IMAGE_STATE_KV?.get) {
    const kvStored = await env.IMAGE_STATE_KV.get(GLOBAL_STATE_KEY, { type: "json" });
    if (kvStored) {
      await storage.put(GLOBAL_STATE_KEY, kvStored);
      return Object.assign({}, DEFAULT_GLOBAL_STATE, kvStored);
    }
  }
  const defaults = {
    prompt_sessions: [],
    prompt: "",
    fidelity: 0,
    size: "1024x1024",
    image_key: null,
    updated_at: 0
  };
  return Object.assign({}, defaults, stored || {});
}

async function loadSendTimestamps(storage) {
  if (!storage?.get) {
    return [];
  }
  const stored = await storage.get(SEND_TIMESTAMPS_KEY);
  return normalizeSendTimestamps(stored);
}

function estimateStateSize(state) {
  return JSON.stringify(state).length;
}

const MAX_STATE_SIZE = 100000; // 100KB safety limit

async function writeGlobalState(storage, env, state) {
  if (!storage?.put || state === undefined || state === null) {
    return;
  }
  const normalized = normalizeGlobalState(state, state.updated_at);
  const size = estimateStateSize(normalized);

  if (size > MAX_STATE_SIZE) {
    console.error(`State too large: ${size} bytes, truncating tokens`);
    // Emergency truncation
    normalized.aggregated_tokens = normalized.aggregated_tokens.slice(-50);
  }

  // Write to Durable Object storage (primary)
  await storage.put(GLOBAL_STATE_KEY, normalized);

  // Write to KV only if state is small enough (under 25KB)
  if (env?.IMAGE_STATE_KV?.put) {
    const value = JSON.stringify(normalized);
    if (value.length < 25000) {
      // 25KB limit for safety
      await env.IMAGE_STATE_KV.put(GLOBAL_STATE_KEY, value);
    }
  }
}

async function writeSendTimestamps(storage, timestamps) {
  if (!storage?.put) {
    return;
  }
  await storage.put(SEND_TIMESTAMPS_KEY, normalizeSendTimestamps(timestamps));
}

function normalizeTokens(words) {
  return words
    .split(/[\s,]+/)
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token && !STOPWORDS.has(token));
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

function buildPrompt(tokens) {
  const tokenCounts = tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});

  const buckets = {
    affect: new Map(),
    motion: new Map(),
    material: new Map(),
    light: new Map(),
    color: new Map(),
    place: new Map()
  };

  Object.entries(tokenCounts).forEach(([token, weight]) => {
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
  const weighted = selected.slice(0, 8).map((item) => {
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

  return `${STYLE_SPINE}\n${moodLine}\n${NON_LITERAL_RULES}`.slice(0, MAX_PROMPT_LENGTH);
}

function buildStateResponse(state, origin) {
  const normalized = normalizeGlobalState(state, state?.updated_at ?? 0);
  const imageUrl = normalized.image_key
    ? `${origin}/v1/image/${encodeURIComponent(normalized.image_key)}`
    : null;
  return {
    ...normalized,
    image_url: imageUrl
  };
}

export class GlobalStateDO {
  constructor(state, env) {
    this.state = state;
    this.storage = state.storage;
    this.env = env;
  }

  async fetch(request) {
    const corsHeaderSource = corsHeaders(request);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaderSource });
    }

    try {
      const url = new URL(request.url);
      const isApiRequest = url.pathname.startsWith("/v1/");

      if (!isApiRequest) {
        return new Response("not found", { status: 404, headers: corsHeaderSource });
      }

      if (request.method === "GET") {
        if (url.pathname === "/v1/state") {
          const storedState = await loadState(this.storage, this.env);
          const timestamps = await loadSendTimestamps(this.storage);
          const now = Date.now();
          const activeTimestamps = timestamps.filter((t) => t >= now - 30000);
          const TARGET = 100;
          // Apply S-curve for smoother regime transitions
          const rawRate = activeTimestamps.length / TARGET;
          const fidelityNormalized = 1 / (1 + Math.exp(-8 * (rawRate - 0.5)));
          const calculatedFidelity = Math.round(fidelityNormalized * 100);
          storedState.fidelity = calculatedFidelity;
          const currentState = buildStateResponse(storedState, url.origin);
          return jsonResponse(200, currentState, corsHeaderSource, NO_CACHE_HEADERS);
        }
        return new Response("not found", { status: 404, headers: corsHeaderSource });
      }

      if (request.method !== "POST") {
        return new Response("not found", { status: 404, headers: corsHeaderSource });
      }

      if (url.pathname === "/v1/state") {
        let payload;
        try {
          payload = await request.json();
        } catch (error) {
          return jsonResponse(400, { error: "Invalid JSON" }, corsHeaderSource);
        }

        const updatedAt = Date.now();
        const existingState = normalizeGlobalState(
          await loadState(this.storage, this.env),
          updatedAt
        );
        const nextState = normalizeGlobalState(
          {
            prompt_sessions: Array.isArray(payload?.prompt_sessions)
              ? payload.prompt_sessions
              : existingState.prompt_sessions,
            prompt:
              typeof payload?.prompt === "string" ? payload.prompt.trim() : existingState.prompt,
            image_key:
              payload?.image_key === null
                ? null
                : typeof payload?.image_key === "string"
                  ? payload.image_key
                  : existingState.image_key,
            fidelity: existingState.fidelity,
            size: typeof payload?.size === "string" ? payload.size.trim() : existingState.size,
            updated_at: updatedAt
          },
          updatedAt
        );
        await writeGlobalState(this.storage, this.env, nextState);
        return jsonResponse(
          200,
          buildStateResponse(nextState, url.origin),
          corsHeaderSource,
          NO_CACHE_HEADERS
        );
      }

      if (url.pathname === "/v1/prompt/add") {
        let payload;
        try {
          payload = await request.json();
        } catch (error) {
          return jsonResponse(400, { error: "Invalid JSON" }, corsHeaderSource);
        }

        const words = typeof payload?.words === "string" ? payload.words.trim() : "";
        if (!words) {
          return jsonResponse(400, { error: "Words are required" }, corsHeaderSource);
        }

        const state = await loadState(this.storage, this.env);
        const now = Date.now();
        const sendTimestamps = await loadSendTimestamps(this.storage);
        sendTimestamps.push(now);
        const prunedTimestamps = normalizeSendTimestamps(sendTimestamps).filter(
          (timestamp) => timestamp >= now - 30000
        );
        const prunedLen = prunedTimestamps.length;
        const TARGET = 100;
        // Apply S-curve for smoother regime transitions
        const rawRate = prunedLen / TARGET;
        const fidelityNormalized = 1 / (1 + Math.exp(-8 * (rawRate - 0.5)));
        state.fidelity = Math.round(fidelityNormalized * 100);

        const newTokens = normalizeTokens(words);
        const existingTokens = Array.isArray(state.aggregated_tokens)
          ? state.aggregated_tokens
          : [];
        const allTokens = [...existingTokens, ...newTokens];
        // Keep only last 200 unique tokens to stay under size limit
        const uniqueTokens = [...new Set(allTokens)].slice(-200);
        state.aggregated_tokens = uniqueTokens;
        const tokens = uniqueTokens;
        state.prompt = buildPrompt(tokens);
        state.updated_at = now;

        await writeGlobalState(this.storage, this.env, state);
        await writeSendTimestamps(this.storage, prunedTimestamps);

        return jsonResponse(200, state, corsHeaderSource);
      }

      if (url.pathname === "/v1/prompt/clear") {
        const updatedAt = Date.now();
        const existingState = normalizeGlobalState(
          await loadState(this.storage, this.env),
          updatedAt
        );
        const nextState = normalizeGlobalState(
          {
            prompt_sessions: [],
            prompt: "",
            fidelity: existingState.fidelity,
            size: existingState.size,
            image_key: existingState.image_key,
            updated_at: updatedAt
          },
          updatedAt
        );
        await writeGlobalState(this.storage, this.env, nextState);
        return jsonResponse(200, { ok: true }, corsHeaderSource);
      }

      if (url.pathname === "/v1/fidelity") {
        const updatedAt = Date.now();
        const existingState = normalizeGlobalState(
          await loadState(this.storage, this.env),
          updatedAt
        );
        const nextState = normalizeGlobalState(
          {
            prompt_sessions: existingState.prompt_sessions,
            prompt: existingState.prompt,
            fidelity: existingState.fidelity,
            size: existingState.size,
            image_key: existingState.image_key,
            updated_at: updatedAt
          },
          updatedAt
        );
        await writeGlobalState(this.storage, this.env, nextState);
        return jsonResponse(
          200,
          buildStateResponse(nextState, url.origin),
          corsHeaderSource,
          NO_CACHE_HEADERS
        );
      }

      if (url.pathname !== "/v1/img-gen") {
        return new Response("not found", { status: 404, headers: corsHeaderSource });
      }

      let payload;
      try {
        payload = await request.json();
      } catch (error) {
        return jsonResponse(400, { error: "Invalid JSON" }, corsHeaderSource);
      }

      const existingState = normalizeGlobalState(
        await loadState(this.storage, this.env),
        Date.now()
      );
      const prompt = typeof existingState?.prompt === "string" ? existingState.prompt.trim() : "";
      const size = typeof payload?.size === "string" ? payload.size.trim() : existingState.size;
      const fidelity = Number.isFinite(existingState?.fidelity)
        ? existingState.fidelity
        : DEFAULT_FIDELITY;

      if (!prompt) {
        return jsonResponse(400, { error: "Prompt is required" }, corsHeaderSource);
      }

      if (prompt.length > MAX_PROMPT_LENGTH) {
        return jsonResponse(400, { error: "Prompt exceeds 4000 characters" }, corsHeaderSource);
      }

      if (!ALLOWED_SIZES.has(size)) {
        return jsonResponse(400, { error: "Invalid size" }, corsHeaderSource);
      }

      const model = this.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

      let upstreamResponse;
      try {
        upstreamResponse = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            prompt,
            n: 1,
            size
          })
        });
      } catch (error) {
        return jsonResponse(502, { error: "Failed to reach OpenAI" }, corsHeaderSource);
      }

      let upstreamJson;
      try {
        upstreamJson = await upstreamResponse.json();
      } catch (error) {
        return jsonResponse(502, { error: "Invalid OpenAI response" }, corsHeaderSource);
      }

      if (!upstreamResponse.ok) {
        const message = upstreamJson?.error?.message || "OpenAI request failed";
        return jsonResponse(upstreamResponse.status, { error: message }, corsHeaderSource);
      }

      const b64 = upstreamJson?.data?.[0]?.b64_json;
      if (!b64) {
        return jsonResponse(502, { error: "OpenAI response missing image" }, corsHeaderSource);
      }

      if (!this.env.IMG_BUCKET) {
        return jsonResponse(500, { error: "Image bucket not configured" }, corsHeaderSource);
      }

      const imageBytes = Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));
      const key = `images/${Date.now()}-${crypto.randomUUID()}.png`;
      await this.env.IMG_BUCKET.put(key, imageBytes, {
        httpMetadata: { contentType: "image/png" }
      });

      const updatedAt = Date.now();
      const nextState = normalizeGlobalState(
        {
          prompt_sessions: existingState.prompt_sessions,
          prompt,
          fidelity,
          size,
          image_key: key,
          updated_at: updatedAt
        },
        updatedAt
      );
      await writeGlobalState(this.storage, this.env, nextState);

      return jsonResponse(
        200,
        buildStateResponse(nextState, url.origin),
        corsHeaderSource,
        NO_CACHE_HEADERS
      );
    } catch (error) {
      return jsonResponse(500, { error: error?.message || "Internal error" }, corsHeaderSource);
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaderSource = corsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaderSource });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return new Response("ok", { status: 200 });
    }

    if (url.pathname.startsWith("/v1/image/") && request.method === "GET") {
      if (!env.IMG_BUCKET) {
        return jsonResponse(500, { error: "Image bucket not configured" }, corsHeaderSource);
      }
      const key = decodeURIComponent(url.pathname.slice("/v1/image/".length));
      if (!key) {
        return new Response("not found", { status: 404, headers: corsHeaderSource });
      }
      const object = await env.IMG_BUCKET.get(key);
      if (!object) {
        return new Response("not found", { status: 404, headers: corsHeaderSource });
      }
      const headers = new Headers(corsHeaderSource);
      object.writeHttpMetadata(headers);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(object.body, { status: 200, headers });
    }

    if (url.pathname.startsWith("/v1/")) {
      try {
        const id = env.GLOBAL_STATE_DO.idFromName("global");
        const resp = await env.GLOBAL_STATE_DO.get(id).fetch(request);
        const out = new Response(resp.body, resp);
        corsHeaderSource.forEach((value, key) => out.headers.set(key, value));
        out.headers.set("Cache-Control", "no-store");
        return out;
      } catch (error) {
        return jsonResponse(500, { error: error?.message || "Internal error" }, corsHeaderSource);
      }
    }

    return new Response("not found", { status: 404 });
  }
};
