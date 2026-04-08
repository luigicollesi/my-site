'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import ThreeScene from '@/app/components/ThreeScene';

export default function Home() {
  const [mobileSceneHeight, setMobileSceneHeight] = useState(320);
  const [mobileNameScale, setMobileNameScale] = useState(1.02);
  const [mobileNameYOffset, setMobileNameYOffset] = useState(0.03);
  const [mobileCameraDistance, setMobileCameraDistance] = useState(0.84);
  const [tabletNameScale, setTabletNameScale] = useState(1.5);
  const [tabletNameYOffset, setTabletNameYOffset] = useState(0.065);
  const [tabletCameraDistance, setTabletCameraDistance] = useState(0.72);
  const whatsappMessage = encodeURIComponent(
    'Olá, tudo bem? Tenho interesse em criar uma plataforma web e gostaria de conversar sobre escopo, prazo e orçamento.'
  );
  const whatsappLink = `https://wa.me/5511988658728?text=${whatsappMessage}`;

  useEffect(() => {
    const getLayoutViewport = () => {
      const root = document.documentElement;
      return {
        w: root.clientWidth,
        h: root.clientHeight,
      };
    };

    const updateMobileViewport = () => {
      const { w, h } = getLayoutViewport();

      const targetHeight = Math.round(Math.min(Math.max(h * 0.5, 250), 420));
      setMobileSceneHeight(targetHeight);

      if (w <= 360) {
        setMobileNameScale(0.2);
        setMobileNameYOffset(0.01);
        setMobileCameraDistance(1.42);
        return;
      }

      if (w <= 390) {
        setMobileNameScale(0.23);
        setMobileNameYOffset(0.02);
        setMobileCameraDistance(1.38);
        return;
      }

      if (w <= 430) {
        setMobileNameScale(0.28);
        setMobileNameYOffset(0.03);
        setMobileCameraDistance(1.34);
        return;
      }

      setMobileNameScale(0.33);
      setMobileNameYOffset(0.045);
      setMobileCameraDistance(1.3);
    };

    const updateTabletViewport = () => {
      const { w } = getLayoutViewport();

      if (w >= 768 && w <= 900) {
        setTabletNameScale(0.58);
        setTabletNameYOffset(0.06);
        setTabletCameraDistance(1.12);
        return;
      }

      if (w > 900 && w <= 1100) {
        setTabletNameScale(0.68);
        setTabletNameYOffset(0.1);
        setTabletCameraDistance(1.06);
        return;
      }

      if (w > 1100 && w <= 1280) {
        setTabletNameScale(0.9);
        setTabletNameYOffset(0.11);
        setTabletCameraDistance(0.94);
        return;
      }

      setTabletNameScale(1.5);
      setTabletNameYOffset(0.065);
      setTabletCameraDistance(0.72);
    };

    updateMobileViewport();
    updateTabletViewport();
    window.addEventListener('resize', updateMobileViewport);
    window.addEventListener('resize', updateTabletViewport);
    return () => {
      window.removeEventListener('resize', updateMobileViewport);
      window.removeEventListener('resize', updateTabletViewport);
    };
  }, []);

  return (
    <main className="home-root w-full min-h-screen relative bg-black overflow-x-hidden overflow-y-auto">
      <Image
        src="/Images/fundo-noturno.png"
        alt="Fundo noturno futurista"
        fill
        className="object-cover absolute top-0 left-0 z-0 opacity-60"
        style={{
          objectFit: 'cover',
          WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
        }}
        sizes="100vw"
        quality={100}
        loading="eager"
        priority
      />

      <div className="md:hidden relative z-10 w-full min-h-screen flex flex-col items-center px-4 pt-3 pb-8 gap-4">
        <div className="w-full max-w-6xl" style={{ height: mobileSceneHeight }}>
          <ThreeScene
            modelPath="/models/name.glb"
            redirectUrl="/ai"
            scale={mobileNameScale}
            nameYOffset={mobileNameYOffset}
            cameraDistanceFactor={mobileCameraDistance}
            containerClassName="relative w-full h-full pointer-events-auto"
          />
        </div>

        <div className="w-full max-w-3xl flex flex-col gap-4">
          <div className="flex items-center justify-center gap-6">
            <Link
              href="https://instagram.com/luigi.collesi/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-plain social-plain--mobile"
            >
              <FaInstagram className="social-tile__icon social-tile__icon--mobile" />
              <span className="social-tile__label social-tile__label--mobile">@luigi.collesi</span>
            </Link>
            <Link
              href="https://linkedin.com/in/luigi-collesi/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-plain social-plain--mobile"
            >
              <FaLinkedin className="social-tile__icon social-tile__icon--mobile" />
              <span className="social-tile__label social-tile__label--mobile">luigi-collesi</span>
            </Link>
          </div>

          <section className="intel-card rounded-2xl p-4">
            <div className="intel-card__scan" />
            <div className="intel-card__grid" />
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.24em] text-cyan-300/80">Neural Core</p>
                  <h2 className="mt-1 text-xl font-bold text-cyan-100 drop-shadow-[0_0_10px_rgba(0,255,255,0.55)]">
                    Interface IA
                  </h2>
                </div>
                <span className="intel-badge">ONLINE</span>
              </div>

              <p className="text-cyan-100/80 text-sm leading-relaxed">
                Plataforma imersiva com IA contextual e navegação guiada por experiência.
              </p>

              <div className="ia-card-microtags">
                <span>IA</span>
                <span>3D</span>
                <span>Fullstack</span>
              </div>

              <div className="ia-card__action-row">
                <p className="text-[0.62rem] text-cyan-200/75 tracking-[0.07em] uppercase">
                  Clique na cabeça ou use o atalho
                </p>
                <Link href="/ai" className="intel-cta ia-card__cta inline-flex items-center justify-center rounded-md px-2 py-1 text-[10px] font-semibold text-cyan-100">
                  IA
                </Link>
              </div>
            </div>
          </section>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="intel-card whatsapp-card-link rounded-2xl p-4 block"
            aria-label="Conversar no WhatsApp sobre criação de plataforma web"
          >
            <div className="intel-card__scan" />
            <div className="intel-card__grid" />
            <div className="relative z-10 flex flex-col gap-4">
              <div>
                <p className="text-[0.62rem] uppercase tracking-[0.24em] text-cyan-300/80">Future Build</p>
                <h3 className="mt-1 text-xl font-bold text-cyan-100 drop-shadow-[0_0_10px_rgba(0,255,255,0.55)]">
                  Transforme Sua Ideia em Plataforma Web
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="intel-pill">Da ideia ao produto real</div>
                <div className="intel-pill">Desenvolvimento web sob medida</div>
                <div className="intel-pill">Construção fullstack completa</div>
                <div className="intel-pill">Evolução contínua com IA</div>
              </div>

              <p className="text-cyan-100/75 text-sm leading-relaxed">
                Vamos tirar seu projeto do papel com uma plataforma web inteligente e levar sua visão para o futuro.
              </p>
            </div>
          </a>
        </div>
      </div>

      <div className="hidden md:block absolute inset-0 desktop-home-shell">
        <div className="absolute inset-0 z-10">
          <ThreeScene
            modelPath="/models/name.glb"
            redirectUrl="/ai"
            scale={tabletNameScale}
            nameYOffset={tabletNameYOffset}
            cameraDistanceFactor={tabletCameraDistance}
            containerClassName="relative w-full h-full pointer-events-auto"
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 top-[44%] lg:top-[50%] z-30 px-6 pb-6 desktop-panels-shell">
          <div className="mx-auto h-full w-full max-w-7xl grid grid-cols-[1.25fr_0.95fr] gap-6">
            <div className="h-full flex flex-col justify-end gap-4 min-h-0">
              <div className="flex items-center justify-center gap-8">
                <Link
                  href="https://instagram.com/luigi.collesi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-plain"
                >
                  <FaInstagram className="social-tile__icon" />
                  <span className="social-tile__label">@luigi.collesi</span>
                </Link>
                <Link
                  href="https://linkedin.com/in/luigi-collesi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-plain"
                >
                  <FaLinkedin className="social-tile__icon" />
                  <span className="social-tile__label">luigi-collesi</span>
                </Link>
              </div>

              <section className="intel-card intel-card--ia h-[50%] min-h-0 rounded-2xl p-5">
                <div className="intel-card__scan" />
                <div className="intel-card__grid" />
                <div className="relative z-10 h-full hidden md:grid lg:hidden grid-cols-[minmax(0,1fr)_168px] items-center">
                  <div className="min-w-0 flex flex-col justify-center">
                    <div>
                      <p className="text-[0.62rem] uppercase tracking-[0.24em] text-cyan-300/80">Neural Core</p>
                      <h2 className="mt-1 text-xl font-bold text-cyan-100 drop-shadow-[0_0_10px_rgba(0,255,255,0.55)]">
                        Interface IA
                      </h2>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-cyan-400/35 bg-cyan-400/10 px-2 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#00ffff]" />
                        <span className="text-[0.56rem] text-cyan-100/85 tracking-[0.14em] uppercase">Assistente ativo</span>
                      </div>
                    </div>

                    <p className="text-cyan-100/80 text-sm leading-relaxed">
                      IA contextual com experiência 3D para navegação rápida.
                    </p>

                    <div className="ia-card-microtags">
                      <span>IA</span>
                      <span>3D</span>
                      <span>Fullstack</span>
                    </div>

                    <div className="ia-card__action-row">
                      <p className="text-[0.62rem] text-cyan-200/75 tracking-[0.07em] uppercase">
                        Clique na cabeça ou use o atalho
                      </p>
                      <Link href="/ai" className="intel-cta ia-card__cta inline-flex items-center justify-center rounded-md px-2 py-1 text-[10px] font-semibold text-cyan-100">
                        IA
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <div className="mini-head-box">
                      <ThreeScene
                        modelPath="/models/head.glb"
                        redirectUrl="/ai"
                        scale={0.48}
                        containerClassName="relative w-full h-full pointer-events-auto"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative z-10 h-full ia-three-col !hidden lg:grid">
                  <div className="ia-col-left">
                    <p className="text-[0.62rem] uppercase tracking-[0.28em] text-cyan-300/80">Neural Core</p>
                    <h2 className="mt-1 text-[1.4rem] leading-tight font-bold text-cyan-100 drop-shadow-[0_0_10px_rgba(0,255,255,0.55)]">
                      Interface IA
                    </h2>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-cyan-400/35 bg-cyan-400/10 px-2 py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#00ffff]" />
                      <span className="text-[0.56rem] text-cyan-100/85 tracking-[0.14em] uppercase">Assistente ativo</span>
                    </div>
                  </div>

                  <div className="ia-col-middle">
                    <div className="ia-card-body">
                      <p className="text-cyan-100/80 text-[0.8rem] leading-relaxed max-w-[42ch]">
                        IA contextual com experiência 3D para navegação rápida.
                      </p>
                      <div className="ia-card-microtags">
                        <span>IA</span>
                        <span>3D</span>
                        <span>Fullstack</span>
                      </div>
                    </div>

                    <div className="ia-card__action-row">
                      <p className="text-[0.62rem] text-cyan-200/75 tracking-[0.07em] uppercase">
                        Clique na cabeça ou use o atalho
                      </p>
                      <Link href="/ai" className="intel-cta ia-card__cta inline-flex items-center justify-center rounded-md px-2 py-1 text-[10px] font-semibold text-cyan-100">
                        IA
                      </Link>
                    </div>
                  </div>

                  <div className="ia-col-right">
                    <div className="mini-head-box">
                      <ThreeScene
                        modelPath="/models/head.glb"
                        redirectUrl="/ai"
                        scale={0.48}
                        containerClassName="relative w-full h-full pointer-events-auto"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="intel-card whatsapp-card-link rounded-2xl p-5 h-full min-h-0 block self-end"
              aria-label="Conversar no WhatsApp sobre criação de plataforma web"
            >
              <div className="intel-card__scan" />
              <div className="intel-card__grid" />
              <div className="relative z-10 h-full flex flex-col gap-4 justify-between">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.3em] text-cyan-300/80">Future Build</p>
                  <h3 className="mt-1 text-2xl font-bold text-cyan-100 drop-shadow-[0_0_10px_rgba(0,255,255,0.55)]">
                    Transforme Sua Ideia em Plataforma Web
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="intel-pill">Da ideia ao produto real</div>
                  <div className="intel-pill">Desenvolvimento web sob medida</div>
                  <div className="intel-pill">Construção fullstack completa</div>
                  <div className="intel-pill">Evolução contínua com IA</div>
                </div>

                <p className="text-cyan-100/75 text-sm leading-relaxed">
                  Se você quer tirar um projeto do papel, vamos construir juntos uma plataforma web inteligente e levar sua visão para o futuro.
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
