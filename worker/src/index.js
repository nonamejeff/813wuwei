const MAX_PROMPT_LENGTH = 4000;
const ALLOWED_SIZES = new Set(["512x512", "1024x1024", "1024x1792"]);

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
    Vary: "Origin"
  };
}

function jsonResponse(status, body, corsHeaders) {
  const headers = {
    "Content-Type": "application/json",
    ...(corsHeaders || {})
  };
  return new Response(JSON.stringify(body), { status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return new Response("ok", { status: 200 });
    }

    if (url.pathname !== "/v1/img-gen") {
      return new Response("not found", { status: 404 });
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
      return jsonResponse(403, { error: "Origin not allowed" });
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
