import { NextRequest, NextResponse } from 'next/server';
import Together from 'together-ai';

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';

if (!TOGETHER_API_KEY) {
  throw new Error('A variável de ambiente TOGETHER_API_KEY não está definida.');
}

const together = new Together({
  apiKey: TOGETHER_API_KEY,
});

const BASE_TEXT = `
Nome: Luigi de Menezes Collesi
Nascimento: 23 de Novembro de 2003
Curso: Engenharia da Computação – 3º ano
Instituição: Instituto Mauá de Tecnologia
Cargo atual: Estagiário no Centro de Pesquisa do Instituto Mauá – Departamento de Elétrica e Telecomunicações

Formação e Idiomas
- Possui formação IB (International Baccalaureate) bilíngue.
- Morou na Argentina por dois anos, experiência que fortaleceu a fluência em espanhol.
- Domina inglês em nível fluente e possui espanhol em nível avançado.

Experiências Acadêmicas e Extracurriculares
- Atuou como consultor de tecnologia na Mauá Jr., empresa júnior da Mauá, por 1 ano.
- Participou da entidade Agro Mauá por 1 ano, aplicando tecnologia ao setor agro.
- Membro ativo do time de xadrez da Mauá, com dedicação constante ao jogo.
- Histórico esportivo inclui futebol, basquete e vôlei em nível competitivo escolar.
- Competiu em torneios de futebol na Argentina e no Canadá.
- Jogou vôlei em um torneio de escolas internacionais no Equador.

Projetos e Realizações Técnicas
1. Monitoramento da Cinética de Crescimento da Soja:
   - Desenvolveu um modelo de machine learning utilizando ResNet18 e ResNet50 com pesos pré-treinados.
   - Treinado com imagens coletadas da horta acadêmica da Mauá.
   - Projeto aceito para apresentação na CBSoja 2025.

2. Detecção de EPIs em Salas Elétricas:
   - Criado com a arquitetura YOLO e datasets públicos.
   - Vencedor do Hackatom ABB na Mauá.
   - Aplicação prática em segurança do trabalho via visão computacional.

3. Plataforma de Jogo de Truco com Algoritmos em Python (Bot Arena):
   - Desenvolvimento completo de um site, com front-end e back-end usando Next.js.
   - Plataforma onde usuários podem criar algoritmos em Python que competem entre si em partidas simuladas de truco.
   - Inclui sistema de autenticação, interface de programação de código, motor de partida automatizado e integração com banco de dados relacional com tabelas interligadas.

4. Plataforma da IA (projeto atual):
   - Desenvolvida inteiramente por Luigi, incluindo front-end e back-end.
   - Integra inteligência artificial com modelagem 3D para criar uma plataforma funcional com estética futurista e navegação simples.
   - Une usabilidade, automação e visual imersivo, mantendo arquitetura de código limpa e modular.

5. Projetos no Centro de Pesquisa do Instituto Mauá:
   - Durante o estágio, participou de diversos projetos desenvolvidos no Centro de Pesquisa, envolvendo aplicações de inteligência artificial e tecnologia embarcada.
   - Atuou no desenvolvimento de soluções práticas, com foco em inovação e integração entre software e hardware.
   - Contribuiu para iniciativas multidisciplinares com impacto em pesquisa aplicada e desenvolvimento tecnológico.

Habilidades Técnicas
- Linguagens: Python, JavaScript, C/C++, Java, TypeScript, HTML, CSS, SQL
- Frameworks: PyTorch, OpenCV, YOLO, Next.js, React, Node.js, Auth.js
- Outros: Desenvolvimento web fullstack, visão computacional, redes neurais convolucionais, integração de back-end com inteligência artificial

Interesses e Preferências Pessoais
- Interesses técnicos: Inteligência artificial, aplicações de IA, jogos com IA autônoma.
- Interesses pessoais: Novas Tecnologias, xadrez, esportes, música, games.
- Cor favorita: Laranja
- Comida favorita: X-Bacon ou hot dog (hot roll), com grande preferência também por pizza de frango com catupiry e borda recheada.
- Esportes: Ex-atleta escolar em futebol, basquete e vôlei. Atualmente, dedica-se ao xadrez universitário.
`;

const systemPrompt = `
Você é uma IA assistente com conhecimento sobre Luigi de Menezes Collesi.
Use o texto base abaixo como referência, mas responda perguntas mesmo que a resposta não esteja explicitamente nele.
Se a resposta estiver no texto, use-a com prioridade. Se não estiver, use raciocínio lógico e conhecimento geral.
Evite respostas vagas, genéricas, ou menções fora da pergunta sobre o texto base. Seja específico e direto.
Se não souber a resposta, diga "Não sei" ou "Não tenho informações suficientes".
Evite respostas com muitos caracteries.
Texto base:
"""${BASE_TEXT}"""
`.trim();

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { question } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Pergunta vazia' }, { status: 400 });
    }

    const chat = await together.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: question.trim(),
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const answer = chat.choices?.[0]?.message?.content?.trim() || 'Não consegui gerar uma resposta.';

    return NextResponse.json({ answer });
  } catch (err: unknown) {
    if (err instanceof Error) {
        console.error('Erro no endpoint /api/ask:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
        console.error('Erro desconhecido no endpoint /api/ask:', err);
        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
  }
}
