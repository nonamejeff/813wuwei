// Ratios follow Eaton RT-18 literature, with speed scaling anchored to 65 MPH at 1630 RPM in 8H.
const FORWARD_GEARS = [
  { display: "1", truckLabel: "LO-L", ratio: 14.4, range: "low", split: "low", slot: "low", holeLabel: "LO hole" },
  { display: "2", truckLabel: "LO-H", ratio: 12.29, range: "low", split: "high", slot: "low", holeLabel: "LO hole" },
  { display: "3", truckLabel: "1-L", ratio: 8.56, range: "low", split: "low", slot: "one", holeLabel: "1 / 5 hole" },
  { display: "4", truckLabel: "1-H", ratio: 7.3, range: "low", split: "high", slot: "one", holeLabel: "1 / 5 hole" },
  { display: "5", truckLabel: "2-L", ratio: 6.05, range: "low", split: "low", slot: "two", holeLabel: "2 / 6 hole" },
  { display: "6", truckLabel: "2-H", ratio: 5.16, range: "low", split: "high", slot: "two", holeLabel: "2 / 6 hole" },
  { display: "7", truckLabel: "3-L", ratio: 4.38, range: "low", split: "low", slot: "three", holeLabel: "3 / 7 hole" },
  { display: "8", truckLabel: "3-H", ratio: 3.74, range: "low", split: "high", slot: "three", holeLabel: "3 / 7 hole" },
  { display: "9", truckLabel: "4-L", ratio: 3.2, range: "low", split: "low", slot: "four", holeLabel: "4 / 8 hole" },
  { display: "10", truckLabel: "4-H", ratio: 2.73, range: "low", split: "high", slot: "four", holeLabel: "4 / 8 hole" },
  { display: "11", truckLabel: "5-L", ratio: 2.29, range: "high", split: "low", slot: "one", holeLabel: "1 / 5 hole" },
  { display: "12", truckLabel: "5-H", ratio: 1.95, range: "high", split: "high", slot: "one", holeLabel: "1 / 5 hole" },
  { display: "13", truckLabel: "6-L", ratio: 1.62, range: "high", split: "low", slot: "two", holeLabel: "2 / 6 hole" },
  { display: "14", truckLabel: "6-H", ratio: 1.38, range: "high", split: "high", slot: "two", holeLabel: "2 / 6 hole" },
  { display: "15", truckLabel: "7-L", ratio: 1.17, range: "high", split: "low", slot: "three", holeLabel: "3 / 7 hole" },
  { display: "16", truckLabel: "7-H", ratio: 1.0, range: "high", split: "high", slot: "three", holeLabel: "3 / 7 hole" },
  { display: "17", truckLabel: "8-L", ratio: 0.86, range: "high", split: "low", slot: "four", holeLabel: "4 / 8 hole" },
  { display: "18", truckLabel: "8-H", ratio: 0.73, range: "high", split: "high", slot: "four", holeLabel: "4 / 8 hole" },
];

const REVERSE_GEARS = [
  { display: "R1", truckLabel: "Low Rev L", ratio: 15.06, range: "low", split: "low", slot: "reverse" },
  { display: "R2", truckLabel: "Low Rev H", ratio: 12.85, range: "low", split: "high", slot: "reverse" },
  { display: "R3", truckLabel: "Hi Rev L", ratio: 4.03, range: "high", split: "low", slot: "reverse" },
  { display: "R4", truckLabel: "Hi Rev H", ratio: 3.43, range: "high", split: "high", slot: "reverse" },
];

const SLOT_LABELS = {
  neutral: "Neutral",
  reverse: "Reverse hole",
  low: "LO hole",
  one: "1 / 5 hole",
  two: "2 / 6 hole",
  three: "3 / 7 hole",
  four: "4 / 8 hole",
};

const IDLE_RPM = 650;
const TOP_GEAR_RATIO = 0.73;
const CRUISE_SPEED_MPH = 65;
const CRUISE_RPM = 1630;
const SPEED_RATIO_FACTOR = (CRUISE_SPEED_MPH * TOP_GEAR_RATIO) / CRUISE_RPM;

const state = {
  speed: 0,
  range: "low",
  split: "low",
  slot: "neutral",
};

const elements = {
  gearDisplay: document.getElementById("gear-display"),
  gearMeaning: document.getElementById("gear-meaning"),
  speedReadout: document.getElementById("speed-readout"),
  speedPanelReadout: document.getElementById("speed-panel-readout"),
  rpmReadout: document.getElementById("rpm-readout"),
  slotReadout: document.getElementById("slot-readout"),
  rangeReadout: document.getElementById("range-readout"),
  splitReadout: document.getElementById("split-readout"),
  ratioReadout: document.getElementById("ratio-readout"),
  shiftMessage: document.getElementById("shift-message"),
  prevGearReadout: document.getElementById("prev-gear-readout"),
  prevRpmReadout: document.getElementById("prev-rpm-readout"),
  nextGearReadout: document.getElementById("next-gear-readout"),
  nextRpmReadout: document.getElementById("next-rpm-readout"),
  speedSlider: document.getElementById("speed-slider"),
  resetButton: document.getElementById("reset-button"),
  neutralButton: document.getElementById("neutral-button"),
  gearMap: document.getElementById("gear-map"),
  selectorButtons: Array.from(document.querySelectorAll(".selector-button")),
  stickButtons: Array.from(document.querySelectorAll(".stick-button")),
  speedStepButtons: Array.from(document.querySelectorAll("[data-speed-step]")),
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

function rpmAtSpeed(ratio) {
  if (state.speed <= 0.1) {
    return IDLE_RPM;
  }

  return Math.max(IDLE_RPM, (state.speed * ratio) / SPEED_RATIO_FACTOR);
}

function getSelection() {
  if (state.slot === "neutral") {
    return {
      kind: "neutral",
      display: "N",
      truckLabel: "Neutral",
    };
  }

  if (state.slot === "low" && state.range === "high") {
    return {
      kind: "invalid",
      display: "--",
      truckLabel: "LO is low range only",
    };
  }

  if (state.slot === "reverse") {
    const reverseGear = REVERSE_GEARS.find(
      (gear) => gear.range === state.range && gear.split === state.split
    );

    return {
      kind: "reverse",
      ...reverseGear,
    };
  }

  const forwardGear = FORWARD_GEARS.find(
    (gear) =>
      gear.slot === state.slot &&
      gear.range === state.range &&
      gear.split === state.split
  );

  if (!forwardGear) {
    return {
      kind: "invalid",
      display: "--",
      truckLabel: "No gear selected",
    };
  }

  return {
    kind: "forward",
    ...forwardGear,
  };
}

function buildMessage(selection, rpm) {
  if (selection.kind === "neutral") {
    return "Neutral selected. Pick a hole and set the range and splitter to see where the RPM lands.";
  }

  if (selection.kind === "invalid") {
    return "The LO hole is only used in low range on an Eaton 18-speed. Flip the range selector back down to use it.";
  }

  if (selection.kind === "reverse") {
    if (state.speed > 8) {
      return "Reverse is selected at a road speed that would be far too high in real life. Bring the truck nearly to a stop before backing.";
    }

    return "Reverse uses the range and splitter too. Keep road speed low and use it only for backing maneuvers.";
  }

  if (state.speed <= 0.5) {
    return "From a stop, the clutch determines the launch. Use the lower holes first, then watch the split and range changes as the truck starts rolling.";
  }

  if (rpm < 900) {
    return "This is below the comfortable pull zone. Drop a split or a full gear before the engine lugs down.";
  }

  if (rpm < 1400) {
    return "Low in the band. Good torque, but a hill or heavy load could call for a downshift soon.";
  }

  if (rpm <= 1800) {
    return "This is the working band. Hold it here or set up the next split while the truck is pulling cleanly.";
  }

  if (rpm <= 2100) {
    return "High in the band. This is a good time to split up or make the next full upshift.";
  }

  return "The engine is wound out for a normal pull. Upshift now to bring the RPM back into the working band.";
}

function setPreview(gearElement, rpmElement, gear) {
  if (!gear) {
    gearElement.textContent = "--";
    rpmElement.textContent = "--";
    return;
  }

  const landedRpm = rpmAtSpeed(gear.ratio);
  gearElement.textContent = `${gear.display} (${gear.truckLabel})`;
  rpmElement.textContent = `${formatRpm(landedRpm)} RPM`;
}

function updatePreviews(selection) {
  if (selection.kind !== "forward") {
    setPreview(elements.prevGearReadout, elements.prevRpmReadout, null);
    setPreview(elements.nextGearReadout, elements.nextRpmReadout, null);
    return;
  }

  const currentIndex = FORWARD_GEARS.findIndex((gear) => gear.display === selection.display);
  const previousGear = FORWARD_GEARS[currentIndex - 1];
  const nextGear = FORWARD_GEARS[currentIndex + 1];

  setPreview(elements.prevGearReadout, elements.prevRpmReadout, previousGear);
  setPreview(elements.nextGearReadout, elements.nextRpmReadout, nextGear);
}

function updateActiveControls() {
  elements.selectorButtons.forEach((button) => {
    const control = button.dataset.control;
    const value = button.dataset.value;
    button.classList.toggle("is-active", state[control] === value);
  });

  elements.stickButtons.forEach((button) => {
    button.classList.toggle("is-active", state.slot === button.dataset.slot);
  });
}

function renderGearMap(activeDisplay) {
  elements.gearMap.innerHTML = FORWARD_GEARS.map((gear) => {
    const isActive = gear.display === activeDisplay ? " is-active" : "";
    return `
      <article class="gear-card${isActive}">
        <span class="gear-number">${gear.display}</span>
        <span class="gear-truck-label">${gear.truckLabel}</span>
        <span class="gear-ratio">${gear.ratio.toFixed(2)} : 1</span>
        <span class="gear-slot">${gear.holeLabel} / ${titleCase(gear.range)} range / ${titleCase(gear.split)} split</span>
      </article>
    `;
  }).join("");
}

function updateDashboard() {
  const selection = getSelection();
  const rpm = selection.ratio ? rpmAtSpeed(selection.ratio) : IDLE_RPM;

  elements.gearDisplay.textContent = selection.display;
  elements.gearMeaning.textContent = selection.truckLabel;
  elements.speedReadout.textContent = formatSpeed(state.speed);
  elements.speedPanelReadout.textContent = formatSpeed(state.speed);
  elements.rpmReadout.textContent = formatRpm(rpm);
  elements.slotReadout.textContent = SLOT_LABELS[state.slot];
  elements.rangeReadout.textContent = titleCase(state.range);
  elements.splitReadout.textContent = titleCase(state.split);
  elements.ratioReadout.textContent = selection.ratio
    ? `${selection.ratio.toFixed(2)} : 1`
    : "--";
  elements.shiftMessage.textContent = buildMessage(selection, rpm);

  updatePreviews(selection);
  updateActiveControls();
  renderGearMap(selection.kind === "forward" ? selection.display : "");
}

elements.speedSlider.addEventListener("input", (event) => {
  state.speed = Number(event.target.value);
  updateDashboard();
});

elements.speedStepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.speed = clamp(Number((state.speed + Number(button.dataset.speedStep)).toFixed(1)), 0, 75);
    elements.speedSlider.value = String(state.speed);
    updateDashboard();
  });
});

elements.selectorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const control = button.dataset.control;
    state[control] = button.dataset.value;
    updateDashboard();
  });
});

elements.stickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.slot = button.dataset.slot;
    updateDashboard();
  });
});

elements.neutralButton.addEventListener("click", () => {
  state.slot = "neutral";
  updateDashboard();
});

elements.resetButton.addEventListener("click", () => {
  state.speed = 0;
  state.range = "low";
  state.split = "low";
  state.slot = "neutral";
  elements.speedSlider.value = "0";
  updateDashboard();
});

updateDashboard();
