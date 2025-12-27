const BIRDS = [
  // Update this list whenever you add new bird image/audio files to the root folder.
  { name: "American Bittern", image: "american-bittern.webp", mp3: "American-Bittern.mp3", web4: "American-Bittern.web4" },
  { name: "American Coot", image: "american-coot.webp", mp3: "American-Coot.mp3", web4: "American-Coot.web4" },
  { name: "American Flamingo", image: "american-flamingo.webp", mp3: "American-Flamingo.mp3", web4: "American-Flamingo.web4" },
  { name: "American Woodcock", image: "american-woodcock.webp", mp3: "American-Woodcock.mp3", web4: "American-Woodcock.web4" },
  { name: "Anhinga", image: "anhinga.webp", mp3: "Anhinga.mp3", web4: "Anhinga.web4" },
  { name: "Bald Eagle", image: "bald-eagle.webp", mp3: "Bald-Eagle.mp3", web4: "Bald-Eagle.web4" },
  { name: "Belted Kingfisher", image: "belted-kingfisher.webp", mp3: "Belted-Kingfisher.mp3", web4: "Belted-Kingfisher.web4" },
  { name: "Black Crowned Night Heron", image: "black-crowned-night-heron.webp", mp3: "Black-crowned-Night-Heron.mp3", web4: "Black-crowned-Night-Heron.web4" },
  { name: "Black Necked Stilt", image: "black-necked-stilt.webp", mp3: "Black-necked-Stilt.mp3", web4: "Black-necked-Stilt.web4" },
  { name: "Boat Tailed Grackle", image: "boat-tailed-grackle.webp", mp3: "Boat-tailed-Grackle.mp3", web4: "Boat-tailed-Grackle.web4" },
  { name: "Cattle Egret", image: "cattle-egret.webp", mp3: "Cattle-Egret.mp3", web4: "Cattle-Egret.web4" },
  { name: "Common Gallinule", image: "common-gallinule.webp", mp3: "Common-Gallinule.mp3", web4: "Common-Gallinule.web4" },
  { name: "Double Crested Cormorant", image: "double-crested-cormorant.webp", mp3: "Double-crested-Cormorant.mp3", web4: "Double-crested-Cormorant.web4" },
  { name: "Glossy Ibis", image: "glossy-ibis.webp", mp3: "Glossy-Ibis.mp3", web4: "Glossy-Ibis.web4" },
  { name: "Great Blue Heron", image: "great-blue-heron.webp", mp3: "Great-Blue-Heron.mp3", web4: "Great-Blue-Heron.web4" },
  { name: "Great Egret", image: "great-egret.webp", mp3: "Great-Egret.mp3", web4: "Great-Egret.web4" },
  { name: "Green Heron", image: "green-heron.webp", mp3: "Green-Heron.mp3", web4: "Green-Heron.web4" },
  { name: "Killdeer", image: "killdeer.webp", mp3: "Killdeer.mp3", web4: "Killdeer.web4" },
  { name: "King Rail", image: "king-rail.webp", mp3: "King-Rail.mp3", web4: "King-Rail.web4" },
  { name: "Least Bittern", image: "least-bittern.webp", mp3: "Least-Bittern.mp3", web4: "Least-Bittern.web4" },
  { name: "Limpkin", image: "limpkin.webp", mp3: "Limpkin.mp3", web4: "Limpkin.web4" },
  { name: "Pied Billed Grebe", image: "pied-billed-grebe.webp", mp3: "Pied-billed-Grebe.mp3", web4: "Pied-billed-Grebe.web4" },
  { name: "Purple Gallinule", image: "purple-gallinule.webp", mp3: "Purple-Gallinule.mp3", web4: "Purple-Gallinule.web4" },
  { name: "Red Shouldered Hawk", image: "red-shouldered-hawk.webp", mp3: "Red-shouldered-Hawk.mp3", web4: "Red-shouldered-Hawk.web4" },
  { name: "Red Winged Blackbird", image: "red-winged-blackbird.webp", mp3: "Red-winged-Blackbird.mp3", web4: "Red-winged-Blackbird.web4" },
  { name: "Reddish Egret", image: "reddish-egret.webp", mp3: "Reddish-Egret.mp3", web4: "Reddish-Egret.web4" },
  { name: "Sandhill Crane", image: "sandhill-crane.webp", mp3: "Sandhill-Crane.mp3", web4: "Sandhill-Crane.web4" },
  { name: "Snail Kite", image: "snail-kite.webp", mp3: "Snail-Kite.mp3", web4: "Snail-Kite.web4" },
  { name: "Snowy Egret", image: "snowy-egret.webp", mp3: "Snowy-Egret.mp3", web4: "Snowy-Egret.web4" },
  { name: "Sora", image: "sora.webp", mp3: "Sora.mp3", web4: "Sora.web4" },
  { name: "Tricolored Heron", image: "tricolored-heron.webp", mp3: "Tricolored-Heron.mp3", web4: "Tricolored-Heron.web4" },
  { name: "Western Osprey", image: "western-osprey.webp", mp3: "Western-Osprey.mp3", web4: "Western-Osprey.web4" },
  { name: "White Ibis", image: "white-ibis.webp", mp3: "White-Ibis.mp3", web4: "White-Ibis.web4" },
  { name: "Wilsons Snipe", image: "wilsons-snipe.jpg", mp3: "Wilsons-Snipe.mp3", web4: "Wilsons-Snipe.web4" },
  { name: "Wood Stork", image: "wood-stork.webp", mp3: "Wood-Stork.mp3", web4: "Wood-Stork.web4" },
  { name: "Yellow Rail", image: "yellow-rail.webp", mp3: "Yellow-Rail.mp3", web4: "Yellow-Rail.web4" },
  { name: "Yellow Crowned Night Heron", image: "yellow-crowned-night-heron.webp", mp3: "Yellow-crowned-Night-Heron.mp3", web4: "Yellow-crowned-Night-Heron.web4" },
  { name: "American Avocet", image: "american-avocet.webp", mp3: "american-avocet.mp3", web4: "american-avocet.web4" },
  { name: "Black Rail", image: "black-rail.webp", mp3: "black-rail.mp3", web4: "black-rail.web4" },
  { name: "Clapper Rail", image: "clapper-rail.webp", mp3: "clapper-rail.mp3", web4: "clapper-rail.web4" },
  { name: "Forsters Tern", image: "forsters-tern.webp", mp3: "forsters-tern.mp3", web4: "forsters-tern.web4" },
  { name: "White Faced Ibis", image: "white-faced-ibis.webp", mp3: "white-faced-ibis.mp3", web4: "white-faced-ibis.web4" },
  { name: "Whooping Crane", image: "whooping-crane.webp", mp3: "whooping-crane.mp3", web4: "whooping-crane.web4" }
];

const STORAGE_KEYS = {
  correct: "birdGame_correct",
  total: "birdGame_total",
  points: "birdMatch_points"
};

const startButton = document.getElementById("start-button");
const resetButton = document.getElementById("reset-button");
const nextButton = document.getElementById("next-button");
const birdImage = document.getElementById("bird-image");
const nameChoicesEl = document.getElementById("name-choices");
const soundChoicesEl = document.getElementById("sound-choices");
const stepSound = document.getElementById("step-sound");
const feedback = document.getElementById("feedback");
const nameFeedbackEl = document.getElementById("name-feedback");
const soundFeedbackEl = document.getElementById("sound-feedback");
const pointsEl = document.getElementById("points");
const scoreEl = document.getElementById("score");
const totalEl = document.getElementById("total");
const roundProgress = document.getElementById("round-progress");
const roundLabel = document.getElementById("round-label");
const hardModeToggle = document.getElementById("hard-mode-toggle");
const hardModeInput = document.getElementById("hard-mode-input");
const nameInput = document.getElementById("name-input");
const submitNameButton = document.getElementById("submit-name");
const audio = new Audio();
const audioAvailability = new Map();

let nameChoices = [];
let soundChoices = [];
let correctBird = null;
let selectedName = null;
let selectedSound = null;
let correctCount = 0;
let totalCount = 0;
let points = 0;
let gameActive = false;
let inputLocked = false;
let roundEvaluated = false;
let step1Locked = false;
let step2Locked = false;
let nameFeedback = "";
let soundFeedback = "";
let nameCorrectThisRound = false;
let soundCorrectThisRound = false;
let birdOrder = [];
let currentBirdIndex = 0;
let hardModeEnabled = false;

const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const normalizeGuess = (value) => value.trim().toLowerCase();

const loadProgress = () => {
  correctCount = Number.parseInt(localStorage.getItem(STORAGE_KEYS.correct), 10) || 0;
  totalCount = Number.parseInt(localStorage.getItem(STORAGE_KEYS.total), 10) || 0;
  points = Number.parseInt(localStorage.getItem(STORAGE_KEYS.points), 10) || 0;
  updateScore();
};

const saveProgress = () => {
  localStorage.setItem(STORAGE_KEYS.correct, correctCount);
  localStorage.setItem(STORAGE_KEYS.total, totalCount);
  localStorage.setItem(STORAGE_KEYS.points, points);
};

const updateScore = () => {
  scoreEl.textContent = correctCount;
  totalEl.textContent = totalCount;
  pointsEl.textContent = points;
};

const updateProgress = () => {
  const totalBirds = BIRDS.length;
  roundProgress.max = totalBirds;
  const currentValue = gameActive ? Math.min(currentBirdIndex + 1, totalBirds) : 0;
  roundProgress.value = currentValue;
  roundLabel.textContent = `${currentValue} / ${totalBirds} birds`;
};

const setFeedback = (message) => {
  feedback.textContent = message;
};

const setNameFeedback = (message) => {
  nameFeedback = message;
  nameFeedbackEl.textContent = nameFeedback;
};

const setSoundFeedback = (message) => {
  soundFeedback = message;
  soundFeedbackEl.textContent = soundFeedback;
};

const stopAudio = () => {
  audio.pause();
  try {
    audio.currentTime = 0;
  } catch (error) {
    // Ignore invalid state errors when resetting audio.
  }
  audio.src = "";
  try {
    audio.load();
  } catch (error) {
    // Some browsers may not support load on Audio objects.
  }
};

const updateHardModeUI = () => {
  if (hardModeEnabled) {
    nameChoicesEl.classList.add("is-hidden");
    hardModeInput.classList.remove("is-hidden");
  } else {
    nameChoicesEl.classList.remove("is-hidden");
    hardModeInput.classList.add("is-hidden");
  }
};

const updateHardModeToggleState = () => {
  hardModeToggle.disabled = gameActive;
};

const updateHardModeInputState = () => {
  if (!hardModeEnabled) {
    return;
  }
  const isDisabled = step1Locked || inputLocked || !gameActive;
  nameInput.disabled = isDisabled;
  submitNameButton.disabled = isDisabled;
};

const checkAudioSource = async (source) => {
  if (!source) {
    return false;
  }
  try {
    const response = await fetch(source, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    return false;
  }
};

const ensureAudioAvailability = async (bird) => {
  if (audioAvailability.has(bird.name)) {
    return audioAvailability.get(bird.name);
  }
  const hasWeb4 = await checkAudioSource(bird.web4);
  if (hasWeb4) {
    const result = { available: true, source: bird.web4 };
    audioAvailability.set(bird.name, result);
    return result;
  }
  const hasMp3 = await checkAudioSource(bird.mp3);
  const result = hasMp3 ? { available: true, source: bird.mp3 } : { available: false, source: "" };
  audioAvailability.set(bird.name, result);
  return result;
};

const playAudio = async (bird) => {
  stopAudio();
  const availability = await ensureAudioAvailability(bird);
  if (!availability.available) {
    setFeedback(`No audio available for ${bird.name}.`);
    return false;
  }
  audio.src = availability.source;
  try {
    audio.load();
  } catch (error) {
    // Ignore load errors.
  }
  try {
    await audio.play();
    return true;
  } catch (error) {
    setFeedback("Audio not supported.");
    return false;
  }
};

const updateNameButtons = () => {
  const buttons = Array.from(nameChoicesEl.querySelectorAll("button"));
  buttons.forEach((button, index) => {
    const bird = nameChoices[index];
    const isSelected = selectedName && bird && selectedName.name === bird.name;
    button.classList.toggle("is-selected", Boolean(isSelected));
    if (step1Locked) {
      button.disabled = !isSelected;
    }
  });
};

const updateSoundButtons = () => {
  const selectButtons = Array.from(soundChoicesEl.querySelectorAll(".sound-select"));
  selectButtons.forEach((button, index) => {
    const bird = soundChoices[index];
    const isSelected = selectedSound && bird && selectedSound.name === bird.name;
    button.classList.toggle("is-selected", Boolean(isSelected));
    button.disabled = step2Locked || inputLocked;
  });
  const playButtons = Array.from(soundChoicesEl.querySelectorAll(".sound-play"));
  playButtons.forEach((button) => {
    const available = button.dataset.audioAvailable === "true";
    if (step2Locked || inputLocked) {
      button.disabled = true;
      return;
    }
    button.disabled = !available;
  });
};

const renderNameChoices = () => {
  nameChoicesEl.innerHTML = "";
  nameChoices.forEach((bird, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = bird.name;
    button.addEventListener("click", () => selectName(index));
    nameChoicesEl.appendChild(button);
  });
  updateNameButtons();
};

const renderSoundChoices = () => {
  soundChoicesEl.innerHTML = "";
  soundChoices.forEach((bird, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "sound-choice";

    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.className = "play-button sound-play";
    playButton.textContent = "Loading audio...";
    playButton.disabled = true;
    playButton.dataset.audioAvailable = "unknown";
    playButton.addEventListener("click", () => previewSound(index));

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "choice-button sound-select";
    selectButton.textContent = `Select Sound ${index + 1}`;
    selectButton.addEventListener("click", () => selectSound(index));

    wrapper.appendChild(playButton);
    wrapper.appendChild(selectButton);
    soundChoicesEl.appendChild(wrapper);

    ensureAudioAvailability(bird).then((availability) => {
      if (!playButton.isConnected) {
        return;
      }
      if (availability.available) {
        playButton.textContent = "Play";
        playButton.disabled = false;
        playButton.dataset.audioAvailable = "true";
      } else {
        playButton.textContent = "No audio";
        playButton.disabled = true;
        playButton.dataset.audioAvailable = "false";
      }
    });
  });
  updateSoundButtons();
};

const pickDistractors = (bird, count) => {
  const candidates = BIRDS.filter((option) => option.name !== bird.name);
  return shuffle(candidates).slice(0, count);
};

const startRound = () => {
  if (BIRDS.length < 4) {
    setFeedback("Add at least 4 birds to play.");
    return;
  }

  stopAudio();
  inputLocked = false;
  roundEvaluated = false;
  selectedName = null;
  selectedSound = null;
  nameCorrectThisRound = false;
  soundCorrectThisRound = false;
  step1Locked = false;
  step2Locked = false;
  setFeedback("");
  setNameFeedback("");
  setSoundFeedback("");
  nextButton.disabled = true;

  if (birdOrder.length === 0 || currentBirdIndex >= birdOrder.length) {
    birdOrder = shuffle(BIRDS);
    currentBirdIndex = 0;
  }

  correctBird = birdOrder[currentBirdIndex];
  nameChoices = shuffle([correctBird, ...pickDistractors(correctBird, 3)]);
  soundChoices = shuffle([correctBird, ...pickDistractors(correctBird, 3)]);

  birdImage.src = correctBird.image;
  birdImage.alt = correctBird.name;

  renderNameChoices();
  renderSoundChoices();
  stepSound.classList.add("is-hidden");
  nameInput.value = "";
  updateHardModeInputState();
  updateProgress();
};

const evaluateRound = () => {
  if (!selectedName || !selectedSound || !correctBird) {
    return;
  }

  totalCount += 1;
  if (nameCorrectThisRound && soundCorrectThisRound) {
    correctCount += 1;
  }

  saveProgress();
  updateScore();
  roundEvaluated = true;
  inputLocked = true;
  updateSoundButtons();
  nextButton.disabled = false;

  setFeedback("");
};

const selectName = (index) => {
  if (!gameActive || inputLocked || step1Locked) {
    return;
  }

  const chosen = nameChoices[index];
  if (!chosen) {
    return;
  }

  stopAudio();
  selectedName = chosen;
  step1Locked = true;
  nameCorrectThisRound = selectedName.name === correctBird.name;
  if (nameCorrectThisRound) {
    points += 1;
    setNameFeedback(`Step 1: Correct — ${correctBird.name}`);
  } else {
    setNameFeedback(`Step 1: Wrong — correct name: ${correctBird.name}`);
  }
  saveProgress();
  updateScore();
  updateNameButtons();
  stepSound.classList.remove("is-hidden");
};

const submitTypedName = () => {
  if (!gameActive || inputLocked || step1Locked) {
    return;
  }
  const guess = nameInput.value;
  if (!guess.trim()) {
    setNameFeedback("Step 1: Please type a bird name.");
    return;
  }
  stopAudio();
  selectedName = { name: guess.trim() };
  step1Locked = true;
  nameCorrectThisRound = normalizeGuess(guess) === normalizeGuess(correctBird.name);
  if (nameCorrectThisRound) {
    points += 1;
    setNameFeedback(`Step 1: Correct — ${correctBird.name}`);
  } else {
    setNameFeedback(`Step 1: Wrong — correct name: ${correctBird.name}`);
  }
  saveProgress();
  updateScore();
  updateHardModeInputState();
  stepSound.classList.remove("is-hidden");
};

const previewSound = (index) => {
  if (!gameActive || inputLocked || step2Locked || !selectedName) {
    return;
  }

  const chosen = soundChoices[index];
  if (!chosen) {
    return;
  }

  playAudio(chosen).catch(() => {
    setFeedback("Audio not supported.");
  });
};

const selectSound = (index) => {
  if (!gameActive || inputLocked || !selectedName || step2Locked) {
    return;
  }

  const chosen = soundChoices[index];
  if (!chosen) {
    return;
  }

  stopAudio();
  selectedSound = chosen;
  step2Locked = true;
  const correctSoundIndex = soundChoices.findIndex((bird) => bird.name === correctBird.name);
  const isCorrectSound = index === correctSoundIndex;
  soundCorrectThisRound = isCorrectSound;
  if (isCorrectSound) {
    points += 2;
    setSoundFeedback("Step 2: Correct. Correct sound was: Sound " + (correctSoundIndex + 1));
  } else {
    setSoundFeedback("Step 2: Wrong. Correct sound was: Sound " + (correctSoundIndex + 1));
  }
  saveProgress();
  updateScore();
  updateSoundButtons();
  evaluateRound();
};

startButton.addEventListener("click", () => {
  if (gameActive) {
    return;
  }
  gameActive = true;
  startButton.disabled = true;
  startButton.textContent = "Playing";
  updateHardModeToggleState();
  birdOrder = shuffle(BIRDS);
  currentBirdIndex = 0;
  startRound();
});

nextButton.addEventListener("click", () => {
  if (!gameActive || !roundEvaluated) {
    return;
  }
  stopAudio();
  if (currentBirdIndex + 1 >= birdOrder.length) {
    birdOrder = shuffle(BIRDS);
    currentBirdIndex = 0;
  } else {
    currentBirdIndex += 1;
  }
  startRound();
});

resetButton.addEventListener("click", () => {
  stopAudio();
  localStorage.removeItem(STORAGE_KEYS.correct);
  localStorage.removeItem(STORAGE_KEYS.total);
  localStorage.removeItem(STORAGE_KEYS.points);
  correctCount = 0;
  totalCount = 0;
  points = 0;
  updateScore();
  setNameFeedback("");
  setSoundFeedback("");
  setFeedback("Progress reset.");
  updateProgress();
});

hardModeToggle.addEventListener("change", (event) => {
  if (gameActive) {
    event.target.checked = hardModeEnabled;
    return;
  }
  hardModeEnabled = event.target.checked;
  updateHardModeUI();
  updateHardModeInputState();
});

submitNameButton.addEventListener("click", submitTypedName);

nameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitTypedName();
  }
});

window.addEventListener("keydown", (event) => {
  if (!gameActive || inputLocked) {
    return;
  }
  const index = Number.parseInt(event.key, 10) - 1;
  if (!Number.isInteger(index) || index < 0 || index > 3) {
    return;
  }

  if (!selectedName) {
    if (hardModeEnabled) {
      return;
    }
    selectName(index);
  } else if (!roundEvaluated) {
    selectSound(index);
  }
});

loadProgress();
updateHardModeUI();
updateHardModeToggleState();
updateProgress();
