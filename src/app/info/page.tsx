'use client';

import Link from 'next/link';
import { FaEnvelope, FaLinkedin } from 'react-icons/fa';

const experiences = [
  {
    title: 'Estagiário de SQA',
    institution: 'Engineering Brasil',
    period: 'mar/2026 - atual',
    details: [
      'Testes e validação de software com análise de funcionalidades, inconsistências, evidências e critérios de aceite.',
      'Documentação de validações, rastreabilidade de problemas e apoio à melhoria contínua da confiabilidade das entregas.',
      'Revisão de cenários positivos e negativos e comunicação objetiva dos defeitos encontrados.',
    ],
  },
  {
    title: 'Estagiário de Verão — Project Automation / Project Industry',
    institution: 'ABB Brasil',
    period: 'out/2025 - jan/2026',
    details: [
      'Automação de processos internos para centralização de dados contratuais, governança de informações e apoio a Project Management.',
      'Otimização de fluxos com Controladoria, organização de planilhas operacionais e melhoria da visibilidade de dados.',
      'Participação em projeto de campo relacionado à organização de processos e upgrades de equipamentos ABB em fábrica.',
    ],
  },
  {
    title: 'Estagiário de Eletrônica e Telecomunicações',
    institution: 'Centro de Pesquisas IMT',
    period: 'dez/2024 - out/2025',
    details: [
      'Projetos FINEP de inovação industrial envolvendo análise de dados, tecnologia embarcada, machine learning e treinamento de modelos de IA.',
      'Integração dos computadores do laboratório em cluster Kubernetes com Kubeflow para otimizar treinamentos e recursos computacionais.',
      'Soluções de visão computacional e automação para problemas técnicos e industriais, com documentação de experimentos e resultados.',
    ],
  },
  {
    title: 'Time de Tecnologia',
    institution: 'Agro Mauá',
    period: 'ago/2024 - jun/2025',
    details: [
      'Desenvolvimento de soluções para pesquisa agrícola, incluindo protótipo de aspirador contador de insetos e IA para contagem de ovos.',
      'Aplicação de IA, visão computacional e automação para acelerar medições e apoiar decisões do laboratório.',
    ],
  },
  {
    title: 'Consultor de Projetos de TI',
    institution: 'Mauá Jr.',
    period: 'mar/2024 - jan/2025',
    details: [
      'Diagnóstico de necessidades tecnológicas com empreendedores, levantamento de requisitos e estruturação de escopo.',
      'Desenvolvimento de sites completos e liderança de iniciativas internas de capacitação do time de tecnologia.',
    ],
  },
  {
    title: 'Desenvolvedor Web Full-Stack',
    institution: 'Projetos Freelance',
    period: 'em paralelo',
    details: [
      'Sites e plataformas web com React, Next.js, Node.js, NestJS, PostgreSQL, APIs e IA.',
      'Integração de autenticação, bancos de dados, automações e fluxos voltados à experiência do usuário.',
    ],
  },
];

const projects = [
  {
    title: 'Portal Escarlate',
    subtitle: 'Portal de Notícias Inteligente',
    description:
      'Portal que pesquisa, sintetiza e resume notícias de diferentes portais brasileiros, combinando coleta, curadoria, automação e IA para organizar múltiplas fontes em conteúdo acessível.',
  },
  {
    title: 'Detecção de EPIs em Salas Elétricas',
    subtitle: 'Vencedor do Hackatom ABB 2025',
    description:
      'Solução com YOLO para detecção de EPIs em ambientes industriais, construída como prova de conceito para segurança, monitoramento e tomada de decisão visual em fábrica.',
  },
  {
    title: 'Monitoramento da Cinética de Crescimento da Soja',
    subtitle: 'Apresentado na CBSoja 2025',
    description:
      'Pipeline em Python com ResNet18 e ResNet50, imagens de horta e análise visual aplicada ao acompanhamento do crescimento da soja em pesquisa agrícola.',
  },
  {
    title: 'Portfólio Pessoal Imersivo',
    subtitle: 'Este site',
    description:
      'Portfólio com experiência visual imersiva, integração de IA e estrutura full stack para apresentar trajetória, competências e projetos de forma interativa.',
  },
];

const skills = [
  {
    title: 'Qualidade',
    items: 'SQA · Testes funcionais · Validação · Análise de requisitos · Evidências · Documentação · Confiabilidade',
  },
  {
    title: 'Front-end',
    items: 'React · Next.js · TypeScript · JavaScript · HTML · CSS · Tailwind CSS · UX/UI',
  },
  {
    title: 'Mobile',
    items: 'React Native · Interfaces mobile · Consumo de APIs · Fluxos autenticados',
  },
  {
    title: 'Back-end',
    items: 'Node.js · NestJS · APIs REST · Autenticação · Integrações · Serviços externos',
  },
  {
    title: 'Bancos',
    items: 'PostgreSQL · MySQL · SQL · Modelagem relacional',
  },
  {
    title: 'IA & Dados',
    items: 'Python · PyTorch · TensorFlow · OpenCV · YOLO · ResNet · Machine Learning · Redes Neurais',
  },
  {
    title: 'Infraestrutura',
    items: 'Kubernetes · Kubeflow · Git · GitHub · VS Code · Unity',
  },
  {
    title: 'Linguagens',
    items: 'Python · TypeScript · JavaScript · Java · C/C++ · SQL · HTML · CSS',
  },
];

export default function InfoPage() {
  return (
    <>
      <Link
        href="/ai"
        className="fixed top-4 left-4 px-6 py-2 text-cyan-400 border-2 border-cyan-400 rounded-lg font-mono text-lg shadow-[0_0_10px_#0ff] hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_#0ff] transition duration-300 z-50"
      >
        IA
      </Link>

      <div className="perspective-container bg-black">
        <div className="parallax-bg" />

        <main className="min-h-screen text-white font-mono px-5 sm:px-6 py-12 relative z-0">
          <header className="max-w-5xl mx-auto text-center mb-16 animate-fade-in relative mt-10 md:mt-0 z-10">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-500 mb-4">Portfólio profissional</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 drop-shadow-lg tracking-wide">
              Luigi de Menezes Collesi
            </h1>
            <p className="text-lg sm:text-xl mt-5 text-gray-200">
              Estagiário de SQA <span className="text-cyan-500">|</span> Engenharia da Computação{' '}
              <span className="text-cyan-500">|</span> Full Stack, Mobile & IA Aplicada
            </p>
            <p className="max-w-3xl mx-auto text-sm sm:text-base leading-7 text-gray-400 mt-5">
              Estudante de Engenharia da Computação no Instituto Mauá de Tecnologia e Estagiário de SQA na
              Engineering Brasil. Experiência em qualidade de software, automação, desenvolvimento web/mobile,
              backends Node.js/NestJS, PostgreSQL, IA aplicada, visão computacional e Kubernetes/Kubeflow.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs sm:text-sm text-gray-300">
              <Tag>São Paulo, SP</Tag>
              <Tag>4º ano · 7º semestre</Tag>
              <Tag>Formatura prevista · fim de 2027</Tag>
            </div>

            <div className="mt-7 flex justify-center gap-5">
              <a
                href="https://linkedin.com/in/luigi-collesi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:text-cyan-300 transition"
              >
                <FaLinkedin size={25} />
              </a>
              <a
                href="mailto:luigicollesi@gmail.com"
                aria-label="Email"
                className="hover:text-cyan-300 transition"
              >
                <FaEnvelope size={25} />
              </a>
            </div>
          </header>

          <div className="space-y-20 max-w-5xl mx-auto relative z-10">
            <Section title="Experiência profissional">
              <div className="space-y-7">
                {experiences.map((experience) => (
                  <TimelineItem key={`${experience.institution}-${experience.period}`} {...experience} />
                ))}
              </div>
            </Section>

            <Section title="Projetos técnicos">
              <div className="grid gap-5 md:grid-cols-2">
                {projects.map((project) => (
                  <ProjectCard key={project.title} {...project} />
                ))}
              </div>
            </Section>

            <Section title="Competências técnicas">
              <div className="grid gap-4 md:grid-cols-2">
                {skills.map((skill) => (
                  <div
                    key={skill.title}
                    className="border border-cyan-400/20 bg-black/50 rounded-lg p-5 shadow-[0_0_18px_rgba(0,255,255,0.04)]"
                  >
                    <h3 className="text-cyan-300 font-semibold mb-2">{skill.title}</h3>
                    <p className="text-sm leading-6 text-gray-400">{skill.items}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Formação e idiomas">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <TimelineItem
                    title="Engenharia da Computação — 4º ano / 7º semestre"
                    institution="Instituto Mauá de Tecnologia"
                    period="2023 - atual · conclusão prevista para o fim de 2027"
                  />
                  <TimelineItem
                    title="International Baccalaureate (IB)"
                    institution="Diploma internacional de ensino"
                    period="Concluído"
                  />
                  <TimelineItem
                    title="Ensino Médio"
                    institution="Escola Bilíngue Pueri Domus"
                    period="2021 - 2022"
                  />
                  <TimelineItem
                    title="Ensino Médio — Argentina"
                    institution="Asociación Escuelas Lincoln"
                    period="2019 - 2020"
                  />
                  <TimelineItem
                    title="Ensino Fundamental"
                    institution="Humboldt Schule"
                    period="2011 - 2018"
                  />
                </div>

                <div className="space-y-4">
                  <InfoCard title="Português" text="Nativo" />
                  <InfoCard title="Inglês" text="Fluente" />
                  <InfoCard title="Espanhol" text="Avançado" />
                  <InfoCard title="Alemão" text="Básico" />
                </div>
              </div>
            </Section>

            <Section title="Destaques e atividades">
              <div className="grid gap-5 md:grid-cols-2">
                <InfoCard
                  title="Hackatom ABB 2025"
                  text="Projeto vencedor com visão computacional aplicada à segurança industrial."
                />
                <InfoCard
                  title="Kubernetes & Kubeflow"
                  text="Experiência na integração de computadores de laboratório em cluster para treinamento e otimização de modelos de IA."
                />
                <InfoCard
                  title="Xadrez universitário"
                  text="Integrante do time de xadrez do Instituto Mauá de Tecnologia desde 2023."
                />
                <InfoCard
                  title="Esportes e interesses"
                  text="Histórico em futebol, basquete e vôlei, com participação em torneios internacionais. Interesses em IA aplicada, computação, novas tecnologias, xadrez, esportes e games."
                />
              </div>
            </Section>
          </div>
        </main>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-gray-700 pb-3">{title}</h2>
      {children}
    </section>
  );
}

function TimelineItem({
  title,
  institution,
  period,
  details,
}: {
  title: string;
  institution: string;
  period: string;
  details?: string[];
}) {
  return (
    <article className="border-l-2 border-cyan-400 pl-5 relative">
      <div className="absolute left-[-9px] top-1.5 w-4 h-4 bg-cyan-400 rounded-full shadow-md" />
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-5">
        <div>
          <h3 className="text-lg font-semibold text-cyan-300">{title}</h3>
          <p className="text-sm sm:text-base text-gray-300">{institution}</p>
        </div>
        {period && <p className="text-sm text-gray-500 shrink-0">{period}</p>}
      </div>
      {details?.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-400 list-disc pl-5">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function ProjectCard({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <article className="border border-cyan-400/25 bg-black/55 rounded-xl p-5 shadow-[0_0_20px_rgba(0,255,255,0.05)]">
      <h3 className="text-lg font-semibold text-cyan-300">{title}</h3>
      <p className="text-xs uppercase tracking-wider text-cyan-600 mt-1">{subtitle}</p>
      <p className="text-sm leading-6 text-gray-400 mt-4">{description}</p>
    </article>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-gray-800 bg-black/40 rounded-lg p-5">
      <h3 className="text-cyan-300 font-semibold">{title}</h3>
      <p className="text-sm leading-6 text-gray-400 mt-2">{text}</p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="border border-cyan-400/25 rounded-full px-3 py-1.5 bg-cyan-400/5">{children}</span>;
}
