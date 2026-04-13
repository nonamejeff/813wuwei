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
].map((gear) => ({ ...gear, kind: "forward" }));

const REVERSE_GEARS = [
  { display: "R1", truckLabel: "Low Rev L", ratio: 15.06, range: "low", split: "low", slot: "reverse" },
  { display: "R2", truckLabel: "Low Rev H", ratio: 12.85, range: "low", split: "high", slot: "reverse" },
  { display: "R3", truckLabel: "Hi Rev L", ratio: 4.03, range: "high", split: "low", slot: "reverse" },
  { display: "R4", truckLabel: "Hi Rev H", ratio: 3.43, range: "high", split: "high", slot: "reverse" },
].map((gear) => ({ ...gear, kind: "reverse" }));

const IDLE_RPM = 650;
const FREE_REV_LIMIT = 2150;
const REDLINE_RPM = 2300;
const BLOW_RPM = 2550;
const SHIFT_STALL_RPM = 420;
const SHIFT_HARD_BOG_RPM = 620;
const SHIFT_BOG_RPM = 820;
const DRIVE_STALL_RPM = 300;
const DRIVE_HARD_BOG_RPM = 430;
const DRIVE_BOG_RPM = 580;
const TOP_GEAR_RATIO = 0.73;
const CRUISE_SPEED_MPH = 65;
const CRUISE_RPM = 1630;
const SPEED_RATIO_FACTOR = (CRUISE_SPEED_MPH * TOP_GEAR_RATIO) / CRUISE_RPM;
const MIN_NEEDLE_ANGLE = -120;
const MAX_NEEDLE_ANGLE = 120;
const MAX_LOAD_CARS = 3;

const START_STATE = {
  throttle: 0,
  speed: 0,
  rpm: IDLE_RPM,
  range: "low",
  split: "low",
  slot: "neutral",
  engineRunning: true,
  stalled: false,
  blown: false,
  muted: false,
  loadCars: 0,
  status: "READY",
};

const state = { ...START_STATE };

const elements = {
  throttleSlider: document.getElementById("throttle-slider"),
  throttleReadout: document.getElementById("throttle-readout"),
  speedReadout: document.getElementById("speed-readout"),
  rpmReadout: document.getElementById("rpm-readout"),
  gearDisplay: document.getElementById("gear-display"),
  gearLabel: document.getElementById("gear-label"),
  rangeStatus: document.getElementById("range-status"),
  splitStatus: document.getElementById("split-status"),
  boxStatus: document.getElementById("box-status"),
  statusLine: document.getElementById("status-line"),
  speedNeedle: document.getElementById("speed-needle"),
  rpmNeedle: document.getElementById("rpm-needle"),
  rangeToggle: document.getElementById("range-toggle"),
  splitToggle: document.getElementById("split-toggle"),
  neutralButton: document.getElementById("neutral-button"),
  startButton: document.getElementById("start-engine"),
  resetSim: document.getElementById("reset-sim"),
  rebuildButton: document.getElementById("rebuild-button"),
  blownOverlay: document.getElementById("blown-overlay"),
  soundToggle: document.getElementById("sound-toggle"),
  toggleButtons: Array.from(document.querySelectorAll("[data-control]")),
  stickButtons: Array.from(document.querySelectorAll(".stick-button")),
  loadReadout: document.getElementById("load-readout"),
  loadUp: document.getElementById("load-up"),
  loadDown: document.getElementById("load-down"),
};

const audio = {
  ctx: null,
  master: null,
  workletNode: null,
  initPromise: null,
  usingWorklet: false,
  compressor: null,
  drive: null,
  engineBus: null,
  engineA: null,
  engineB: null,
  engineC: null,
  engineAGain: null,
  engineBGain: null,
  engineCGain: null,
  filter: null,
  pulseFilter: null,
  clatterFilter: null,
  rumble: null,
  noiseSource: null,
  noiseFilter: null,
  noiseGain: null,
  turboFilter: null,
  turboGain: null,
  initialized: false,
};

let lastFrameTime = 0;
let statusTimer = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function angleFor(value, min, max) {
  const progress = clamp((value - min) / (max - min), 0, 1);
  return MIN_NEEDLE_ANGLE + progress * (MAX_NEEDLE_ANGLE - MIN_NEEDLE_ANGLE);
}

function setNeedle(element, value, min, max) {
  const angle = angleFor(value, min, max);
  element.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
}

function formatSpeed(value) {
  return Math.abs(value).toFixed(1);
}

function formatRpm(value) {
  return Math.round(value).toLocaleString();
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function setStatus(message, isAlert = false, durationMs = 1800) {
  state.status = message;
  statusTimer = durationMs > 0 ? performance.now() + durationMs : 0;
  elements.statusLine.textContent = message;
  elements.statusLine.classList.toggle("is-alert", isAlert);
}

function resetStatusToDefault() {
  setStatus("READY", false, 0);
}

function getSelectionFor(snapshot) {
  if (snapshot.slot === "neutral") {
    return {
      kind: "neutral",
      display: "N",
      truckLabel: "Neutral",
      ratio: null,
      slot: "neutral",
    };
  }

  if (snapshot.slot === "low" && snapshot.range === "high") {
    return {
      kind: "invalid",
      display: "--",
      truckLabel: "LO blocked",
      ratio: null,
      slot: snapshot.slot,
    };
  }

  if (snapshot.slot === "reverse") {
    return REVERSE_GEARS.find(
      (gear) => gear.range === snapshot.range && gear.split === snapshot.split
    ) || {
      kind: "invalid",
      display: "--",
      truckLabel: "No reverse",
      ratio: null,
      slot: snapshot.slot,
    };
  }

  return FORWARD_GEARS.find(
    (gear) =>
      gear.slot === snapshot.slot &&
      gear.range === snapshot.range &&
      gear.split === snapshot.split
  ) || {
    kind: "invalid",
    display: "--",
    truckLabel: "No gear",
    ratio: null,
    slot: snapshot.slot,
  };
}

function getSelection() {
  return getSelectionFor(state);
}

function predictedRpmAtSpeed(selection, speed) {
  if (!selection || !selection.ratio) {
    return IDLE_RPM;
  }

  return Math.max(IDLE_RPM, coupledRpmAtSpeed(selection, speed));
}

function coupledRpmAtSpeed(selection, speed) {
  if (!selection || !selection.ratio) {
    return 0;
  }

  return Math.abs(speed) * selection.ratio / SPEED_RATIO_FACTOR;
}

function idleSpeedForGear(selection) {
  if (!selection || !selection.ratio) {
    return 0;
  }

  return (IDLE_RPM * SPEED_RATIO_FACTOR) / selection.ratio;
}

function getLaunchAssist(selection, speed) {
  if (!selection || selection.kind !== "forward" || !selection.ratio) {
    return 0;
  }

  if (selection.ratio < 3.74) {
    return 0;
  }

  const roadSpeed = Math.abs(speed);
  const assistWindow = Math.max(1.6, idleSpeedForGear(selection) * 0.78);
  return clamp(1 - roadSpeed / assistWindow, 0, 1);
}

function getShiftLuggingState(selection, speed, previousSelection = null, loadCars = 0) {
  if (!selection || selection.kind !== "forward" || !selection.ratio) {
    return null;
  }

  if (!previousSelection || previousSelection.kind === "neutral" || Math.abs(speed) < 0.75) {
    return null;
  }

  const projectedRpm = coupledRpmAtSpeed(selection, speed);
  const ratioStep = previousSelection && previousSelection.ratio
    ? selection.ratio / previousSelection.ratio
    : 1;
  const stallRpm = SHIFT_STALL_RPM + loadCars * 26;
  const hardBogRpm = SHIFT_HARD_BOG_RPM + loadCars * 34;
  const bogRpm = SHIFT_BOG_RPM + loadCars * 46;

  if (projectedRpm < stallRpm) {
    return "stall";
  }

  if (projectedRpm < hardBogRpm) {
    if (ratioStep < 0.38) {
      return "stall";
    }
    return "bog";
  }

  if (projectedRpm < bogRpm) {
    return "bog";
  }

  if (ratioStep < 0.28 && projectedRpm < 760 + loadCars * 48) {
    return "stall";
  }

  if (ratioStep < 0.46 && projectedRpm < 920 + loadCars * 56) {
    return "bog";
  }

  return null;
}

function getDriveLuggingState(selection, speed, throttleAmount, loadCars = 0) {
  if (!selection || selection.kind !== "forward" || !selection.ratio) {
    return null;
  }

  if (throttleAmount < 0.14) {
    return null;
  }

  const launchAssist = getLaunchAssist(selection, speed);
  if (launchAssist > 0.45) {
    return null;
  }

  const coupledRpm = coupledRpmAtSpeed(selection, speed);
  const stallRpm = DRIVE_STALL_RPM + loadCars * 26;
  const hardBogRpm = DRIVE_HARD_BOG_RPM + loadCars * 34;
  const bogRpm = DRIVE_BOG_RPM + loadCars * 48;

  if (coupledRpm < stallRpm && throttleAmount > Math.max(0.5, 0.72 - loadCars * 0.05)) {
    return "stall";
  }

  if (coupledRpm < hardBogRpm && throttleAmount > Math.max(0.34, 0.48 - loadCars * 0.04)) {
    return "bog";
  }

  if (coupledRpm < bogRpm && throttleAmount > Math.max(0.45, 0.62 - loadCars * 0.04)) {
    return "bog";
  }

  return null;
}

function targetSpeedForGear(selection) {
  if (!selection || !selection.ratio) {
    return 0;
  }

  const throttleAmount = state.throttle / 100;
  if (throttleAmount <= 0.01) {
    return 0;
  }

  const targetRpm = IDLE_RPM + throttleAmount * (FREE_REV_LIMIT - IDLE_RPM);
  return (targetRpm * SPEED_RATIO_FACTOR) / selection.ratio;
}

function buildDriveCurve(amount = 36) {
  const sampleCount = 2048;
  const curve = new Float32Array(sampleCount);

  for (let index = 0; index < sampleCount; index += 1) {
    const x = index * 2 / sampleCount - 1;
    curve[index] = Math.tanh(amount * x) / Math.tanh(amount);
  }

  return curve;
}

function createNoiseBuffer(context, durationSeconds = 2) {
  const frameCount = Math.floor(context.sampleRate * durationSeconds);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const channel = buffer.getChannelData(0);
  let last = 0;

  for (let index = 0; index < frameCount; index += 1) {
    const white = Math.random() * 2 - 1;
    last = (last * 0.93) + (white * 0.07);
    channel[index] = last;
  }

  return buffer;
}

function createDieselWave(context) {
  const real = new Float32Array(10);
  const imag = new Float32Array(10);
  imag[1] = 1;
  imag[2] = 0.92;
  imag[3] = 0.56;
  imag[4] = 0.31;
  imag[5] = 0.18;
  imag[6] = 0.1;
  imag[7] = 0.06;
  imag[8] = 0.04;
  imag[9] = 0.02;
  return context.createPeriodicWave(real, imag);
}

function createBaseAudioContext(AudioCtx) {
  audio.ctx = new AudioCtx();
  audio.master = audio.ctx.createGain();
  audio.master.gain.value = 0;
  audio.master.connect(audio.ctx.destination);
}

function initializeLegacyEngine() {
  audio.compressor = audio.ctx.createDynamicsCompressor();
  audio.compressor.threshold.value = -20;
  audio.compressor.knee.value = 12;
  audio.compressor.ratio.value = 3.5;
  audio.compressor.attack.value = 0.004;
  audio.compressor.release.value = 0.18;

  audio.drive = audio.ctx.createWaveShaper();
  audio.drive.curve = buildDriveCurve();
  audio.drive.oversample = "4x";

  audio.engineBus = audio.ctx.createGain();
  audio.engineBus.gain.value = 0.85;

  audio.filter = audio.ctx.createBiquadFilter();
  audio.filter.type = "lowpass";
  audio.filter.frequency.value = 190;
  audio.filter.Q.value = 0.8;

  audio.pulseFilter = audio.ctx.createBiquadFilter();
  audio.pulseFilter.type = "bandpass";
  audio.pulseFilter.frequency.value = 240;
  audio.pulseFilter.Q.value = 0.65;

  audio.clatterFilter = audio.ctx.createBiquadFilter();
  audio.clatterFilter.type = "lowpass";
  audio.clatterFilter.frequency.value = 850;
  audio.clatterFilter.Q.value = 0.45;

  audio.rumble = audio.ctx.createGain();
  audio.rumble.gain.value = 0.12;

  audio.engineAGain = audio.ctx.createGain();
  audio.engineAGain.gain.value = 0.12;

  audio.engineBGain = audio.ctx.createGain();
  audio.engineBGain.gain.value = 0.16;

  audio.engineCGain = audio.ctx.createGain();
  audio.engineCGain.gain.value = 0.04;

  audio.engineA = audio.ctx.createOscillator();
  audio.engineA.type = "triangle";
  audio.engineA.frequency.value = 16;

  audio.engineB = audio.ctx.createOscillator();
  audio.engineB.setPeriodicWave(createDieselWave(audio.ctx));
  audio.engineB.frequency.value = 32;

  audio.engineC = audio.ctx.createOscillator();
  audio.engineC.type = "sawtooth";
  audio.engineC.frequency.value = 90;

  audio.noiseSource = audio.ctx.createBufferSource();
  audio.noiseSource.buffer = createNoiseBuffer(audio.ctx);
  audio.noiseSource.loop = true;

  audio.noiseFilter = audio.ctx.createBiquadFilter();
  audio.noiseFilter.type = "bandpass";
  audio.noiseFilter.frequency.value = 680;
  audio.noiseFilter.Q.value = 0.8;

  audio.noiseGain = audio.ctx.createGain();
  audio.noiseGain.gain.value = 0.01;

  audio.turboFilter = audio.ctx.createBiquadFilter();
  audio.turboFilter.type = "bandpass";
  audio.turboFilter.frequency.value = 1800;
  audio.turboFilter.Q.value = 0.7;

  audio.turboGain = audio.ctx.createGain();
  audio.turboGain.gain.value = 0.002;

  audio.engineA.connect(audio.engineAGain);
  audio.engineAGain.connect(audio.filter);
  audio.filter.connect(audio.rumble);
  audio.rumble.connect(audio.engineBus);

  audio.engineB.connect(audio.engineBGain);
  audio.engineBGain.connect(audio.pulseFilter);
  audio.pulseFilter.connect(audio.engineBus);

  audio.engineC.connect(audio.engineCGain);
  audio.engineCGain.connect(audio.clatterFilter);
  audio.clatterFilter.connect(audio.engineBus);

  audio.noiseSource.connect(audio.noiseFilter);
  audio.noiseFilter.connect(audio.noiseGain);
  audio.noiseGain.connect(audio.engineBus);

  audio.noiseSource.connect(audio.turboFilter);
  audio.turboFilter.connect(audio.turboGain);
  audio.turboGain.connect(audio.engineBus);

  audio.engineBus.connect(audio.drive);
  audio.drive.connect(audio.compressor);
  audio.compressor.connect(audio.master);

  audio.engineA.start();
  audio.engineB.start();
  audio.engineC.start();
  audio.noiseSource.start();
  audio.usingWorklet = false;
  audio.initialized = true;
}

function ensureAudio() {
  if (audio.initialized) {
    if (audio.ctx && audio.ctx.state === "suspended") {
      audio.ctx.resume().catch(() => {});
    }
    return;
  }

  if (audio.initPromise) {
    if (audio.ctx && audio.ctx.state === "suspended") {
      audio.ctx.resume().catch(() => {});
    }
    return;
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return;
  }

  createBaseAudioContext(AudioCtx);

  if (!audio.ctx.audioWorklet) {
    initializeLegacyEngine();
    return;
  }

  audio.initPromise = audio.ctx.audioWorklet.addModule("engine-worklet.js")
    .then(() => {
      audio.workletNode = new AudioWorkletNode(audio.ctx, "diesel-engine-processor", {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [1],
      });
      audio.workletNode.connect(audio.master);
      audio.usingWorklet = true;
      audio.initialized = true;
    })
    .catch(() => {
      initializeLegacyEngine();
    })
    .finally(() => {
      audio.initPromise = null;
    });
}

function updateAudio() {
  if (!audio.initialized) {
    return;
  }

  const now = audio.ctx.currentTime;
  const activeMaster = state.muted ? 0 : 0.32;
  audio.master.gain.cancelScheduledValues(now);
  audio.master.gain.linearRampToValueAtTime(activeMaster, now + 0.04);

  if (audio.usingWorklet && audio.workletNode) {
    const rpmParam = audio.workletNode.parameters.get("rpm");
    const throttleParam = audio.workletNode.parameters.get("throttle");
    const engineOnParam = audio.workletNode.parameters.get("engine_on");
    const roadSpeedParam = audio.workletNode.parameters.get("road_speed");

    rpmParam.setValueAtTime(state.rpm, now);
    throttleParam.setValueAtTime(state.throttle / 100, now);
    engineOnParam.setValueAtTime(state.blown || !state.engineRunning ? 0 : 1, now);
    roadSpeedParam.setValueAtTime(clamp(Math.abs(state.speed) / 75, 0, 1), now);
    return;
  }

  const throttleAmount = state.throttle / 100;
  const rpmRatio = clamp((state.rpm - IDLE_RPM) / (FREE_REV_LIMIT - IDLE_RPM), 0, 1);
  const engineAlive = state.blown || !state.engineRunning ? 0 : 1;
  const huntStrength = 1 - Math.min(throttleAmount * 2.2, 1);
  const hunt = huntStrength * (
    Math.sin(now * 5.4) * 0.06 +
    Math.sin(now * 11.2) * 0.025
  );
  const fireFreq = Math.max(18, (state.rpm / 60) * 3 * (1 + hunt));
  const subFreq = Math.max(11, fireFreq * 0.5);
  const pulseFreq = fireFreq;
  const clatterFreq = Math.max(60, fireFreq * (2.2 + throttleAmount * 0.5));
  const roadFactor = clamp(Math.abs(state.speed) / 75, 0, 1);

  audio.engineA.frequency.cancelScheduledValues(now);
  audio.engineB.frequency.cancelScheduledValues(now);
  audio.engineC.frequency.cancelScheduledValues(now);
  audio.engineAGain.gain.cancelScheduledValues(now);
  audio.engineBGain.gain.cancelScheduledValues(now);
  audio.engineCGain.gain.cancelScheduledValues(now);
  audio.filter.frequency.cancelScheduledValues(now);
  audio.pulseFilter.frequency.cancelScheduledValues(now);
  audio.clatterFilter.frequency.cancelScheduledValues(now);
  audio.rumble.gain.cancelScheduledValues(now);
  audio.noiseFilter.frequency.cancelScheduledValues(now);
  audio.noiseGain.gain.cancelScheduledValues(now);
  audio.turboFilter.frequency.cancelScheduledValues(now);
  audio.turboGain.gain.cancelScheduledValues(now);

  audio.engineA.frequency.linearRampToValueAtTime(subFreq, now + 0.05);
  audio.engineB.frequency.linearRampToValueAtTime(pulseFreq, now + 0.05);
  audio.engineC.frequency.linearRampToValueAtTime(clatterFreq, now + 0.05);

  audio.engineAGain.gain.linearRampToValueAtTime((0.18 + throttleAmount * 0.08) * engineAlive, now + 0.05);
  audio.engineBGain.gain.linearRampToValueAtTime((0.2 + throttleAmount * 0.14) * engineAlive, now + 0.05);
  audio.engineCGain.gain.linearRampToValueAtTime((0.026 + rpmRatio * 0.05 + throttleAmount * 0.04) * engineAlive, now + 0.05);

  audio.filter.frequency.linearRampToValueAtTime(120 + throttleAmount * 65 + rpmRatio * 55, now + 0.05);
  audio.pulseFilter.frequency.linearRampToValueAtTime(170 + fireFreq * 6.5, now + 0.05);
  audio.clatterFilter.frequency.linearRampToValueAtTime(780 + throttleAmount * 1400 + rpmRatio * 900, now + 0.05);
  audio.rumble.gain.linearRampToValueAtTime((0.12 + throttleAmount * 0.08) * engineAlive, now + 0.05);

  audio.noiseFilter.frequency.linearRampToValueAtTime(420 + throttleAmount * 980 + rpmRatio * 260, now + 0.05);
  audio.noiseGain.gain.linearRampToValueAtTime((0.008 + throttleAmount * 0.03 + rpmRatio * 0.01) * engineAlive, now + 0.05);
  audio.turboFilter.frequency.linearRampToValueAtTime(1200 + throttleAmount * 2200 + roadFactor * 320, now + 0.05);
  audio.turboGain.gain.linearRampToValueAtTime((0.002 + throttleAmount * throttleAmount * 0.05 + roadFactor * 0.012) * engineAlive, now + 0.05);
}

function playToneBurst(fromFreq, toFreq, duration, gainAmount, type = "triangle") {
  if (!audio.initialized || state.muted) {
    return;
  }

  const osc = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(fromFreq, audio.ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(10, toFreq), audio.ctx.currentTime + duration);
  gain.gain.setValueAtTime(gainAmount, audio.ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audio.master);
  osc.start();
  osc.stop(audio.ctx.currentTime + duration);
}

function playNoiseBurst(duration, gainAmount, highpassFreq) {
  if (!audio.initialized || state.muted) {
    return;
  }

  const frameCount = Math.floor(audio.ctx.sampleRate * duration);
  const buffer = audio.ctx.createBuffer(1, frameCount, audio.ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / frameCount);
  }

  const source = audio.ctx.createBufferSource();
  const filter = audio.ctx.createBiquadFilter();
  const gain = audio.ctx.createGain();

  filter.type = "highpass";
  filter.frequency.value = highpassFreq;
  gain.gain.setValueAtTime(gainAmount, audio.ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.ctx.currentTime + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audio.master);
  source.start();
}

function playShiftAir() {
  playNoiseBurst(0.12, 0.18, 900);
}

function playGearClunk() {
  playToneBurst(120, 45, 0.12, 0.12, "square");
}

function playBlowUp() {
  playNoiseBurst(0.8, 0.34, 120);
  playToneBurst(170, 26, 0.7, 0.3, "sawtooth");
  playToneBurst(70, 18, 0.9, 0.22, "triangle");
}

function playBogDown() {
  playToneBurst(72, 38, 0.22, 0.1, "sawtooth");
}

function playStartEngine() {
  playNoiseBurst(0.34, 0.2, 220);
  playToneBurst(82, 138, 0.22, 0.16, "sawtooth");
}

function stopEngine(message = "STALLED IT") {
  state.engineRunning = false;
  state.stalled = true;
  state.throttle = 0;
  state.rpm = 0;
  elements.throttleSlider.value = "0";
  setStatus(message, true, 0);
  playBogDown();
}

function startEngine() {
  if (state.blown) {
    return;
  }

  ensureAudio();

  if (state.engineRunning) {
    setStatus("ENGINE RUNNING", false, 900);
    return;
  }

  if (state.slot !== "neutral") {
    setStatus("SHIFT TO NEUTRAL TO START", true, 1500);
    return;
  }

  state.engineRunning = true;
  state.stalled = false;
  state.rpm = IDLE_RPM;
  setStatus("ENGINE FIRED", false, 1200);
  playStartEngine();
}

function blowEngine() {
  if (state.blown) {
    return;
  }

  state.blown = true;
  state.engineRunning = false;
  state.stalled = false;
  state.throttle = 0;
  state.rpm = 0;
  elements.throttleSlider.value = "0";
  elements.blownOverlay.classList.remove("is-hidden");
  setStatus("YOU JUST BLEW UP YOUR ENGINE CHRIS", true, 0);
  playBlowUp();
}

function resetSim() {
  const muted = state.muted;
  Object.assign(state, START_STATE, { muted });
  elements.throttleSlider.value = "0";
  elements.blownOverlay.classList.add("is-hidden");
  elements.statusLine.classList.remove("is-alert");
  render();
  updateAudio();
}

function tryStateChange(mutator, kind) {
  if (state.blown) {
    return;
  }

  ensureAudio();

  const before = { ...state };
  const beforeSelection = getSelectionFor(before);

  mutator();

  const after = { ...state };
  const afterSelection = getSelectionFor(after);

  if (afterSelection.kind === "invalid") {
    Object.assign(state, before);
    setStatus("NOT ALLOWED", true);
    return;
  }

  if (kind === "slot" && before.slot !== "neutral" && after.slot === "reverse" && Math.abs(before.speed) > 1.5) {
    Object.assign(state, before);
    setStatus("NOT ALLOWED", true);
    return;
  }

  if (kind === "range" && before.slot === "reverse" && Math.abs(before.speed) > 0.5) {
    Object.assign(state, before);
    setStatus("NO RANGE SHIFT IN REVERSE", true);
    return;
  }

  if ((kind === "slot" || kind === "range" || kind === "split") && afterSelection.ratio) {
    const projectedRpm = coupledRpmAtSpeed(afterSelection, before.speed);
    if (projectedRpm >= BLOW_RPM && Math.abs(before.speed) > 1) {
      Object.assign(state, before);
      blowEngine();
      return;
    }
  }

  let feedbackShown = false;
  const luggingState = getShiftLuggingState(afterSelection, before.speed, beforeSelection, before.loadCars);
  if (luggingState === "stall") {
    state.speed = before.speed * 0.96;
    stopEngine("STALLED IT");
    feedbackShown = true;
  } else if (luggingState === "bog") {
    state.rpm = Math.min(before.rpm, Math.max(460, coupledRpmAtSpeed(afterSelection, before.speed)));
    state.speed = before.speed * 0.985;
    setStatus("YOU'RE BOGGING YOUR ENGINE OUT", true, 1600);
    playBogDown();
    feedbackShown = true;
  }

  if (kind === "range" || kind === "split") {
    playShiftAir();
  }

  if (kind === "slot") {
    playGearClunk();
  }

  if (kind === "neutral") {
    playGearClunk();
  }

  if (!feedbackShown) {
    setStatus("READY", false, 800);
  }
}

function updatePhysics(dt) {
  if (state.blown) {
    state.speed += (0 - state.speed) * Math.min(dt * 1.3, 1);
    state.rpm += (0 - state.rpm) * Math.min(dt * 2.4, 1);
    if (Math.abs(state.speed) < 0.02) {
      state.speed = 0;
    }
    if (state.rpm < 5) {
      state.rpm = 0;
    }
    return;
  }

  if (!state.engineRunning) {
    const drag = state.slot === "neutral" ? 0.85 : 1.35;
    state.speed += (0 - state.speed) * Math.min(dt * drag, 1);
    state.rpm += (0 - state.rpm) * Math.min(dt * 6.5, 1);

    if (Math.abs(state.speed) < 0.02) {
      state.speed = 0;
    }

    if (state.rpm < 5) {
      state.rpm = 0;
    }

    return;
  }

  const selection = getSelection();
  const throttleAmount = state.throttle / 100;

  if (selection.kind === "neutral") {
    state.speed += (0 - state.speed) * Math.min(dt * 1.35, 1);
    const neutralTarget = IDLE_RPM + throttleAmount * (FREE_REV_LIMIT - IDLE_RPM);
    state.rpm += (neutralTarget - state.rpm) * Math.min(dt * 7.2, 1);
    return;
  }

  const direction = selection.slot === "reverse" ? -1 : 1;
  const targetSpeed = targetSpeedForGear(selection) * direction;
  const gearPull = Math.pow(selection.ratio / TOP_GEAR_RATIO, 0.12);
  const loadPenalty = 1 + state.loadCars * 0.32;
  const accel = throttleAmount > 0.01
    ? ((0.24 + throttleAmount * 0.92) * gearPull) / loadPenalty
    : 1.05;
  const launchAssist = getLaunchAssist(selection, state.speed);
  const luggingState = selection.kind === "forward"
    ? getDriveLuggingState(selection, state.speed, throttleAmount, state.loadCars)
    : null;
  const lugFactor = luggingState === "stall" ? 0.18 : luggingState === "bog" ? 0.55 : 1;

  state.speed += (targetSpeed - state.speed) * Math.min(dt * accel * lugFactor, 1);

  if (luggingState) {
    const dragStrength = luggingState === "stall" ? 1.4 : 0.72;
    state.speed += (0 - state.speed) * Math.min(dt * dragStrength * Math.max(throttleAmount, 0.2), 1);
  }

  if (Math.abs(state.speed) < 0.02 && throttleAmount < 0.01) {
    state.speed = 0;
  }

  const roadDrag = (0.02 + state.loadCars * 0.018) * (0.3 + Math.abs(state.speed) / 90);
  state.speed += (0 - state.speed) * Math.min(dt * roadDrag, 1);

  const coupledRpm = coupledRpmAtSpeed(selection, state.speed);
  const engineLoad = throttleAmount > 0.02
    ? throttleAmount * (70 + state.loadCars * 18)
    : 0;
  const freeRevTarget = IDLE_RPM + throttleAmount * (FREE_REV_LIMIT - IDLE_RPM) * 0.42;
  let targetRpm = Math.max(IDLE_RPM, coupledRpm + engineLoad);

  if (launchAssist > 0) {
    const slippedTarget = Math.max(IDLE_RPM, freeRevTarget);
    targetRpm = targetRpm * (1 - launchAssist) + slippedTarget * launchAssist;
  }

  if (luggingState === "stall") {
    targetRpm = Math.max(180, coupledRpm - 80 + throttleAmount * 20);
  } else if (luggingState === "bog") {
    targetRpm = Math.max(360, coupledRpm + throttleAmount * 24);
  }

  state.rpm += (targetRpm - state.rpm) * Math.min(dt * 9.5, 1);

  if (state.rpm >= BLOW_RPM) {
    blowEngine();
  } else if (state.rpm >= REDLINE_RPM) {
    setStatus("REDLINE", true, 250);
  } else if (luggingState === "stall" && throttleAmount > 0.34 && coupledRpm < DRIVE_STALL_RPM) {
    stopEngine("STALLED IT");
  } else if (luggingState === "bog") {
    setStatus("YOU'RE BOGGING YOUR ENGINE OUT", true, 250);
  }
}

function updateToggleState() {
  elements.rangeToggle.dataset.active = state.range;
  elements.splitToggle.dataset.active = state.split;

  elements.toggleButtons.forEach((button) => {
    const control = button.dataset.control;
    const isActive = state[control] === button.dataset.value;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.disabled = state.blown;
  });
}

function updateStickState() {
  elements.stickButtons.forEach((button) => {
    const isActive = state.slot === button.dataset.slot;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.disabled = state.blown;
  });

  elements.neutralButton.classList.toggle("is-active", state.slot === "neutral");
  elements.neutralButton.setAttribute("aria-pressed", String(state.slot === "neutral"));
  elements.neutralButton.disabled = state.blown;
  elements.startButton.disabled = state.blown;
}

function render() {
  const selection = getSelection();

  elements.throttleReadout.textContent = `${Math.round(state.throttle)}%`;
  elements.speedReadout.textContent = formatSpeed(state.speed);
  elements.rpmReadout.textContent = formatRpm(state.rpm);
  elements.gearDisplay.textContent = state.blown ? "X" : selection.display;
  elements.gearLabel.textContent = state.blown ? "Blown" : selection.truckLabel;
  elements.rangeStatus.textContent = `Range ${titleCase(state.range)}`;
  elements.splitStatus.textContent = `Split ${titleCase(state.split)}`;
  elements.boxStatus.textContent = state.blown
    ? "Engine Dead"
    : !state.engineRunning
      ? "Engine Off"
      : selection.slot === "reverse"
        ? "Reverse"
        : "Forward";
  elements.soundToggle.textContent = state.muted ? "Sound: Off" : "Sound: On";
  elements.startButton.classList.toggle("is-hidden", state.engineRunning || state.blown);
  elements.loadReadout.textContent = `${state.loadCars} NASCAR${state.loadCars === 1 ? "" : "s"}`;
  elements.loadDown.disabled = state.loadCars === 0;
  elements.loadUp.disabled = state.loadCars === MAX_LOAD_CARS;

  setNeedle(elements.speedNeedle, Math.abs(state.speed), 0, 75);
  setNeedle(elements.rpmNeedle, state.rpm, 500, 3000);

  if (state.status !== elements.statusLine.textContent) {
    elements.statusLine.textContent = state.status;
  }

  updateToggleState();
  updateStickState();
}

function frame(time) {
  if (!lastFrameTime) {
    lastFrameTime = time;
  }

  const dt = clamp((time - lastFrameTime) / 1000, 0, 0.05);
  lastFrameTime = time;

  updatePhysics(dt);
  updateAudio();

  if (statusTimer && time >= statusTimer && !state.blown && state.status !== "REDLINE") {
    resetStatusToDefault();
  }

  if (state.status === "REDLINE" && !state.blown && state.rpm < REDLINE_RPM - 100) {
    resetStatusToDefault();
  }

  render();
  requestAnimationFrame(frame);
}

function onFirstUserGesture() {
  ensureAudio();
  document.removeEventListener("pointerdown", onFirstUserGesture);
  document.removeEventListener("keydown", onFirstUserGesture);
}

document.addEventListener("pointerdown", onFirstUserGesture);
document.addEventListener("keydown", onFirstUserGesture);

elements.throttleSlider.addEventListener("input", (event) => {
  if (state.blown) {
    return;
  }

  ensureAudio();
  state.throttle = Number(event.target.value);
});

elements.toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tryStateChange(() => {
      const control = button.dataset.control;
      state[control] = button.dataset.value;
    }, button.dataset.control);
  });
});

elements.stickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tryStateChange(() => {
      state.slot = button.dataset.slot;
    }, "slot");
  });
});

elements.neutralButton.addEventListener("click", () => {
  tryStateChange(() => {
    state.slot = "neutral";
  }, "neutral");
});

elements.startButton.addEventListener("click", startEngine);

elements.soundToggle.addEventListener("click", () => {
  ensureAudio();
  state.muted = !state.muted;
  render();
});

elements.resetSim.addEventListener("click", resetSim);
elements.rebuildButton.addEventListener("click", resetSim);
elements.loadDown.addEventListener("click", () => {
  state.loadCars = clamp(state.loadCars - 1, 0, MAX_LOAD_CARS);
  setStatus(state.loadCars === 0 ? "TRAILER EMPTY" : `${state.loadCars} NASCAR${state.loadCars === 1 ? "" : "S"} LOADED`, false, 900);
  render();
});
elements.loadUp.addEventListener("click", () => {
  state.loadCars = clamp(state.loadCars + 1, 0, MAX_LOAD_CARS);
  setStatus(`${state.loadCars} NASCAR${state.loadCars === 1 ? "" : "S"} LOADED`, false, 900);
  render();
});

render();
requestAnimationFrame(frame);
