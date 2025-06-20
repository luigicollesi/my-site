'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';

type ThreeSceneProps = {
  scale?: number;
  redirectUrl?: string;
};

export default function ThreeScene({ scale = 1.5, redirectUrl }: ThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  const [hover, setHover] = useState(false);

    useEffect(() => {
        if (!mountRef.current) return;
        const mount = mountRef.current;

        const width = mount.clientWidth;
        const height = mount.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        mount.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(3, 5, 5);
        scene.add(dirLight);

        const loader = new GLTFLoader();

        let head: THREE.Object3D | null = null;
        const mouse = { x: 0, y: 0 };

        // --- raycaster para clique ---
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        loader.load(
            '/models/head.glb',
            gltf => {
                const model = gltf.scene;
                model.scale.setScalar(scale);

                // Inclinação inicial padrão
                model.rotation.x = 0.20;
                model.rotation.z = 0;

                // Recentraliza o pivô
                const box = new THREE.Box3().setFromObject(model);
                const center = new THREE.Vector3();
                box.getCenter(center);
                model.position.sub(center);

                // Grupo para rotação
                const pivot = new THREE.Group();
                pivot.add(model);
                scene.add(pivot);
                head = pivot;

                // Aplica material azul neon nos meshes
                model.traverse(child => {
                    if ((child as THREE.Mesh).isMesh) {
                        const mesh = child as THREE.Mesh;

                        // Material azul-marinho preenchido
                        const solidMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color('#001f3f'),
                            metalness: 1.0,
                            roughness: 0.15,
                            emissive: new THREE.Color('#003d66'),
                            emissiveIntensity: 1.5,
                            toneMapped: false
                        });

                        mesh.material = solidMaterial;

                        // Nova técnica: contornos por malha com EdgesGeometry
                        const edges = new THREE.EdgesGeometry(mesh.geometry);
                        const lineMat = new THREE.LineBasicMaterial({
                            color: '#00ffff',
                            linewidth: 1,
                            toneMapped: false,
                            transparent: true,
                            opacity: 1.0,
                            depthTest: true
                        });
                        const edgeLines = new THREE.LineSegments(edges, lineMat);
                        edgeLines.renderOrder = 999; // render após o mesh
                        mesh.add(edgeLines);         // adiciona como filho do mesh para posicionamento
                    }
                });

                // Centraliza a câmera
                const size = box.getSize(new THREE.Vector3()).length();
                camera.position.set(0, 0, size * 1.2);
                camera.lookAt(new THREE.Vector3(0, 0, 0));
            },
            undefined,
            error => {
                console.error('❌ Erro ao carregar modelo:', error);
            }
        );

        const animate = () => {
            requestAnimationFrame(animate);

            // Aplica rotação da cabeça com base na posição do mouse
            if (head) {
            const rotationY = THREE.MathUtils.clamp(mouse.x * Math.PI * 0.5, -Math.PI / 4, Math.PI / 4); // +/- 45°
            const rotationX = THREE.MathUtils.clamp(mouse.y * Math.PI * 0.3, -Math.PI / 6, Math.PI / 6); // +/- 30°
            head.rotation.y = rotationY;
            head.rotation.x = rotationX;
            }

            renderer.render(scene, camera);
        };
        animate();

        const onMouseMove = (event: MouseEvent) => {
            mouse.x = (event.clientX / width - 0.5) * 2;
            mouse.y = (event.clientY / height - 0.5) * 2;

            if (!head) return;
            const rect = mount.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const hit = raycaster.intersectObject(head, true).length > 0;

            setHover(hit);
        };
        window.addEventListener('mousemove', onMouseMove);

        const onTouchMove = (event: TouchEvent) => {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            mouse.x = (touch.clientX / width - 0.5) * 2;
            mouse.y = (touch.clientY / height - 0.5) * 2;
        }
        };
        window.addEventListener('touchmove', onTouchMove, { passive: true });

        const handleResize = () => {
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            mount.removeChild(renderer.domElement);
        };
    }, [scale]);

  return (
    <div className="relative w-full h-screen pointer-events-auto" ref={mountRef}>
        {hover && redirectUrl && (
        <a
            href={redirectUrl}
            rel="noopener noreferrer"
            className="absolute top-0 left-0 w-full h-full z-10"
            style={{ display: 'block' }}
        >
            {/* Link invisível que ativa o preview de URL no canto inferior esquerdo */}
        </a>
        )}
    </div>
  );
}
