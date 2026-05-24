document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const container = document.getElementById('mainContainer');
  const signUpBtn = document.getElementById('signUpTrigger');
  const signInBtn = document.getElementById('signInTrigger');
  
  const signUpForm = document.getElementById('signUpForm');
  const signInForm = document.getElementById('signInForm');
  
  // Password fields and toggles
  const signUpPasswordInput = document.getElementById('signUpPassword');
  const signUpPasswordToggle = document.getElementById('signUpPasswordToggle');
  const signInPasswordInput = document.getElementById('signInPassword');
  const signInPasswordToggle = document.getElementById('signInPasswordToggle');

  // Input groups for validation tracking
  const inputsToValidate = [
    {
      input: document.getElementById('signUpName'),
      group: document.getElementById('signUpNameGroup'),
      validate: (val) => val.trim().length > 0
    },
    {
      input: document.getElementById('signUpEmail'),
      group: document.getElementById('signUpEmailGroup'),
      validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
    },
    {
      input: document.getElementById('signUpPassword'),
      group: document.getElementById('signUpPasswordGroup'),
      validate: (val) => val.length >= 8
    },
    {
      input: document.getElementById('signInEmail'),
      group: document.getElementById('signInEmailGroup'),
      validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
    },
    {
      input: document.getElementById('signInPassword'),
      group: document.getElementById('signInPasswordGroup'),
      validate: (val) => val.length > 0
    }
  ];

  // --- 1. Ambient Mouse Spotlight Effect ---
  // Coordinates default to center of the viewport
  document.body.style.setProperty('--mouse-x', '50%');
  document.body.style.setProperty('--mouse-y', '50%');

  let spotlightThrottled = false;
  document.addEventListener('mousemove', (e) => {
    if (!spotlightThrottled) {
      window.requestAnimationFrame(() => {
        document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
        spotlightThrottled = false;
      });
      spotlightThrottled = true;
    }
  });

  // --- 2. Swipe Panel Controls ---
  signUpBtn.addEventListener('click', () => {
    container.classList.add('right-panel-active');
    // Clear validation styling when switching panels
    clearAllValidations();
  });

  signInBtn.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
    clearAllValidations();
  });

  function clearAllValidations() {
    inputsToValidate.forEach(({ group, input }) => {
      group.classList.remove('error', 'success');
    });
  }

  // --- 3. Password Visibility Toggles ---
  function setupPasswordToggle(toggleElement, inputElement) {
    toggleElement.addEventListener('click', () => {
      const isPassword = inputElement.type === 'password';
      inputElement.type = isPassword ? 'text' : 'password';
      
      const eyeOpen = toggleElement.querySelector('.eye-open');
      const eyeClosed = toggleElement.querySelector('.eye-closed');
      
      if (isPassword) {
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
        toggleElement.style.color = 'var(--accent-cyan)';
      } else {
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
        toggleElement.style.color = 'var(--text-muted)';
      }
    });
  }

  setupPasswordToggle(signUpPasswordToggle, signUpPasswordInput);
  setupPasswordToggle(signInPasswordToggle, signInPasswordInput);

  // --- 4. Live Form Field Validation ---
  inputsToValidate.forEach(({ input, group, validate }) => {
    if (!input) return;

    // Validate on loss of focus
    input.addEventListener('blur', () => {
      // Don't show error immediately if user leaves a completely blank untouched input
      if (input.value === '') {
        group.classList.remove('error', 'success');
        return;
      }
      performFieldValidation(input, group, validate);
    });

    // Clear error style as user begins modifying/correcting values
    input.addEventListener('input', () => {
      if (group.classList.contains('error')) {
        // Re-validate dynamically if in error state to clear it quickly
        if (validate(input.value)) {
          group.classList.remove('error');
          group.classList.add('success');
        }
      } else if (input.value === '') {
        group.classList.remove('error', 'success');
      }
    });
  });

  function performFieldValidation(input, group, validateFn) {
    if (validateFn(input.value)) {
      group.classList.remove('error');
      group.classList.add('success');
      return true;
    } else {
      group.classList.remove('success');
      group.classList.add('error');
      return false;
    }
  }

  // --- 5. Submit Interactions & Micro-animations ---
  function handleFormSubmit(form, submitBtnId, formType) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById(submitBtnId);
      const btnText = submitBtn.querySelector('.btn-text');
      
      // Get all inputs belonging to this specific form
      const formInputs = inputsToValidate.filter(item => form.contains(item.input));
      
      // Perform full synchronous validation sweep
      let isFormValid = true;
      formInputs.forEach(({ input, group, validate }) => {
        const isValid = performFieldValidation(input, group, validate);
        if (!isValid) isFormValid = false;
      });

      if (!isFormValid) {
        // Trigger haptic-like shake on button as physical negative feedback
        submitBtn.style.animation = 'shake 0.3s ease';
        setTimeout(() => {
          submitBtn.style.animation = '';
        }, 300);
        return;
      }

      // Enter loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      btnText.textContent = formType === 'signin' ? 'Syncing grid...' : 'Encrypting keys...';
      
      // Translucent disable inputs to block double-entry
      formInputs.forEach(({ input }) => input.disabled = true);

      // Simulate secure server authorization transaction
      setTimeout(() => {
        // Transition to successful authenticating
        submitBtn.classList.remove('loading');
        submitBtn.classList.add('success');
        btnText.textContent = formType === 'signin' ? 'Access Granted' : 'Account Created';
        
        // Custom visual spotlight expansion sequence
        document.body.style.transition = 'background 0.5s ease';
        document.body.style.setProperty('--mouse-x', '50%');
        document.body.style.setProperty('--mouse-y', '50%');
        
        // Show cosmic success alert overlay
        createSuccessNotification(formType === 'signin' ? 'Welcome Back!' : 'Registration Complete!');

        setTimeout(() => {
          // Reset forms and view after success alert ends
          submitBtn.classList.remove('success');
          btnText.textContent = formType === 'signin' ? 'Sign In' : 'Sign Up';
          submitBtn.disabled = false;
          formInputs.forEach(({ input, group }) => {
            input.disabled = false;
            input.value = '';
            group.classList.remove('success', 'error');
          });
          
          // Re-enable interactive spotlight movement
          document.body.style.transition = '';
        }, 3000);

      }, 2000);
    });
  }

  handleFormSubmit(signInForm, 'signInBtn', 'signin');
  handleFormSubmit(signUpForm, 'signUpBtn', 'signup');

  // --- 6. Immersive Success Overlay Notification ---
  function createSuccessNotification(title) {
    const successOverlay = document.createElement('div');
    successOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(7, 5, 15, 0.95);
      backdrop-filter: blur(20px);
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    `;

    const successCard = document.createElement('div');
    successCard.style.cssText = `
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 40px 60px;
      text-align: center;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 100px rgba(99, 102, 241, 0.15);
      transform: scale(0.9);
      transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
    `;

    // Success Ring & Checkmark
    successCard.innerHTML = `
      <div style="
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(16, 185, 129, 0.1);
        border: 2px solid #10b981;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
        box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
        animation: pulseGlow 2s infinite;
      ">
        <svg fill="none" viewBox="0 0 24 24" stroke="#10b981" stroke-width="3" style="width: 40px; height: 40px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 style="
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 12px;
        background: linear-gradient(to right, #ffffff, var(--accent-cyan));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      ">${title}</h2>
      <p style="
        color: var(--text-muted);
        font-size: 0.95rem;
        max-width: 320px;
        line-height: 1.6;
        margin-bottom: 0;
      ">Quantum authorization synchronization complete. Portal redirection sequence initiated.</p>
      
      <!-- Progress Bar Tracker -->
      <div style="
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 2px;
        margin-top: 30px;
        overflow: hidden;
        position: relative;
      ">
        <div style="
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 0;
          background: linear-gradient(to right, var(--accent-cyan), var(--accent-indigo));
          animation: loadProgress 2.5s forwards linear;
          box-shadow: 0 0 10px var(--accent-cyan);
        "></div>
      </div>
    `;

    // Inject styles for overlay custom animations
    if (!document.getElementById('successOverlayStyles')) {
      const styles = document.createElement('style');
      styles.id = 'successOverlayStyles';
      styles.textContent = `
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
        }
        @keyframes loadProgress {
          to { width: 100%; }
        }
      `;
      document.head.appendChild(styles);
    }

    successOverlay.appendChild(successCard);
    document.body.appendChild(successOverlay);
// develope by piyushSoni
    // Fade-in
    setTimeout(() => {
      successOverlay.style.opacity = '1';
      successCard.style.transform = 'scale(1)';
    }, 50);

    // Auto cleanup and fadeout
    setTimeout(() => {
      successOverlay.style.opacity = '0';
      successCard.style.transform = 'scale(0.9)';
      setTimeout(() => {
        successOverlay.remove();
      }, 500);
    }, 2800);
  }

  // Handle Social Buttons Mock Alert Interaction
  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const label = btn.getAttribute('aria-label');
      createSuccessNotification(`Connecting: ${label.split('with ')[1]}`);
    });
  });

  // --- 7. Interactive 3D Canvas Scene ---
  const canvas3DContainer = document.getElementById('canvas3d');
  if (canvas3DContainer) {
    let scene, camera, renderer, torusKnot, particleSystem;
    let targetX = 0, targetY = 0;
    let mouseX = 0, mouseY = 0;
    
    // Check panel state for active color shifts
    let currentColor = new THREE.Color(0x6366f1); // Indigo
    const cyanColor = new THREE.Color(0x06b6d4); // Cyan
    const pinkColor = new THREE.Color(0xec4899); // Pink

    function init3D() {
      // Create scene
      scene = new THREE.Scene();

      // Camera
      camera = new THREE.PerspectiveCamera(
        45,
        canvas3DContainer.clientWidth / canvas3DContainer.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 24;

      // Renderer
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(canvas3DContainer.clientWidth, canvas3DContainer.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      canvas3DContainer.appendChild(renderer.domElement);

      // Objects: Glowing Torus Knot Mesh
      const geometry = new THREE.TorusKnotGeometry(4.2, 1.2, 120, 16);
      const material = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        wireframe: true,
        roughness: 0.1,
        metalness: 0.9,
        emissive: 0x111030
      });
      torusKnot = new THREE.Mesh(geometry, material);
      scene.add(torusKnot);

      // Floating Particle Field
      const particlesCount = 180;
      const particlesGeom = new THREE.BufferGeometry();
      const positions = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i += 3) {
        // Distribute in a spherical cloud around the Torus Knot
        const radius = 7 + Math.random() * 8;
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
      }

      particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particlesMat = new THREE.PointsMaterial({
        size: 0.08,
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });

      particleSystem = new THREE.Points(particlesGeom, particlesMat);
      scene.add(particleSystem);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const pointLightCyan = new THREE.PointLight(0x06b6d4, 2.5, 50);
      pointLightCyan.position.set(10, 10, 10);
      scene.add(pointLightCyan);

      const pointLightPurple = new THREE.PointLight(0xa855f7, 2.5, 50);
      pointLightPurple.position.set(-10, -10, 10);
      scene.add(pointLightPurple);
      
      const frontLight = new THREE.PointLight(0xffffff, 1, 100);
      frontLight.position.set(0, 0, 20);
      scene.add(frontLight);

      // Start Animating
      animate();
    }

    // Capture mouse moves inside canvas container coordinates
    document.addEventListener('mousemove', (e) => {
      // Calculate normalized coordinates (-0.5 to 0.5) relative to screen center
      mouseX = (e.clientX - window.innerWidth / 2) * 0.002;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.002;
    });

    function animate() {
      requestAnimationFrame(animate);

      // Smooth camera/object tilting based on mouse coordinate vectors (Lerp)
      targetX += (mouseX - targetX) * 0.08;
      targetY += (mouseY - targetY) * 0.08;

      if (torusKnot) {
        // Continuous smooth auto-rotation
        torusKnot.rotation.y += 0.006;
        torusKnot.rotation.z += 0.002;

        // Apply interactive mouse displacement tilting
        torusKnot.rotation.x = targetY * 1.5;
        torusKnot.rotation.y += targetX * 0.1;
        
        // Dynamically morph color depending on the panel swipe state
        const isSignUpActive = container.classList.contains('right-panel-active');
        const targetColor = isSignUpActive ? pinkColor : cyanColor;
        currentColor.lerp(targetColor, 0.05);
        torusKnot.material.color.copy(currentColor);
        
        // Particle mesh slow spin
        if (particleSystem) {
          particleSystem.rotation.y -= 0.002;
          particleSystem.rotation.x = -targetY * 0.5;
          particleSystem.material.color.copy(currentColor);
        }
      }

      renderer.render(scene, camera);
    }

    // Responsive adaptation on resizing window
    window.addEventListener('resize', () => {
      if (!camera || !renderer) return;
      camera.aspect = canvas3DContainer.clientWidth / canvas3DContainer.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas3DContainer.clientWidth, canvas3DContainer.clientHeight);
    });

    // Handle mobile view container dimensions changes (where dimensions can jump)
    const resizeObserver = new ResizeObserver(() => {
      if (!camera || !renderer) return;
      camera.aspect = canvas3DContainer.clientWidth / canvas3DContainer.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas3DContainer.clientWidth, canvas3DContainer.clientHeight);
    });
    resizeObserver.observe(canvas3DContainer);

    // Run initialization
    init3D();
  }
});
