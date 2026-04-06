'use client';

import Link from 'next/link';
import { FaInstagram, FaLinkedin, FaEnvelope } from 'react-icons/fa';

export default function Home() {
    
  return (
    <>
    <Link href="/ai" className="fixed top-4 left-4 px-6 py-2 text-cyan-400 border-2 border-cyan-400 rounded-lg font-mono text-lg shadow-[0_0_10px_#0ff] hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_#0ff] transition duration-300 z-50">
    IA
    </Link>
    <div className="perspective-container bg-black">

        <div className="parallax-bg" />

        <div className="min-h-screen text-white font-mono px-6 py-12 relative z-0">

            <div className="max-w-5xl mx-auto text-center mb-16 animate-fade-in relative mt-8 md:mt-0 z-10">
                <h1 className="text-5xl font-bold text-cyan-400 drop-shadow-lg tracking-wide z-10">Luigi de Menezes Collesi</h1>
                <p className="text-base text-gray-400 mt-2 z-10">Nascido em 23 de Novembro de 2003</p>
                <p className="text-xl mt-4 text-gray-300 z-10">Estagiário na Engineering Brasil</p>
                <div className="mt-6 flex justify-center gap-4">
                <a href="https://linkedin.com/in/luigi-collesi" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition">
                    <FaLinkedin size={24} />
                </a>
                <a href="https://instagram.com/luigi.collesi" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition">
                    <FaInstagram size={24} />
                </a>
                <a href="mailto:luigicollesi@gmail.com" className="hover:text-cyan-300 transition">
                    <FaEnvelope size={24} />
                </a>
                </div>
            </div>

            <div className="space-y-20 max-w-4xl mx-auto relative z-10">
                <Section title="Formação Acadêmica e Idiomas">
                    <div className="space-y-6">
                        <TimelineItem
                        title="Engenharia da Computação – 4º ano (7º semestre)"
                        institution="Instituto Mauá de Tecnologia, São Caetano do Sul"
                        period="2023 - Atual"
                        />
                        <TimelineItem
                        title="International Baccalaureate (IB) Bilíngue"
                        institution="Ensino Médio Internacional"
                        period="Concluído"
                        />
                        <TimelineItem
                        title="Experiência Internacional na Argentina"
                        institution="Vivência de 2 anos"
                        period="2019 - 2020"
                        />
                        <TimelineItem
                        title="Idiomas"
                        institution="Inglês (fluente), Espanhol (avançado)"
                        period=""
                        />
                    </div>
                </Section>

                <Section title="Experiências Acadêmicas e Extracurriculares">
                    <div className="space-y-6">
                        <TimelineItem title="Membro do Time de Tecnologia" institution="Agro Mauá" period="1 ano" />
                        <TimelineItem title="Consultor de Tecnologia" institution="Mauá Jr." period="1 ano" />
                        <TimelineItem title="Integrante do time de Xadrez" institution="Instituto Mauá de Tecnologia" period="Desde 2023" />
                        <TimelineItem title="Histórico Esportivo" institution="Futebol, basquete, vôlei em nível escolar" period="2012 - 2020" />
                        <TimelineItem title="Torneios Internacionais" institution="Futebol (Argentina, Canadá), Vôlei (Equador)" period="Diversos anos" />
                    </div>
                </Section>

                <Section title="Experiências Profissionais">
                    <div className="space-y-6">
                        <TimelineItem
                          title="Estagiário no Centro de Pesquisa do Instituto Mauá de Tecnologia"
                          institution="Pesquisa aplicada e desenvolvimento tecnológico"
                          period="De dezembro de 2024 a outubro de 2025"
                        />
                        <TimelineItem
                          title="Estagiário no Departamento de Project Industry da ABB Brasil"
                          institution="Atuação na área de Project Automation Project Industry, com automatização de processos de Project Management, planilhas de controladoria e organização de processos de instalação de placas elétricas em fábrica"
                          period="De outubro de 2025 a janeiro de 2026"
                        />
                        <TimelineItem
                          title="Estagiário de SQA (Software Quality Assurance) na Engineering Brasil"
                          institution="Garantia de qualidade, testes e validação de software"
                          period="De março de 2026 até o momento"
                        />
                        <TimelineItem
                          title="Experiências freelance em desenvolvimento web"
                          institution="Projetos de sites inteligentes e plataformas web de inovação"
                          period="Em paralelo às atividades profissionais"
                        />
                    </div>
                </Section>

                <Section title="Projetos e Realizações Técnicas">
                    <div className="space-y-6">
                        <TimelineItem
                        title="Monitoramento da Cinética de Crescimento da Soja"
                        institution="Modelo com ResNet18/50 treinado em imagens da horta"
                        period="Apresentação na CBSoja 2025"
                        />
                        <TimelineItem
                        title="Detecção de EPIs em Salas Elétricas"
                        institution="Arquitetura YOLO. Vencedor do Hackatom ABB"
                        period="2025"
                        />
                        <TimelineItem
                        title="CardBot Arena – Plataforma de Truco com Algoritmos"
                        institution="Next.js com back-end, autenticação e IA em Python"
                        period="2025"
                        />
                        <TimelineItem
                        title="Meu Site! – Portfólio Pessoal com Experiência Imersiva"
                        institution="Integração de IA, front-end e back-end com design imersivo"
                        period="Projeto atual"
                        />
                        <TimelineItem
                        title="Projetos no Centro de Pesquisa da Mauá"
                        institution="IA aplicada, tecnologia embarcada e soluções práticas"
                        period="Durante o estágio"
                        />
                    </div>
                </Section>

                <Section title="Habilidades Técnicas">
                <div className="space-y-8 relative">
                    {[
                    {
                        title: 'Inteligência Artificial & Visão Computacional',
                        skills: ['Python', 'PyTorch', 'TensorFlow', 'OpenCV', 'YOLO', 'Redes Neurais', 'Visão Computacional']
                    },
                    {
                        title: 'Desenvolvimento Web Fullstack',
                        skills: ['JavaScript', 'TypeScript', 'HTML/CSS', 'SQL', 'React', 'Next.js', 'Node.js', 'Auth.js', 'Fullstack Web']
                    },
                    {
                        title: 'Outras Linguagens e Tecnologias',
                        skills: ['C/C++', 'Java', 'MySQL']
                    }
                    ].map(({ title, skills }) => (
                    <div key={title} className="relative">
                        <TimelineItem
                            title={title}
                            institution={skills.join(' | ')}
                            period=""
                        />
                    </div>
                    ))}
                </div>
                </Section>

                <Section title="Interesses">
                <div className="space-y-6">
                    <TimelineItem title="Interesses Técnicos" institution="IA Aplicada, Pesquisas na área de computação" period="" />
                    <TimelineItem title="Interesses Pessoais" institution="Novas Tecnologias, Xadrez, Esportes, Games" period="" />
                </div>
                </Section>
            </div>
        </div>
    </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">{title}</h2>
      {children}
    </section>
  );
}

function TimelineItem({
  title,
  institution,
  period,
}: {
  title: string;
  institution: string;
  period: string;
}) {
  return (
    <div className="border-l-2 border-cyan-400 pl-4 relative">
      <div className="absolute left-[-9px] top-1.5 w-4 h-4 bg-cyan-400 rounded-full shadow-md"></div>
      <h3 className="text-lg font-semibold text-cyan-300">{title}</h3>
      <p className="text-md text-gray-400">{institution}</p>
      {period && <p className="text-sm text-gray-500">{period}</p>}
    </div>
  );
}
