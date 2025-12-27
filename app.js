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
  total: "birdGame_total"
};

const startButton = document.getElementById("start-button");
const resetButton = document.getElementById("reset-button");
const birdImage = document.getElementById("bird-image");
const choices = document.getElementById("choices");
const feedback = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const totalEl = document.getElementById("total");
const audio = document.getElementById("bird-audio");

let currentOptions = [];
let currentAnswer = null;
let correctCount = 0;
let totalCount = 0;
let gameActive = false;
let inputLocked = false;

const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const loadProgress = () => {
  correctCount = Number.parseInt(localStorage.getItem(STORAGE_KEYS.correct), 10) || 0;
  totalCount = Number.parseInt(localStorage.getItem(STORAGE_KEYS.total), 10) || 0;
  updateScore();
};

const saveProgress = () => {
  localStorage.setItem(STORAGE_KEYS.correct, correctCount);
  localStorage.setItem(STORAGE_KEYS.total, totalCount);
};

const updateScore = () => {
  scoreEl.textContent = correctCount;
  totalEl.textContent = totalCount;
};

const setFeedback = (message) => {
  feedback.textContent = message;
};

const playAudio = (bird) => {
  audio.pause();
  audio.currentTime = 0;
  audio.innerHTML = "";

  const web4Source = document.createElement("source");
  web4Source.src = bird.web4;

  const mp3Source = document.createElement("source");
  mp3Source.src = bird.mp3;
  mp3Source.type = "audio/mpeg";

  audio.appendChild(web4Source);
  audio.appendChild(mp3Source);
  audio.load();

  audio.play().catch(() => {
    setFeedback("Audio not supported.");
  });
};

const renderChoices = () => {
  choices.innerHTML = "";
  currentOptions.forEach((bird, index) => {
    const row = document.createElement("div");
    row.className = "choice";
    row.setAttribute("role", "listitem");

    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.className = "choice-play";
    playButton.textContent = "Play";
    playButton.addEventListener("click", (event) => {
      event.stopPropagation();
      playAudio(bird);
    });

    const label = document.createElement("span");
    label.className = "choice-label";
    label.textContent = `${index + 1}. ${bird.name}`;

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "choice-select";
    selectButton.textContent = "Select";
    selectButton.addEventListener("click", (event) => {
      event.stopPropagation();
      handleSelection(index);
    });

    row.appendChild(playButton);
    row.appendChild(label);
    row.appendChild(selectButton);
    row.addEventListener("click", () => handleSelection(index));

    choices.appendChild(row);
  });
};

const startRound = () => {
  if (BIRDS.length < 4) {
    setFeedback("Add at least 4 birds to play.");
    return;
  }

  inputLocked = false;
  setFeedback("");

  const shuffled = shuffle(BIRDS);
  currentAnswer = shuffled[0];
  currentOptions = shuffle([currentAnswer, ...shuffled.slice(1, 4)]);

  birdImage.src = currentAnswer.image;
  birdImage.alt = currentAnswer.name;

  renderChoices();
};

const handleSelection = (index) => {
  if (!gameActive || inputLocked) {
    return;
  }

  const chosen = currentOptions[index];
  if (!chosen) {
    return;
  }

  inputLocked = true;
  totalCount += 1;

  if (chosen.name === currentAnswer.name) {
    correctCount += 1;
    setFeedback("Correct!");
  } else {
    setFeedback(`Not quite. That was ${currentAnswer.name}.`);
  }

  saveProgress();
  updateScore();

  setTimeout(() => {
    if (gameActive) {
      startRound();
    }
  }, 900);
};

startButton.addEventListener("click", () => {
  if (gameActive) {
    return;
  }
  gameActive = true;
  startButton.disabled = true;
  startButton.textContent = "Playing";
  startRound();
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.correct);
  localStorage.removeItem(STORAGE_KEYS.total);
  correctCount = 0;
  totalCount = 0;
  updateScore();
  setFeedback("Progress reset.");
});

window.addEventListener("keydown", (event) => {
  if (!gameActive) {
    return;
  }
  const index = Number.parseInt(event.key, 10) - 1;
  if (Number.isInteger(index) && index >= 0 && index < currentOptions.length) {
    handleSelection(index);
  }
});

loadProgress();
