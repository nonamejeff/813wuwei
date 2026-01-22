# Shared Modules

This directory contains shared modules used by both the `/img-gen/` and `/artwork/` pages to avoid code duplication.

## Modules

### `renderer.js` - WebGL Renderer

Handles all WebGL rendering, canvas management, shader compilation, and visual effects.

**Key Features:**

- WebGL shader setup and management
- Canvas resizing and device pixel ratio handling
- Texture management and updates
- Real-time rendering with noise effects
- Fidelity-based visual scrambling

**Usage:**

```javascript
import { WebGLRenderer } from "./shared/renderer.js";

const renderer = new WebGLRenderer("canvas-id");
renderer.setFidelity(0.5);
renderer.startRenderLoop();
```

### `api.js` - API Communication

Handles all backend communication with the Cloudflare Worker API.

**Key Features:**

- State synchronization with polling
- Word submission and prompt building
- Image generation requests
- Error handling and retry logic
- State normalization

**Usage:**

```javascript
import { APIManager } from "./shared/api.js";

const api = new APIManager();
api.startStatePolling(callbacks);
const state = await api.sendWords("words here");
```

### `prompt.js` - Prompt Building

Handles tokenization, prompt building, clustering, and all prompt-related logic.

**Key Features:**

- Text tokenization and stopword filtering
- K-means clustering of messages
- Mood-based prompt generation
- Weighted token processing
- Bootstrap token initialization

**Usage:**

```javascript
import { PromptBuilder } from "./shared/prompt.js";

const promptBuilder = new PromptBuilder();
promptBuilder.addMessage("some text here");
const prompt = promptBuilder.buildPromptFromWords("words");
```

## Constants

Each module exports relevant constants:

- `STYLE_SPINE`, `NON_LITERAL_RULES`, `NEGATIVE_PROMPT` from `prompt.js`
- `WORKER_URL`, `STATE_POLL_MS`, `DEFAULT_IMAGE_SIZE` from `api.js`
- Shader constants are encapsulated in the WebGLRenderer class

## Architecture

The modules are designed to be:

- **Reusable**: Can be imported and used independently
- **DOM-agnostic**: Handle cases where DOM elements may not exist
- **ES Modules**: Use modern import/export syntax
- **Error-resilient**: Graceful handling of missing elements or network issues

## Shared Usage Pattern

```javascript
import { WebGLRenderer } from "../shared/renderer.js";
import { APIManager } from "../shared/api.js";
import { PromptBuilder } from "../shared/prompt.js";

// Initialize modules
const renderer = new WebGLRenderer("canvas-id");
const api = new APIManager();
const promptBuilder = new PromptBuilder();

// Set up callbacks for API updates
const callbacks = {
  onImageUpdate: (imageUrl) => {
    /* handle image */
  },
  onPromptUpdate: (prompt) => {
    /* handle prompt */
  },
  onFidelityUpdate: (fidelity) => {
    /* handle fidelity */
  }
};

// Start the system
api.startStatePolling(callbacks);
renderer.startRenderLoop();
```

## Testing

All modules have been syntax-validated and are designed to work with both:

- Full-featured img-gen page (with all dev tools)
- Simplified artwork page (minimal UI)

The modules gracefully handle missing DOM elements, making them suitable for different contexts.
