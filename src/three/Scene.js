import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';
import { PROJECTS } from '../data/projects.js';

// Custom Chromatic Aberration Shader
const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.0015 },
    angle: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float angle;
    varying vec2 vUv;
    void main() {
      vec2 offset = amount * vec2(cos(angle), sin(angle));
      vec4 cr = texture2D(tDiffuse, vUv + offset);
      vec4 cga = texture2D(tDiffuse, vUv);
      vec4 cb = texture2D(tDiffuse, vUv - offset);
      gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
    }
  `
};

export class GalleryScene {
  constructor(container) {
    this.container = container;
    this.setupScene();
    this.createGrid();
    this.setupInteraction();
    this.bindEvents();

    this.isTransitioning = false;
    this.scrollTarget = 0;
    this.scrollCurrent = 0;

    this.animate = this.animate.bind(this);
    this.animate();
  }

  setupScene() {
    this.isMobile = window.innerWidth < 600;
    this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1 : 1.5));

    this.renderer.shadowMap.enabled = !this.isMobile;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfafafa); // Set opaque background for proper glass transmission

    // ESER MİKTAR exact FOV and Perspective (Low FOV for telefoto effect)
    this.camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(1, 12, 10); // Higher Y and closer Z for the ESER MİKTAR look // BURASI

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(-5, 10, 5);
    this.scene.add(dirLight);

    // Setup Post Processing (Desktop only for performance)
    if (!this.isMobile) {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 0.1, 0.4, 0.85);
      this.composer.addPass(bloomPass);
    }

    this.clock = new THREE.Clock();

    this.resize();
  }

  createGrid() {
    this.group = new THREE.Group();

    // ESER MİKTAR exact tilt and perspective (Bottom-left to Top-right cascade) // BURASI
    this.group.rotation.x = -0.45; // Kartların geriye doğru yatması (Distant cards go up)
    this.group.rotation.y = -0.39; // Derinliğin sağa doğru gitmesi (Distant cards go right)
    this.group.rotation.z = 0.05;  // Ufak bir düzeltme açısı

    // Center adjustment // BURASI
    this.group.position.x = -1.0; // Başlangıç noktasını sola al
    this.group.position.y = -0.9; // Başlangıç noktasını aşağı al

    this.scene.add(this.group);

    this.tiles = [];
    const loader = new THREE.TextureLoader();
    // BURASI
    const TILE_WIDTH = 2.8;
    const TILE_HEIGHT = 3.9;
    const THICKNESS = 0.05; // Daha zarif olması için tekrar yarıya düşürüldü
    const STEP_Z = 2.1;

    // Kasıyor sorununu çözmek için obje sayısı azaltıldı (54 -> 36).
    // Yeni wrap mantığıyla 36 obje sonsuz döngü için fazlasıyla yeterli.
    const REPEAT = 4;
    let globalIndex = 0;

    // Plane yerine BoxGeometry kullanarak gerçek hacim sağlıyoruz
    const boxGeo = new THREE.BoxGeometry(TILE_WIDTH, TILE_HEIGHT, THICKNESS);

    // Daha zarif beyaz kenar ışığı (Kartın sınırları)
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      opacity: 0.15 // Çok daha temiz ve ince bir cam çerçevesi
    });

    for (let r = 0; r < REPEAT; r++) {
      PROJECTS.forEach((proj) => {
        // Görsel materyali - Mobilde daha hafif bir material kullanıyoruz
        let imageMat;
        if (this.isMobile) {
          imageMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.95,
            roughness: 0.1,
            metalness: 0.1
          });
        } else {
          imageMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
            transmission: 0.5,
            roughness: 0.05,
            metalness: 0.0,
            ior: 1.45,
            thickness: THICKNESS,
            envMapIntensity: 1.0
          });
        }

        // Yan yüzeyler - Mobilde basit şeffaf material
        let sideMat;
        if (this.isMobile) {
          sideMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1
          });
        } else {
          sideMat = new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff, 
            transparent: true,
            opacity: 0.2,
            transmission: 1.0, 
            roughness: 0.0,
            metalness: 0.0,
            ior: 1.45,
            thickness: THICKNESS,
          });
        }

        // BoxGeometry için 6 yüzeyin materyalleri
        const materials = [
          sideMat, // +x
          sideMat, // -x
          sideMat, // +y
          sideMat, // -y
          imageMat, // +z (ÖN YÜZ)
          sideMat  // -z
        ];

        const mesh = new THREE.Mesh(boxGeo, materials);
        mesh.frustumCulled = false; 

        // CSS Glowing Border efektini ekle
        const edgeLines = new THREE.LineSegments(edgesGeo, edgesMat);
        edgeLines.frustumCulled = false;
        mesh.add(edgeLines);

        // SAĞ ALT'a proje ismi etiketi
        const labelMesh = this.createTextLabel(proj.title, TILE_WIDTH, TILE_HEIGHT, THICKNESS);
        labelMesh.frustumCulled = false;
        mesh.add(labelMesh);

        mesh.position.set(0, 0, -(globalIndex * STEP_Z));

        this.group.add(mesh);

        const tileObj = {
          mesh,
          imageMesh: mesh,
          imageMat,
          sideMat, // Yan yüzeylerin opacity kontrolü için
          labelMesh,
          proj,
          index: globalIndex,
          hoverX: 0 // Hover animasyonu için eklendi
        };

        this.tiles.push(tileObj);

        if (proj.coverImage) {
          loader.load(proj.coverImage, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.minFilter = THREE.LinearFilter;
            tex.generateMipmaps = false;

            const imgAspect = tex.image.width / tex.image.height;
            if (imgAspect > 1.0) {
              tex.repeat.set(1.0 / imgAspect, 1);
              tex.offset.set((1 - 1.0 / imgAspect) / 2, 0);
            } else {
              tex.repeat.set(1, imgAspect);
              tex.offset.set(0, (1 - imgAspect) / 2);
            }

            imageMat.map = tex;
            imageMat.needsUpdate = true;
          });
        }

        globalIndex++;
      });
    }

    this.maxScroll = this.tiles.length - 1;
    this.STEP_Z = STEP_Z;
  }

  createTextLabel(text, tileW, tileH, thickness) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 64;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '300 28px -apple-system, Helvetica Neue, Arial, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right'; // Metni sağa daya
    ctx.fillText(text, canvas.width - 24, canvas.height / 2); // Sağdan 24px boşluk bırak

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Etiket genişliğini kartla aynı yapıp hizalamayı canvas içinde çözüyoruz
    const labelW = tileW;
    const labelH = labelW * (canvas.height / canvas.width);
    const labelGeo = new THREE.PlaneGeometry(labelW, labelH);
    const labelMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthTest: true, // Sahne derinliğine saygı duysun, objelerin arkasında kalabilsin
      depthWrite: false, // Saydam objelerde derinlik yazmayı kapatmak çakışmayı önler
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);

    // Sağ alt köşe (X ekseninde ortalı, Y'de en altta)
    labelMesh.position.set(
      0,
      -(tileH / 2) + (labelH / 2) + 0.15,
      0.01 // Kartın hemen önünde
    );

    return labelMesh;
  }

  setupInteraction() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.hoveredProj = null;

    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (this.isTransitioning) return;

      const speed = e.deltaY * 0.005;
      this.scrollTarget += speed;
    }, { passive: false });

    // Touch support for mobile scrolling
    let touchStartY = 0;
    this.container.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    this.container.addEventListener('touchmove', (e) => {
      if (this.isTransitioning) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      this.scrollTarget += deltaY * 0.02; // Touch scroll sensitivity
      touchStartY = touchY;
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      const label = document.getElementById('cursor-label');
      if (label) {
        label.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    this.container.addEventListener('click', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      // Recursive: false yapıyoruz ki labelMesh gibi alt elemanlar ışını engellemesin
      const hits = this.raycaster.intersectObjects(this.tiles.map(t => t.imageMesh), false);
      if (hits.length > 0) {
        const validHits = hits.filter(h => {
          const worldPos = new THREE.Vector3();
          h.object.getWorldPosition(worldPos);
          return worldPos.z < this.camera.position.z && h.object.parent.visible;
        });

        if (validHits.length > 0) {
          const hitTile = this.tiles.find(t => t.imageMesh === validHits[0].object);
          if (hitTile) {
            window.dispatchEvent(new CustomEvent('project-click', { detail: hitTile.proj }));
          }
        }
      }
    });
  }

  updateCursorLabel() {
    // Her frame'de raycaster ateşle — scroll sırasında da label güncellensin
    // Recursive: false yapıyoruz ki kartın üzerindeki çizgiler ve yazılar tıklamayı/hover'ı bozmasin
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.tiles.map(t => t.imageMesh), false);

    let hoveredTile = null;
    let hoveredProj = null;
    if (hits.length > 0) {
      // Sadece görünür olan ve kameranın makul bir mesafesinde olanları al
      const validHits = hits.filter(h => h.object.visible && h.distance > 0.1);
      if (validHits.length > 0) {
        const hit = this.tiles.find(t => t.mesh === validHits[0].object);
        if (hit) {
          hoveredProj = hit.proj;
          hoveredTile = hit;
        }
      }
    }

    this.hoveredProj = hoveredProj;
    this.hoveredTile = hoveredTile;
    const label = document.getElementById('cursor-label');
    if (hoveredProj && label) {
      label.textContent = hoveredProj.title;
      label.classList.add('visible');
    } else if (label) {
      label.classList.remove('visible');
    }
  }

  bindEvents() {
    this._onResize = this.resize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (this.composer) this.composer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    requestAnimationFrame(this.animate);

    // Look at center to maintain correct perspective
    this.camera.lookAt(0, 0, 0);

    const elapsedTime = this.clock.getElapsedTime();

    // Daha yumuşak scroll lerp — premium his
    this.scrollCurrent += (this.scrollTarget - this.scrollCurrent) * 0.06;

    // Her frame'de cursor label ve hover bilgisini GÜNCELLE
    // (Bunu döngüden önce yapıyoruz ki hoverX gecikmesiz çalışsın)
    this.updateCursorLabel();

    // Proje sayısını dinamik alarak sonsuz döngü matematiğini sağlama alıyoruz
    const projectCount = PROJECTS.length; 
    const totalTiles = this.tiles.length; 
    
    this.tiles.forEach(tile => {
      let distIndex = tile.index - this.scrollCurrent;

      // Kusursuz infinite döngü:
      // Eğer bir kart kamerayı iyice geçtiyse (örn: 6 birim geride kaldıysa)
      // Onu dizinin en arkasına atıyoruz (görünmez olduğu için atladığı fark edilmez)
      while (distIndex < -6) {
        distIndex += totalTiles;
      }
      // Ters yöne kaydırıyorsak, arkadakileri öne alıyoruz
      while (distIndex > totalTiles - 6) {
        distIndex -= totalTiles;
      }

      // Move tiles along Z axis using the recycled distIndex
      const localZ = -distIndex * this.STEP_Z;

      // Daha organik ve zarif drift — her kartın kendi faz kayması var
      const phase = tile.index * 1.7;
      const driftY = Math.sin(elapsedTime * 0.3 + phase) * 0.06;
      let driftX = Math.cos(elapsedTime * 0.25 + phase) * 0.04;
      const driftRotZ = Math.sin(elapsedTime * 0.2 + phase) * 0.003;

      // Mouse Hover Pop-out efekti (Sağa doğru çıkma)
      const isHovered = (this.hoveredTile === tile);
      // Kullanıcı isteği: Mouse üzerine gelince kartlar biraz daha açığa çıksın (0.8 -> 1.8)
      const targetHoverX = isHovered ? 1.8 : 0;
      tile.hoverX += (targetHoverX - tile.hoverX) * 0.1; // Lerp ile yumuşak geçiş

      driftX += tile.hoverX; // Hover değerini X pozisyonuna ekle

      tile.mesh.position.set(driftX, driftY, localZ);
      tile.mesh.rotation.z = driftRotZ;

      // Opacity management — daha geniş fade zone
      let targetOpacity = 1;

      if (distIndex < -2.5) {
        // Kameradan İYİCE GEÇTİKTEN SONRA fade (Hemen yok olmasını engeller, en az 2.5 birim bekle)
        targetOpacity = Math.max(0, 1 - Math.abs(distIndex + 2.5) * 1.5);
      }
      else if (distIndex > 15) {
        // Çok uzaktakiler — daha geç fade
        targetOpacity = Math.max(0, 1 - (distIndex - 15) * 0.15);
      }

      // Daha yumuşak opacity geçişleri
      const lerpSpeed = 0.08;
      tile.imageMat.opacity += (targetOpacity - tile.imageMat.opacity) * lerpSpeed;
      
      // Yan yüzeylerin de aynı anda sönmesini sağlıyoruz
      if (tile.sideMat) {
        tile.sideMat.opacity += (targetOpacity - tile.sideMat.opacity) * lerpSpeed;
      }

      // Label opacity da aynı şekilde fade olsun
      if (tile.labelMesh) {
        tile.labelMesh.material.opacity += (targetOpacity - tile.labelMesh.material.opacity) * lerpSpeed;
      }

      // Set visibility for performance based on ACTUAL opacity, not target opacity!
      // This prevents the mesh from instantly disappearing while it's still fading out.
      tile.mesh.visible = tile.imageMat.opacity > 0.005;
    });

    // Render via composer on desktop, direct render on mobile for performance
    if (this.isMobile) {
      this.renderer.render(this.scene, this.camera);
    } else {
      this.composer.render();
    }
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
    this.container.innerHTML = '';
  }
}
