const IMAGE_BASE = "../../Photos/Biomes/";

const BIOMES = [
  { name: "Alluv_Forest_p0001_img001", image: `${IMAGE_BASE}Alluv_Forest_p0001_img001.png` },
  { name: "Alluv_Forest_p0006_img001", image: `${IMAGE_BASE}Alluv_Forest_p0006_img001.png` },
  { name: "Alluvial_Forest_Final_2010_p0001_img001", image: `${IMAGE_BASE}Alluvial_Forest_Final_2010_p0001_img001.png` },
  { name: "Alluvial_Forest_Final_2010_p0006_img001", image: `${IMAGE_BASE}Alluvial_Forest_Final_2010_p0006_img001.png` },
  { name: "Basin_Marsh_Final_2010_p0001_img001", image: `${IMAGE_BASE}Basin_Marsh_Final_2010_p0001_img001.png` },
  { name: "Basin_Swamp_Final_2010_p0001_img001", image: `${IMAGE_BASE}Basin_Swamp_Final_2010_p0001_img001.png` },
  { name: "Baygall_Final_2010_p0001_img001", image: `${IMAGE_BASE}Baygall_Final_2010_p0001_img001.png` },
  { name: "Beach_Dune_Final_2010_p0001_img001", image: `${IMAGE_BASE}Beach_Dune_Final_2010_p0001_img001.png` },
  { name: "Bottomland_Forest_Final_2010_p0001_img001", image: `${IMAGE_BASE}Bottomland_Forest_Final_2010_p0001_img001.png` },
  { name: "Bottomland_Forest_Final_2010_p0006_img001", image: `${IMAGE_BASE}Bottomland_Forest_Final_2010_p0006_img001.png` },
  { name: "Coast_Grass_p0001_img001", image: `${IMAGE_BASE}Coast_Grass_p0001_img001.png` },
  { name: "Coast_Strand_p0001_img001", image: `${IMAGE_BASE}Coast_Strand_p0001_img001.png` },
  { name: "Coast_Strand_p0006_img001", image: `${IMAGE_BASE}Coast_Strand_p0006_img001.png` },
  { name: "Coastal_Berm_Final_2010_p0001_img001", image: `${IMAGE_BASE}Coastal_Berm_Final_2010_p0001_img001.png` },
  { name: "Coastal_Grassland_Final_2010_p0001_img001", image: `${IMAGE_BASE}Coastal_Grassland_Final_2010_p0001_img001.png` },
  { name: "Coastal_Interdunal_Swale_Final_2010_p0001_img001", image: `${IMAGE_BASE}Coastal_Interdunal_Swale_Final_2010_p0001_img001.png` },
  { name: "Coastal_Strand_Final_2010_p0001_img001", image: `${IMAGE_BASE}Coastal_Strand_Final_2010_p0001_img001.png` },
  { name: "Coastal_Strand_Final_2010_p0006_img001", image: `${IMAGE_BASE}Coastal_Strand_Final_2010_p0006_img001.png` },
  { name: "Depression_Marsh_Final_2010_p0001_img001", image: `${IMAGE_BASE}Depression_Marsh_Final_2010_p0001_img001.png` },
  { name: "Depression_Marsh_Final_2010_p0006_img001", image: `${IMAGE_BASE}Depression_Marsh_Final_2010_p0006_img001.png` },
  { name: "Depression_Marsh_Final_2010_p0007_img001", image: `${IMAGE_BASE}Depression_Marsh_Final_2010_p0007_img001.png` },
  { name: "Dome_Swamp_Final_2010_p0001_img001", image: `${IMAGE_BASE}Dome_Swamp_Final_2010_p0001_img001.png` },
  { name: "Dome_Swamp_Final_2010_p0009_img001", image: `${IMAGE_BASE}Dome_Swamp_Final_2010_p0009_img001.png` },
  { name: "Dry_Prairie_Final_2010_p0001_img001", image: `${IMAGE_BASE}Dry_Prairie_Final_2010_p0001_img001.png` },
  { name: "Dry_Prairie_Final_2010_p0006_img001", image: `${IMAGE_BASE}Dry_Prairie_Final_2010_p0006_img001.png` },
  { name: "Floodplain_Marsh_Final_2010_p0001_img001", image: `${IMAGE_BASE}Floodplain_Marsh_Final_2010_p0001_img001.png` },
  { name: "Floodplain_Swamp_Final_2010_p0001_img001", image: `${IMAGE_BASE}Floodplain_Swamp_Final_2010_p0001_img001.png` },
  { name: "Floodplain_Swamp_Final_2010_p0007_img001", image: `${IMAGE_BASE}Floodplain_Swamp_Final_2010_p0007_img001.png` },
  { name: "Floodplain_Swamp_Final_2010_p0008_img001", image: `${IMAGE_BASE}Floodplain_Swamp_Final_2010_p0008_img001.png` },
  { name: "Glades_Marsh_Final_2010_p0001_img001", image: `${IMAGE_BASE}Glades_Marsh_Final_2010_p0001_img001.png` },
  { name: "Hydric_Hammock_Final_2010_p0001_img001", image: `${IMAGE_BASE}Hydric_Hammock_Final_2010_p0001_img001.png` },
  { name: "Keys_Cactus_Barren_Final_2010_p0001_img001", image: `${IMAGE_BASE}Keys_Cactus_Barren_Final_2010_p0001_img001.png` },
  { name: "Keys_Cactus_Barren_Final_2010_p0003_img001", image: `${IMAGE_BASE}Keys_Cactus_Barren_Final_2010_p0003_img001.png` },
  { name: "Keys_Tidal_Rock_Barren_Final_2010_p0001_img001", image: `${IMAGE_BASE}Keys_Tidal_Rock_Barren_Final_2010_p0001_img001.png` },
  { name: "Limestone_Outcrop_Final_2010_p0001_img001", image: `${IMAGE_BASE}Limestone_Outcrop_Final_2010_p0001_img001.png` },
  { name: "Limestone_Outcrop_Final_2010_p0004_img001", image: `${IMAGE_BASE}Limestone_Outcrop_Final_2010_p0004_img001.png` },
  { name: "Mangrove_Swamp_Final_2010_p0001_img001", image: `${IMAGE_BASE}Mangrove_Swamp_Final_2010_p0001_img001.png` },
  { name: "Maritime_Hammock_Final_2010_p0001_img001", image: `${IMAGE_BASE}Maritime_Hammock_Final_2010_p0001_img001.png` },
  { name: "Marl_Prairie_Final_2010_p0001_img001", image: `${IMAGE_BASE}Marl_Prairie_Final_2010_p0001_img001.png` },
  { name: "Mesic_Flatwoods_Final_2010_p0001_img001", image: `${IMAGE_BASE}Mesic_Flatwoods_Final_2010_p0001_img001.png` },
  { name: "Mesic_Hammock_Final_2010_p0001_img001", image: `${IMAGE_BASE}Mesic_Hammock_Final_2010_p0001_img001.png` },
  { name: "Pine_Rockland_Final_2010_p0001_img001", image: `${IMAGE_BASE}Pine_Rockland_Final_2010_p0001_img001.png` },
  { name: "Pine_Rockland_Final_2010_p0008_img001", image: `${IMAGE_BASE}Pine_Rockland_Final_2010_p0008_img001.png` },
  { name: "Rockland_Hammock_Final_2010_p0001_img001", image: `${IMAGE_BASE}Rockland_Hammock_Final_2010_p0001_img001.png` },
  { name: "Rockland_Hammock_Final_2010_p0008_img001", image: `${IMAGE_BASE}Rockland_Hammock_Final_2010_p0008_img001.png` },
  { name: "Salt_Marsh_Final_2010_p0001_img001", image: `${IMAGE_BASE}Salt_Marsh_Final_2010_p0001_img001.png` },
  { name: "Salt_Marsh_Final_2010_p0008_img001", image: `${IMAGE_BASE}Salt_Marsh_Final_2010_p0008_img001.png` },
  { name: "Sandhill_Final_2010_p0001_img001", image: `${IMAGE_BASE}Sandhill_Final_2010_p0001_img001.png` },
  { name: "Sandhill_Final_2010_p0008_img001", image: `${IMAGE_BASE}Sandhill_Final_2010_p0008_img001.png` },
  { name: "Scrub_Final_2010_p0001_img001", image: `${IMAGE_BASE}Scrub_Final_2010_p0001_img001.png` },
  { name: "Scrubby_Flatwoods_Final_2010_p0001_img001", image: `${IMAGE_BASE}Scrubby_Flatwoods_Final_2010_p0001_img001.png` },
  { name: "Seepage_Slope_Final_2010_p0001_img001", image: `${IMAGE_BASE}Seepage_Slope_Final_2010_p0001_img001.png` },
  { name: "Shell_Mound_Final_2010_p0001_img001", image: `${IMAGE_BASE}Shell_Mound_Final_2010_p0001_img001.png` },
  { name: "Shell_Mound_Final_2010_p0005_img001", image: `${IMAGE_BASE}Shell_Mound_Final_2010_p0005_img001.png` },
  { name: "Shrub_Bog_Final_2010_p0001_img001", image: `${IMAGE_BASE}Shrub_Bog_Final_2010_p0001_img001.png` },
  { name: "Sinkhole_Final_2010_p0001_img001", image: `${IMAGE_BASE}Sinkhole_Final_2010_p0001_img001.png` },
  { name: "Sinkhole_Final_2010_p0005_img001", image: `${IMAGE_BASE}Sinkhole_Final_2010_p0005_img001.png` },
  { name: "Slope_Forest_Final_2010_p0001_img001", image: `${IMAGE_BASE}Slope_Forest_Final_2010_p0001_img001.png` },
  { name: "Slough_Final_2010_p0001_img001", image: `${IMAGE_BASE}Slough_Final_2010_p0001_img001.png` },
  { name: "Slough_Marsh_Final_2010_p0001_img001", image: `${IMAGE_BASE}Slough_Marsh_Final_2010_p0001_img001.png` },
  { name: "Strand_Swamp_Final_2010_p0001_img001", image: `${IMAGE_BASE}Strand_Swamp_Final_2010_p0001_img001.png` },
  { name: "Upland_Glade_Final_2010_p0001_img001", image: `${IMAGE_BASE}Upland_Glade_Final_2010_p0001_img001.png` },
  { name: "Upland_Hardwood_Forest_Final_2010_p0001_img001", image: `${IMAGE_BASE}Upland_Hardwood_Forest_Final_2010_p0001_img001.png` },
  { name: "Upland_Mixed_Woodland_Final_2010_p0001_img001", image: `${IMAGE_BASE}Upland_Mixed_Woodland_Final_2010_p0001_img001.png` },
  { name: "Upland_Pine_Final_2010_p0001_img001", image: `${IMAGE_BASE}Upland_Pine_Final_2010_p0001_img001.png` },
  { name: "Upland_Pine_Final_2010_p0008_img001", image: `${IMAGE_BASE}Upland_Pine_Final_2010_p0008_img001.png` },
  { name: "Wet_Flatwoods_Final_2010_p0001_img001", image: `${IMAGE_BASE}Wet_Flatwoods_Final_2010_p0001_img001.png` },
  { name: "Wet_Flatwoods_Final_2010_p0007_img001", image: `${IMAGE_BASE}Wet_Flatwoods_Final_2010_p0007_img001.png` },
  { name: "Wet_Flatwoods_Final_2010_p0008_img001", image: `${IMAGE_BASE}Wet_Flatwoods_Final_2010_p0008_img001.png` },
  { name: "Wet_Flatwoods_Final_2010_p0009_img001", image: `${IMAGE_BASE}Wet_Flatwoods_Final_2010_p0009_img001.png` },
  { name: "Wet_Prairie_Final_2010_p0001_img001", image: `${IMAGE_BASE}Wet_Prairie_Final_2010_p0001_img001.png` },
  { name: "Wet_Prairie_Final_2010_p0008_img001", image: `${IMAGE_BASE}Wet_Prairie_Final_2010_p0008_img001.png` },
  { name: "Xeric_Hammock_Final_2010_p0001_img001", image: `${IMAGE_BASE}Xeric_Hammock_Final_2010_p0001_img001.png` }
];

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
