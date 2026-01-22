// API communication module - handles backend communication and state sync

const WORKER_URL = "https://img-gen-backend.nnjeff-prod.workers.dev";
const STATE_POLL_MS = 5000;
const DEFAULT_IMAGE_SIZE = "1536x1024";

class APIManager {
  constructor() {
    this.lastSeenUpdatedAt = -1;
    this.lastSharedImageUrl = null;
    this.hasBackendState = false;
    this.lastSyncErrorMessage = "";
    this.lastSyncErrorAt = 0;
    this.SYNC_ERROR_COOLDOWN_MS = 5000;
  }

  normalizeSharedState(data) {
    return {
      prompt: typeof data?.prompt === "string" ? data.prompt : "",
      image_url: typeof data?.image_url === "string" ? data.image_url : "",
      updated_at: Number.isFinite(data?.updated_at) ? data.updated_at : 0,
      fidelity: Number.isFinite(data?.fidelity) ? data.fidelity : null,
      size: typeof data?.size === "string" ? data.size : ""
    };
  }

  async syncSharedState() {
    try {
      const response = await fetch(`${WORKER_URL}/v1/state`, {
        method: "GET",
        cache: "no-store"
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.error || "Image sync failed.";
        this.setSyncError(message);
        return null;
      }
      const state = this.normalizeSharedState(data);
      this.lastSyncErrorMessage = "";
      return state;
    } catch (error) {
      this.setSyncError(error?.message || "Image sync failed.");
      return null;
    }
  }

  setSyncError(message) {
    const nextMessage = message || "Image sync failed.";
    const now = Date.now();
    if (
      nextMessage === this.lastSyncErrorMessage &&
      now - this.lastSyncErrorAt < this.SYNC_ERROR_COOLDOWN_MS
    ) {
      return;
    }
    this.lastSyncErrorMessage = nextMessage;
    this.lastSyncErrorAt = now;
    return nextMessage;
  }

  async hydrateFidelityFromBackend() {
    try {
      const response = await fetch(`${WORKER_URL}/v1/state`, {
        method: "GET",
        cache: "no-store"
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        const state = this.normalizeSharedState(data);
        if (Number.isFinite(state?.fidelity)) {
          return state;
        }
      }
    } catch (error) {
      // Ignore initial load failures.
    }
    return null;
  }

  async sendWords(words) {
    if (!words || !words.trim()) {
      throw new Error("Enter a few words to build a prompt.");
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

      return this.normalizeSharedState(data);
    } catch (error) {
      throw new Error(error?.message || "Failed to aggregate words.");
    }
  }

  async generateImage(size = DEFAULT_IMAGE_SIZE) {
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

      return this.normalizeSharedState(data);
    } catch (error) {
      throw new Error(error?.message || "Image generation failed.");
    }
  }

  applyStateToUI(state, callbacks = {}) {
    const updatedAt = Number.isFinite(state?.updated_at) ? state.updated_at : 0;
    if (updatedAt >= 0) {
      this.hasBackendState = true;
    }
    this.lastSeenUpdatedAt = Math.max(this.lastSeenUpdatedAt, updatedAt);

    const imageUrl = state?.image_url || "";
    this.applySharedImage(imageUrl, callbacks.onImageUpdate);

    if (typeof state?.prompt === "string" && callbacks.onPromptUpdate) {
      callbacks.onPromptUpdate(state.prompt.trim());
    }

    if (Number.isFinite(state?.fidelity) && callbacks.onFidelityUpdate) {
      callbacks.onFidelityUpdate(state.fidelity);
    }

    if (state?.size && callbacks.onSizeUpdate) {
      callbacks.onSizeUpdate(state.size);
    }

    return true;
  }

  applySharedImage(imageUrl, onImageUpdate = null) {
    const nextUrl = typeof imageUrl === "string" ? imageUrl : "";
    if (!nextUrl) {
      if (this.lastSharedImageUrl) {
        this.lastSharedImageUrl = null;
        if (onImageUpdate) {
          onImageUpdate(null);
        }
      }
      return;
    }
    if (nextUrl === this.lastSharedImageUrl) {
      return;
    }

    this.lastSharedImageUrl = nextUrl;

    if (onImageUpdate) {
      onImageUpdate(nextUrl);
    }
  }

  startStatePolling(callbacks = {}) {
    // Initial sync
    this.syncSharedState().then((state) => {
      if (state) {
        this.applyStateToUI(state, callbacks);
      }
    });

    // Set up polling
    return setInterval(() => {
      this.syncSharedState().then((state) => {
        if (state) {
          this.applyStateToUI(state, callbacks);
        }
      });
    }, STATE_POLL_MS);
  }

  scheduleInitialFidelityLoad(callback) {
    const run = () => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          this.hydrateFidelityFromBackend().then((state) => {
            if (state && callback) {
              callback(state);
            }
          });
        }, 0);
      });
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run);
    } else {
      run();
    }
  }

  getLastSyncError() {
    const now = Date.now();
    if (now - this.lastSyncErrorAt < this.SYNC_ERROR_COOLDOWN_MS) {
      return this.lastSyncErrorMessage;
    }
    return null;
  }

  hasState() {
    return this.hasBackendState;
  }
}

export { APIManager, WORKER_URL, STATE_POLL_MS, DEFAULT_IMAGE_SIZE };
