declare const THREE: any;

let scene: any, camera: any, renderer: any, sealGroup: any;
let targetRotationX = 0;
let targetRotationY = 0;

export function initThreeScene(): void {
  const container = document.getElementById('three-canvas-container');
  if (!container) return;
  if (typeof THREE === 'undefined') {
    console.warn('Three.js chưa được tải từ CDN');
    return;
  }

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  // 1. Scene & Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 2.2, 8.5);

  // 2. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // 3. Ánh sáng
  const ambientLight = new THREE.AmbientLight(0xfff0db, 0.95);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffd599, 1.8);
  mainLight.position.set(5, 10, 7);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const rimLight = new THREE.PointLight(0xb22222, 2.6, 20);
  rimLight.position.set(-6, -2, -4);
  scene.add(rimLight);

  const goldGlow = new THREE.PointLight(0xe5a93c, 1.6, 15);
  goldGlow.position.set(0, 3, 2);
  scene.add(goldGlow);

  // 4. Dựng khối 3D Ấn Tín Hoa Sen
  sealGroup = new THREE.Group();

  const redLacquerMat = new THREE.MeshStandardMaterial({
    color: 0x9b1b1b,
    roughness: 0.25,
    metalness: 0.35,
    clearcoat: 0.85,
    clearcoatRoughness: 0.2
  });

  const goldBrassMat = new THREE.MeshStandardMaterial({
    color: 0xe5a93c,
    roughness: 0.3,
    metalness: 0.85
  });

  const jadeGreenMat = new THREE.MeshStandardMaterial({
    color: 0x2c5e50,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.92
  });

  // Đế vuông Kim Bảo
  const baseGeo = new THREE.BoxGeometry(3.2, 0.9, 3.2);
  const baseMesh = new THREE.Mesh(baseGeo, redLacquerMat);
  baseMesh.position.y = -0.45;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  sealGroup.add(baseMesh);

  // Vành viền đồng
  const rimGeo = new THREE.BoxGeometry(3.35, 0.15, 3.35);
  const rimMesh = new THREE.Mesh(rimGeo, goldBrassMat);
  rimMesh.position.y = -0.85;
  sealGroup.add(rimMesh);

  const rimGeoTop = new THREE.BoxGeometry(3.3, 0.1, 3.3);
  const rimMeshTop = new THREE.Mesh(rimGeoTop, goldBrassMat);
  rimMeshTop.position.y = 0.05;
  sealGroup.add(rimMeshTop);

  // Đài sen
  const lotusBaseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.45, 24);
  const lotusBaseMesh = new THREE.Mesh(lotusBaseGeo, goldBrassMat);
  lotusBaseMesh.position.y = 0.3;
  sealGroup.add(lotusBaseMesh);

  // 8 Cánh sen
  const petalCount = 8;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const petalGeo = new THREE.ConeGeometry(0.55, 1.1, 5);
    petalGeo.scale(1, 0.4, 1.8);
    const petalMesh = new THREE.Mesh(petalGeo, redLacquerMat);
    petalMesh.position.set(Math.cos(angle) * 1.35, 0.5, Math.sin(angle) * 1.35);
    petalMesh.rotation.y = -angle;
    petalMesh.rotation.x = 0.45;
    sealGroup.add(petalMesh);
  }

  // Núm ấn & Búp sen ngọc
  const knobPillarGeo = new THREE.CylinderGeometry(0.75, 1.0, 1.2, 16);
  const knobPillar = new THREE.Mesh(knobPillarGeo, goldBrassMat);
  knobPillar.position.y = 1.0;
  sealGroup.add(knobPillar);

  const budGeo = new THREE.SphereGeometry(0.9, 16, 16);
  budGeo.scale(0.85, 1.35, 0.85);
  const budMesh = new THREE.Mesh(budGeo, jadeGreenMat);
  budMesh.position.y = 1.85;
  sealGroup.add(budMesh);

  const tipGeo = new THREE.ConeGeometry(0.2, 0.5, 8);
  const tipMesh = new THREE.Mesh(tipGeo, goldBrassMat);
  tipMesh.position.y = 2.6;
  sealGroup.add(tipMesh);

  // Bụi vàng bay lơ lửng
  const particleCount = 50;
  const particleGeo = new THREE.BufferGeometry();
  const posArray = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 8;
    posArray[i + 1] = (Math.random() - 0.5) * 6 + 1;
    posArray[i + 2] = (Math.random() - 0.5) * 8;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.08,
    color: 0xe5a93c,
    transparent: true,
    opacity: 0.75
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  sealGroup.add(particleSystem);

  sealGroup.position.y = -0.2;
  scene.add(sealGroup);

  // Tương tác chuột / touch xoay parallax
  function onPointerMove(e: MouseEvent | TouchEvent) {
    const clientX = ('clientX' in e ? e.clientX : e.touches?.[0]?.clientX) || 0;
    const clientY = ('clientY' in e ? e.clientY : e.touches?.[0]?.clientY) || 0;
    const normX = (clientX / window.innerWidth) * 2 - 1;
    const normY = -(clientY / window.innerHeight) * 2 + 1;
    targetRotationY = normX * 0.9;
    targetRotationX = -normY * 0.4;
  }
  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });

  window.addEventListener('resize', () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    if (sealGroup) {
      sealGroup.rotation.y += 0.007;
      sealGroup.rotation.y += (targetRotationY - sealGroup.rotation.y * 0.1) * 0.03;
      sealGroup.rotation.x += (targetRotationX - sealGroup.rotation.x) * 0.04;
      sealGroup.position.y = -0.2 + Math.sin(elapsedTime * 1.5) * 0.1;
    }

    renderer.render(scene, camera);
  }
  animate();
}
