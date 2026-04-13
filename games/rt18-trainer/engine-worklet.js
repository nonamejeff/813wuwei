class DieselEngineProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "rpm", defaultValue: 650, minValue: 0, maxValue: 3000, automationRate: "k-rate" },
      { name: "throttle", defaultValue: 0, minValue: 0, maxValue: 1, automationRate: "k-rate" },
      { name: "engine_on", defaultValue: 1, minValue: 0, maxValue: 1, automationRate: "k-rate" },
      { name: "road_speed", defaultValue: 0, minValue: 0, maxValue: 1, automationRate: "k-rate" },
    ];
  }

  constructor() {
    super();
    this.phase = 0;
    this.huntPhase = 0;
    this.engineEnergy = 1;
    this.cycleJitter = 1;
    this.noiseState = 0;
    this.lowState = 0;
    this.bodyState = 0;
    this.bodySlow = 0;
    this.clatterState = 0;
    this.airState = 0;
    this.seed = 22222;
  }

  random() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  process(_inputs, outputs, parameters) {
    const output = outputs[0][0];
    if (!output) {
      return true;
    }

    for (let index = 0; index < output.length; index += 1) {
      const rpm = parameters.rpm.length > 1 ? parameters.rpm[index] : parameters.rpm[0];
      const throttle = parameters.throttle.length > 1 ? parameters.throttle[index] : parameters.throttle[0];
      const engineOn = parameters.engine_on.length > 1 ? parameters.engine_on[index] : parameters.engine_on[0];
      const roadSpeed = parameters.road_speed.length > 1 ? parameters.road_speed[index] : parameters.road_speed[0];

      this.engineEnergy += (engineOn - this.engineEnergy) * 0.004;

      const idleBlend = (1 - throttle) * Math.max(0, 1 - rpm / 1500);
      this.huntPhase += (0.45 + idleBlend * 1.6) / sampleRate;
      if (this.huntPhase >= 1) {
        this.huntPhase -= 1;
      }

      const hunt =
        Math.sin(this.huntPhase * Math.PI * 2) * 0.05 * idleBlend +
        Math.sin(this.huntPhase * Math.PI * 2 * 2.7) * 0.018 * idleBlend;

      const fireFrequency = Math.max(0, (rpm / 60) * 3 * (1 + hunt));
      if (fireFrequency > 0.1) {
        this.phase += (fireFrequency * this.cycleJitter) / sampleRate;
        if (this.phase >= 1) {
          this.phase -= 1;
          this.cycleJitter = 1 + (this.random() - 0.5) * (0.09 * idleBlend + 0.02);
        }
      }

      const cycle = Math.max(0, 1 - this.phase);
      const combustion = Math.pow(cycle, 7);
      const knock = Math.pow(cycle, 18);
      const whiteNoise = this.random() * 2 - 1;
      this.noiseState = (this.noiseState * 0.94) + (whiteNoise * 0.06);

      const lowTarget = combustion * (0.95 + throttle * 0.28) * this.engineEnergy;
      this.lowState += (lowTarget - this.lowState) * 0.13;

      const bodyTarget =
        (combustion * 0.62 + knock * 0.18) * (0.55 + throttle * 0.35) * this.engineEnergy +
        this.noiseState * 0.06;
      this.bodyState += (bodyTarget - this.bodyState) * 0.34;
      this.bodySlow += (bodyTarget - this.bodySlow) * 0.06;
      const bodyBand = this.bodyState - this.bodySlow;

      const clatterTarget =
        this.noiseState *
        (0.024 + knock * (0.42 + throttle * 0.12) + Math.min(rpm / 3000, 1) * 0.08) *
        this.engineEnergy;
      this.clatterState += (clatterTarget - this.clatterState) * 0.52;

      const airTarget =
        whiteNoise *
        (0.008 + throttle * throttle * 0.16 + roadSpeed * 0.03) *
        (0.45 + this.engineEnergy * 0.55);
      this.airState += (airTarget - this.airState) * (0.06 + throttle * 0.14);

      const low = this.lowState * 0.9;
      const body = bodyBand * 0.85;
      const clatter = this.clatterState * 0.55;
      const air = this.airState;

      let sample = low + body + clatter + air;
      sample *= 0.82 + throttle * 0.18;

      output[index] = Math.tanh(sample * 1.9);
    }

    return true;
  }
}

registerProcessor("diesel-engine-processor", DieselEngineProcessor);
