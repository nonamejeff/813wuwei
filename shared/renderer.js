// WebGL renderer module - handles canvas, shaders, textures, and rendering

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform sampler2D u_image;
  uniform vec2 u_res;
  uniform float u_fidelity;
  uniform float u_time;
  uniform float u_seed;
  uniform vec2 u_tex_res;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  vec2 randUnitVec(vec2 p) {
    float a = hash12(p) * 6.28318530718;
    return vec2(cos(a), sin(a));
  }

  float luminance(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
  }

  vec3 adjustSaturation(vec3 c, float sat) {
    float l = luminance(c);
    return mix(vec3(l), c, sat);
  }

  void main() {
    vec2 p = gl_FragCoord.xy;
    float f = clamp(u_fidelity, 0.0, 1.0);
    float n = 1.0 - f;
    float motion = log2(1.0 + 7.0 * n) / log2(8.0);

    // Add instability at high fidelity
    float instability = 0.0;
    if (f > 0.85) {
      // High fidelity = unstable jitter
      instability = (f - 0.85) / 0.15;  // 0 at 0.85, 1 at 1.0
      float jitterSeed = u_seed + floor(u_time * 30.0);
      float jitter = (hash12(p + jitterSeed) - 0.5) * instability * 0.03;
      // Apply micro-displacement at high fidelity
      p += jitter * 10.0;
    }

    if (f < 0.02) {
      float r = hash12(p + u_seed * 17.0 + floor(u_time * 60.0));
      float g = hash12(p + u_seed * 31.0 + floor(u_time * 60.0) + 11.0);
      float b = hash12(p + u_seed * 47.0 + floor(u_time * 60.0) + 23.0);
      gl_FragColor = vec4(vec3(r, g, b), 1.0);
      return;
    }

    float maxRadius = min(u_res.x, u_res.y) * 0.35;
    float radiusPx = mix(0.0, maxRadius, pow(motion, 1.4));
    float timeAmp = pow(motion, 1.15);
    float t = u_time * (4.0 + 12.0 * timeAmp);
    vec2 timeDir = randUnitVec(p + u_seed * 2.0 + vec2(t, t * 1.3));
    float timeMag = radiusPx * 0.1 * timeAmp;

    vec2 sampleP = p + timeDir * timeMag;
    vec2 uv = sampleP / u_res;
    float screenAspect = u_res.x / u_res.y;
    float texAspect = u_tex_res.x / u_tex_res.y;
    vec2 coverScale = vec2(1.0);
    if (screenAspect > texAspect) {
      coverScale.y = screenAspect / texAspect;
    } else {
      coverScale.x = texAspect / screenAspect;
    }
    uv = (uv - 0.5) / coverScale + 0.5;
    uv = clamp(uv, 0.0, 1.0);

    vec2 texel = uv * u_tex_res;
    float zoneSize = mix(1.0, 12.0, pow(motion, 1.3));
    vec2 zone = floor(texel / zoneSize);
    vec2 zoneDir = randUnitVec(zone + u_seed * 3.7);
    float zoneMag = radiusPx * (0.6 + 0.4 * hash12(zone + u_seed * 9.1));

    vec2 microDir = randUnitVec(texel + u_seed * 13.3);
    float microMag = radiusPx * 0.25 * hash12(texel + zone * 7.7 + u_seed * 5.5);

    vec2 offsetPx = zoneDir * zoneMag + microDir * microMag;
    vec2 sampleUv = (sampleP + offsetPx) / u_res;
    sampleUv = (sampleUv - 0.5) / coverScale + 0.5;
    sampleUv = clamp(sampleUv, 0.0, 1.0);

    vec3 col = texture2D(u_image, sampleUv).rgb;
    float sat = mix(1.0, 0.2, pow(motion, 1.1));
    col = adjustSaturation(col, sat);

    float j = (hash12(texel + u_seed * 101.0 + t) - 0.5) * 0.2 * pow(motion, 1.1);
    col = clamp(col + j, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

class WebGLRenderer {
  constructor(canvasId = "field") {
    this.canvas = null;
    this.gl = null;
    this.glProgram = null;
    this.glUniforms = null;
    this.glBuffers = null;
    this.targetTexture = null;
    this.targetCanvas = null;
    this.targetCtx = null;
    this.frameCounter = 0;
    this.noiseSeed = 1;
    this.fidelity = 0;

    this.screenSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.initCanvas(canvasId);
    this.initTargetCanvas();
  }

  initCanvas(canvasId) {
    const canvasElement = document.getElementById(canvasId);
    if (canvasElement) {
      this.canvas = canvasElement;
      this.gl = this.canvas.getContext("webgl");
      this.setupEventListeners();
    }
  }

  initTargetCanvas() {
    this.targetCanvas = document.createElement("canvas");
    this.targetCtx = this.targetCanvas.getContext("2d");
    this.targetCanvas.width = 512;
    this.targetCanvas.height = 512;
  }

  setupEventListeners() {
    if (this.canvas) {
      window.addEventListener("resize", () => this.resize());
      this.resize();
    }
  }

  resize() {
    if (!this.canvas) return;

    this.screenSize.width = window.innerWidth;
    this.screenSize.height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    const nextWidth = Math.max(1, Math.floor(this.screenSize.width * dpr));
    const nextHeight = Math.max(1, Math.floor(this.screenSize.height * dpr));

    if (this.canvas.width !== nextWidth || this.canvas.height !== nextHeight) {
      this.canvas.width = nextWidth;
      this.canvas.height = nextHeight;
    }

    this.canvas.style.width = `${this.screenSize.width}px`;
    this.canvas.style.height = `${this.screenSize.height}px`;
  }

  createShader(type, source) {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compile failed: ${info}`);
    }
    return shader;
  }

  createProgram(vertexSource, fragmentSource) {
    if (!this.gl) return null;

    const program = this.gl.createProgram();
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Program link failed: ${info}`);
    }

    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);
    return program;
  }

  initWebGL() {
    if (!this.gl || this.glProgram) {
      return;
    }

    this.glProgram = this.createProgram(VERTEX_SHADER, FRAGMENT_SHADER);
    this.glUniforms = {
      position: this.gl.getAttribLocation(this.glProgram, "a_position"),
      image: this.gl.getUniformLocation(this.glProgram, "u_image"),
      resolution: this.gl.getUniformLocation(this.glProgram, "u_res"),
      fidelity: this.gl.getUniformLocation(this.glProgram, "u_fidelity"),
      time: this.gl.getUniformLocation(this.glProgram, "u_time"),
      seed: this.gl.getUniformLocation(this.glProgram, "u_seed"),
      textureResolution: this.gl.getUniformLocation(this.glProgram, "u_tex_res")
    };

    this.glBuffers = {
      quad: this.gl.createBuffer()
    };

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glBuffers.quad);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      this.gl.STATIC_DRAW
    );

    this.targetTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.targetTexture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

    this.updateTargetTexture();
  }

  updateTargetTexture() {
    if (!this.gl || !this.targetTexture) {
      return;
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.targetTexture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.targetCanvas
    );
  }

  setTargetCanvasSize(width, height) {
    const nextWidth = Math.max(1, Math.floor(width));
    const nextHeight = Math.max(1, Math.floor(height));
    if (this.targetCanvas.width === nextWidth && this.targetCanvas.height === nextHeight) {
      return;
    }
    this.targetCanvas.width = nextWidth;
    this.targetCanvas.height = nextHeight;
  }

  drawTargetToCanvas(image) {
    this.setTargetCanvasSize(image.width, image.height);
    this.targetCtx.clearRect(0, 0, this.targetCanvas.width, this.targetCanvas.height);
    this.targetCtx.drawImage(image, 0, 0);
    this.updateTargetTexture();
  }

  clearTargetCanvas() {
    this.setTargetCanvasSize(512, 512);
    this.targetCtx.clearRect(0, 0, this.targetCanvas.width, this.targetCanvas.height);
    this.updateTargetTexture();
  }

  motionCurve(value) {
    return Math.log2(1 + 7 * value) / Math.log2(8);
  }

  renderFrame(time = 0, onRenderData = null) {
    if (!this.gl) {
      return;
    }
    this.initWebGL();

    const noiseAmount = 1 - this.fidelity;
    const timeAmp = this.motionCurve(noiseAmount);
    const regime =
      this.fidelity < 0.1
        ? "COLLAPSE"
        : this.fidelity < 0.5
          ? "SCRAMBLE"
          : this.fidelity < 0.8
            ? "CONVERGE"
            : "UNSTABLE";

    const renderData = {
      motion: timeAmp.toFixed(3),
      regime,
      entropy: noiseAmount.toFixed(3),
      coherence: this.fidelity.toFixed(3),
      flow: "true"
    };

    if (onRenderData) {
      onRenderData(renderData);
    }

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.useProgram(this.glProgram);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glBuffers.quad);
    this.gl.enableVertexAttribArray(this.glUniforms.position);
    this.gl.vertexAttribPointer(this.glUniforms.position, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.targetTexture);
    this.gl.uniform1i(this.glUniforms.image, 0);
    this.gl.uniform2f(this.glUniforms.resolution, this.canvas.width, this.canvas.height);
    this.gl.uniform1f(this.glUniforms.fidelity, this.fidelity);
    this.gl.uniform1f(this.glUniforms.time, time * 0.001);
    this.gl.uniform1f(this.glUniforms.seed, this.noiseSeed);
    this.gl.uniform2f(
      this.glUniforms.textureResolution,
      this.targetCanvas.width,
      this.targetCanvas.height
    );

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    this.frameCounter += 1;
  }

  startRenderLoop(onRenderData = null) {
    const loop = (time) => {
      this.renderFrame(time, onRenderData);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  setFidelity(value) {
    this.fidelity = Math.max(0, Math.min(1, value));
  }

  bumpSeed() {
    this.noiseSeed = (this.noiseSeed + 1) % 10000;
  }

  getTargetCanvas() {
    return this.targetCanvas;
  }
}

export { WebGLRenderer };
