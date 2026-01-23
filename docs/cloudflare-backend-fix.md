# Cloudflare Backend Data Architecture Fix

> **OpenCode Implementation Plan** — Fixing SQLITE_TOOBIG by restructuring data storage

---

## Problem Summary

The `global_state` KV/Durable Object entry stores **base64 image data inline**, causing:
- `SQLITE_TOOBIG` errors (Durable Object SQLite limit ~128KB per value)
- Slow syncs and excessive bandwidth
- `prompt_sessions` also accumulating garbage data

![Current KV State](/Users/kailashpermaul/.gemini/antigravity/brain/065df5b3-027b-4742-a75b-29ee41c6630e/uploaded_image_1769126966849.png)

---

## Architecture Overview

### Current (Broken)
```
┌─────────────────────────────────────────────────────┐
│ Durable Object + KV                                 │
│ ┌─────────────────────────────────────────────────┐ │
│ │ global_state = {                                │ │
│ │   prompt: "...",                                │ │
│ │   prompt_sessions: [...],                       │ │
│ │   fidelity: 50,                                 │ │
│ │   image_data: "BASE64_BLOB..." ← PROBLEM        │ │
│ │ }                                               │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Target (Fixed)
```
┌─────────────────────────────────────────────────────┐
│ R2 Bucket (IMG_BUCKET)                              │
│ └── images/1234-uuid.png  ← Large binary files      │
└─────────────────────────────────────────────────────┘
         │
         │ image_key reference only
         ▼
┌─────────────────────────────────────────────────────┐
│ Durable Object Storage                              │
│ ┌─────────────────────────────────────────────────┐ │
│ │ global_state = {                                │ │
│ │   prompt: "...",              ← Small text      │ │
│ │   aggregated_tokens: [...],   ← Just tokens     │ │
│ │   fidelity: 50,               ← Number          │ │
│ │   image_key: "images/x.png",  ← Reference only  │ │
│ │   updated_at: 1706...         ← Timestamp       │ │
│ │ }                                               │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ send_timestamps = [1706..., 1706...]            │ │
│ │   ← Last 30 seconds of timestamps only          │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
         │
         │ Periodic snapshot for durability
         ▼
┌─────────────────────────────────────────────────────┐
│ KV (IMAGE_STATE_KV) - Optional backup               │
│ └── global_state (metadata only, no images)         │
└─────────────────────────────────────────────────────┘
```

---

## Cloudflare Storage Comparison

| Storage Type | Size Limit | Use Case | Cost |
|-------------|------------|----------|------|
| **R2 Bucket** | 5TB/object | Images, large files | $0.015/GB/mo |
| **Durable Object** | ~128KB/value | Small structured data | Per-request |
| **KV** | 25MB/value | Cache, snapshots | $0.50/M reads |

**Recommendation**: 
- Images → R2 (already configured as `IMG_BUCKET`)
- State metadata → Durable Object (small JSON only)
- KV → Optional backup, remove image data

---

## Implementation Steps

### Phase 1: Clean Existing Data

#### Task 1.1: Delete Corrupted KV Entry

**Action**: Manually delete the `global_state` KV entry from Cloudflare dashboard.

**Steps**:
1. Go to Cloudflare Dashboard → Workers & Pages → KV
2. Select your `IMAGE_STATE_KV` namespace
3. Delete the `global_state` key
4. The Durable Object will recreate it with clean structure on next request

---

### Phase 2: Fix State Structure

#### Task 2.1: Remove Image Data from State

**File**: [worker/src/index.js](file:///Users/kailashpermaul/Documents/GitHub/813wuwei/worker/src/index.js)

**Change `DEFAULT_GLOBAL_STATE`** (around line 24):
```javascript
// BEFORE:
const DEFAULT_GLOBAL_STATE = {
  prompt_sessions: [],  // ← Stores full text strings
  prompt: "",
  fidelity: DEFAULT_FIDELITY,
  size: "1024x1024",
  image_key: null,
  updated_at: 0
};

// AFTER:
const DEFAULT_GLOBAL_STATE = {
  aggregated_tokens: [],  // ← Store only unique tokens (max ~200)
  prompt: "",
  fidelity: DEFAULT_FIDELITY,
  size: "1024x1024",
  image_key: null,        // ← Reference only, NOT the image itself
  updated_at: 0
};
```

---

#### Task 2.2: Fix Token Aggregation

**File**: [worker/src/index.js](file:///Users/kailashpermaul/Documents/GitHub/813wuwei/worker/src/index.js)

**Replace `prompt_sessions` handling** in `/v1/prompt/add` (lines 584-589):

```javascript
// BEFORE:
const storedSessions = normalizePromptSessions(state.prompt_sessions);
storedSessions.push(words);
state.prompt_sessions = storedSessions.slice(-MAX_WORD_ENTRIES);
const tokens = normalizeTokens(state.prompt_sessions.join(" "));

// AFTER:
const newTokens = normalizeTokens(words);
const existingTokens = Array.isArray(state.aggregated_tokens) 
  ? state.aggregated_tokens 
  : [];
const allTokens = [...existingTokens, ...newTokens];
// Keep only last 200 unique tokens to stay under size limit
const uniqueTokens = [...new Set(allTokens)].slice(-200);
state.aggregated_tokens = uniqueTokens;
const tokens = uniqueTokens;
```

---

#### Task 2.3: Update State Normalization

**File**: [worker/src/index.js](file:///Users/kailashpermaul/Documents/GitHub/813wuwei/worker/src/index.js)

**Update `normalizeGlobalState` function** (around line 281):

```javascript
function normalizeGlobalState(state, fallbackUpdatedAt = 0) {
  return {
    // CHANGED: aggregated_tokens instead of prompt_sessions
    aggregated_tokens: Array.isArray(state?.aggregated_tokens) 
      ? state.aggregated_tokens.filter(t => typeof t === 'string').slice(-200)
      : [],
    prompt: typeof state?.prompt === "string" ? state.prompt.slice(0, 4000) : "",
    fidelity: normalizeFidelity(state?.fidelity),
    size: typeof state?.size === "string" ? state.size : DEFAULT_GLOBAL_STATE.size,
    image_key: normalizeImageKey(state?.image_key),  // Reference only
    updated_at: Number.isFinite(state?.updated_at) ? state.updated_at : fallbackUpdatedAt
  };
}
```

---

#### Task 2.4: Remove `normalizePromptSessions` function

**File**: [worker/src/index.js](file:///Users/kailashpermaul/Documents/GitHub/813wuwei/worker/src/index.js)

**Action**: Delete the `normalizePromptSessions` function (lines 245-250) as it's no longer needed.

---

### Phase 3: Ensure Images Go to R2 Only

#### Task 3.1: Verify Image Storage Path

The current code already stores images in R2 (lines 725-729):
```javascript
const imageBytes = Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));
const key = `images/${Date.now()}-${crypto.randomUUID()}.png`;
await this.env.IMG_BUCKET.put(key, imageBytes, {
  httpMetadata: { contentType: "image/png" }
});
```

**This is correct** — images go to R2, only `image_key` (the reference) goes to state.

**Verify**: Ensure no code path stores base64 data in `global_state`.

---

### Phase 4: Limit KV Writes

#### Task 4.1: Make KV Backup Optional

**File**: [worker/src/index.js](file:///Users/kailashpermaul/Documents/GitHub/813wuwei/worker/src/index.js)

**Change `writeGlobalState`** (around line 324):

```javascript
async function writeGlobalState(storage, env, state) {
  if (!storage?.put || state === undefined || state === null) {
    return;
  }
  const normalized = normalizeGlobalState(state, state.updated_at);
  
  // Write to Durable Object storage (primary)
  await storage.put(GLOBAL_STATE_KEY, normalized);
  
  // Write to KV only if state is small enough (under 25KB)
  if (env?.IMAGE_STATE_KV?.put) {
    const value = JSON.stringify(normalized);
    if (value.length < 25000) {  // 25KB limit for safety
      await env.IMAGE_STATE_KV.put(GLOBAL_STATE_KEY, value);
    }
  }
}
```

---

### Phase 5: Add Size Guard

#### Task 5.1: Add Pre-Write Size Check

**File**: [worker/src/index.js](file:///Users/kailashpermaul/Documents/GitHub/813wuwei/worker/src/index.js)

**Add helper function**:
```javascript
function estimateStateSize(state) {
  return JSON.stringify(state).length;
}

const MAX_STATE_SIZE = 100000; // 100KB safety limit
```

**Add check before `storage.put`**:
```javascript
async function writeGlobalState(storage, env, state) {
  const normalized = normalizeGlobalState(state, state.updated_at);
  const size = estimateStateSize(normalized);
  
  if (size > MAX_STATE_SIZE) {
    console.error(`State too large: ${size} bytes, truncating tokens`);
    // Emergency truncation
    normalized.aggregated_tokens = normalized.aggregated_tokens.slice(-50);
  }
  
  await storage.put(GLOBAL_STATE_KEY, normalized);
  // ... rest of function
}
```

---

## Verification

### Manual Tests

| Test | Command/Action | Expected |
|------|----------------|----------|
| Clear KV | Delete `global_state` from KV dashboard | Key removed |
| Send words | POST to `/v1/prompt/add` | State saved, no error |
| Check state size | GET `/v1/state`, check response size | < 10KB |
| Generate image | POST to `/v1/img-gen` | Image in R2, key in state |
| View image | GET `/v1/image/{key}` | Image loads from R2 |

### Size Estimation

| Field | Max Size |
|-------|----------|
| `aggregated_tokens` (200 tokens × 20 chars) | ~4KB |
| `prompt` | ~4KB |
| `fidelity`, `size`, `updated_at` | ~100 bytes |
| `image_key` | ~100 bytes |
| **Total max** | **~8KB** ✅ |

---

## Deployment Steps

1. **Clear existing data**: Delete `global_state` from KV dashboard
2. **Deploy worker changes**: `wrangler deploy`
3. **Test endpoint**: Send a few words, verify no errors
4. **Monitor**: Check Durable Object logs for any size warnings

---

## Summary

| Change | Purpose |
|--------|---------|
| Replace `prompt_sessions` → `aggregated_tokens` | Store ~200 unique tokens, not full text |
| Images → R2 only | Large binaries never touch DO/KV |
| Add size guards | Prevent future SQLITE_TOOBIG |
| Truncate on overflow | Emergency fallback |
