'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader, MeshSurfaceSampler } from 'three-stdlib';

type ThreeSceneProps = {
  scale?: number;
  redirectUrl?: string;
  modelPath?: string;
  containerClassName?: string;
  nameYOffset?: number;
  cameraDistanceFactor?: number;
};

export default function ThreeScene({
  scale = 1.5,
  redirectUrl,
  modelPath = '/models/head.glb',
  containerClassName = 'relative w-full h-screen pointer-events-auto',
  nameYOffset,
  cameraDistanceFactor,
}: ThreeSceneProps) {
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
    let interactTarget: THREE.Object3D | null = null;
    const mouse = { x: 0, y: 0 };

    // --- raycaster para hover/click ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const isNameModel = modelPath.endsWith('name.glb');
    const isHeadModel = modelPath.endsWith('head.glb');

    // Fragmentação exclusiva para name.glb
    const fragmentSamplePositions: THREE.Vector3[] = [];
    const fragmentSampleNormals: THREE.Vector3[] = [];
    const localHitPoint = new THREE.Vector3();
    const targetHitPoint = new THREE.Vector3();
    const tmpDirection = new THREE.Vector3();
    const tmpPosition = new THREE.Vector3();
    const instanceTransform = new THREE.Object3D();

    let hasHitPoint = false;
    let fragmentInfluence = 0;
    let fragmentRadius = 0.35;
    let fragmentBurst = 0.12;
    let fragmentBaseScale = 0.02;
    let fragmentInstances: THREE.InstancedMesh | null = null;
    let voidInstances: THREE.InstancedMesh | null = null;
    const extraVoidLayers: THREE.InstancedMesh[] = [];

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        model.scale.setScalar(scale);

        // Inclinação inicial padrão
        model.rotation.x = 0.2;
        model.rotation.z = 0;

        // Recentraliza o pivô
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);

        // Grupo para rotação
        const pivot = new THREE.Group();
        pivot.add(model);
        if (isNameModel) {
          // Sobe o modelo de nome para ficar mais alto na composição da home.
          pivot.position.y = nameYOffset ?? 0.065;
        }
        scene.add(pivot);
        head = pivot;
        interactTarget = model;

        const modelMeshes: THREE.Mesh[] = [];

        // Aplica material azul neon nos meshes
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            modelMeshes.push(mesh);

            const solidMaterial = new THREE.MeshStandardMaterial({
              color: new THREE.Color('#001f3f'),
              metalness: 1.0,
              roughness: 0.15,
              emissive: new THREE.Color('#003d66'),
              emissiveIntensity: 1.5,
              toneMapped: false,
            });

            mesh.material = solidMaterial;

            const edges = new THREE.EdgesGeometry(mesh.geometry);
            const lineMat = new THREE.LineBasicMaterial({
              color: '#00ffff',
              linewidth: 1,
              toneMapped: false,
              transparent: true,
              opacity: 1.0,
              depthTest: true,
            });
            const edgeLines = new THREE.LineSegments(edges, lineMat);
            edgeLines.renderOrder = 999;
            mesh.add(edgeLines);
          }
        });

        // Centraliza a câmera
        const size = box.getSize(new THREE.Vector3()).length();
        const modelCameraDistanceFactor = cameraDistanceFactor ?? (isNameModel ? 0.72 : 1.2);
        camera.position.set(0, 0, size * modelCameraDistanceFactor);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        // Efeito de fragmentação local (exclusivo do name.glb)
        if (isNameModel && modelMeshes.length > 0 && head) {
          const samplePoint = new THREE.Vector3();
          const sampleNormal = new THREE.Vector3();
          const headWorldInverse = new THREE.Matrix4();
          const totalVertices = modelMeshes.reduce((acc, mesh) => {
            return acc + (mesh.geometry.attributes.position?.count ?? 0);
          }, 0);
          const fragmentCount = 3000;
          fragmentRadius = size * 0.05;
          fragmentBurst = size * 0.1;
          fragmentBaseScale = size * 0.08;

          scene.updateMatrixWorld(true);
          headWorldInverse.copy(head.matrixWorld).invert();

          let allocated = 0;
          modelMeshes.forEach((mesh, meshIndex) => {
            const meshVertices = mesh.geometry.attributes.position?.count ?? 0;
            const proportional = totalVertices > 0 ? Math.round((meshVertices / totalVertices) * fragmentCount) : 0;
            const remainingMeshes = modelMeshes.length - meshIndex - 1;
            const remainingSlots = fragmentCount - allocated;
            const countForMesh = Math.max(1, Math.min(remainingSlots - remainingMeshes, proportional || 1));
            const sampler = new MeshSurfaceSampler(mesh).build();

            for (let i = 0; i < countForMesh; i += 1) {
              sampler.sample(samplePoint, sampleNormal);

              const samplePointInHead = samplePoint.clone();
              mesh.localToWorld(samplePointInHead);
              samplePointInHead.applyMatrix4(headWorldInverse);

              const sampleNormalInHead = sampleNormal.clone();
              sampleNormalInHead.transformDirection(mesh.matrixWorld);
              sampleNormalInHead.transformDirection(headWorldInverse);
              sampleNormalInHead.normalize();

              fragmentSamplePositions.push(samplePointInHead);
              fragmentSampleNormals.push(sampleNormalInHead);
              allocated += 1;
            }
          });

          const fragmentGeometry = new THREE.IcosahedronGeometry(fragmentBaseScale, 0);
          const fragmentMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#00ffff'),
            emissive: new THREE.Color('#00ffff'),
            emissiveIntensity: 1.1,
            metalness: 0.15,
            roughness: 0.25,
            transparent: true,
            opacity: 1,
            toneMapped: false,
            depthTest: false,
          });
          const voidGeometry = new THREE.IcosahedronGeometry(fragmentBaseScale * 1.05, 0);
          const voidMaterial = new THREE.MeshBasicMaterial({
            // Recorte transparente: escreve só no depth para "abrir" o objeto.
            colorWrite: false,
            depthWrite: true,
            depthTest: true,
          });

          fragmentInstances = new THREE.InstancedMesh(fragmentGeometry, fragmentMaterial, fragmentSamplePositions.length);
          fragmentInstances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
          fragmentInstances.frustumCulled = false;
          fragmentInstances.renderOrder = 1002;
          voidInstances = new THREE.InstancedMesh(voidGeometry, voidMaterial, fragmentSamplePositions.length);
          voidInstances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
          voidInstances.frustumCulled = false;
          // Renderiza antes dos meshes principais para bloquear o desenho local.
          voidInstances.renderOrder = -3;
          head.add(voidInstances);

          const layerScales = [1.45, 1.95, 2.55];
          layerScales.forEach((layerScale, index) => {
            const layerGeometry = new THREE.IcosahedronGeometry(fragmentBaseScale * layerScale, 0);
            const layerMaterial = new THREE.MeshBasicMaterial({
              colorWrite: false,
              depthWrite: true,
              depthTest: true,
            });
            const layerInstances = new THREE.InstancedMesh(layerGeometry, layerMaterial, fragmentSamplePositions.length);
            layerInstances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            layerInstances.frustumCulled = false;
            layerInstances.renderOrder = -4 - index;
            head?.add(layerInstances);
            extraVoidLayers.push(layerInstances);
          });
          head.add(fragmentInstances);
        }
      },
      undefined,
      (error) => {
        console.error('❌ Erro ao carregar modelo:', error);
      }
    );

    const animate = () => {
      requestAnimationFrame(animate);

      // Aplica rotação com base na posição do mouse
      if (head) {
        if (isNameModel) {
          // Mantém o mecanismo de seguir o mouse, porém com amplitude menor e transição suave.
          const targetY = THREE.MathUtils.clamp(mouse.x * Math.PI * 0.1, -Math.PI / 20, Math.PI / 20);
          const targetX = THREE.MathUtils.clamp(mouse.y * Math.PI * 0.12, -Math.PI / 14, Math.PI / 14);
          head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, targetY, 0.04);
          head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, targetX, 0.08);

          if (fragmentInstances && fragmentSamplePositions.length > 0) {
            const influenceBackSpeed = hasHitPoint ? 0.12 : 0.32;
            fragmentInfluence = THREE.MathUtils.lerp(fragmentInfluence, hasHitPoint ? 1 : 0, influenceBackSpeed);
            if (hasHitPoint) {
              localHitPoint.lerp(targetHitPoint, 0.3);
            }

            const elapsed = performance.now() * 0.001;

            for (let i = 0; i < fragmentSamplePositions.length; i += 1) {
              const base = fragmentSamplePositions[i];
              const normal = fragmentSampleNormals[i];
              const dist = base.distanceTo(localHitPoint);
              const distanceFactor = 1 - dist / fragmentRadius;
              const effect = Math.max(0, distanceFactor) * fragmentInfluence;

              if (effect > 0.001) {
                tmpDirection.copy(base).sub(localHitPoint).normalize();
                const pulse = Math.sin(elapsed * 8 + i * 0.35) * (fragmentBurst * 0.18) * effect;

                tmpPosition
                  .copy(base)
                  .addScaledVector(normal, fragmentBurst * 1.4 * effect + pulse)
                  .addScaledVector(tmpDirection, fragmentBurst * 1.05 * effect);

                const fragmentScale = fragmentBaseScale * (0.45 + effect * 2.3);
                instanceTransform.position.copy(tmpPosition);
                instanceTransform.rotation.set(i * 0.17, i * 0.11, i * 0.07);
                instanceTransform.scale.setScalar(fragmentScale);
                instanceTransform.updateMatrix();
                fragmentInstances.setMatrixAt(i, instanceTransform.matrix);

                if (voidInstances) {
                  const voidPosition = base.clone().addScaledVector(normal, fragmentBurst * 0.02 * effect);
                  const voidScale = fragmentBaseScale * (1.1 + effect * 3.4);
                  instanceTransform.position.copy(voidPosition);
                  instanceTransform.scale.setScalar(voidScale);
                  instanceTransform.updateMatrix();
                  voidInstances.setMatrixAt(i, instanceTransform.matrix);
                }
                extraVoidLayers.forEach((layer, layerIndex) => {
                  const layerPosition = base.clone().addScaledVector(normal, fragmentBurst * (0.03 + layerIndex * 0.02) * effect);
                  const layerScale = fragmentBaseScale * (1.7 + layerIndex * 0.9 + effect * (4.6 + layerIndex * 0.8));
                  instanceTransform.position.copy(layerPosition);
                  instanceTransform.scale.setScalar(layerScale);
                  instanceTransform.updateMatrix();
                  layer.setMatrixAt(i, instanceTransform.matrix);
                });
              } else {
                instanceTransform.position.copy(base);
                instanceTransform.scale.setScalar(0.00001);
                instanceTransform.updateMatrix();
                fragmentInstances.setMatrixAt(i, instanceTransform.matrix);
                if (voidInstances) {
                  voidInstances.setMatrixAt(i, instanceTransform.matrix);
                }
                extraVoidLayers.forEach((layer) => {
                  layer.setMatrixAt(i, instanceTransform.matrix);
                });
              }
            }

            fragmentInstances.instanceMatrix.needsUpdate = true;
            if (voidInstances) {
              voidInstances.instanceMatrix.needsUpdate = true;
            }
            extraVoidLayers.forEach((layer) => {
              layer.instanceMatrix.needsUpdate = true;
            });
          }
        } else if (isHeadModel) {
          const targetY = THREE.MathUtils.clamp(mouse.x * Math.PI * 0.5, -Math.PI / 4, Math.PI / 4);
          const targetX = THREE.MathUtils.clamp(mouse.y * Math.PI * 0.3, -Math.PI / 6, Math.PI / 6);
          head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, targetY, 0.06);
          head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, targetX, 0.06);
        } else {
          const rotationY = THREE.MathUtils.clamp(mouse.x * Math.PI * 0.5, -Math.PI / 4, Math.PI / 4);
          const rotationX = THREE.MathUtils.clamp(mouse.y * Math.PI * 0.3, -Math.PI / 6, Math.PI / 6);
          head.rotation.y = rotationY;
          head.rotation.x = rotationX;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const onMouseMove = (event: MouseEvent) => {
      const rect = mount.getBoundingClientRect();

      if (isHeadModel) {
        const insideX = event.clientX >= rect.left && event.clientX <= rect.right;
        const insideY = event.clientY >= rect.top && event.clientY <= rect.bottom;
        if (insideX && insideY) {
          const localX = (event.clientX - rect.left) / rect.width;
          const localY = (event.clientY - rect.top) / rect.height;
          mouse.x = (localX - 0.5) * 2;
          mouse.y = (localY - 0.5) * 2;
        } else {
          mouse.x = THREE.MathUtils.lerp(mouse.x, 0, 0.18);
          mouse.y = THREE.MathUtils.lerp(mouse.y, 0, 0.18);
        }
      } else {
        const localX = (event.clientX - rect.left) / rect.width;
        const localY = (event.clientY - rect.top) / rect.height;
        mouse.x = (localX - 0.5) * 2;
        mouse.y = (localY - 0.5) * 2;
      }

      if (!head) return;
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const target = interactTarget ?? head;
      const intersections = target ? raycaster.intersectObject(target, true) : [];
      const hit = intersections.length > 0;

      setHover(hit);

      if (isNameModel && hit && head) {
        targetHitPoint.copy(intersections[0].point);
        head.worldToLocal(targetHitPoint);
        if (!hasHitPoint) {
          localHitPoint.copy(targetHitPoint);
        }
        hasHitPoint = true;
      } else if (isNameModel) {
        hasHitPoint = false;
      }
    };
    const onMouseLeave = () => {
      mouse.x = 0;
      mouse.y = 0;
    };
    if (isHeadModel) {
      mount.addEventListener('mousemove', onMouseMove);
      mount.addEventListener('mouseleave', onMouseLeave);
    } else {
      window.addEventListener('mousemove', onMouseMove);
    }

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        if (isHeadModel) {
          const rect = mount.getBoundingClientRect();
          const localX = (touch.clientX - rect.left) / rect.width;
          const localY = (touch.clientY - rect.top) / rect.height;
          mouse.x = (localX - 0.5) * 2;
          mouse.y = (localY - 0.5) * 2;
        } else {
          const rect = mount.getBoundingClientRect();
          const localX = (touch.clientX - rect.left) / rect.width;
          const localY = (touch.clientY - rect.top) / rect.height;
          mouse.x = (localX - 0.5) * 2;
          mouse.y = (localY - 0.5) * 2;
        }
      }
    };
    if (isHeadModel) {
      mount.addEventListener('touchmove', onTouchMove, { passive: true });
    } else {
      window.addEventListener('touchmove', onTouchMove, { passive: true });
    }

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
      if (isHeadModel) {
        mount.removeEventListener('mousemove', onMouseMove);
        mount.removeEventListener('mouseleave', onMouseLeave);
        mount.removeEventListener('touchmove', onTouchMove);
      } else {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('touchmove', onTouchMove);
      }

      if (fragmentInstances) {
        fragmentInstances.geometry.dispose();
        if (Array.isArray(fragmentInstances.material)) {
          fragmentInstances.material.forEach((material) => material.dispose());
        } else {
          fragmentInstances.material.dispose();
        }
      }
      if (voidInstances) {
        voidInstances.geometry.dispose();
        if (Array.isArray(voidInstances.material)) {
          voidInstances.material.forEach((material) => material.dispose());
        } else {
          voidInstances.material.dispose();
        }
      }
      extraVoidLayers.forEach((layer) => {
        layer.geometry.dispose();
        if (Array.isArray(layer.material)) {
          layer.material.forEach((material) => material.dispose());
        } else {
          layer.material.dispose();
        }
      });

      mount.removeChild(renderer.domElement);
    };
  }, [scale, modelPath]);

  return (
    <div className={containerClassName} ref={mountRef}>
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
