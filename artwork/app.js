// Artwork page app - simplified version using shared modules

import { WebGLRenderer } from "../shared/renderer.js";
import { APIManager, DEFAULT_IMAGE_SIZE } from "../shared/api.js";
import { PromptBuilder, DEFAULT_OVERRIDE_PROMPT, NEGATIVE_PROMPT } from "../shared/prompt.js";

// Initialize shared modules
const renderer = new WebGLRenderer("field");
const api = new APIManager();
const promptBuilder = new PromptBuilder();

// UI Elements (may be null in shared context)
const canvas = document.getElementById("field");
const promptOutput = document.getElementById("promptOutput");
const negativeOutput = document.getElementById("negativeOutput");
const promptTimestamp = document.getElementById("promptTimestamp");
const imageStatus = document.getElementById("imageStatus");
const generatedImage = document.getElementById("generatedImage");

// State variables
let currentPrompt = "";
let currentNegative = NEGATIVE_PROMPT;
let fidelity = 0;
let targetFidelity = 0;

// Initialize the artwork page
function initArtworkPage() {
  if (!canvas) {
    console.error("Canvas element not found");
    return;
  }

  // Set up image callbacks
  const callbacks = {
    onImageUpdate: (imageUrl) => {
      if (generatedImage) {
        if (imageUrl) {
          generatedImage.src = imageUrl;
          // Also load image into renderer
          const image = new Image();
          image.onload = () => {
            renderer.drawTargetToCanvas(image);
          };
          image.src = imageUrl;
        } else {
          generatedImage.removeAttribute("src");
        }
      }
      if (imageStatus) {
        imageStatus.textContent = imageUrl ? "Image synced." : "—";
      }
    },
    onPromptUpdate: (prompt) => {
      currentPrompt = prompt;
      updatePromptDisplay();
    },
    onFidelityUpdate: (newFidelity) => {
      fidelity = newFidelity;
      targetFidelity = newFidelity;
      renderer.setFidelity(fidelity);
    },
    onSizeUpdate: (size) => {
      // Handle size updates if needed
    }
  };

  // Start state polling
  api.startStatePolling(callbacks);

  // Start render loop with readouts
  renderer.startRenderLoop((renderData) => {
    // Could update UI with render data if needed
  });

  // Set up initial fidelity
  api.scheduleInitialFidelityLoad((state) => {
    if (state.fidelity !== null) {
      fidelity = state.fidelity;
      targetFidelity = state.fidelity;
      renderer.setFidelity(fidelity);
    }
  });

  // Load default image if no backend state
  if (!api.hasState()) {
    const defaultImage = new Image();
    defaultImage.onload = () => {
      renderer.drawTargetToCanvas(defaultImage);
    };
    defaultImage.src = "default.png";

    // Set default prompt
    currentPrompt = DEFAULT_OVERRIDE_PROMPT;
    currentNegative = NEGATIVE_PROMPT;
    updatePromptDisplay();
  }

  renderer.setFidelity(fidelity);
}

function updatePromptDisplay() {
  if (promptOutput) {
    promptOutput.textContent = currentPrompt;
  }
  if (negativeOutput) {
    negativeOutput.textContent = currentNegative;
  }
  if (promptTimestamp) {
    promptTimestamp.textContent = new Date().toLocaleTimeString();
  }
}

// Helper function to simulate some activity for demonstration
function simulateActivity() {
  // Add some sample messages
  const samples = [
    "glow over wet pavement and slow currents",
    "salt haze and late traffic around the bay",
    "humid midnight drift with rusted rails",
    "storm residue settling into asphalt"
  ];

  samples.forEach((sample) => promptBuilder.addMessage(sample));
  promptBuilder.buildClusters(3);
  const newPrompt = promptBuilder.generatePrompt();
  currentPrompt = newPrompt;
  updatePromptDisplay();
  renderer.bumpSeed();
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initArtworkPage();
    setupEventListeners();
  });
} else {
  initArtworkPage();
  setupEventListeners();
}

function setupEventListeners() {
  const simulateBtn = document.getElementById("simulateBtn");
  if (simulateBtn) {
    simulateBtn.addEventListener("click", simulateActivity);
  }

  const generatedImageContainer = document.querySelector(".generated-image-container");
  const generatedImage = document.getElementById("generatedImage");

  if (generatedImage) {
    generatedImage.addEventListener("load", () => {
      if (generatedImageContainer && generatedImage.src) {
        generatedImageContainer.style.display = "block";
      }
    });

    generatedImage.addEventListener("error", () => {
      if (generatedImageContainer) {
        generatedImageContainer.style.display = "none";
      }
    });
  }
}

// Export for potential external use
window.artworkApp = {
  simulateActivity,
  renderer,
  api,
  promptBuilder
};
