const FORWARD_GEARS = [
  { display: "1", truckLabel: "LO-L", ratio: 14.4, range: "low", split: "low", slot: "low" },
  { display: "2", truckLabel: "LO-H", ratio: 12.29, range: "low", split: "high", slot: "low" },
  { display: "3", truckLabel: "1-L", ratio: 8.56, range: "low", split: "low", slot: "one" },
  { display: "4", truckLabel: "1-H", ratio: 7.3, range: "low", split: "high", slot: "one" },
  { display: "5", truckLabel: "2-L", ratio: 6.05, range: "low", split: "low", slot: "two" },
  { display: "6", truckLabel: "2-H", ratio: 5.16, range: "low", split: "high", slot: "two" },
  { display: "7", truckLabel: "3-L", ratio: 4.38, range: "low", split: "low", slot: "three" },
  { display: "8", truckLabel: "3-H", ratio: 3.74, range: "low", split: "high", slot: "three" },
  { display: "9", truckLabel: "4-L", ratio: 3.2, range: "low", split: "low", slot: "four" },
  { display: "10", truckLabel: "4-H", ratio: 2.73, range: "low", split: "high", slot: "four" },
  { display: "11", truckLabel: "5-L", ratio: 2.29, range: "high", split: "low", slot: "one" },
  { display: "12", truckLabel: "5-H", ratio: 1.95, range: "high", split: "high", slot: "one" },
  { display: "13", truckLabel: "6-L", ratio: 1.62, range: "high", split: "low", slot: "two" },
  { display: "14", truckLabel: "6-H", ratio: 1.38, range: "high", split: "high", slot: "two" },
  { display: "15", truckLabel: "7-L", ratio: 1.17, range: "high", split: "low", slot: "three" },
  { display: "16", truckLabel: "7-H", ratio: 1.0, range: "high", split: "high", slot: "three" },
  { display: "17", truckLabel: "8-L", ratio: 0.86, range: "high", split: "low", slot: "four" },
  { display: "18", truckLabel: "8-H", ratio: 0.73, range: "high", split: "high", slot: "four" },
];

const REVERSE_GEARS = [
  { display: "R1", truckLabel: "Low Rev L", ratio: 15.06, range: "low", split: "low", slot: "reverse" },
  { display: "R2", truckLabel: "Low Rev H", ratio: 12.85, range: "low", split: "high", slot: "reverse" },
  { display: "R3", truckLabel: "Hi Rev L", ratio: 4.03, range: "high", split: "low", slot: "reverse" },
  { display: "R4", truckLabel: "Hi Rev H", ratio: 3.43, range: "high", split: "high", slot: "reverse" },
];

const IDLE_RPM = 650;
const TOP_GEAR_RATIO = 0.73;
const CRUISE_SPEED_MPH = 65;
const CRUISE_RPM = 1630;
const SPEED_RATIO_FACTOR = (CRUISE_SPEED_MPH * TOP_GEAR_RATIO) / CRUISE_RPM;
const MIN_NEEDLE_ANGLE = -120;
const MAX_NEEDLE_ANGLE = 120;

const state = {
  speed: 0,
  range: "low",
  activeRange: "low",
  split: "low",
  slot: "neutral",
};

const elements = {
  speedReadout: document.getElementById("speed-readout"),
  rpmReadout: document.getElementById("rpm-readout"),
  gearDisplay: document.getElementById("gear-display"),
  gearLabel: document.getElementById("gear-label"),
  rangeStatus: document.getElementById("range-status"),
  splitStatus: document.getElementById("split-status"),
  boxStatus: document.getElementById("box-status"),
  speedNeedle: document.getElementById("speed-needle"),
  rpmNeedle: document.getElementById("rpm-needle"),
  speedSlider: document.getElementById("speed-slider"),
  rangeToggle: document.getElementById("range-toggle"),
  splitToggle: document.getElementById("split-toggle"),
  neutralButton: document.getElementById("neutral-button"),
  toggleButtons: Array.from(document.querySelectorAll("[data-control]")),
  stickButtons: Array.from(document.querySelectorAll(".stick-button")),
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatSpeed(value) {
  return value.toFixed(1);
}

function formatRpm(value) {
  return Math.round(value).toLocaleString();
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function angleFor(value, min, max) {
  const progress = clamp((value - min) / (max - min), 0, 1);
  return MIN_NEEDLE_ANGLE + progress * (MAX_NEEDLE_ANGLE - MIN_NEEDLE_ANGLE);
}

function rpmAtSpeed(ratio) {
  if (state.speed <= 0.1) {
    return IDLE_RPM;
  }

  return Math.max(IDLE_RPM, (state.speed * ratio) / SPEED_RATIO_FACTOR);
}

function getSelection() {
  if (state.slot === "neutral") {
    return {
      display: "N",
      truckLabel: "Neutral",
      ratio: null,
      kind: "neutral",
    };
  }

  if (state.slot === "low" && state.activeRange === "high") {
    return {
      display: "--",
      truckLabel: "LO blocked",
      ratio: null,
      kind: "invalid",
    };
  }

  if (state.slot === "reverse") {
    const reverseGear = REVERSE_GEARS.find(
      (gear) => gear.range === state.activeRange && gear.split === state.split
    );

    return {
      kind: "reverse",
      ...reverseGear,
    };
  }

  const forwardGear = FORWARD_GEARS.find(
    (gear) =>
      gear.slot === state.slot &&
      gear.range === state.activeRange &&
      gear.split === state.split
  );

  if (!forwardGear) {
    return {
      display: "--",
      truckLabel: "No gear",
      ratio: null,
      kind: "invalid",
    };
  }

  return {
    kind: "forward",
    ...forwardGear,
  };
}

function setNeedle(element, value, min, max) {
  const angle = angleFor(value, min, max);
  element.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
}

function updateToggleState() {
  elements.rangeToggle.dataset.active = state.range;
  elements.splitToggle.dataset.active = state.split;

  elements.toggleButtons.forEach((button) => {
    const control = button.dataset.control;
    const isActive = state[control] === button.dataset.value;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateStickState() {
  elements.stickButtons.forEach((button) => {
    const isActive = state.slot === button.dataset.slot;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function render() {
  const selection = getSelection();
  const rpm = selection.ratio ? rpmAtSpeed(selection.ratio) : IDLE_RPM;

  elements.speedReadout.textContent = formatSpeed(state.speed);
  elements.rpmReadout.textContent = formatRpm(rpm);
  elements.gearDisplay.textContent = selection.display;
  elements.gearLabel.textContent = selection.truckLabel;
  elements.rangeStatus.textContent = `Range ${titleCase(state.range)}`;
  elements.splitStatus.textContent = `Split ${titleCase(state.split)}`;
  elements.boxStatus.textContent =
    state.activeRange === state.range
      ? `Box ${titleCase(state.activeRange)}`
      : `Box ${titleCase(state.activeRange)} / ${titleCase(state.range)} Set`;

  setNeedle(elements.speedNeedle, state.speed, 0, 75);
  setNeedle(elements.rpmNeedle, rpm, 600, 2400);

  updateToggleState();
  updateStickState();
}

elements.speedSlider.addEventListener("input", (event) => {
  state.speed = Number(event.target.value);
  render();
});

elements.toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const control = button.dataset.control;
    state[control] = button.dataset.value;

    if (control === "range" && state.slot === "neutral") {
      state.activeRange = state.range;
    }

    render();
  });
});

elements.stickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextSlot = button.dataset.slot;

    if (state.slot !== "neutral" && state.slot !== nextSlot) {
      state.activeRange = state.range;
    }

    state.slot = nextSlot;
    render();
  });
});

elements.neutralButton.addEventListener("click", () => {
  if (state.slot !== "neutral") {
    state.activeRange = state.range;
  }

  state.slot = "neutral";
  render();
});

render();
