         // Run
         (() => {
            const container = document.getElementById('galaxy-scene');
            
            // Scene, camera, renderer
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
            camera.position.set(0, 3, 8);
            
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setClearColor(0x000000);
            container.appendChild(renderer.domElement);
            
            // Galaxy params
            const params = {
                count: 30000,
                size: 0.02,
                radius: 5,
                branches: 5,
                spin: 1,
                randomness: 0.5,
                randomnessPower: 3,
                insideColor: 0xff6030,
                outsideColor: 0x1b3984,
                rotationSpeed: 0.2
            };
            
            // Connect sliders
            document.getElementById('stars-count').addEventListener('input', function() {
                params.count = parseInt(this.value);
                generateGalaxy();
            });
            
            document.getElementById('branches').addEventListener('input', function() {
                params.branches = parseInt(this.value);
                generateGalaxy();
            });
            
            document.getElementById('spin').addEventListener('input', function() {
                params.spin = parseFloat(this.value);
                generateGalaxy();
            });
            
            document.getElementById('radius').addEventListener('input', function() {
                params.radius = parseFloat(this.value);
                generateGalaxy();
            });
            
            document.getElementById('randomness').addEventListener('input', function() {
                params.randomness = parseFloat(this.value);
                generateGalaxy();
            });
            
            document.getElementById('rotation-speed').addEventListener('input', function() {
                params.rotationSpeed = parseFloat(this.value);
            });
            
            // Generate galaxy
            let geometry = null;
            let material = null;
            let points = null;
            
            const generateGalaxy = () => {
                // Dispose of old galaxy
                if (points !== null) {
                    geometry.dispose();
                    material.dispose();
                    scene.remove(points);
                }
                
                // New geometry
                geometry = new THREE.BufferGeometry();
                
                const positions = new Float32Array(params.count * 3);
                const colors = new Float32Array(params.count * 3);
                
                const colorInside = new THREE.Color(params.insideColor);
                const colorOutside = new THREE.Color(params.outsideColor);
                
                for (let i = 0; i < params.count; i++) {
                    const i3 = i * 3;
                    
                    // Position
                    const radius = Math.random() * params.radius;
                    const spinAngle = radius * params.spin;
                    const branchAngle = (i % params.branches) / params.branches * Math.PI * 2;
                    
                    const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
                    const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
                    const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
                    
                    positions[i3    ] = Math.cos(branchAngle + spinAngle) * radius + randomX;
                    positions[i3 + 1] = randomY;
                    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
                    
                    const mixedColor = colorInside.clone();
                    mixedColor.lerp(colorOutside, radius / params.radius);
                    
                    colors[i3    ] = mixedColor.r;
                    colors[i3 + 1] = mixedColor.g;
                    colors[i3 + 2] = mixedColor.b;
                }
                
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                
                // Material
                material = new THREE.PointsMaterial({
                    size: params.size,
                    sizeAttenuation: true,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending,
                    vertexColors: true
                });
                
                // Points
                points = new THREE.Points(geometry, material);
                scene.add(points);
            };
            
            generateGalaxy();
            
            // Controls
            let isDragging = false;
            let previousMousePosition = {
                x: 0,
                y: 0
            };
            
            container.addEventListener('mousedown', (e) => {
                isDragging = true;
                
                previousMousePosition = {
                    x: e.clientX,
                    y: e.clientY
                };
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                
                const deltaMove = {
                    x: e.clientX - previousMousePosition.x,
                    y: e.clientY - previousMousePosition.y
                };
                
                if (container.contains(e.target) || container.contains(document.elementFromPoint(e.clientX, e.clientY))) {
                    points.rotation.y += deltaMove.x * 0.005;
                    points.rotation.x += deltaMove.y * 0.005;
                }
                
                previousMousePosition = {
                    x: e.clientX,
                    y: e.clientY
                };
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
            
            // Zooming camera
            container.addEventListener('wheel', (e) => {
                e.preventDefault();
                
                camera.position.z += e.deltaY * 0.01;
                camera.position.z = Math.max(2, Math.min(15, camera.position.z));
            });
            
            // Color change interval evry 2,5 sec
            //TOOOODO smoothen transition required when changing colors
           //TOODOOO increase color mix variations and intensity
            setInterval(() => {
                params.insideColor = new THREE.Color(
                    Math.random(), 
                    Math.random(), 
                    Math.random()
                ).getHex();
                
                params.outsideColor = new THREE.Color(
                    Math.random() * 0.5, 
                    Math.random() * 0.5, 
                    Math.random() * 0.5 + 0.5
                ).getHex();
                
                generateGalaxy();
            }, 2500);
            
            // Animation
            const animate = () => {
                requestAnimationFrame(animate);
                
                if (points) {
                    points.rotation.y += params.rotationSpeed * 0.002;
                }
                
                renderer.render(scene, camera);
            };
            
            animate();
            
            // Resize handler
            window.addEventListener('resize', () => {
                const width = container.clientWidth;
                const height = container.clientHeight;
                
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                
                renderer.setSize(width, height);
            });
        })();
  