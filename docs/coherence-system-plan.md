# Permanent Impermanence: Alignment Audit & Execution Plan

> **OpenCode Roadmap** — Aligning current implementation with intended behavior

---

## Requirement Checklist

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | Single base image | ✅ Works | `default.png` loaded, can be replaced via backend |
| 2 | Deconstruct into noise via UV-space randomization | ✅ Works | Fragment shader uses zone-based UV displacement |
| 3 | NOT opacity, blur, or overlay | ✅ Correct | Shader samples from displaced UV coordinates |
| 4 | Lowest coherence = near white noise | ✅ Works | At fidelity < 0.02, shader outputs RGB noise |
| 5 | Highest coherence = clear but unstable | ⚠️ Partial | Clear at high fidelity, but no instability |
| 6 | Coherence NOT user-controlled directly | ⚠️ Partial | Fidelity slider hidden, but still in DOM |
| 7 | Coherence driven by Send input rate | ✅ Works | Backend tracks timestamps, calculates rate |
| 8 | Low rate → collapse into noise | ✅ Works | Passive decay on GET /v1/state |
| 9 | Medium rate → stable lower-fidelity | ⚠️ Partial | No "stable" regime distinction |
| 10 | High rate → high-fidelity but unstable | ❌ Missing | High fidelity is stable, not unstable |
| 11 | Only control = sensitivity slider | ⚠️ Partial | Slider exists, but extra UI elements visible |

---

## Architecture Summary

### What's Working ✅

**1. Visual System (Shader)**
```
fidelity < 0.02  →  Pure RGB noise (TV static)
fidelity 0.02-1  →  UV displacement with zone-based scrambling
motion = log2(1 + 7 * (1-fidelity)) / log2(8)  →  Higher motion at lower fidelity
```

**2. Rate Tracking (Backend)**
```
POST /v1/prompt/add  →  Records timestamp, prunes to 30s window
GET /v1/state        →  Recalculates fidelity from active timestamps
fidelity = (timestamps_in_30s / 100) * 100  →  100 sends = 100% fidelity
```

**3. Passive Decay**
- When no sends occur, `/v1/state` GET returns decreasing fidelity as timestamps age out
- Client polls every 5 seconds, applies new fidelity

### What's Missing/Wrong ❌

**1. No "Unstable" High-Fidelity Regime**
- The shader is stable at all fidelity levels
- High rate should create jitter/flicker, not smooth image

**2. No "Stable Medium" vs "Unstable High" Distinction**
- Current: fidelity is linear 0-100 based on rate
- Needed: Different visual behavior at medium vs high rates

**3. Extra UI Elements Still Visible**
- "Words" textarea visible (should this be a simple input?)
- "Prompt" output visible (dev-only?)
- Status readout visible

---

## Execution Plan

### Phase 1: Simplify Public UI

**Goal**: Only show text input, Send button, and sensitivity slider.

**File**: [`img-gen/index.html`](file:///Users/kailashpermaul/Documents/GitHub/813wuwei/img-gen/index.html)

**Changes**:
```html
<!-- KEEP these elements visible -->
<textarea id="userWords" ...></textarea>
<button id="sendWordsBtn">Send</button>
<input id="sensitivity" type="range" ...>

<!-- HIDE these (add dev-only class) -->
<textarea id="promptOut" ...>  <!-- Move to dev-only -->
<div id="imageStatus" ...>     <!-- Move to dev-only -->
<img id="generatedImage" ...>  <!-- Move to dev-only -->
```

**Validation**:
- [ ] Without `?dev=1`: Only input, Send, and Sensitivity visible
- [ ] With `?dev=1`: All controls visible

---

### Phase 2: Add Instability at High Fidelity

**Goal**: High rate = high fidelity but visually unstable (jitter/flicker).

**File**: [`shared/renderer.js`](file:///Users/kailashpermaul/Documents/GitHub/813wuwei/shared/renderer.js)

**Concept**: Add per-frame seed variation when fidelity is high (>0.85).

**Change Fragment Shader** (add instability at high fidelity):
```glsl
void main() {
  vec2 p = gl_FragCoord.xy;
  float f = clamp(u_fidelity, 0.0, 1.0);
  float n = 1.0 - f;
  float motion = log2(1.0 + 7.0 * n) / log2(8.0);

  // NEW: Add instability at high fidelity
  float instability = 0.0;
  if (f > 0.85) {
    // High fidelity = unstable jitter
    instability = (f - 0.85) / 0.15;  // 0 at 0.85, 1 at 1.0
    float jitterSeed = u_seed + floor(u_time * 30.0);
    float jitter = (hash12(p + jitterSeed) - 0.5) * instability * 0.03;
    // Apply micro-displacement at high fidelity
    p += jitter * 10.0;
  }
  
  // ... rest of shader unchanged
}
```

**Validation**:
- [ ] Fidelity 0.9-1.0: Image is clear but has subtle jitter/flicker
- [ ] Fidelity 0.5-0.85: Image is stable but scrambled
- [ ] Fidelity < 0.3: Full noise

---

### Phase 3: Define Coherence Regimes

**Goal**: Create distinct visual regimes based on input rate.

**Regime Map**:
| Rate (sends/30s) | Fidelity | Visual Behavior |
|------------------|----------|-----------------|
| 0-10 | 0-10% | COLLAPSE: Pure noise |
| 10-50 | 10-50% | SCRAMBLE: Heavy distortion, stable |
| 50-80 | 50-80% | CONVERGE: Recognizable but noisy, stable |
| 80-100+ | 80-100% | UNSTABLE: Clear but jittery |

**File**: [`shared/renderer.js`](file:///Users/kailashpermaul/Documents/GitHub/813wuwei/shared/renderer.js)

**Update `renderFrame` to report regime**:
```javascript
renderFrame(time = 0, onRenderData = null) {
  // ...
  const regime = 
    this.fidelity < 0.1 ? "COLLAPSE" :
    this.fidelity < 0.5 ? "SCRAMBLE" :
    this.fidelity < 0.8 ? "CONVERGE" :
    "UNSTABLE";
  // ...
}
```

---

### Phase 4: Tune Rate→Fidelity Curve

**Goal**: Make the transition between regimes feel natural.

**Current Backend Logic** (linear):
```javascript
fidelity = (timestamps.length / 100) * 100;
```

**Proposed Curve** (S-curve for smoother transitions):
```javascript
// Normalize rate to 0-1 (cap at 100 sends)
const rawRate = timestamps.length / 100;
// Apply S-curve for smoother regime transitions
const fidelity = 1 / (1 + Math.exp(-8 * (rawRate - 0.5)));
// Scale back to 0-100
state.fidelity = Math.round(fidelity * 100);
```

**Effect**:
- Few sends → fidelity stays low longer (noise persists)
- Medium sends → fidelity rises gradually
- Many sends → fidelity jumps to high (unstable regime)

**File**: [`worker/src/index.js`](file:///Users/kailashpermaul/Documents/GitHub/813wuwei/worker/src/index.js) (lines 520-527 and 599-601)

---

### Phase 5: Clean Up Sensitivity Slider Logic

**Goal**: Sensitivity should scale the rate→fidelity relationship, not apply a power curve.

**Current Logic** (in `app.js`):
```javascript
const adjustedFidelity = Math.pow(clamped, 1 + (1 - sensitivity));
```

**Proposed Logic**:
```javascript
// Sensitivity scales how quickly fidelity responds to rate
// High sensitivity: small rate changes → big fidelity changes
// Low sensitivity: fidelity changes more gradually
const scale = 0.5 + sensitivity * 1.0;  // 0.5x to 1.5x  
const adjustedFidelity = clamp(clamped * scale, 0, 1);
```

**File**: [`img-gen/app.js`](file:///Users/kailashpermaul/Documents/GitHub/813wuwei/img-gen/app.js) (lines 168-173)

---

## Verification Checklist

| Test | Steps | Expected |
|------|-------|----------|
| **Noise at idle** | Load page, wait 30s | Canvas degrades to pure noise |
| **Coherence on send** | Send 5 words | Canvas becomes slightly less noisy |
| **High rate unstable** | Send 50+ words rapidly | Canvas becomes clear but jittery |
| **Decay after burst** | Stop sending, wait | Canvas gradually returns to noise |
| **Sensitivity low** | Set slider to 0, send words | Fidelity changes slowly |
| **Sensitivity high** | Set slider to 1, send words | Fidelity changes rapidly |
| **Dev controls hidden** | Load without `?dev=1` | Only input, Send, Sensitivity visible |

---

## Summary

| Phase | Priority | Files |
|-------|----------|-------|
| 1. Simplify UI | 🔴 High | `img-gen/index.html` |
| 2. Add instability | 🔴 High | `shared/renderer.js` |
| 3. Define regimes | 🟡 Medium | `shared/renderer.js` |
| 4. Tune rate curve | 🟡 Medium | `worker/src/index.js` |
| 5. Fix sensitivity | 🟢 Low | `img-gen/app.js` |

**Core insight**: The visual system (shader) is correct. The main gaps are:
1. No visual instability at high fidelity
2. Extra UI elements visible to non-dev users
3. Sensitivity slider logic could be clearer
