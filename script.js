
    // Setup renderer and canvas
    const canvas = document.getElementById('solarCanvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Scene and camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 90;

    // Lighting: Sun as point light + ambient light
    const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    // Sun sphere
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(6, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00 })
    );
    scene.add(sun);

    // Planet data
    const planets = [
      { name: 'Mercury', radius: 2, distance: 14, color: 0xb2b2b2, speed: 0.04 },
      { name: 'Venus', radius: 2.4, distance: 18, color: 0xe6c87d, speed: 0.032 },
      { name: 'Earth', radius: 2.8, distance: 23, color: 0x2a75bb, speed: 0.027 },
      { name: 'Mars', radius: 2.5, distance: 28, color: 0xc1440e, speed: 0.022 },
      { name: 'Jupiter', radius: 4.4, distance: 34, color: 0xd9b38c, speed: 0.016 },
      { name: 'Saturn', radius: 4.0, distance: 42, color: 0xf0e68c, speed: 0.013 },
      { name: 'Uranus', radius: 3.6, distance: 50, color: 0xadd8e6, speed: 0.010 },
      { name: 'Neptune', radius: 3.6, distance: 58, color: 0x4169e1, speed: 0.008 },
    ];

    // Controls container
    const controlsDiv = document.getElementById('controls');

    // Store label divs for updating position
    const planetLabels = [];

    // Create planets and labels
    planets.forEach(p => {
      // Planet mesh
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.radius, 32, 32),
        new THREE.MeshStandardMaterial({ color: p.color })
      );
      mesh.position.x = p.distance;
      p.mesh = mesh;
      p.angle = Math.random() * Math.PI * 2; // random start angle
      scene.add(mesh);

      // Speed control slider in UI
      const label = document.createElement('label');
      label.textContent = p.name;
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = 0.001;
      slider.max = 0.05;
      slider.step = 0.001;
      slider.value = p.speed;
      slider.addEventListener('input', () => {
        p.speed = parseFloat(slider.value);
      });
      controlsDiv.appendChild(label);
      controlsDiv.appendChild(slider);

      // Create a label div for planet name (HTML overlay)
      const labelEl = document.createElement('div');
      labelEl.className = 'label';
      labelEl.textContent = p.name;
      document.body.appendChild(labelEl);

      planetLabels.push({ mesh, labelEl, radius: p.radius });
    });

    // Animation control
    let paused = false;

    function animate() {
      requestAnimationFrame(animate);

      if (!paused) {
        planets.forEach(p => {
          p.angle += p.speed;
          p.mesh.position.x = Math.cos(p.angle) * p.distance;
          p.mesh.position.z = Math.sin(p.angle) * p.distance;
        });
      }

      // Update labels position
      planetLabels.forEach(({ mesh, labelEl, radius }) => {
        // Get 3D position above planet (add radius in y-axis)
        const pos = mesh.position.clone();
        pos.y += radius + 0.5; // slightly above the sphere

        // Project to 2D screen space
        const vector = pos.project(camera);
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

        // Set label position with offset for center alignment
        labelEl.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;

        // Optionally hide label if behind camera
        if (vector.z > 1) {
          labelEl.style.display = 'none';
        } else {
          labelEl.style.display = 'block';
        }
      });

      renderer.render(scene, camera);
    }

    animate();

    // Pause / Resume buttons
    document.getElementById('pauseBtn').onclick = () => paused = true;
    document.getElementById('resumeBtn').onclick = () => paused = false;

    // Responsive
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
