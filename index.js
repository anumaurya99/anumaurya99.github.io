/* ── CURSOR ─────────────────────────────────────────── */
const cur = document.getElementById('cur');
const ring = document.getElementById('ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function loop() {
    rx += (mx - rx) * .16;
    ry += (my - ry) * .16;
    cur.style.left = mx + 'px';
    cur.style.top = my + 'px';
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
})();

document.querySelectorAll('a, .srv-card, .wi').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cur.style.width = '12px';
        cur.style.height = '12px';
        ring.style.width = '52px';
        ring.style.height = '52px';
    });
    el.addEventListener('mouseleave', () => {
        cur.style.width = '7px';
        cur.style.height = '7px';
        ring.style.width = '34px';
        ring.style.height = '34px';
    });
});

/* ── REVEAL ON SCROLL ───────────────────────────────── */
const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('vis');
            io.unobserve(e.target);
        }
    });
}, { threshold: .1 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ══════════════════════════════════════════════════════
   THREE.JS — ISOMETRIC MOVIE-SET DIORAMA
   ══════════════════════════════════════════════════════ */
(function () {
    const canvas = document.getElementById('studio-canvas');
    if (!canvas) return;

    const W = window.innerWidth, H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    const scene = new THREE.Scene();

    const cam = new THREE.PerspectiveCamera(35, W / H, 0.1, 60);
    cam.position.set(9, 7, 9);
    cam.lookAt(1.5, 1, 1.5);

    /* lights — original warm studio */
    scene.add(new THREE.HemisphereLight(0xffe8c0, 0x2a1e0a, 1.8));

    const key = new THREE.DirectionalLight(0xfff5dc, 2.5);
    key.position.set(-4, 8, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    key.shadow.camera.near   = 0.5;
    key.shadow.camera.far    = 30;
    key.shadow.camera.left   = -6;
    key.shadow.camera.right  = 8;
    key.shadow.camera.top    = 8;
    key.shadow.camera.bottom = -4;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xc8a96e, 1.2);
    rim.position.set(5, 4, -4);
    scene.add(rim);

    const monGlow = new THREE.PointLight(0x4080ff, 1.5, 3);
    monGlow.position.set(2.6, 2.0, -0.8);
    scene.add(monGlow);

    /* materials — original warm dark studio */
    const lam = c => new THREE.MeshLambertMaterial({ color: c });

    const mFloor    = lam(0x2a2318);
    const mFloorAlt = lam(0x241f14);
    const mBackdrop = lam(0x222018);
    const mMetal    = lam(0x3a3528);
    const mMetalBt  = lam(0x4a4035);
    const mGold     = lam(0xc8a96e);
    const mRubber   = lam(0x0e0c08);
    const mCamBody  = lam(0x1e1b12);
    const mGreen    = lam(0x2a4a2a);
    const mPotClay  = lam(0x5a3a28);
    const mChair    = lam(0x1a3050);
    const mChairFr  = lam(0x2a2318);
    const mCrate    = lam(0x4a3a22);
    const mTape     = lam(0xc8a96e);
    const mScreen   = new THREE.MeshLambertMaterial({ color: 0x101828, emissive: 0x1040a0, emissiveIntensity: 1.0 });
    const mLens     = new THREE.MeshLambertMaterial({ color: 0x080c14, emissive: 0x0a1020, emissiveIntensity: 0.3, transparent: true, opacity: 0.85 });
    const mCable    = lam(0x100e08);

    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent = scene) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        m.rotation.set(rx, ry, rz);
        m.castShadow = true;
        m.receiveShadow = true;
        parent.add(m);
        return m;
    };

    /* floor */
    for (let i = 0; i < 6; i++) {
        add(new THREE.BoxGeometry(1, 0.08, 6), i % 2 === 0 ? mFloor : mFloorAlt, i, 0, 1.5);
    }


    /* backdrop */
    add(new THREE.BoxGeometry(3.5, 0.015, 2.5), mBackdrop, 1.25, 0.05, 0.3);
    add(new THREE.BoxGeometry(3.5, 3.2, 0.06), mBackdrop, 1.25, 1.6, -0.38);

    add(new THREE.BoxGeometry(0.45, 0.012, 0.045), mTape, 1.2, 0.055, 0.7, 0,  0.44);
    add(new THREE.BoxGeometry(0.45, 0.012, 0.045), mTape, 1.2, 0.055, 0.7, 0, -0.44);

    /* tripod */
    const tripG = new THREE.Group();
    tripG.position.set(1.0, 0, 0.7);
    scene.add(tripG);

    [0, Math.PI * 2 / 3, Math.PI * 4 / 3].forEach(a => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.018, 1.8, 7), mMetal);
        leg.position.set(Math.sin(a) * 0.4, 0.55, Math.cos(a) * 0.4);
        leg.rotation.set(0, a, 0.38);
        leg.castShadow = true;
        tripG.add(leg);
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.042, 7, 7), mRubber);
        foot.position.set(Math.sin(a) * 0.71, 0.04, Math.cos(a) * 0.71);
        tripG.add(foot);
    });

    add(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 10), mMetalBt, 0, 1.45, 0, 0, 0, 0, tripG);
    add(new THREE.BoxGeometry(0.2, 0.12, 0.14), mMetal, 0, 2.17, 0, 0, 0, 0, tripG);
    add(new THREE.BoxGeometry(0.15, 0.04, 0.12), mGold,  0, 2.25, 0, 0, 0, 0, tripG);

    /* camera body */
    const camG = new THREE.Group();
    camG.position.set(0, 2.6, 0);
    tripG.add(camG);

    add(new THREE.BoxGeometry(0.85, 0.54, 0.46), mCamBody, 0, 0, 0, 0, 0, 0, camG);
    add(new THREE.BoxGeometry(0.32, 0.2,  0.42), mRubber,  0.19, 0.35, 0, 0, 0, 0, camG);
    add(new THREE.BoxGeometry(0.24, 0.15, 0.4),  mCamBody, -0.07, 0.34, 0, 0, 0, 0, camG);
    add(new THREE.CylinderGeometry(0.18, 0.2, 0.62, 16), mRubber, 0.69, 0, 0, 0, 0, Math.PI / 2, camG);
    add(new THREE.TorusGeometry(0.185, 0.016, 9, 22), mGold, 0.82, 0, 0, 0, Math.PI / 2, 0, camG);
    add(new THREE.CircleGeometry(0.15, 16), mLens, 0.8, 0, 0, 0, Math.PI / 2, 0, camG);
    add(new THREE.BoxGeometry(0.013, 0.34, 0.25), mScreen, -0.44, 0, 0, 0, -0.32, 0, camG);
    add(new THREE.BoxGeometry(0.16, 0.035, 0.12), mGold, -0.07, 0.3, 0, 0, 0, 0, camG);



    /* director's chair */
    const dc = new THREE.Group();
    dc.position.set(2.8, 0, 0.8);
    dc.rotation.y = -0.6;
    scene.add(dc);

    [[-0.18, 0], [0.18, 0], [-0.18, 0.24], [0.18, 0.24]].forEach(([x, z], i) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 8), mChairFr);
        leg.position.set(x, 0.5, z);
        leg.rotation.z = i % 2 === 0 ? 0.27 : -0.27;
        dc.add(leg);
    });

    add(new THREE.BoxGeometry(0.5, 0.036, 0.28), mChair,   0, 0.57, 0.12, 0, 0, 0, dc);
    add(new THREE.BoxGeometry(0.5, 0.44,  0.03), mChair,   0, 1.1,  0,    0, 0, 0, dc);
    add(new THREE.BoxGeometry(0.034, 0.034, 0.3), mChairFr, -0.24, 0.82, 0.12, 0, 0, 0, dc);
    add(new THREE.BoxGeometry(0.034, 0.034, 0.3), mChairFr,  0.24, 0.82, 0.12, 0, 0, 0, dc);
    add(new THREE.BoxGeometry(0.3, 0.04, 0.01),  mGold,    0, 1.24, 0.015, 0, 0, 0, dc);

    /* monitor on stand */
    const mon = new THREE.Group();
    mon.position.set(2.5, 0, -0.2);
    scene.add(mon);

    [0, Math.PI * 2 / 3, Math.PI * 4 / 3].forEach(a => {
        const l = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.01, 0.9, 7), mMetal);
        l.position.set(Math.sin(a) * 0.26, 0.32, Math.cos(a) * 0.26);
        l.rotation.set(0, a, 0.31);
        mon.add(l);
    });

    add(new THREE.CylinderGeometry(0.016, 0.016, 2.8, 9), mMetal,   0, 1.4,  0, 0, 0, 0, mon);
    add(new THREE.CylinderGeometry(0.012, 0.012, 0.48, 8), mMetalBt, -0.13, 2.86, 0, 0, 0, Math.PI / 2, mon);

    const monB = new THREE.Group();
    monB.position.set(-0.36, 2.86, 0);
    monB.rotation.y = 0.25;
    mon.add(monB);
    add(new THREE.BoxGeometry(0.42, 0.26, 0.045), mRubber, 0, 0, 0,     0, 0, 0, monB);
    add(new THREE.BoxGeometry(0.36, 0.21, 0.016), mScreen,  0, 0, 0.024, 0, 0, 0, monB);


    /* prop table */
    const pt = new THREE.Group();
    pt.position.set(3.8, 0, -0.3);
    scene.add(pt);

    add(new THREE.BoxGeometry(1.0, 0.042, 0.62), mCrate, 0, 0.78, 0, 0, 0, 0, pt);
    [[-0.45, -0.26], [0.45, -0.26], [-0.45, 0.26], [0.45, 0.26]].forEach(([x, z]) => {
        add(new THREE.BoxGeometry(0.05, 0.78, 0.05), mCrate, x, 0.39, z, 0, 0, 0, pt);
    });
    add(new THREE.BoxGeometry(0.3,  0.11, 0.19), mRubber,  -0.2, 0.83,  0, 0, 0, 0, pt);
    add(new THREE.BoxGeometry(0.26, 0.07, 0.15), mGold,    -0.2, 0.855, 0, 0, 0, 0, pt);
    add(new THREE.CylinderGeometry(0.055, 0.055, 0.12, 12), mMetalBt, 0.28, 0.84, 0.04, 0, 0, 0, pt);

    /* crates */
    add(new THREE.BoxGeometry(0.65, 0.55, 0.55), mCrate,   4.5, 0.3,  -0.1);
    add(new THREE.BoxGeometry(0.55, 0.45, 0.55), mCrate,   4.5, 0.78,  0.1, 0, 0.3, 0);
    add(new THREE.BoxGeometry(0.655, 0.03, 0.025), mMetalBt, 4.5, 0.08, -0.1);
    add(new THREE.BoxGeometry(0.655, 0.03, 0.025), mMetalBt, 4.5, 0.5,  -0.1);

    /* plant */
    const plant = new THREE.Group();
    plant.position.set(4.6, 0, 1.5);
    scene.add(plant);
    add(new THREE.CylinderGeometry(0.18, 0.22, 0.36, 12), mPotClay, 0, 0.2, 0, 0, 0, 0, plant);
    [[0, 0.55, 0], [0.15, 0.7, 0.1], [-0.12, 0.65, 0.08], [0.05, 0.75, -0.12]].forEach(([x, y, z]) => {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.15, 7, 7), mGreen);
        s.scale.set(0.8, 0.7, 0.8);
        s.position.set(x, y, z);
        plant.add(s);
    });

    /* cables */
    [
        [[-0.3, 0.014, 0.5],  [0.3, 0.014, 0.65], [0.9, 0.014, 0.7]],
        [[3.5, 0.014, 2.8],   [2.8, 0.014, 2.0],  [1.6, 0.014, 1.2], [1.1, 0.014, 0.8]],
        [[2.5, 0.014, -0.2],  [2.0, 0.014, 0.3],  [1.4, 0.014, 0.7]]
    ].forEach(pts => {
        const curve = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
        const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.01, 5, false), mCable);
        m.receiveShadow = true;
        scene.add(m);
    });

    /* dust particles */
    const pn = 40, pp = new Float32Array(pn * 3);
    for (let i = 0; i < pn; i++) {
        pp[i * 3]     = Math.random() * 5.5;
        pp[i * 3 + 1] = 0.5 + Math.random() * 3.5;
        pp[i * 3 + 2] = Math.random() * 4 - 0.5;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    scene.add(new THREE.Points(pg, new THREE.PointsMaterial({
        color: 0xffeebb, size: 0.028, transparent: true, opacity: 0.35
    })));

    /* animate */
    let mouseX = 0, mouseY = 0, scroll = 0, t = 0;
    const BASE = new THREE.Vector3(9, 7, 9);
    const LOOK = new THREE.Vector3(1.5, 1, 1.5);

    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('scroll', () => { scroll = window.scrollY; });

    window.addEventListener('resize', () => {
        cam.aspect = window.innerWidth / window.innerHeight;
        cam.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        t += 0.006;

        const scrollT = Math.min(scroll / window.innerHeight, 1);

        cam.position.x = BASE.x + mouseX * 0.18 + Math.sin(t * 0.4) * 0.06;
        cam.position.y = BASE.y - mouseY * 0.12 + Math.sin(t * 0.3) * 0.04 - scrollT * 0.8;
        cam.position.z = BASE.z + mouseX * 0.06;
        cam.lookAt(LOOK.x + mouseX * 0.05, LOOK.y - mouseY * 0.03, LOOK.z);

        renderer.render(scene, cam);
    }

    animate();
})();
