// Fonction pour créer un avion en papier 3D
function createPaperPlane() {
    const plane = new THREE.Group();
    
    // Matériau blanc pour l'avion en papier
    const paperMaterial = new THREE.MeshPhongMaterial({
        color: 0xf5f5f5,
        shininess: 30,
        flatShading: false
    });

    // Corps principal de l'avion (triangle central)
    const bodyGeometry = new THREE.BufferGeometry();
    const bodyVertices = new Float32Array([
        // Face avant
        0, 0, 2,      // Nez
        -0.3, 0, -1.5,  // Arrière gauche
        0.3, 0, -1.5,   // Arrière droit
        
        // Face arrière (épaisseur)
        0, 0.05, 2,
        -0.3, 0.05, -1.5,
        0.3, 0.05, -1.5,
    ]);
    
    const bodyIndices = [
        // Face avant
        0, 1, 2,
        // Face arrière
        3, 5, 4,
        // Côtés
        0, 3, 4, 0, 4, 1,
        2, 5, 3, 2, 3, 0,
        1, 4, 5, 1, 5, 2
    ];
    
    bodyGeometry.setAttribute('position', new THREE.BufferAttribute(bodyVertices, 3));
    bodyGeometry.setIndex(bodyIndices);
    bodyGeometry.computeVertexNormals();
    
    const body = new THREE.Mesh(bodyGeometry, paperMaterial);
    plane.add(body);

    // Aile gauche
    const leftWingGeometry = new THREE.BufferGeometry();
    const leftWingVertices = new Float32Array([
        // Aile gauche pliée
        -0.3, 0, 0,     // Point central
        -2, 0, -0.5,    // Bout de l'aile
        -0.5, 0, -1.5,  // Arrière de l'aile
        
        -0.3, 0.02, 0,
        -2, 0.15, -0.5,
        -0.5, 0.02, -1.5,
    ]);
    
    const wingIndices = [
        0, 1, 2,
        3, 5, 4,
        0, 3, 4, 0, 4, 1,
        2, 5, 3, 2, 3, 0,
        1, 4, 5, 1, 5, 2
    ];
    
    leftWingGeometry.setAttribute('position', new THREE.BufferAttribute(leftWingVertices, 3));
    leftWingGeometry.setIndex(wingIndices);
    leftWingGeometry.computeVertexNormals();
    
    const leftWing = new THREE.Mesh(leftWingGeometry, paperMaterial);
    plane.add(leftWing);

    // Aile droite (miroir de l'aile gauche)
    const rightWingGeometry = new THREE.BufferGeometry();
    const rightWingVertices = new Float32Array([
        0.3, 0, 0,
        2, 0, -0.5,
        0.5, 0, -1.5,
        
        0.3, 0.02, 0,
        2, 0.15, -0.5,
        0.5, 0.02, -1.5,
    ]);
    
    rightWingGeometry.setAttribute('position', new THREE.BufferAttribute(rightWingVertices, 3));
    rightWingGeometry.setIndex(wingIndices);
    rightWingGeometry.computeVertexNormals();
    
    const rightWing = new THREE.Mesh(rightWingGeometry, paperMaterial);
    plane.add(rightWing);

    // Stabilisateurs arrière (petits)
    const tailGeometry = new THREE.ConeGeometry(0.15, 0.3, 3);
    const tail = new THREE.Mesh(tailGeometry, paperMaterial);
    tail.rotation.x = Math.PI / 2;
    tail.position.set(0, 0.1, -1.5);
    plane.add(tail);

    // Ombres portées
    plane.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    return plane;
}

// Fonction pour initialiser une scène 3D dans un conteneur
function initThreeScene(containerId, createObjectFunc) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scène
    const scene = new THREE.Scene();
    
    // Caméra
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4, 3, 5);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-3, 2, -3);
    scene.add(backLight);

    // Créer l'objet 3D
    const object = createObjectFunc();
    scene.add(object);

    // Animation
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotation de l'objet
        object.rotation.y += 0.005;
        object.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
        
        renderer.render(scene, camera);
    }
    animate();

    // Gestion du redimensionnement
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });

    return { scene, camera, renderer, object };
}

// Initialisation après le chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser l'avion en papier dans le premier placeholder
    initThreeScene('three-plane', createPaperPlane);
});
