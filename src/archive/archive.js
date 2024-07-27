import * as THREE from '../libs/three.module.js';

// Vertex shader code as a string
const vertexShader = `
void main() {
    gl_Position = vec4(position, 1.0);
}
`;

// Fragment shader code as a string
const fragmentShader = `
uniform float time;
uniform vec2 resolution;

float random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 20.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Scale the UV coordinates to get very fine details
    vec2 uvMove = uv * 100.0 + vec2(0.0, time * 0.02);
    float n = noise(uvMove);

    // Create finer details by reducing the influence of additional noise layers
    float detail1 = noise(uvMove * 2.0 + time * 0.5) * 0.5;
    float detail2 = noise(uvMove * 4.0 + time * 0.7) * 0.25;
    float detail3 = noise(uvMove * 8.0 + time * 0.9) * 0.125;

    // Combine the noise layers
    float combinedNoise = n + detail1 + detail2 + detail3;

    // Adjust colors to look like stardust
    vec3 stardustColor = vec3(combinedNoise * 1.2, combinedNoise * 1.0, combinedNoise * 1.4);
    stardustColor *= smoothstep(0.4, 0.6, combinedNoise);

    gl_FragColor = vec4(stardustColor, 1.0);
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

    const uniforms = {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
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
        uniforms.time.value += 0.01; // Slower animation for more elegance
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
