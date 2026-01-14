const MAX_PROMPT_LENGTH = 4000;
const ALLOWED_SIZES = new Set(["512x512", "1024x1024", "1024x1792"]);
const MAX_WORD_ENTRIES = 50;
const promptSessions = new Map();

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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
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

function parseCookies(cookieHeader) {
  if (!cookieHeader) {
    return {};
  }
  return cookieHeader.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) {
      return acc;
    }
    acc[key] = rest.join("=");
    return acc;
  }, {});
}

function getSessionId(request) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  if (cookies.sid) {
    return { sid: cookies.sid, setCookie: null };
  }
  const sid = crypto.randomUUID();
  const setCookie = `sid=${sid}; Path=/; Secure; SameSite=None`;
  return { sid, setCookie };
}

function normalizeTokens(words) {
  return words
    .split(/[\s,]+/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

function buildPrompt(tokens, fidelity) {
  const uniqueTokens = [...new Set(tokens)];
  const limitedTokens = uniqueTokens.slice(0, 60);
  const fidelityValue = Number.isFinite(fidelity) ? fidelity : 0.5;
  let descriptor = "balanced, evocative, semi-literal composition";
  if (fidelityValue <= 0.33) {
    descriptor = "abstract, experimental, atmospheric impression";
  } else if (fidelityValue >= 0.66) {
    descriptor = "literal, detailed, high-fidelity depiction";
  }
  const tokenPhrase = limitedTokens.length ? ` of ${limitedTokens.join(", ")}` : "";
  return `${descriptor}${tokenPhrase}`.slice(0, MAX_PROMPT_LENGTH);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return new Response("ok", { status: 200 });
    }

    const origin = request.headers.get("Origin");
    const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS);
    const corsHeaders = buildCorsHeaders(origin, allowedOrigins);

    if (origin && !corsHeaders) {
      return jsonResponse(403, { error: "Origin not allowed" });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders || {} });
    }

    if (request.method !== "POST") {
      return new Response("not found", { status: 404 });
    }

    if (!corsHeaders) {
      return jsonResponse(403, { error: "Origin not allowed" }, corsHeaders);
    }

    if (url.pathname === "/v1/prompt/add") {
      let payload;
      try {
        payload = await request.json();
      } catch (error) {
        return jsonResponse(400, { error: "Invalid JSON" }, corsHeaders);
      }

      const words = typeof payload?.words === "string" ? payload.words.trim() : "";
      const fidelity = typeof payload?.fidelity === "number" ? payload.fidelity : undefined;

      if (!words) {
        return jsonResponse(400, { error: "Words are required" }, corsHeaders);
      }

      const { sid, setCookie } = getSessionId(request);
      const entries = promptSessions.get(sid) || [];
      entries.push(words);
      const nextEntries = entries.slice(-MAX_WORD_ENTRIES);
      promptSessions.set(sid, nextEntries);

      const tokens = normalizeTokens(nextEntries.join(" "));
      const prompt = buildPrompt(tokens, fidelity);
      const headers = setCookie ? { "Set-Cookie": setCookie } : null;
      return jsonResponse(
        200,
        { prompt, tokens: [...new Set(tokens)], count: nextEntries.length },
        corsHeaders,
        headers
      );
    }

    if (url.pathname === "/v1/prompt/clear") {
      const { sid, setCookie } = getSessionId(request);
      promptSessions.delete(sid);
      const headers = setCookie ? { "Set-Cookie": setCookie } : null;
      return jsonResponse(200, { ok: true }, corsHeaders, headers);
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

    const prompt = typeof payload?.prompt === "string" ? payload.prompt.trim() : "";
    const size = typeof payload?.size === "string" ? payload.size.trim() : "";

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

    return jsonResponse(
      200,
      { image_data_url: `data:image/png;base64,${b64}` },
      corsHeaders
    );
  }
};
