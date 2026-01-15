const MAX_PROMPT_LENGTH = 4000;
const ALLOWED_SIZES = new Set(["512x512", "1024x1024", "1024x1536", "1536x1024"]);
const MAX_WORD_ENTRIES = 50;
const GLOBAL_STATE_KEY = "global_state";
// prompt_sessions aggregates prompt inputs only; using it for shared image state
// caused desync because it never stored the canonical image payload.
const DEFAULT_FIDELITY = 0;
const DEFAULT_GLOBAL_STATE = {
  prompt_sessions: [],
  prompt: "",
  send_timestamps: [],
  fidelity: DEFAULT_FIDELITY,
  size: "1024x1024",
  image_url: null,
  image_data_url: null,
  updated_at: 0
};
// NOTE: Do not store global image state in-memory; per-worker isolates reset often
// and are not shared across regions, so memory state diverges between clients.
// KV persistence is now used for global image state. Deploy after changes:
// cd worker && npm run deploy
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

function parseAllowedOrigins(value) {
  return (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function buildCorsHeaders(origin, allowedOrigins) {
  if (!origin || !allowedOrigins.includes(origin)) {
    return null;
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin"
  };
}

function jsonResponse(status, body, corsHeaders, extraHeaders) {
  const headers = {
    "Content-Type": "application/json",
    ...(corsHeaders || {}),
    ...(extraHeaders || {})
  };
  return new Response(JSON.stringify(body), { status, headers });
}

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0"
};

function normalizePromptSessions(sessions) {
  if (!Array.isArray(sessions)) {
    return [];
  }
  return sessions.filter((entry) => typeof entry === "string" && entry.trim().length > 0);
}

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

function normalizeGlobalState(state, fallbackUpdatedAt = 0) {
  return {
    prompt_sessions: normalizePromptSessions(state?.prompt_sessions),
    prompt: typeof state?.prompt === "string" ? state.prompt : "",
    send_timestamps: normalizeSendTimestamps(state?.send_timestamps),
    fidelity: normalizeFidelity(state?.fidelity),
    size: typeof state?.size === "string" ? state.size : DEFAULT_GLOBAL_STATE.size,
    image_url: normalizeImageValue(state?.image_url),
    image_data_url: normalizeImageValue(state?.image_data_url),
    updated_at: Number.isFinite(state?.updated_at) ? state.updated_at : fallbackUpdatedAt
  };
}

async function loadGlobalState(env) {
  if (!env?.IMAGE_STATE_KV?.get) {
    return { ...DEFAULT_GLOBAL_STATE };
  }
  try {
    const stored = await env.IMAGE_STATE_KV.get(GLOBAL_STATE_KEY, {
      type: "json"
    });
    return normalizeGlobalState(stored, DEFAULT_GLOBAL_STATE.updated_at);
  } catch (error) {
    return { ...DEFAULT_GLOBAL_STATE };
  }
}

async function writeGlobalState(env, state) {
  if (!env?.IMAGE_STATE_KV?.put || state === undefined || state === null) {
    return;
  }
  const normalized = normalizeGlobalState(state, state.updated_at);
  const value = JSON.stringify(normalized);
  await env.IMAGE_STATE_KV.put(GLOBAL_STATE_KEY, value);
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

  return `${STYLE_SPINE}\n${moodLine}\n${NON_LITERAL_RULES}`.slice(0, MAX_PROMPT_LENGTH);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return new Response("ok", { status: 200 });
    }

    const isApiRequest = url.pathname.startsWith("/v1/");
    const origin = request.headers.get("Origin");
    const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS);
    const corsHeaders = isApiRequest ? buildCorsHeaders(origin, allowedOrigins) : null;

    if (isApiRequest && origin && !corsHeaders) {
      return jsonResponse(403, { error: "Origin not allowed" });
    }

    if (isApiRequest && request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders || {} });
    }

    if (request.method === "GET") {
      if (url.pathname === "/v1/state") {
        let storedState = null;
        if (env?.IMAGE_STATE_KV?.get) {
          try {
            storedState = await env.IMAGE_STATE_KV.get(GLOBAL_STATE_KEY, { type: "json" });
          } catch (error) {
            storedState = null;
          }
        }

        const currentState = storedState
          ? normalizeGlobalState(storedState, DEFAULT_GLOBAL_STATE.updated_at)
          : { ...DEFAULT_GLOBAL_STATE };

        if (!storedState) {
          await writeGlobalState(env, currentState);
        }
        return jsonResponse(
          200,
          currentState,
          corsHeaders,
          NO_CACHE_HEADERS
        );
      }
      return new Response("not found", { status: 404 });
    }

    if (request.method !== "POST") {
      return new Response("not found", { status: 404 });
    }

    if (isApiRequest && !corsHeaders) {
      return jsonResponse(403, { error: "Origin not allowed" }, corsHeaders);
    }

    if (url.pathname === "/v1/state") {
      let payload;
      try {
        payload = await request.json();
      } catch (error) {
        return jsonResponse(400, { error: "Invalid JSON" }, corsHeaders);
      }

      const updatedAt = Date.now();
      const existingState = await loadGlobalState(env);
      const nextState = normalizeGlobalState(
        {
          prompt_sessions: Array.isArray(payload?.prompt_sessions)
            ? payload.prompt_sessions
            : existingState.prompt_sessions,
          prompt: typeof payload?.prompt === "string" ? payload.prompt.trim() : existingState.prompt,
          image_data_url:
            payload?.image_data_url === null
              ? null
              : typeof payload?.image_data_url === "string"
                ? payload.image_data_url
                : existingState.image_data_url,
          image_url:
            payload?.image_url === null
              ? null
              : typeof payload?.image_url === "string"
                ? payload.image_url
                : existingState.image_url,
          send_timestamps: existingState.send_timestamps,
          fidelity: existingState.fidelity,
          size: typeof payload?.size === "string" ? payload.size.trim() : existingState.size,
          updated_at: updatedAt
        },
        updatedAt
      );
      await writeGlobalState(env, nextState);
      return jsonResponse(200, nextState, corsHeaders, NO_CACHE_HEADERS);
    }

    if (url.pathname === "/v1/prompt/add") {
      let payload;
      try {
        payload = await request.json();
      } catch (error) {
        return jsonResponse(400, { error: "Invalid JSON" }, corsHeaders);
      }

      const words = typeof payload?.words === "string" ? payload.words.trim() : "";
      if (!words) {
        return jsonResponse(400, { error: "Words are required" }, corsHeaders);
      }

      const existingState = await loadGlobalState(env);
      const storedSessions = normalizePromptSessions(existingState.prompt_sessions);
      storedSessions.push(words);
      const nextEntries = storedSessions.slice(-MAX_WORD_ENTRIES);

      const tokens = normalizeTokens(nextEntries.join(" "));
      const prompt = buildPrompt(tokens);

      const updatedAt = Date.now();
      const cutoff = updatedAt - 30000;
      const nextSendTimestamps = normalizeSendTimestamps(existingState.send_timestamps);
      nextSendTimestamps.push(updatedAt);
      const recentTimestamps = nextSendTimestamps.filter((timestamp) => timestamp >= cutoff);
      const presses = recentTimestamps.length;
      const TARGET = 100;
      const fidelity = Math.round((presses / TARGET) * 100);
      const nextFidelity = Math.max(0, Math.min(100, fidelity));
      const nextState = normalizeGlobalState(
        {
          prompt_sessions: nextEntries,
          prompt,
          send_timestamps: recentTimestamps,
          fidelity: nextFidelity,
          size: existingState.size,
          image_url: existingState.image_url,
          image_data_url: existingState.image_data_url,
          updated_at: updatedAt
        },
        updatedAt
      );
      console.log("presses", presses, "fidelity", nextState.fidelity);
      await writeGlobalState(env, nextState);

      return jsonResponse(
        200,
        nextState,
        corsHeaders
      );
    }

    if (url.pathname === "/v1/prompt/clear") {
      const updatedAt = Date.now();
      const existingState = await loadGlobalState(env);
      const nextState = normalizeGlobalState(
        {
          prompt_sessions: [],
          prompt: "",
          send_timestamps: existingState.send_timestamps,
          fidelity: existingState.fidelity,
          size: existingState.size,
          image_url: existingState.image_url,
          image_data_url: existingState.image_data_url,
          updated_at: updatedAt
        },
        updatedAt
      );
      await writeGlobalState(env, nextState);
      return jsonResponse(200, { ok: true }, corsHeaders);
    }

    if (url.pathname === "/v1/fidelity") {
      const updatedAt = Date.now();
      const existingState = await loadGlobalState(env);
      const nextState = normalizeGlobalState(
        {
          prompt_sessions: existingState.prompt_sessions,
          prompt: existingState.prompt,
          send_timestamps: existingState.send_timestamps,
          fidelity: existingState.fidelity,
          size: existingState.size,
          image_url: existingState.image_url,
          image_data_url: existingState.image_data_url,
          updated_at: updatedAt
        },
        updatedAt
      );
      await writeGlobalState(env, nextState);
      return jsonResponse(200, nextState, corsHeaders, NO_CACHE_HEADERS);
    }

    if (url.pathname !== "/v1/img-gen") {
      return new Response("not found", { status: 404 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return jsonResponse(400, { error: "Invalid JSON" }, corsHeaders);
    }

    const existingState = await loadGlobalState(env);
    const prompt = typeof existingState?.prompt === "string" ? existingState.prompt.trim() : "";
    const size = typeof payload?.size === "string" ? payload.size.trim() : existingState.size;
    const fidelity = Number.isFinite(existingState?.fidelity)
      ? existingState.fidelity
      : DEFAULT_FIDELITY;

    if (!prompt) {
      return jsonResponse(400, { error: "Prompt is required" }, corsHeaders);
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return jsonResponse(400, { error: "Prompt exceeds 4000 characters" }, corsHeaders);
    }

    if (!ALLOWED_SIZES.has(size)) {
      return jsonResponse(400, { error: "Invalid size" }, corsHeaders);
    }

    const model = env.OPENAI_IMAGE_MODEL || "gpt-image-1";

    let upstreamResponse;
    try {
      upstreamResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
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
      return jsonResponse(502, { error: "Failed to reach OpenAI" }, corsHeaders);
    }

    let upstreamJson;
    try {
      upstreamJson = await upstreamResponse.json();
    } catch (error) {
      return jsonResponse(502, { error: "Invalid OpenAI response" }, corsHeaders);
    }

    if (!upstreamResponse.ok) {
      const message =
        upstreamJson?.error?.message || "OpenAI request failed";
      return jsonResponse(upstreamResponse.status, { error: message }, corsHeaders);
    }

    const b64 = upstreamJson?.data?.[0]?.b64_json;
    if (!b64) {
      return jsonResponse(502, { error: "OpenAI response missing image" }, corsHeaders);
    }

    const imageDataUrl = `data:image/png;base64,${b64}`;
    const updatedAt = Date.now();
    const nextState = normalizeGlobalState(
      {
        prompt_sessions: existingState.prompt_sessions,
        prompt,
        send_timestamps: existingState.send_timestamps,
        fidelity,
        size,
        image_url: null,
        image_data_url: imageDataUrl,
        updated_at: updatedAt
      },
      updatedAt
    );
    await writeGlobalState(env, nextState);

    return jsonResponse(
      200,
      nextState,
      corsHeaders,
      NO_CACHE_HEADERS
    );
  }
};
