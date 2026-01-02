const IMAGE_BASE = "../../bird/";
const AUDIO_BASE = "../../audio/";

const BIRDS = [
  // Update this list whenever you add new bird image/audio files to the bird or audio folders.
  { name: "American Bittern", image: `${IMAGE_BASE}american-bittern.webp`, mp3: `${AUDIO_BASE}American-Bittern.mp3`, web4: `${AUDIO_BASE}American-Bittern.web4` },
  { name: "American Coot", image: `${IMAGE_BASE}american-coot.webp`, mp3: `${AUDIO_BASE}American-Coot.mp3`, web4: `${AUDIO_BASE}American-Coot.web4` },
  { name: "American Flamingo", image: `${IMAGE_BASE}american-flamingo.webp`, mp3: `${AUDIO_BASE}American-Flamingo.mp3`, web4: `${AUDIO_BASE}American-Flamingo.web4` },
  { name: "American Woodcock", image: `${IMAGE_BASE}american-woodcock.webp`, mp3: `${AUDIO_BASE}American-Woodcock.mp3`, web4: `${AUDIO_BASE}American-Woodcock.web4` },
  { name: "Anhinga", image: `${IMAGE_BASE}anhinga.webp`, mp3: `${AUDIO_BASE}Anhinga.mp3`, web4: `${AUDIO_BASE}Anhinga.web4` },
  { name: "Bald Eagle", image: `${IMAGE_BASE}bald-eagle.webp`, mp3: `${AUDIO_BASE}Bald-Eagle.mp3`, web4: `${AUDIO_BASE}Bald-Eagle.web4` },
  { name: "Belted Kingfisher", image: `${IMAGE_BASE}belted-kingfisher.webp`, mp3: `${AUDIO_BASE}Belted-Kingfisher.mp3`, web4: `${AUDIO_BASE}Belted-Kingfisher.web4` },
  { name: "Black Crowned Night Heron", image: `${IMAGE_BASE}black-crowned-night-heron.webp`, mp3: `${AUDIO_BASE}Black-crowned-Night-Heron.mp3`, web4: `${AUDIO_BASE}Black-crowned-Night-Heron.web4` },
  { name: "Black Necked Stilt", image: `${IMAGE_BASE}black-necked-stilt.webp`, mp3: `${AUDIO_BASE}Black-necked-Stilt.mp3`, web4: `${AUDIO_BASE}Black-necked-Stilt.web4` },
  { name: "Boat Tailed Grackle", image: `${IMAGE_BASE}boat-tailed-grackle.webp`, mp3: `${AUDIO_BASE}Boat-tailed-Grackle.mp3`, web4: `${AUDIO_BASE}Boat-tailed-Grackle.web4` },
  { name: "Cattle Egret", image: `${IMAGE_BASE}cattle-egret.webp`, mp3: `${AUDIO_BASE}Cattle-Egret.mp3`, web4: `${AUDIO_BASE}Cattle-Egret.web4` },
  { name: "Common Gallinule", image: `${IMAGE_BASE}common-gallinule.webp`, mp3: `${AUDIO_BASE}Common-Gallinule.mp3`, web4: `${AUDIO_BASE}Common-Gallinule.web4` },
  { name: "Double Crested Cormorant", image: `${IMAGE_BASE}double-crested-cormorant.webp`, mp3: `${AUDIO_BASE}Double-crested-Cormorant.mp3`, web4: `${AUDIO_BASE}Double-crested-Cormorant.web4` },
  { name: "Glossy Ibis", image: `${IMAGE_BASE}glossy-ibis.webp`, mp3: `${AUDIO_BASE}Glossy-Ibis.mp3`, web4: `${AUDIO_BASE}Glossy-Ibis.web4` },
  { name: "Great Blue Heron", image: `${IMAGE_BASE}great-blue-heron.webp`, mp3: `${AUDIO_BASE}Great-Blue-Heron.mp3`, web4: `${AUDIO_BASE}Great-Blue-Heron.web4` },
  { name: "Great Egret", image: `${IMAGE_BASE}great-egret.webp`, mp3: `${AUDIO_BASE}Great-Egret.mp3`, web4: `${AUDIO_BASE}Great-Egret.web4` },
  { name: "Green Heron", image: `${IMAGE_BASE}green-heron.webp`, mp3: `${AUDIO_BASE}Green-Heron.mp3`, web4: `${AUDIO_BASE}Green-Heron.web4` },
  { name: "Killdeer", image: `${IMAGE_BASE}killdeer.webp`, mp3: `${AUDIO_BASE}Killdeer.mp3`, web4: `${AUDIO_BASE}Killdeer.web4` },
  { name: "King Rail", image: `${IMAGE_BASE}king-rail.webp`, mp3: `${AUDIO_BASE}King-Rail.mp3`, web4: `${AUDIO_BASE}King-Rail.web4` },
  { name: "Least Bittern", image: `${IMAGE_BASE}least-bittern.webp`, mp3: `${AUDIO_BASE}Least-Bittern.mp3`, web4: `${AUDIO_BASE}Least-Bittern.web4` },
  { name: "Limpkin", image: `${IMAGE_BASE}limpkin.webp`, mp3: `${AUDIO_BASE}Limpkin.mp3`, web4: `${AUDIO_BASE}Limpkin.web4` },
  { name: "Pied Billed Grebe", image: `${IMAGE_BASE}pied-billed-grebe.webp`, mp3: `${AUDIO_BASE}Pied-billed-Grebe.mp3`, web4: `${AUDIO_BASE}Pied-billed-Grebe.web4` },
  { name: "Purple Gallinule", image: `${IMAGE_BASE}purple-gallinule.webp`, mp3: `${AUDIO_BASE}Purple-Gallinule.mp3`, web4: `${AUDIO_BASE}Purple-Gallinule.web4` },
  { name: "Red Shouldered Hawk", image: `${IMAGE_BASE}red-shouldered-hawk.webp`, mp3: `${AUDIO_BASE}Red-shouldered-Hawk.mp3`, web4: `${AUDIO_BASE}Red-shouldered-Hawk.web4` },
  { name: "Red Winged Blackbird", image: `${IMAGE_BASE}red-winged-blackbird.webp`, mp3: `${AUDIO_BASE}Red-winged-Blackbird.mp3`, web4: `${AUDIO_BASE}Red-winged-Blackbird.web4` },
  { name: "Reddish Egret", image: `${IMAGE_BASE}reddish-egret.webp`, mp3: `${AUDIO_BASE}Reddish-Egret.mp3`, web4: `${AUDIO_BASE}Reddish-Egret.web4` },
  { name: "Sandhill Crane", image: `${IMAGE_BASE}sandhill-crane.webp`, mp3: `${AUDIO_BASE}Sandhill-Crane.mp3`, web4: `${AUDIO_BASE}Sandhill-Crane.web4` },
  { name: "Snail Kite", image: `${IMAGE_BASE}snail-kite.webp`, mp3: `${AUDIO_BASE}Snail-Kite.mp3`, web4: `${AUDIO_BASE}Snail-Kite.web4` },
  { name: "Snowy Egret", image: `${IMAGE_BASE}snowy-egret.webp`, mp3: `${AUDIO_BASE}Snowy-Egret.mp3`, web4: `${AUDIO_BASE}Snowy-Egret.web4` },
  { name: "Sora", image: `${IMAGE_BASE}sora.webp`, mp3: `${AUDIO_BASE}Sora.mp3`, web4: `${AUDIO_BASE}Sora.web4` },
  { name: "Tricolored Heron", image: `${IMAGE_BASE}tricolored-heron.webp`, mp3: `${AUDIO_BASE}Tricolored-Heron.mp3`, web4: `${AUDIO_BASE}Tricolored-Heron.web4` },
  { name: "Western Osprey", image: `${IMAGE_BASE}western-osprey.webp`, mp3: `${AUDIO_BASE}Western-Osprey.mp3`, web4: `${AUDIO_BASE}Western-Osprey.web4` },
  { name: "White Ibis", image: `${IMAGE_BASE}white-ibis.webp`, mp3: `${AUDIO_BASE}White-Ibis.mp3`, web4: `${AUDIO_BASE}White-Ibis.web4` },
  { name: "Wilsons Snipe", image: `${IMAGE_BASE}wilsons-snipe.jpg`, mp3: `${AUDIO_BASE}Wilsons-Snipe.mp3`, web4: `${AUDIO_BASE}Wilsons-Snipe.web4` },
  { name: "Wood Stork", image: `${IMAGE_BASE}wood-stork.webp`, mp3: `${AUDIO_BASE}Wood-Stork.mp3`, web4: `${AUDIO_BASE}Wood-Stork.web4` },
  { name: "Yellow Rail", image: `${IMAGE_BASE}yellow-rail.webp`, mp3: `${AUDIO_BASE}Yellow-Rail.mp3`, web4: `${AUDIO_BASE}Yellow-Rail.web4` },
  { name: "Yellow Crowned Night Heron", image: `${IMAGE_BASE}yellow-crowned-night-heron.webp`, mp3: `${AUDIO_BASE}Yellow-crowned-Night-Heron.mp3`, web4: `${AUDIO_BASE}Yellow-crowned-Night-Heron.web4` },
  { name: "American Avocet", image: `${IMAGE_BASE}american-avocet.webp`, mp3: `${AUDIO_BASE}american-avocet.mp3`, web4: `${AUDIO_BASE}american-avocet.web4` },
  { name: "Black Rail", image: `${IMAGE_BASE}black-rail.webp`, mp3: `${AUDIO_BASE}black-rail.mp3`, web4: `${AUDIO_BASE}black-rail.web4` },
  { name: "Clapper Rail", image: `${IMAGE_BASE}clapper-rail.webp`, mp3: `${AUDIO_BASE}clapper-rail.mp3`, web4: `${AUDIO_BASE}clapper-rail.web4` },
  { name: "Forsters Tern", image: `${IMAGE_BASE}forsters-tern.webp`, mp3: `${AUDIO_BASE}forsters-tern.mp3`, web4: `${AUDIO_BASE}forsters-tern.web4` },
  { name: "White Faced Ibis", image: `${IMAGE_BASE}white-faced-ibis.webp`, mp3: `${AUDIO_BASE}white-faced-ibis.mp3`, web4: `${AUDIO_BASE}white-faced-ibis.web4` },
  { name: "Whooping Crane", image: `${IMAGE_BASE}whooping-crane.webp`, mp3: `${AUDIO_BASE}whooping-crane.mp3`, web4: `${AUDIO_BASE}whooping-crane.web4` }
];

const startButton = document.getElementById("start-button");
const nextButton = document.getElementById("next-button");
const birdImage = document.getElementById("bird-image");
const nameChoicesEl = document.getElementById("name-choices");
const soundChoicesEl = document.getElementById("sound-choices");
const stepSound = document.getElementById("step-sound");
const feedback = document.getElementById("feedback");
const nameFeedbackEl = document.getElementById("name-feedback");
const soundFeedbackEl = document.getElementById("sound-feedback");
const nameStepTitle = document.getElementById("name-step-title");
const nameStep = document.getElementById("step-name");
const nextWrap = document.querySelector(".next-wrap");
const audio = new Audio();
const audioAvailability = new Map();

let nameChoices = [];
let soundChoices = [];
let correctBird = null;
let selectedName = null;
let selectedSound = null;
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

const checkAudioSource = async (source) => {
  if (!source) {
    return "missing";
  }
  try {
    const response = await fetch(source, { method: "HEAD" });
    return response.ok ? "available" : "missing";
  } catch (error) {
    return "unknown";
  }
};

const ensureAudioAvailability = async (bird) => {
  if (audioAvailability.has(bird.name)) {
    return audioAvailability.get(bird.name);
  }
  const web4Status = await checkAudioSource(bird.web4);
  if (web4Status === "available") {
    const result = { available: true, source: bird.web4 };
    audioAvailability.set(bird.name, result);
    return result;
  }
  const mp3Status = await checkAudioSource(bird.mp3);
  if (mp3Status === "available") {
    const result = { available: true, source: bird.mp3 };
    audioAvailability.set(bird.name, result);
    return result;
  }
  const isUnknown = web4Status === "unknown" || mp3Status === "unknown";
  const fallbackSource = bird.mp3 || bird.web4 || "";
  const result = isUnknown
    ? { available: Boolean(fallbackSource), source: fallbackSource }
    : { available: false, source: "" };
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
    if (inputLocked && !roundEvaluated) {
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
};

const evaluateRound = () => {
  if (!selectedName || !selectedSound || !correctBird) {
    return;
  }

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
    setNameFeedback(`Step 1: Correct — ${correctBird.name}`);
  } else {
    setNameFeedback(`Step 1: Wrong — correct name: ${correctBird.name}`);
  }
  updateNameButtons();
  stepSound.classList.remove("is-hidden");
};

const previewSound = (index) => {
  if (!gameActive || (!roundEvaluated && (inputLocked || step2Locked)) || !selectedName) {
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
    setSoundFeedback("Step 2: Correct. Correct sound was: Sound " + (correctSoundIndex + 1));
  } else {
    setSoundFeedback("Step 2: Wrong. Correct sound was: Sound " + (correctSoundIndex + 1));
  }
  updateSoundButtons();
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

window.addEventListener("keydown", (event) => {
  if (!gameActive || inputLocked) {
    return;
  }
  const index = Number.parseInt(event.key, 10) - 1;
  if (!Number.isInteger(index) || index < 0 || index > 3) {
    return;
  }

  if (!selectedName) {
    selectName(index);
  } else if (!roundEvaluated) {
    selectSound(index);
  }
});

nameStepTitle.textContent = "Step 1: Select the bird name.";
