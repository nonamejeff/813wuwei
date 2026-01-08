const IMAGE_BASE = "../../Photos/Biomes/";

const BIOME_FILES = [
  "Alluvial Forest 2.png",
  "Alluvial Forest.png",
  "Basin Marsh.png",
  "Basin Swamp.png",
  "Baygall Final 2.png",
  "Beach Dune.png",
  "Bottomland Forest 2.png",
  "Bottomland Forest.png",
  "Coast Grass.png",
  "Coast Strand 2.png",
  "Coast Strand.png",
  "Coastal Berm.png",
  "Coastal Grassland.png",
  "Coastal Interdunal.png",
  "Coastal Strand 2.png",
  "Coastal Strand.png",
  "Depression Marsh 2.png",
  "Depression Marsh 3.png",
  "Depression Marsh.png",
  "Dome Swamp 2.png",
  "Dome Swamp.png",
  "Dry Prairie 2.png",
  "Dry Prairie.png",
  "Floodplain Marsh.png",
  "Floodplain Swamp 2.png",
  "Floodplain Swamp 3.png",
  "Floodplain Swamp.png",
  "Glades Marsh.png",
  "Hydric Hammock.png",
  "Keys Cactus Barren 2.png",
  "Keys Cactus Barren.png",
  "Keys Tidal Rock Barren.png",
  "Limestone Outcrop Final 2.png",
  "Limestone Outcrop Final.png",
  "Mangrove Swamp Final.png",
  "Maritime Hammock Final.png",
  "Marl Prairie.png",
  "Mesic Flatwoods.png",
  "Mesic Hammock.png",
  "Pine Rockland 2.png",
  "Pine Rockland.png",
  "Rockland Hammock 2.png",
  "Rockland Hammock.png",
  "Salt Marsh 2.png",
  "Salt Marsh.png",
  "Sandhill Final 2.png",
  "Sandhill Final.png",
  "Scrub Final.png",
  "Scrubby Flatwoods.png",
  "Seepage Slope.png",
  "Shell Mound 2.png",
  "Shell Mound.png",
  "Shrub Bog.png",
  "Sinkhole Final 2.png",
  "Sinkhole Final.png",
  "Slope Forest.png",
  "Slough Final.png",
  "Slough Marsh.png",
  "Strand Swamp.png",
  "Upland Glade.png",
  "Upland Hardwood.png",
  "Upland Mixed Woodland.png",
  "Upland Pine 2.png",
  "Upland Pine.png",
  "Wet Flatwoods 2.png",
  "Wet Flatwoods 3.png",
  "Wet Flatwoods 4.png",
  "Wet Flatwoods.png",
  "Wet Prairie 2.png",
  "Wet Prairie.png",
  "Xeric Hammock.png"
];

const formatBiomeName = (filename) =>
  filename.replace(/\.png$/i, "").replace(/\s+\d+$/, "");

const BIOMES = BIOME_FILES.map((filename) => ({
  name: formatBiomeName(filename),
  image: `${IMAGE_BASE}${filename}`
}));

const startButton = document.getElementById("start-button");
const nextButton = document.getElementById("next-button");
const biomeImage = document.getElementById("biome-image");
const nameChoicesEl = document.getElementById("name-choices");
const feedback = document.getElementById("feedback");
const nameFeedbackEl = document.getElementById("name-feedback");
const nameStepTitle = document.getElementById("name-step-title");
const nameStep = document.getElementById("step-name");
const nextWrap = document.querySelector(".next-wrap");

let nameChoices = [];
let correctBiome = null;
let selectedName = null;
let gameActive = false;
let inputLocked = false;
let roundEvaluated = false;
let nameFeedback = "";
let nameCorrectThisRound = false;
let biomeOrder = [];
let currentBiomeIndex = 0;

const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const setFeedback = (message) => {
  feedback.textContent = message;
};

const setNameFeedback = (message) => {
  nameFeedback = message;
  nameFeedbackEl.textContent = nameFeedback;
};

const updateNameButtons = () => {
  const buttons = Array.from(nameChoicesEl.querySelectorAll("button"));
  buttons.forEach((button, index) => {
    const biome = nameChoices[index];
    const isSelected = selectedName && biome && selectedName.name === biome.name;
    button.classList.toggle("is-selected", Boolean(isSelected));
    if (roundEvaluated) {
      button.disabled = !isSelected;
    }
  });
};

const renderNameChoices = () => {
  nameChoicesEl.innerHTML = "";
  nameChoices.forEach((biome, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = biome.name;
    button.addEventListener("click", () => selectName(index));
    nameChoicesEl.appendChild(button);
  });
  updateNameButtons();
};

const pickDistractors = (biome, count) => {
  const candidates = BIOMES.filter((option) => option.name !== biome.name);
  return shuffle(candidates).slice(0, count);
};

const startRound = () => {
  if (BIOMES.length < 4) {
    setFeedback("Add at least 4 biomes to play.");
    return;
  }

  inputLocked = false;
  roundEvaluated = false;
  selectedName = null;
  nameCorrectThisRound = false;
  setFeedback("");
  setNameFeedback("");
  nextButton.disabled = true;

  if (biomeOrder.length === 0 || currentBiomeIndex >= biomeOrder.length) {
    biomeOrder = shuffle(BIOMES);
    currentBiomeIndex = 0;
  }

  correctBiome = biomeOrder[currentBiomeIndex];
  nameChoices = shuffle([correctBiome, ...pickDistractors(correctBiome, 3)]);

  biomeImage.src = correctBiome.image;
  biomeImage.alt = correctBiome.name;

  renderNameChoices();
};

const evaluateRound = () => {
  if (!selectedName || !correctBiome) {
    return;
  }

  roundEvaluated = true;
  inputLocked = true;
  nextButton.disabled = false;
  setFeedback("");
};

const selectName = (index) => {
  if (!gameActive || inputLocked || roundEvaluated) {
    return;
  }

  const chosen = nameChoices[index];
  if (!chosen) {
    return;
  }

  selectedName = chosen;
  nameCorrectThisRound = selectedName.name === correctBiome.name;
  if (nameCorrectThisRound) {
    setNameFeedback(`Correct — ${correctBiome.name}`);
  } else {
    setNameFeedback(`Wrong — correct name: ${correctBiome.name}`);
  }
  updateNameButtons();
  evaluateRound();
};

startButton.addEventListener("click", () => {
  if (gameActive) {
    return;
  }
  gameActive = true;
  nameStep.classList.remove("is-hidden");
  nextWrap.classList.remove("is-hidden");
  startButton.disabled = true;
  startButton.textContent = "Playing";
  biomeOrder = shuffle(BIOMES);
  currentBiomeIndex = 0;
  startRound();
});

nextButton.addEventListener("click", () => {
  if (!gameActive || !roundEvaluated) {
    return;
  }
  if (currentBiomeIndex + 1 >= biomeOrder.length) {
    biomeOrder = shuffle(BIOMES);
    currentBiomeIndex = 0;
  } else {
    currentBiomeIndex += 1;
  }
  startRound();
});

window.addEventListener("keydown", (event) => {
  if (!gameActive || inputLocked) {
    return;
  }
  const index = Number.parseInt(event.key, 10) - 1;
  if (!Number.isInteger(index) || index < 0 || index > 3) {
    return;
  }

  if (!roundEvaluated) {
    selectName(index);
  }
});

nameStepTitle.textContent = "Step 1: Select the biome name.";
