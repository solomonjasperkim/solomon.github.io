import * as THREE from './libs/three.module.js';

// Vertex shader code
const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 0.4);
}
`;

// Fragment shader code
const fragmentShader = `
precision highp float;

uniform sampler2D grainTex;
uniform sampler2D blurTex;
uniform float time;
uniform float seed;
uniform vec3 back;
uniform float style;
uniform float param1;
uniform float param2;
uniform float param3;

varying vec2 vUv;

#define PI 3.141592653589793

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 10.0) * x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float snoise01(vec2 v) {
  return (1.0 + snoise(v)) * 0.5;
}

float noise2d(vec2 st) {
  return snoise01(vec2(st.x + time * 0.02, st.y - time * 0.04 + seed));
}

float pattern(vec2 p) {
  vec2 q = vec2(noise2d(p + vec2(0.0, 0.0)), noise2d(p + vec2(5.2, 1.3)));
  vec2 r = vec2(noise2d(p + 4.0 * q + vec2(1.7, 9.2)), noise2d(p + 4.0 * q + vec2(8.3, 2.8)));
  return noise2d(p + 1.0 * r);
}

void main() {
  vec2 uv = vUv;
  vec2 p = gl_FragCoord.xy;
  uv = style > 0.0 ? ceil(uv * 50.0) / 50.0 : uv;
  vec3 grainColor = texture2D(grainTex, mod(p * param1 * 5.0, 1024.0) / 1024.0).rgb;
  float blurAlpha = texture2D(blurTex, uv).a;
  float gr = pow(grainColor.r * 1.0, 1.5) + 0.5 * (1.0 - blurAlpha);
  float gg = grainColor.g;
  float ax = param2 * gr * cos(gg * 2.0 * PI);
  float ay = param2 * gr * sin(gg * 2.0 * PI);
  float ndx = 1.0 * 1.0 * param3 + 0.1 * (1.0 - blurAlpha);
  float ndy = 2.0 * 1.0 * param3 + 0.1 * (1.0 - blurAlpha);
  float nx = uv.x * ndx + ax;
  float ny = uv.y * ndy + ay;
  float n = pattern(vec2(nx, ny));
  n = pow(n * 1.05, 6.0);
  n = smoothstep(0.0, 1.0, n);

  // Create wave-like animation for opacity
  float opacity = 0.5 + 0.5 * sin(time + uv.y * 10.0);

  // Create gradient wave of black shadows moving around
  float shadowWaveX = 0.5 + 0.5 * sin(time * 0.5 + uv.x * 10.0);
  float shadowWaveY = 0.5 + 0.5 * cos(time * 0.5 + uv.y * 10.0);
  float shadowEffect = shadowWaveX * shadowWaveY;
  vec3 shadowColor = mix(vec3(0.0), vec3(1.0), shadowEffect);

  vec3 front = vec3(0.5);
  vec3 result = mix(back, front * shadowColor, n);
  gl_FragColor = vec4(result, opacity * blurAlpha);
}
`;

// Initialize the Three.js scene
function init() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    const grainTexture = new THREE.TextureLoader().load('./src/grain.webp', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearFilter;
    });

    const blurTexture = new THREE.TextureLoader().load('./src/blur.webp', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearFilter;
    });

    const uniforms = {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        grainTex: { value: grainTexture },
        blurTex: { value: blurTexture },
        seed: { value: Math.random() * 1000 },
        back: { value: new THREE.Color(0x000000) },
        style: { value: 0.0 },
        param1: { value: 1.0 },
        param2: { value: 1.0 },
        param3: { value: 1.0 }
    };

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });

    const plane = new THREE.PlaneGeometry(2, 2);
    const background = new THREE.Mesh(plane, material);
    scene.add(background);

    const animate = function () {
        requestAnimationFrame(animate);
        uniforms.time.value += 0.01; // Update time for animation
        renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    });
}

init();
