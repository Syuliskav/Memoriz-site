# 🧠 Memoriz

> Plataforma de estudo ativo, fixação acelerada e repetição espaçada (SRS) alimentada por bancos de questões estruturados em JSON.

---

## 📌 Sobre o Projeto

O **Memoriz** é uma aplicação web moderna, offline-first e de alta performance desenvolvida para potencializar a memorização e o estudo ativo através de resolução de questões comentadas, revisão espaçada e métricas detalhadas de retenção.

### ✨ Principais Recursos

- 🎯 **Modo Prática Interativo**: Resolução de questões com visualização imediata ou postergada de gabarito, eliminação de alternativas (riscador/strikes), marcação de favoritos e *split-screen* inteligente para textos associados e enunciados extensos.
- 🔁 **Repetição Espaçada (SRS)**: Algoritmo de intervalos baseado no modelo SM-2/FSRS com cálculo de maturidade, cards para revisão diária e histórico de retenção.
- 📓 **Caderno de Erros Automático**: Centralização inteligente de todas as questões erradas para fixação e re-resolução direcionada.
- ⏱️ **Modo Simulado**: Simulação realista de tempo de prova com cronômetro regressivo/progressivo e relatório final de desempenho.
- 📊 **Dashboard de Métricas & Gamificação**: Acompanhamento de taxa de acerto por matéria/banca/ano, histórico de XP, níveis e metas de estudo.
- 📂 **Gestor de Bancos de Questões**: Suporte a múltiplos bancos de dados simultâneos com importação e exportação de arquivos JSON locais.
- 🎨 **4 Temas Especializados**:
  - **Daylight**: Alto contraste para ambientes iluminados.
  - **Dark Slate**: Tons profundos para foco noturno.
  - **Reading Sepia**: Tons canela e pergaminho para leitura prolongada.
  - **Night Circadian**: Modo âmbar 0% luz azul para preservar a melatonina e o ciclo circadiano.

---

## 📚 Bancos de Questões Personalizados

Os bancos de dados do **Memoriz** são totalmente agnósticos ao conteúdo. **Não é necessário que as questões sejam sobre concursos públicos** — você pode criar ou importar bancos sobre qualquer tema:

- 🎓 Vestibulares, ENEM e Universidades
- 💻 Certificações de TI (AWS, Azure, GCP, Cisco, CompTIA, etc.)
- 📖 Estudos Bíblicos, Teologia e Religião
- 🎌 Animes, Mangás, Cinema e Cultura Pop
- 🗣️ Idiomas e Vocabulário (Inglês, Espanhol, Japonês, etc.)
- 🩺 Medicina, Enfermagem e Saúde
- 🧩 Curiosidades, Quizzes e Conhecimentos Gerais

### 📄 Schema JSON Oficial

A única exigência para que um banco funcione perfeitamente é que o arquivo JSON siga o contrato de dados tipado do projeto, definido em [`src/types/question.ts`](./src/types/question.ts).

#### Exemplo de Estrutura de Questão (`Question`):

```json
[
  {
    "sequence_id": 1,
    "metadata": {
      "reference_code": "EX-001",
      "subject": "Tecnologia",
      "topics": ["Arquitetura Web", "Frontend"],
      "tags": ["React", "Performance"],
      "year": 2026,
      "exam_board": "Geral",
      "institution": "Memoriz",
      "exam_name": "Simulado de Frontend",
      "role": "Engenheiro de Software"
    },
    "associated_context": {
      "has_associated_context": false,
      "title": "",
      "source": "",
      "content": ""
    },
    "stem": {
      "full_text": "No ecossistema do React 19, qual é a principal finalidade da diretiva 'use client'?"
    },
    "options": [
      {
        "letter": "A",
        "text": "Marcar um componente para ser renderizado e executado no cliente, habilitando hooks e interatividade."
      },
      {
        "letter": "B",
        "text": "Executar consultas SQL diretamente no navegador do cliente."
      },
      {
        "letter": "C",
        "text": "Desabilitar o uso de TypeScript em todo o arquivo."
      },
      {
        "letter": "D",
        "text": "Importar bibliotecas de estilo CSS de forma síncrona."
      }
    ],
    "resolution": {
      "cot_reasoning": "A diretiva 'use client' demarca a fronteira entre Server Components e Client Components no modelo moderno do React.",
      "deduced_answer": "A",
      "pedagogical_explanation": "A alternativa A está correta. A diretiva 'use client' indica ao compilador que o módulo deve ser empacotado para o bundle do cliente, permitindo interatividade via hooks como useState e useEffect."
    },
    "difficulty": {
      "estimated_level": 2,
      "estimation_method": "human_estimated"
    }
  }
]
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** (ou yarn / pnpm)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Syuliskav/Memoriz-site.git
   cd Memoriz-site
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   O app estará disponível em `http://localhost:3000`.

### Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor Vite em modo de desenvolvimento |
| `npm run build` | Valida conformidade de tokens e compila o projeto para produção |
| `npm run preview` | Executa a prévia local do build compilado em `dist/` |
| `npm run lint` | Valida tipagem estática e sintaxe via TypeScript (`tsc --noEmit`) |
| `npm run check:colors` | Verifica se 100% dos componentes utilizam tokens semânticos de tema |

---

## 🤖 Desenvolvimento & Assistência de IA

O desenvolvimento, a arquitetura de estado e a refatoração do **Memoriz** contaram em grande parte com a colaboração e assistência contínua dos modelos da família **Google Gemini** (através do Google AI Studio), auxiliando na geração de interfaces acessíveis, algoritmos de indexação em memória, tratamento de subpixel e harmonia de temas.

---

## 👤 Autor & Mantenedor

Desenvolvido e mantido por **[Syuliskav](https://github.com/Syuliskav)**.

Repositório: [Syuliskav/Memoriz-site](https://github.com/Syuliskav/Memoriz-site)
