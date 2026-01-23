// Img-gen app - full-featured version using shared modules

import { WebGLRenderer } from "../shared/renderer.js";
import { APIManager, DEFAULT_IMAGE_SIZE } from "../shared/api.js";
import {
  PromptBuilder,
  DEFAULT_OVERRIDE_PROMPT,
  NEGATIVE_PROMPT,
  BOOTSTRAP_TOKENS
} from "../shared/prompt.js";

// Constants
const DEFAULT_TARGET_SIZE = 512;
const FIDELITY_MIN = 0;
const FIDELITY_MAX = 1;
const FIDELITY_SCALE = 100;

// UI Elements
const sensitivityInput = document.getElementById("sensitivity");
const fidelitySlider = document.getElementById("fidelitySlider");
const userWordsInput = document.getElementById("userWords");
const sendWordsBtn = document.getElementById("sendWordsBtn");
const promptOut = document.getElementById("promptOut");
const kInput = document.getElementById("kValue");
const motionReadout = document.getElementById("motionReadout");
const regimeReadout = document.getElementById("regimeReadout");
const entropyReadout = document.getElementById("entropyReadout");
const coherenceReadout = document.getElementById("coherenceReadout");
const flowReadout = document.getElementById("flowReadout");
const rateReadout = document.getElementById("rateReadout");
const emaRateReadout = document.getElementById("emaRateReadout");
const targetFidelityReadout = document.getElementById("targetFidelityReadout");
const currentFidelityReadout = document.getElementById("currentFidelityReadout");
const devTools = document.getElementById("devTools");
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
const generateImageBtn = document.getElementById("generateImageBtn");
const imageSizeSelect = document.getElementById("imageSize");
const imageStatus = document.getElementById("imageStatus");
const generatedImage = document.getElementById("generatedImage");
const promptOutput = document.getElementById("promptOutput");
const negativeOutput = document.getElementById("negativeOutput");
const promptTimestamp = document.getElementById("promptTimestamp");
const currentK = document.getElementById("currentK");
const clusterSizesEl = document.getElementById("clusterSizes");
const tokenCountEl = document.getElementById("tokenCount");
const clusterDetails = document.getElementById("clusterDetails");

// Initialize shared modules
const renderer = new WebGLRenderer("field");
const api = new APIManager();
const promptBuilder = new PromptBuilder();

// State variables
let targetImageReady = false;
let targetImageUrl = null;
let lastSeenUpdatedAt = -1;
let lastSharedImageUrl = null;
let hasBackendState = false;
let fidelity = 0;
let targetFidelity = 0;
let isEditingPrompt = false;
let isProgrammaticFidelityUpdate = false;
let hasAppliedBackendFidelity = false;
let hasAppliedUserFidelity = false;
let lastSyncErrorMessage = "";
let lastSyncErrorAt = 0;

const devEnabled = new URLSearchParams(window.location.search).get("dev") === "1";

if (devTools) {
  devTools.style.display = devEnabled ? "flex" : "none";
}

if (devEnabled) {
  document.querySelectorAll(".dev-only").forEach((el) => {
    el.style.display = "";
  });
}

function updatePromptEditingState() {
  const active = document.activeElement;
  isEditingPrompt = active === promptOut || active === userWordsInput;
}

if (promptOut) {
  promptOut.addEventListener("focus", updatePromptEditingState);
  promptOut.addEventListener("blur", updatePromptEditingState);
}

if (userWordsInput) {
  userWordsInput.addEventListener("focus", updatePromptEditingState);
  userWordsInput.addEventListener("blur", updatePromptEditingState);
}

if (fidelitySlider) {
  fidelitySlider.min = "0";
  fidelitySlider.max = String(FIDELITY_SCALE);
  fidelitySlider.step = "1";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeFidelityValue(value) {
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return numeric / FIDELITY_SCALE;
}

function denormalizeFidelityValue(value) {
  return value * FIDELITY_SCALE;
}

function updateFidelityReadouts() {
  if (devEnabled) {
    if (targetFidelityReadout) {
      targetFidelityReadout.textContent = targetFidelity.toFixed(3);
    }
    if (currentFidelityReadout) {
      currentFidelityReadout.textContent = fidelity.toFixed(3);
    }
  }
}

function dispatchFidelityEvents() {
  if (!fidelitySlider) {
    return;
  }
  isProgrammaticFidelityUpdate = true;
  fidelitySlider.dispatchEvent(new Event("input", { bubbles: true }));
  fidelitySlider.dispatchEvent(new Event("change", { bubbles: true }));
  isProgrammaticFidelityUpdate = false;
}

function setFidelitySliderValue(value) {
  if (!fidelitySlider) {
    return;
  }
  const nextValue = String(value);
  const didChange = fidelitySlider.value !== nextValue;
  fidelitySlider.value = nextValue;
  if (didChange) {
    dispatchFidelityEvents();
  }
}

function setFidelityUI(value, source) {
  const normalized = normalizeFidelityValue(value);
  if (!Number.isFinite(normalized)) {
    return;
  }
  const clamped = clamp(normalized, FIDELITY_MIN, FIDELITY_MAX);

  let finalFidelity = clamped;

  if (source === "backend" && !devEnabled) {
    const sensitivity = Number(sensitivityInput?.value || 0.5);
    // Sensitivity scales how quickly fidelity responds to rate
    // High sensitivity: small rate changes → big fidelity changes
    // Low sensitivity: fidelity changes more gradually
    const scale = 0.5 + sensitivity * 1.0; // 0.5x to 1.5x
    const adjustedFidelity = clamp(clamped * scale, 0, 1);
    finalFidelity = adjustedFidelity;
  }

  targetFidelity = finalFidelity;
  fidelity = finalFidelity;
  renderer.setFidelity(fidelity);

  if (source !== "slider") {
    setFidelitySliderValue(denormalizeFidelityValue(finalFidelity));
  }
  updateFidelityReadouts();
  if (source === "backend") {
    hasAppliedBackendFidelity = true;
  } else if (source === "slider" || source === "local") {
    hasAppliedUserFidelity = true;
  }
}

function updatePromptDisplay({ updatePromptOut = true } = {}) {
  if (promptBlock) {
    promptBlock.value = `PROMPT:\n${promptBuilder.getPrompt()}\n\nNEGATIVE:\n${promptBuilder.getNegative()}`;
  }
  if (promptOutput) {
    promptOutput.textContent = promptBuilder.getPrompt();
  }
  if (negativeOutput) {
    negativeOutput.textContent = promptBuilder.getNegative();
  }
  if (promptTimestamp) {
    promptTimestamp.textContent = new Date().toLocaleTimeString();
  }
  if (promptOut && updatePromptOut) {
    promptOut.value = promptBuilder.getPrompt();
  }
}

function setImageStatus(message) {
  if (!imageStatus) {
    return;
  }
  imageStatus.textContent = message || "—";
}

function copyPrompt() {
  const manualValue = manualPrompt?.value.trim() || "";
  const promptText = manualValue.length ? manualValue : promptBuilder.getPrompt();
  const combined = `PROMPT:\n${promptText}\n\nNEGATIVE:\n${promptBuilder.getNegative()}`;
  navigator.clipboard.writeText(combined).catch(() => {
    // Clipboard may be blocked; ignore.
  });
}

function renderClusterDebug(k) {
  if (currentK) currentK.textContent = String(k);
  if (clusterSizesEl) {
    const clusters = promptBuilder.getClusters();
    clusterSizesEl.textContent = clusters.map((cluster) => cluster.size).join(", ");
  }
  if (tokenCountEl) tokenCountEl.textContent = String(promptBuilder.reservoir.size);
  if (clusterDetails) {
    const clusters = promptBuilder.getClusters();
    clusterDetails.innerHTML = "";
    clusters.forEach((cluster, idx) => {
      const item = document.createElement("div");
      item.className = "cluster-item";
      item.textContent = `Cluster ${idx + 1}: ${cluster.terms.join(", ")}`;
      clusterDetails.appendChild(item);
    });
  }
}

function buildClusters() {
  const k = Number.parseInt(kInput?.value || 1, 10);
  promptBuilder.buildClusters(k);
  renderClusterDebug(k);
  renderer.bumpSeed();
}

function generatePrompt() {
  promptBuilder.generatePrompt();
  updatePromptDisplay();
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
    renderer.drawTargetToCanvas(image);
    if (targetPreview) {
      targetPreview.src = targetImageUrl;
    }
  };
  image.src = targetImageUrl;
}

function clearTargetImage() {
  renderer.clearTargetCanvas();
  if (targetPreview) {
    targetPreview.src = "";
  }
  if (targetImageUrl) {
    URL.revokeObjectURL(targetImageUrl);
    targetImageUrl = null;
  }
  if (targetImageInput) {
    targetImageInput.value = "";
  }
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
    promptBuilder.addMessage(sample);
  }
  buildClusters();
}

async function sendWords() {
  const words = userWordsInput ? userWordsInput.value.trim() : "";

  if (!words) {
    setImageStatus("Enter a few words to build a prompt.");
    return;
  }

  if (sendWordsBtn) {
    sendWordsBtn.disabled = true;
  }
  const localPrompt = promptBuilder.buildPromptFromWords(words);
  if (localPrompt) {
    promptBuilder.setPrompt(localPrompt);
    updatePromptDisplay();
    setImageStatus("Updating prompt…");
  } else {
    setImageStatus("Sending words…");
  }

  try {
    const state = await api.sendWords(words);
    // Apply state through callbacks
    api.applyStateToUI(state, {
      onImageUpdate: (imageUrl) => {
        if (imageUrl) {
          const image = new Image();
          image.onload = () => {
            renderer.drawTargetToCanvas(image);
          };
          image.src = imageUrl;
        }
        if (generatedImage) {
          generatedImage.src = imageUrl || "";
        }
      },
      onPromptUpdate: (prompt) => {
        promptBuilder.setPrompt(prompt);
        updatePromptDisplay();
      },
      onFidelityUpdate: (fidelityValue) => {
        setFidelityUI(fidelityValue, "backend");
      },
      onSizeUpdate: (size) => {
        if (imageSizeSelect && document.activeElement !== imageSizeSelect) {
          imageSizeSelect.value = size;
        }
      }
    });
    setImageStatus("Prompt updated.");
  } catch (error) {
    setImageStatus(error?.message || "Failed to aggregate words.");
  } finally {
    if (sendWordsBtn) {
      sendWordsBtn.disabled = false;
    }
  }
}

async function generateImage() {
  const promptText = promptOut?.value.trim() || promptBuilder.getPrompt();
  const size = imageSizeSelect ? imageSizeSelect.value : DEFAULT_IMAGE_SIZE;

  if (!promptText) {
    setImageStatus("Add or generate a prompt first.");
    return;
  }

  if (generateImageBtn) {
    generateImageBtn.disabled = true;
  }
  setImageStatus("Generating image…");

  try {
    const state = await api.generateImage(size);
    api.applyStateToUI(state, {
      onImageUpdate: (imageUrl) => {
        if (imageUrl) {
          const image = new Image();
          image.onload = () => {
            renderer.drawTargetToCanvas(image);
          };
          image.src = imageUrl;
        }
        if (generatedImage) {
          generatedImage.src = imageUrl || "";
        }
      },
      onPromptUpdate: (prompt) => {
        promptBuilder.setPrompt(prompt);
        updatePromptDisplay();
      },
      onFidelityUpdate: (fidelityValue) => {
        setFidelityUI(fidelityValue, "backend");
      }
    });
    setImageStatus("Image ready.");
  } catch (error) {
    setImageStatus(error?.message || "Image generation failed.");
  } finally {
    if (generateImageBtn) {
      generateImageBtn.disabled = false;
    }
  }
}

// Initialize the app
function initApp() {
  // Set up render data callbacks
  renderer.startRenderLoop((renderData) => {
    if (motionReadout) motionReadout.textContent = renderData.motion;
    if (regimeReadout) regimeReadout.textContent = renderData.regime;
    if (entropyReadout) entropyReadout.textContent = renderData.entropy;
    if (coherenceReadout) coherenceReadout.textContent = renderData.coherence;
    if (flowReadout) flowReadout.textContent = renderData.flow;
    if (rateReadout) rateReadout.textContent = String(renderer.frameCounter);
  });

  // Set up image callbacks
  const callbacks = {
    onImageUpdate: (imageUrl) => {
      if (imageUrl) {
        const image = new Image();
        image.onload = () => {
          renderer.drawTargetToCanvas(image);
        };
        image.src = imageUrl;
      }
      if (generatedImage) {
        generatedImage.src = imageUrl || "";
      }
    },
    onPromptUpdate: (prompt) => {
      promptBuilder.setPrompt(prompt);
      updatePromptDisplay();
    },
    onFidelityUpdate: (fidelityValue) => {
      setFidelityUI(fidelityValue, "backend");
    },
    onSizeUpdate: (size) => {
      if (imageSizeSelect && document.activeElement !== imageSizeSelect) {
        imageSizeSelect.value = size;
      }
    }
  };

  // Start state polling
  api.startStatePolling(callbacks);

  // Set up initial fidelity
  api.scheduleInitialFidelityLoad((state) => {
    if (state.fidelity !== null) {
      setFidelityUI(state.fidelity, "backend");
    }
  });

  // Load default image if no backend state
  if (!api.hasState()) {
    const defaultImage = new Image();
    defaultImage.onload = () => {
      renderer.drawTargetToCanvas(defaultImage);
      if (targetPreview) {
        targetPreview.src = "default.png";
      }
    };
    defaultImage.src = "default.png";

    promptBuilder.setPrompt(DEFAULT_OVERRIDE_PROMPT);
    generatePrompt();
  }

  // Initialize clusters
  buildClusters();
  if (negativeOutput) {
    negativeOutput.textContent = NEGATIVE_PROMPT;
  }
}

function setupEventListeners() {
  if (submitText) {
    submitText.addEventListener("click", () => {
      const text = inputText?.value.trim();
      if (!text) return;
      promptBuilder.addMessage(text);
      if (inputText) inputText.value = "";
      buildClusters();
    });
  }

  if (simulateBurst) {
    simulateBurst.addEventListener("click", simulateBurstMessages);
  }

  if (generatePromptBtn) {
    generatePromptBtn.addEventListener("click", generatePrompt);
  }

  if (copyPromptBtn) {
    copyPromptBtn.addEventListener("click", copyPrompt);
  }

  if (kInput) {
    kInput.addEventListener("change", buildClusters);
  }

  if (targetImageInput) {
    targetImageInput.addEventListener("change", (event) => {
      handleTargetImage(event.target.files[0]);
    });
  }

  if (clearTargetImageBtn) {
    clearTargetImageBtn.addEventListener("click", clearTargetImage);
  }

  if (generateImageBtn) {
    generateImageBtn.addEventListener("click", generateImage);
  }

  if (sendWordsBtn) {
    sendWordsBtn.addEventListener("click", sendWords);
  }

  if (fidelitySlider) {
    fidelitySlider.addEventListener("input", (event) => {
      if (isProgrammaticFidelityUpdate) return;
      const value = normalizeFidelityValue(event.target.value);
      if (Number.isFinite(value)) {
        fidelity = value;
        targetFidelity = value;
        renderer.setFidelity(fidelity);
        updateFidelityReadouts();
        hasAppliedUserFidelity = true;
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupEventListeners();
  });
} else {
  initApp();
  setupEventListeners();
}

// Export for potential external use
window.imgGenApp = {
  renderer,
  api,
  promptBuilder,
  sendWords,
  generateImage,
  generatePrompt,
  simulateBurstMessages
};
