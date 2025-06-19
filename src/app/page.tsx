'use client';

import ThreeScene from '@/app/components/ThreeScene';
import { FaInstagram, FaLinkedin, FaRobot } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [typingAnswer, setTypingAnswer] = useState('');
  const [fullAnswer, setFullAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const sendQuestion = async () => {
    if (!question.trim()) return;
    setTypingAnswer('');
    setFullAnswer('');
    setLoading(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        body: JSON.stringify({ question }),
      });
      const json = await res.json();
      const text: string = json.answer || 'Desculpe, não consegui responder.';
      if (json.answer) {
        setQuestion(''); // Limpa o campo de pergunta
      }
      setFullAnswer(text);
    } catch {
      setFullAnswer('Erro de comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Efeito de digitação (typewriter)
  useEffect(() => {
    if (!fullAnswer) return;
    let i = 0;
    const interval = setInterval(() => {
      setTypingAnswer(fullAnswer.slice(0, ++i));
      if (i >= fullAnswer.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [fullAnswer]);

  return (
    <main className="w-full min-h-screen md:h-screen text-white font-mono flex flex-col md:flex-row items-center md:justify-between px-4 py-6 md:p-0 md:overflow-hidden relative bg-black">

      {/* Imagem de fundo */}
      <Image
        src="/Images/fundo-noturno.png" // substitua com o nome correto do arquivo
        alt="Fundo noturno futurista"
        fill
        className="object-cover w-full h-full absolute top-0 left-0 z-0 opacity-60"
        style={{ objectFit: 'cover' }}
        sizes="100vw"
        quality={100}
        loading="eager" // Carrega a imagem imediatamente para evitar atraso
        priority
      />
    
      {/* Título no topo */}
      <div className="w-full text-center z-20 md:absolute md:top-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[#00ffff] drop-shadow-[0_0_6px_#00ffff]">
          Bem-vindo
        </h1>
      </div>

      {/* Cabeça 3D */}
      <div className="w-full flex justify-center pointer-events-none md:flex-1 md:items-center md:justify-center md:relative z-10">
        <ThreeScene scale={0.5} />
      </div>

      {/* Texto de resposta */}
      <div className="text-lg md:text-xl leading-relaxed text-[#00ffff] text-center max-w-lg md:absolute md:left-6 md:top-1/2 md:-translate-y-1/2 md:text-left md:max-w-xs z-10">
        {loading ? (
          <p className="animate-pulse">…carregando resposta</p>
        ) : typingAnswer ? (
          <p>
            {typingAnswer}
            <span className="blink">|</span>
          </p>
        ) : (
          <>
            <p>Olá, tudo bem?</p>
            <p>Fique à vontade para me perguntar algo sobre <strong>Luigi Collesi</strong>. Responderei tudo que eu souber.</p>
          </>
        )}
      </div>

      {/* Input e botão */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 md:absolute md:bottom-6 md:left-1/2 md:-translate-x-1/2 z-20">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Digite sua pergunta..."
          disabled={loading}
          className={`flex-1 p-4 text-lg rounded-full bg-[#011f35] text-white placeholder-[#00ffff] border-2 border-[#00ffff] focus:outline-none focus:ring-2 focus:ring-[#00ffff] transition-all shadow-md shadow-[#00ffff]/20 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onKeyDown={e => e.key === 'Enter' && sendQuestion()}
        />
        <button
          onClick={sendQuestion}
          disabled={loading}
          className={`px-6 py-3 rounded-full bg-[#00ffff] text-[#001f3f] font-bold text-lg transition-all shadow-lg shadow-[#00ffff]/30 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00e6e6] cursor-pointer'
          }`}
        >
          {loading ? 'Carregando...' : 'Enviar'}
        </button>
      </div>

      {/* Links sociais */}
      <div className="flex flex-col justify-center items-center gap-4 text-lg text-[#00ffff] mt-4 md:mt-0 md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2 z-10">
        <Link href="https://instagram.com/luigi.collesi/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#00e6e6] transition-colors">
          <FaInstagram size={24} /> <span className="font-semibold">Instagram</span>
        </Link>
        <Link href="https://linkedin.com/in/luigi-collesi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#00e6e6] transition-colors">
          <FaLinkedin size={24} /> <span className="font-semibold">LinkedIn</span>
        </Link>
        <Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#00e6e6] transition-colors">
          <FaRobot size={24} /> <span className="font-semibold">Bot Arena</span>
        </Link>
      </div>

      <style jsx>{`
        .blink {
          animation: blink 1s steps(2, start) infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </main>
  );
}
