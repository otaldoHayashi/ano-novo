import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
// THREE.ColorManagement.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);
new OrbitControls(camera, renderer.domElement);
const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg"),
  specularMap: loader.load("./textures/02_earthspec1k.jpg"),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
});
// material.map.colorSpace = THREE.SRGBColorSpace;
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'),
  // alphaTest: 0.3,
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

const stars = getStarfield({numStars: 2000});
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

function animate() {
  requestAnimationFrame(animate);

  earthMesh.rotation.y += 0.002;
  lightsMesh.rotation.y += 0.002;
  cloudsMesh.rotation.y += 0.0023;
  glowMesh.rotation.y += 0.002;
  stars.rotation.y -= 0.0002;
  renderer.render(scene, camera);
}

animate();

import { FontLoader } from 'jsm/loaders/FontLoader.js';
import { TextGeometry } from 'jsm/geometries/TextGeometry.js';

// Carregar fonte para o texto
const fontLoader = new FontLoader();
fontLoader.load(
  'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
  (font) => {
    // Criar geometria do texto
    const textGeometry = new TextGeometry('Feliz Ano Novo!', {
      font: font,
      size: 0.3, // Tamanho do texto
      height: 0.05, // Espessura do texto
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 5,
    });

    // Centralizar a geometria
    textGeometry.computeBoundingBox(); // Calcular os limites da geometria
    const boundingBox = textGeometry.boundingBox;
    const xOffset = -(boundingBox.max.x - boundingBox.min.x) / 2; // Centralizar no eixo X
    const yOffset = -(boundingBox.max.y - boundingBox.min.y) / 2; // Centralizar no eixo Y
    const zOffset = -(boundingBox.max.z - boundingBox.min.z) / 2; // Centralizar no eixo Z
    textGeometry.translate(xOffset, yOffset, zOffset);

    // Material do texto
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 }); // Dourado
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Posicionar o texto acima da Terra
    const textHeight = 1.5; // Altura acima da Terra
    textMesh.position.set(0, textHeight, 0); // Posição exata acima do planeta

    // Adicionar o texto à cena
    scene.add(textMesh);

    // Animação para girar o texto em torno de si mesmo (opcional)
    function animateText() {
      requestAnimationFrame(animateText);
      textMesh.rotation.y += 0.01; // Velocidade de rotação
    }
    animateText();
  }
);

// Criar sistema de partículas para fogos de artifício
const fireworksGroup = new THREE.Group();
scene.add(fireworksGroup);

function createFirework() {
  const particleCount = 100; // Número de partículas
  const radius = 0.2; // Raio inicial
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3); // Cada partícula tem x, y, z
  const colors = new Float32Array(particleCount * 3); // Cada partícula tem cor r, g, b

  // Gerar posições e cores das partículas
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2; // Ângulo aleatório
    const distance = Math.random() * radius; // Distância inicial

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const z = (Math.random() - 0.5) * radius;

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Cores aleatórias
    colors[i * 3 + 0] = Math.random();
    colors[i * 3 + 1] = Math.random();
    colors[i * 3 + 2] = Math.random();
  }

  particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );
  particlesGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
  );

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.05, // Tamanho das partículas
    vertexColors: true,
    transparent: true,
    opacity: 1,
  });

  const particles = new THREE.Points(particlesGeometry, particleMaterial);

  // Posicionar os fogos em uma área ao redor da Terra
  const maxDistance = 5; // Distância máxima dos fogos em relação ao centro
  particles.position.set(
    (Math.random() - 0.5) * maxDistance, // Posição aleatória no eixo X
    (Math.random() - 0.5) * maxDistance, // Posição aleatória no eixo Y
    (Math.random() - 0.5) * maxDistance  // Posição aleatória no eixo Z
  );

  fireworksGroup.add(particles);

  // Animação para expandir as partículas
  const explosionSpeed = 0.05;
  let lifeTime = 2; // Duração em segundos
  const animateFirework = () => {
    if (lifeTime > 0) {
      requestAnimationFrame(animateFirework);
      particlesGeometry.attributes.position.array.forEach((_, idx) => {
        const i = Math.floor(idx / 3);
        const dir = particlesGeometry.attributes.position.array[i * 3 + idx % 3];
        particlesGeometry.attributes.position.array[idx] += dir * explosionSpeed;
      });
      particlesGeometry.attributes.position.needsUpdate = true;
      lifeTime -= 0.01; // Reduzir vida útil
    } else {
      fireworksGroup.remove(particles); // Remover partícula após a explosão
      particlesGeometry.dispose();
      particleMaterial.dispose();
    }
  };
  animateFirework();
}

// Função para criar fogos periodicamente em toda a cena
setInterval(() => {
  createFirework();
}, 300); // Criar fogos a cada 300ms
