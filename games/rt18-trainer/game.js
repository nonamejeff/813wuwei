// Gear ratios follow Eaton RT-18 literature. Speed scaling is anchored to 65 MPH at 1630 RPM in 8H.
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

const DEFAULT_STATE = {
  speed: 0,
  range: "low",
  activeRange: "low",
  split: "low",
  slot: "neutral",
};

const IDLE_RPM = 650;
const TOP_GEAR_RATIO = 0.73;
const CRUISE_SPEED_MPH = 65;
const CRUISE_RPM = 1630;
const SPEED_RATIO_FACTOR = (CRUISE_SPEED_MPH * TOP_GEAR_RATIO) / CRUISE_RPM;

const LESSONS = [
  {
    id: "controls",
    title: "Learn the controls",
    summary: "Meet the range switch, splitter, and stick without worrying about the whole box.",
    steps: [
      {
        title: "Find neutral",
        instruction: "Press Neutral so the stick is centered and the truck is out of gear.",
        why: "Neutral is your reset point whenever you feel lost.",
        expect: { slot: "neutral" },
        focus: ["neutral"],
      },
      {
        title: "Set low range",
        instruction: "Flip the white range switch down to Low.",
        why: "Low range is the bottom half of the transmission.",
        expect: { slot: "neutral", range: "low" },
        focus: ["range"],
      },
      {
        title: "Touch the LO hole",
        instruction: "Tap the LO hole on the knob.",
        why: "That hole gives you the lowest starting gears.",
        expect: { slot: "low", range: "low" },
        focus: ["stick:low"],
      },
      {
        title: "Split without moving the stick",
        instruction: "Keep the stick in the LO hole and flip the splitter to High.",
        why: "The splitter changes gear inside the same stick hole.",
        expect: { slot: "low", range: "low", split: "high", display: "2" },
        focus: ["split", "stick:low"],
      },
      {
        title: "See the top half",
        instruction: "Go back to Neutral, then flip the range switch up to High.",
        why: "High range reuses the same H pattern for the upper gears.",
        expect: { slot: "neutral", range: "high" },
        focus: ["neutral", "range"],
      },
    ],
  },
  {
    id: "launch",
    title: "Start rolling",
    summary: "Practice the first few moves from a stop and watch how the splitter works.",
    steps: [
      {
        title: "Set up gear 1",
        instruction: "Put the truck in gear 1: LO hole, Low range, Low split.",
        why: "This is the bottom of the box and the easiest place to feel the pattern begin.",
        expect: { slot: "low", range: "low", split: "low", display: "1", speedMax: 2 },
        focus: ["stick:low", "range", "split"],
      },
      {
        title: "Let the truck start moving",
        instruction: "Bring truck speed up to about 2 MPH.",
        why: "Think of the truck rolling before the next shift.",
        expect: { slot: "low", range: "low", split: "low", speedMin: 1.5, speedMax: 3 },
        focus: ["speed"],
      },
      {
        title: "Split up to gear 2",
        instruction: "Without moving the stick, flip the splitter to High.",
        why: "The easiest upshift on the box is often a split in the same hole.",
        expect: { slot: "low", range: "low", split: "high", display: "2", speedMin: 1.5 },
        focus: ["split", "stick:low"],
      },
      {
        title: "Move to the 1 / 5 hole",
        instruction: "Move the stick to the 1 / 5 hole and drop the splitter back to Low.",
        why: "This is your first full shift: new hole, lower split, same low range.",
        expect: { slot: "one", range: "low", split: "low", display: "3" },
        focus: ["stick:one", "split"],
      },
      {
        title: "Split again",
        instruction: "Stay in the 1 / 5 hole and flip the splitter to High.",
        why: "The pattern is already repeating.",
        expect: { slot: "one", range: "low", split: "high", display: "4" },
        focus: ["split", "stick:one"],
      },
    ],
  },
  {
    id: "pattern",
    title: "Repeat the H pattern",
    summary: "Keep climbing through the low range so the pattern becomes familiar.",
    steps: [
      {
        title: "Move to the 2 / 6 hole",
        instruction: "Shift to the 2 / 6 hole and return the splitter to Low.",
        why: "Each new hole starts with the lower split again.",
        expect: { slot: "two", range: "low", split: "low", display: "5" },
        focus: ["stick:two", "split"],
      },
      {
        title: "Split the same hole",
        instruction: "Flip the splitter to High while staying in the 2 / 6 hole.",
        why: "Same hand position, next gear.",
        expect: { slot: "two", range: "low", split: "high", display: "6" },
        focus: ["split", "stick:two"],
      },
      {
        title: "Move over to the 3 / 7 hole",
        instruction: "Shift to the 3 / 7 hole and set the splitter back to Low.",
        why: "You are doing the same move again, only in the next lane of the H pattern.",
        expect: { slot: "three", range: "low", split: "low", display: "7" },
        focus: ["stick:three", "split"],
      },
      {
        title: "Split to gear 8",
        instruction: "Stay in the 3 / 7 hole and flip the splitter to High.",
        why: "By now the lower-then-higher rhythm should feel familiar.",
        expect: { slot: "three", range: "low", split: "high", display: "8" },
        focus: ["split", "stick:three"],
      },
      {
        title: "Finish low range in the 4 / 8 hole",
        instruction: "Move to the 4 / 8 hole with the splitter on Low.",
        why: "This is the last stick lane before the range change.",
        expect: { slot: "four", range: "low", split: "low", display: "9" },
        focus: ["stick:four", "split"],
      },
      {
        title: "Split to 4-H",
        instruction: "Stay there and flip the splitter to High.",
        why: "4-H is the handoff point before you preselect high range.",
        expect: { slot: "four", range: "low", split: "high", display: "10" },
        focus: ["split", "stick:four"],
      },
    ],
  },
  {
    id: "range-shift",
    title: "Make the range shift",
    summary: "Learn the key move from 4-H to 5-L without drowning in extra detail.",
    steps: [
      {
        title: "Get to 4-H",
        instruction: "Set the truck in the 4 / 8 hole, Low range, High split.",
        why: "The range shift begins from 4-H, which the display shows as gear 10.",
        expect: { slot: "four", range: "low", split: "high", display: "10" },
        focus: ["stick:four", "range", "split"],
      },
      {
        title: "Bring road speed up",
        instruction: "Move truck speed up to about 18 MPH so the shift feels like a real pull.",
        why: "Range changes make more sense when the truck is moving and the engine is in a useful band.",
        expect: { slot: "four", range: "low", split: "high", display: "10", speedMin: 16, speedMax: 24 },
        focus: ["speed"],
      },
      {
        title: "Preselect high range",
        instruction: "While still in 4-H, flip the range switch up to High.",
        why: "On the truck, you preselect range before you move the stick.",
        expect: { slot: "four", range: "high", activeRange: "low", split: "high", display: "10" },
        focus: ["range", "stick:four"],
      },
      {
        title: "Shift to 5-L",
        instruction: "Move the stick to the 1 / 5 hole and drop the splitter back to Low.",
        why: "Same H pattern, new range, lower split in the next hole.",
        expect: { slot: "one", range: "high", activeRange: "high", split: "low", display: "11" },
        focus: ["stick:one", "split"],
      },
      {
        title: "Split once more",
        instruction: "Stay in the 1 / 5 hole and flip the splitter to High.",
        why: "Now you are fully on the upper half of the box.",
        expect: { slot: "one", range: "high", activeRange: "high", split: "high", display: "12" },
        focus: ["split", "stick:one"],
      },
    ],
  },
  {
    id: "free-drive",
    title: "Free drive",
    summary: "Explore the whole box at your own pace once the pattern starts making sense.",
    freeDrive: true,
  },
];

const state = {
  ...DEFAULT_STATE,
  lessonId: LESSONS[0].id,
  stepIndex: 0,
};

const elements = {
  lessonStrip: document.getElementById("lesson-strip"),
  lessonTitle: document.getElementById("lesson-title"),
  lessonCopy: document.getElementById("lesson-copy"),
  lessonProgressText: document.getElementById("lesson-progress-text"),
  stepStatus: document.getElementById("step-status"),
  progressFill: document.getElementById("progress-fill"),
  stepTitle: document.getElementById("step-title"),
  stepInstruction: document.getElementById("step-instruction"),
  stepWhy: document.getElementById("step-why"),
  feedbackCard: document.getElementById("feedback-card"),
  feedbackMessage: document.getElementById("feedback-message"),
  nextStep: document.getElementById("next-step"),
  restartLesson: document.getElementById("restart-lesson"),
  resetButton: document.getElementById("reset-button"),
  neutralButton: document.getElementById("neutral-button"),
  gearDisplay: document.getElementById("gear-display"),
  gearMeaning: document.getElementById("gear-meaning"),
  speedReadout: document.getElementById("speed-readout"),
  speedPanelReadout: document.getElementById("speed-panel-readout"),
  rpmReadout: document.getElementById("rpm-readout"),
  rpmBand: document.getElementById("rpm-band"),
  rpmCard: document.getElementById("rpm-card"),
  currentState: document.getElementById("current-state"),
  rangeReadout: document.getElementById("range-readout"),
  splitReadout: document.getElementById("split-readout"),
  slotReadout: document.getElementById("slot-readout"),
  ratioReadout: document.getElementById("ratio-readout"),
  advancedGear: document.getElementById("advanced-gear"),
  advancedTruckLabel: document.getElementById("advanced-truck-label"),
  gearMap: document.getElementById("gear-map"),
  speedSlider: document.getElementById("speed-slider"),
  rangeFrame: document.getElementById("range-frame"),
  splitFrame: document.getElementById("split-frame"),
  selectorButtons: Array.from(document.querySelectorAll("[data-control]")),
  stickButtons: Array.from(document.querySelectorAll(".stick-button")),
  speedStepButtons: Array.from(document.querySelectorAll("[data-speed-step]")),
  guidable: Array.from(document.querySelectorAll(".guidable")),
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

function getLesson() {
  return LESSONS.find((lesson) => lesson.id === state.lessonId);
}

function getStep() {
  const lesson = getLesson();
  return lesson.freeDrive ? null : lesson.steps[state.stepIndex];
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

  if (state.slot === "low" && state.activeRange === "high") {
    return {
      kind: "invalid",
      display: "--",
      truckLabel: "LO only works in low range",
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
      kind: "invalid",
      display: "--",
      truckLabel: "No forward gear found",
    };
  }

  return {
    kind: "forward",
    ...forwardGear,
  };
}

function getBand(rpm) {
  if (state.speed <= 0.1) {
    return { className: "", label: "Stopped / idle" };
  }

  if (rpm < 1100) {
    return { className: "is-lugging", label: "Too low / lugging" };
  }

  if (rpm <= 1800) {
    return { className: "is-band", label: "Working band" };
  }

  return { className: "is-high", label: "Ready for next gear" };
}

function resetTruck(base = DEFAULT_STATE) {
  state.speed = base.speed ?? DEFAULT_STATE.speed;
  state.range = base.range ?? DEFAULT_STATE.range;
  state.activeRange = base.activeRange ?? state.range;
  state.split = base.split ?? DEFAULT_STATE.split;
  state.slot = base.slot ?? DEFAULT_STATE.slot;
  elements.speedSlider.value = String(state.speed);
}

function getFriendlySelection(selection) {
  if (selection.kind === "neutral") {
    return "Neutral";
  }

  if (selection.kind === "invalid") {
    return selection.truckLabel;
  }

  if (selection.kind === "reverse") {
    return `${selection.display} (${selection.truckLabel})`;
  }

  return `gear ${selection.display} (${selection.truckLabel})`;
}

function getCurrentStateText(selection, rpm) {
  if (selection.kind === "neutral") {
    return `Neutral. Range ${titleCase(state.range)}, splitter ${titleCase(state.split)}. Truck ${
      state.speed <= 0.1 ? "stopped" : `rolling ${formatSpeed(state.speed)} MPH`
    }.`;
  }

  if (selection.kind === "invalid") {
    return "The LO hole does not work in high range. Flip the range switch back down to Low to use LO.";
  }

  if (selection.kind === "reverse") {
    return `Reverse selected: ${selection.truckLabel}. Keep speed near zero before backing. Engine is around ${formatRpm(rpm)} RPM.`;
  }

  if (state.range !== state.activeRange) {
    return `Range switch is set to ${titleCase(state.range)}, but the transmission is still in ${titleCase(
      state.activeRange
    )} range until the shift completes. Right now you are still in ${selection.truckLabel}, shown here as gear ${selection.display}.`;
  }

  return `${SLOT_LABELS[state.slot]} + ${titleCase(state.range)} range + ${titleCase(state.split)} split = ${
    selection.truckLabel
  }, shown here as gear ${selection.display}.`;
}

function getNextForwardGear(selection) {
  if (selection.kind !== "forward") {
    return null;
  }

  const index = FORWARD_GEARS.findIndex((gear) => gear.display === selection.display);
  return FORWARD_GEARS[index + 1] || null;
}

function getFreeDriveMessage(selection, rpm) {
  if (selection.kind === "neutral") {
    return "Free drive is open. Pick a hole, range, and split, then watch the display translate it for you.";
  }

  if (selection.kind === "invalid") {
    return "The LO hole belongs to low range only. That is an easy beginner mistake, so the trainer calls it out clearly.";
  }

  if (selection.kind === "reverse") {
    return state.speed > 8
      ? "Reverse is selected too fast for real driving. Bring the truck almost to a stop first."
      : "Reverse is modeled too, but keep most beginner practice on forward gears first.";
  }

  const nextGear = getNextForwardGear(selection);

  if (rpm < 1100) {
    return `You are in ${selection.truckLabel} and the engine is getting low. A downshift or lower split would usually feel better here.`;
  }

  if (rpm <= 1800) {
    return nextGear
      ? `You are in ${selection.truckLabel} and the engine is in the working band. The next likely move is ${nextGear.truckLabel}.`
      : `You are in ${selection.truckLabel} and cruising in the upper end of the box.`;
  }

  return nextGear
    ? `The engine is asking for the next gear. The next likely move is ${nextGear.truckLabel}.`
    : "You are at the top of the box. Hold it or slow down.";
}

function stepMatches(step, selection) {
  const expect = step.expect || {};

  if (expect.slot && state.slot !== expect.slot) {
    return false;
  }

  if (expect.range && state.range !== expect.range) {
    return false;
  }

  if (expect.activeRange && state.activeRange !== expect.activeRange) {
    return false;
  }

  if (expect.split && state.split !== expect.split) {
    return false;
  }

  if (expect.kind && selection.kind !== expect.kind) {
    return false;
  }

  if (expect.display && selection.display !== expect.display) {
    return false;
  }

  if (typeof expect.speedMin === "number" && state.speed < expect.speedMin) {
    return false;
  }

  if (typeof expect.speedMax === "number" && state.speed > expect.speedMax) {
    return false;
  }

  return true;
}

function buildGuidedFeedback(step, selection, complete) {
  if (complete) {
    const friendly = getFriendlySelection(selection);

    if (state.stepIndex === getLesson().steps.length - 1) {
      return {
        tone: "ready",
        text: `Nice. You made ${friendly}. This lesson is complete. Pick another lesson or switch to Free drive.`,
      };
    }

    return {
      tone: "ready",
      text: `Nice. You made ${friendly}. Press Next Step when you are ready.`,
    };
  }

  if (selection.kind === "invalid") {
    return {
      tone: "danger",
      text: "That control combination is not valid. The LO hole only works in low range.",
    };
  }

  if (selection.kind === "reverse" && state.speed > 8) {
    return {
      tone: "danger",
      text: "Reverse at this speed would not make sense in real driving. Slow the truck almost to a stop first.",
    };
  }

  if (step.expect && typeof step.expect.speedMin === "number" && state.speed < step.expect.speedMin) {
    return {
      tone: "warning",
      text: "You are in the right place, but the truck still needs more road speed for this step.",
    };
  }

  if (step.expect && typeof step.expect.speedMax === "number" && state.speed > step.expect.speedMax) {
    return {
      tone: "warning",
      text: "You have gone a little too fast for this drill step. Coast it back down and try again.",
    };
  }

  return {
    tone: "warning",
    text: `Current state: ${getCurrentStateText(selection, selection.ratio ? rpmAtSpeed(selection.ratio) : IDLE_RPM)}`,
  };
}

function renderLessonStrip() {
  elements.lessonStrip.innerHTML = LESSONS.map((lesson, index) => {
    const activeClass = lesson.id === state.lessonId ? " is-active" : "";
    return `
      <button class="lesson-button${activeClass}" data-lesson-id="${lesson.id}" type="button">
        <span class="lesson-kicker">Lesson ${index + 1}</span>
        <span class="lesson-name">${lesson.title}</span>
        <span class="lesson-summary">${lesson.summary}</span>
      </button>
    `;
  }).join("");

  Array.from(elements.lessonStrip.querySelectorAll("[data-lesson-id]")).forEach((button) => {
    button.addEventListener("click", () => {
      state.lessonId = button.dataset.lessonId;
      state.stepIndex = 0;
      resetTruck();
      render();
    });
  });
}

function renderGuidance(step, lesson) {
  document.body.classList.toggle("guided-mode", !lesson.freeDrive);

  elements.guidable.forEach((item) => {
    item.classList.remove("is-focused");
  });

  if (lesson.freeDrive || !step) {
    return;
  }

  const focusKeys = new Set(step.focus || []);

  focusKeys.forEach((key) => {
    if (key === "speed") {
      document.querySelector('[data-focus-target="speed"]').classList.add("is-focused");
      return;
    }

    if (key === "range") {
      document.querySelector('[data-focus-target="range"]').classList.add("is-focused");
      return;
    }

    if (key === "split") {
      document.querySelector('[data-focus-target="split"]').classList.add("is-focused");
      return;
    }

    if (key === "neutral") {
      document.querySelector('[data-focus-target="stick"]').classList.add("is-focused");
      document.querySelector('[data-focus-target="neutral"]').classList.add("is-focused");
      return;
    }

    if (key.startsWith("stick:")) {
      document.querySelector('[data-focus-target="stick"]').classList.add("is-focused");
      const target = document.querySelector(`[data-focus-target="${key}"]`);
      if (target) {
        target.classList.add("is-focused");
      }
    }
  });
}

function renderControlStates(selection) {
  elements.selectorButtons.forEach((button) => {
    const control = button.dataset.control;
    const isActive = state[control] === button.dataset.value;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  elements.rangeFrame.dataset.active = state.range;
  elements.splitFrame.dataset.active = state.split;

  elements.stickButtons.forEach((button) => {
    const isActive = state.slot === button.dataset.slot;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderGearMap(activeDisplay) {
  elements.gearMap.innerHTML = FORWARD_GEARS.map((gear) => {
    const activeClass = gear.display === activeDisplay ? " is-active" : "";
    return `
      <article class="gear-card${activeClass}">
        <span class="gear-number">${gear.display}</span>
        <span class="gear-truck-label">${gear.truckLabel}</span>
        <span class="gear-ratio">${gear.ratio.toFixed(2)} : 1</span>
        <span class="gear-slot">${gear.holeLabel} / ${titleCase(gear.range)} range / ${titleCase(gear.split)} split</span>
      </article>
    `;
  }).join("");
}

function renderCoach(selection, rpm) {
  const lesson = getLesson();
  const step = getStep();

  elements.lessonTitle.textContent = lesson.title;
  elements.lessonCopy.textContent = lesson.summary;

  if (lesson.freeDrive) {
    elements.lessonProgressText.textContent = "No locked steps";
    elements.stepStatus.textContent = "Free drive";
    elements.stepStatus.className = "status-pill is-free";
    elements.progressFill.style.width = "100%";
    elements.stepTitle.textContent = "Explore the box";
    elements.stepInstruction.textContent =
      "Try any stick hole, range, splitter, or road speed. The trainer keeps translating what the truck is doing.";
    elements.stepWhy.textContent =
      "Once the pattern feels smaller in your head, free practice helps the motions become familiar.";
    elements.feedbackMessage.textContent = getFreeDriveMessage(selection, rpm);
    elements.feedbackCard.className = "coach-card feedback-card";
    elements.nextStep.disabled = true;
    elements.nextStep.textContent = "No Steps in Free Drive";
    return;
  }

  const complete = stepMatches(step, selection);
  const feedback = buildGuidedFeedback(step, selection, complete);
  const doneCount = state.stepIndex + (complete ? 1 : 0);
  const progressPercent = (doneCount / lesson.steps.length) * 100;

  elements.lessonProgressText.textContent = `Step ${state.stepIndex + 1} of ${lesson.steps.length}`;
  elements.progressFill.style.width = `${progressPercent}%`;
  elements.stepTitle.textContent = step.title;
  elements.stepInstruction.textContent = step.instruction;
  elements.stepWhy.textContent = step.why;
  elements.feedbackMessage.textContent = feedback.text;
  elements.feedbackCard.className = `coach-card feedback-card ${
    feedback.tone === "ready"
      ? "is-ready"
      : feedback.tone === "danger"
        ? "is-danger"
        : "is-warning"
  }`;

  if (complete) {
    elements.nextStep.disabled = state.stepIndex === lesson.steps.length - 1;
    elements.nextStep.textContent =
      state.stepIndex === lesson.steps.length - 1 ? "Lesson Complete" : "Next Step";
    elements.stepStatus.textContent =
      state.stepIndex === lesson.steps.length - 1 ? "Lesson complete" : "Ready for next step";
    elements.stepStatus.className = `status-pill ${
      state.stepIndex === lesson.steps.length - 1 ? "is-complete" : "is-ready"
    }`;
  } else {
    elements.nextStep.disabled = true;
    elements.nextStep.textContent = "Next Step";
    elements.stepStatus.textContent = "Do the step";
    elements.stepStatus.className = "status-pill is-pending";
  }

  renderGuidance(step, lesson);
}

function renderDashboard(selection) {
  const rpm = selection.ratio ? rpmAtSpeed(selection.ratio) : IDLE_RPM;
  const band = getBand(rpm);

  elements.gearDisplay.textContent = selection.display;
  elements.gearMeaning.textContent = selection.truckLabel;
  elements.speedReadout.textContent = formatSpeed(state.speed);
  elements.speedPanelReadout.textContent = formatSpeed(state.speed);
  elements.rpmReadout.textContent = formatRpm(rpm);
  elements.rpmBand.textContent = band.label;
  elements.rpmCard.className = `readout-card rpm-card ${band.className}`.trim();
  elements.currentState.textContent = getCurrentStateText(selection, rpm);

  elements.rangeReadout.textContent = titleCase(state.range);
  elements.splitReadout.textContent = titleCase(state.split);
  elements.slotReadout.textContent = `${SLOT_LABELS[state.slot]} / ${titleCase(state.activeRange)} active`;
  elements.ratioReadout.textContent = selection.ratio ? `${selection.ratio.toFixed(2)} : 1` : "--";
  elements.advancedGear.textContent = selection.display;
  elements.advancedTruckLabel.textContent = selection.truckLabel;

  renderControlStates(selection);
  renderGearMap(selection.kind === "forward" ? selection.display : "");
  renderCoach(selection, rpm);
}

function render() {
  renderLessonStrip();
  renderDashboard(getSelection());
}

elements.speedSlider.addEventListener("input", (event) => {
  state.speed = Number(event.target.value);
  renderDashboard(getSelection());
});

elements.speedStepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.speed = clamp(Number((state.speed + Number(button.dataset.speedStep)).toFixed(1)), 0, 75);
    elements.speedSlider.value = String(state.speed);
    renderDashboard(getSelection());
  });
});

elements.selectorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const control = button.dataset.control;
    state[control] = button.dataset.value;

    if (control === "range" && state.slot === "neutral") {
      state.activeRange = state.range;
    }

    renderDashboard(getSelection());
  });
});

elements.stickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (state.slot !== "neutral" && state.slot !== button.dataset.slot) {
      state.activeRange = state.range;
    }

    state.slot = button.dataset.slot;
    renderDashboard(getSelection());
  });
});

elements.neutralButton.addEventListener("click", () => {
  if (state.slot !== "neutral") {
    state.activeRange = state.range;
  }

  state.slot = "neutral";
  renderDashboard(getSelection());
});

elements.resetButton.addEventListener("click", () => {
  resetTruck();
  renderDashboard(getSelection());
});

elements.restartLesson.addEventListener("click", () => {
  state.stepIndex = 0;
  resetTruck();
  render();
});

elements.nextStep.addEventListener("click", () => {
  const lesson = getLesson();

  if (lesson.freeDrive) {
    return;
  }

  if (state.stepIndex < lesson.steps.length - 1) {
    state.stepIndex += 1;
    render();
  }
});

render();
