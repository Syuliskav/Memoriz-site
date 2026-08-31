import { QuestionBankRoot } from '../types/question';

export const initialQuestionBank: QuestionBankRoot = {
  question_bank: [
    {
      sequence_id: 1,
      metadata: {
        reference_code: "Q3950352",
        subject: "Português",
        topics: ["Pontuação", "Uso da Vírgula", "Sintaxe"],
        year: 2025,
        exam_board: "IGEDUC",
        institution: "Câmara de Craíbas - AL",
        exam_name: "IGEDUC - 2025 - Câmara de Craíbas - AL - Agente Administrativo",
        role: "Agente Administrativo"
      },
      associated_context: {
        has_associated_context: true,
        title: "O Desafio da Leitura Digital e a Atenção Profunda",
        source: "Revista Educação & Sociedade / bbc.com/portuguese (Adaptado)",
        content: "O professor Régis Marques, ao analisar o impacto da tecnologia na cognição de jovens universitários, observou que a leitura fragmentada em telas altera os circuitos neurais da atenção profunda.\n\nEmbora muitos defendam que a hiperconectividade amplia a velocidade de busca, pesquisadores alertam que a capacidade de retenção e síntese textual sofre perdas substanciais quando não há pausas reflexivas durante o estudo."
      },
      stem: {
        full_text: "Considerando as regras gramaticais de pontuação e a estrutura sintática do texto de apoio, analise as assertivas a seguir:\n\nI. A vírgula empregada após 'Régis Marques' e após 'jovens universitários' no primeiro parágrafo é obrigatória por isolar uma oração subordinada adverbial temporal reduzida de infinitivo intercalada.\nII. No segundo parágrafo, a vírgula após 'velocidade de busca' separa uma oração subordinada adverbial concessiva anteposta à oração principal.\nIII. É facultativo o emprego da vírgula antes do conectivo 'e' em 'retenção e síntese textual'.\n\nAssinale a alternativa CORRETA:"
      },
      options: [
        { letter: "A", text: "Apenas a assertiva I está correta." },
        { letter: "B", text: "Apenas a assertiva III está correta." },
        { letter: "C", text: "Apenas as assertivas I e II estão corretas." },
        { letter: "D", text: "Todas as assertivas estão corretas." }
      ],
      resolution: {
        cot_reasoning: "Passo 1: Analisar o item I. 'ao analisar o impacto da tecnologia...' é oração subordinada adverbial temporal reduzida de gerúndio/infinitivo ('ao analisar'). Estando intercalada entre o sujeito ('O professor Régis Marques') e o predicado ('observou que...'), a dupla vírgula é obrigatória. Item I verdadeiro.\nPasso 2: Analisar o item II. 'Embora muitos defendam que a hiperconectividade amplia a velocidade de busca' introduz uma oração subordinada adverbial concessiva anteposta. A vírgula que a separa da oração principal ('pesquisadores alertam que...') é de uso obrigatório pela norma culta. Item II verdadeiro.\nPasso 3: Analisar o item III. Em 'capacidade de retenção e síntese textual', o conectivo 'e' une termos que exercem a mesma função sintática (núcleos do complemento nominal) sem sujeitos distintos. Nesses casos, a vírgula antes do 'e' é proibida, e não facultativa. Item III falso.\nPasso 4: Conclusão: Itens I e II corretos.",
        deduced_answer: "C",
        pedagogical_explanation: "Gabarito: C. As assertivas I e II são verdadeiras. A primeira justifica-se pela intercalação de oração adverbial temporal reduzida de infinitivo ('ao analisar...'), exigindo isolamento por vírgulas. A segunda é correta porque orações subordinadas adverbiais antepostas à oração principal exigem vírgula obrigatória. A assertiva III é incorreta porque não se emprega vírgula antes de 'e' aditivo que liga termos com mesma função sintática e mesmo sujeito."
      }
    },
    {
      sequence_id: 2,
      metadata: {
        reference_code: "Q3950353",
        subject: "Direito Administrativo",
        topics: ["Princípios Constitucionais", "Artigo 37 LIMPE", "Moralidade e Impessoalidade"],
        year: 2025,
        exam_board: "CESPE / CEBRASPE",
        institution: "Tribunal Regional Federal (TRF)",
        exam_name: "TRF - 2025 - Analista Judiciário - Área Administrativa",
        role: "Analista Judiciário"
      },
      associated_context: {
        has_associated_context: false,
        title: "",
        source: "",
        content: ""
      },
      stem: {
        full_text: "Acerca dos princípios fundamentais da Administração Pública expressos e implícitos na Constituição Federal de 1988, assinale a opção correta:"
      },
      options: [
        { letter: "A", text: "O princípio da moralidade administrativa confunde-se com a moralidade comum e dispensa a observância de preceitos éticos objetivos codificados." },
        { letter: "B", text: "O princípio da impessoalidade proíbe que constem nomes, símbolos ou imagens que caracterizem promoção pessoal de autoridades em publicidade de atos oficiais." },
        { letter: "C", text: "Pelo princípio da legalidade estrita, o particular e o agente público submetem-se exatamente à mesma regra: ambos só podem agir conforme a lei expressamente autorizar." },
        { letter: "D", text: "O princípio da eficiência autoriza o gestor público a descumprir procedimentos legais formais desde que o resultado econômico final seja mais vantajoso para o erário." }
      ],
      resolution: {
        cot_reasoning: "Passo 1: Avaliar a letra A: A moralidade administrativa é jurídica e objetiva (não se confunde meramente com a moralidade comum subjetiva) e exige preceitos éticos de probidade e boa-fé. Incorreta.\nPasso 2: Avaliar a letra B: O § 1º do art. 37 da CF/88 estabelece que a publicidade dos atos, programas e obras dos órgãos públicos deve ter caráter educativo, informativo ou de orientação social, dela não podendo constar nomes, símbolos ou imagens que caracterizem promoção pessoal de autoridades. É a clássica manifestação da impessoalidade. Correta.\nPasso 3: Avaliar a letra C: O particular pode fazer tudo o que a lei não proíbe (art. 5º, II da CF), enquanto a Administração só pode fazer o que a lei autoriza/determina (art. 37, caput). Incorreta.\nPasso 4: Avaliar a letra D: A eficiência nunca se sobrepõe à legalidade estrita; o princípio da juridicidade impede a quebra de ritos formais sob pretexto de economia. Incorreta.",
        deduced_answer: "B",
        pedagogical_explanation: "Gabarito: B. Conforme o art. 37, § 1º da CF/88, o princípio da impessoalidade veda a promoção pessoal de autoridades ou servidores em campanhas, obras e atos do poder público. A publicidade governamental deve ter finalidade estritamente institucional, educativa ou informativa."
      }
    },
    {
      sequence_id: 3,
      metadata: {
        reference_code: "Q3950354",
        subject: "Direito Constitucional",
        topics: ["Direitos e Garantias Fundamentais", "Artigo 5º", "Liberdades e Remédios Constitucionais"],
        year: 2024,
        exam_board: "FGV",
        institution: "Câmara dos Deputados",
        exam_name: "FGV - 2024 - Câmara dos Deputados - Técnico Legislativo",
        role: "Técnico Legislativo"
      },
      associated_context: {
        has_associated_context: false,
        title: "",
        source: "",
        content: ""
      },
      stem: {
        full_text: "Com base no rol dos direitos e deveres individuais e coletivos previstos no artigo 5º da Constituição Federal de 1988, assinale a afirmativa INCORRETA:"
      },
      options: [
        { letter: "A", text: "A casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, para prestar socorro, ou, durante o dia, por determinação judicial." },
        { letter: "B", text: "É livre a manifestação do pensamento, sendo vedado o anonimato." },
        { letter: "C", text: "A criação de associações e, na forma da lei, a de cooperativas independem de autorização, sendo vedada a interferência estatal em seu funcionamento." },
        { letter: "D", text: "As associações só poderão ter suas atividades suspensas por decisão judicial transitada em julgado." }
      ],
      resolution: {
        cot_reasoning: "Passo 1: A questão pede a alternativa INCORRETA (comando negativo).\nPasso 2: Analisar a Letra A: Reproduz fielmente o art. 5º, XI (inviolabilidade domiciliar). Correta (portanto não é o gabarito).\nPasso 3: Analisar a Letra B: Reproduz fielmente o art. 5º, IV (livre manifestação e vedação ao anonimato). Correta.\nPasso 4: Analisar a Letra C: Reproduz fielmente o art. 5º, XVIII (independência e vedação à interferência estatal em associações). Correta.\nPasso 5: Analisar a Letra D: O art. 5º, XIX prevê que a DISSOLUÇÃO compulsória exige trânsito em julgado, ao passo que a mera SUSPENSÃO de atividades exige apenas decisão judicial, dispensando o trânsito em julgado. Logo, a letra D está incorreta.",
        deduced_answer: "D",
        pedagogical_explanation: "Gabarito: D (Incorreta). Segundo o art. 5º, inciso XIX da CF/88: 'as associações só poderão ser compulsoriamente dissolvidas ou ter suas atividades suspensas por decisão judicial, exigindo-se, no primeiro caso (dissolução), o trânsito em julgado'. Para a simples suspensão de atividades, basta uma decisão judicial interlocutória ou liminar, não se exigindo o trânsito em julgado."
      }
    },
    {
      sequence_id: 4,
      metadata: {
        reference_code: "Q3950355",
        subject: "Administração Pública & Geral",
        topics: ["Funções Administrativas", "Ciclo PDCA", "Melhoria Contínua"],
        year: 2025,
        exam_board: "VUNESP",
        institution: "Prefeitura Municipal de São Paulo",
        exam_name: "VUNESP - 2025 - Analista de Planejamento e Gestão Pública",
        role: "Analista de Gestão"
      },
      associated_context: {
        has_associated_context: false,
        title: "",
        source: "",
        content: ""
      },
      stem: {
        full_text: "O Ciclo PDCA (Plan, Do, Check, Act) é uma das metodologias clássicas de gestão da qualidade mais difundidas na administração contemporânea. Em relação às etapas desse ciclo, assinale a alternativa que descreve corretamente a etapa 'Check' (Checar/Verificar):"
      },
      options: [
        { letter: "A", text: "Definição de metas estratégicas e elaboração do plano de ação com alocação dos recursos orçamentários." },
        { letter: "B", text: "Execução estrita das tarefas planejadas e treinamento intensivo das equipes operacionais." },
        { letter: "C", text: "Mensuração, monitoramento dos processos e comparação dos resultados obtidos com os padrões previamente planejados." },
        { letter: "D", text: "Padronização das práticas bem-sucedidas e implementação imediata de ações corretivas para desvios identificados." }
      ],
      resolution: {
        cot_reasoning: "Passo 1: Revisar as 4 etapas do PDCA:\n- Plan (Planejar): definição de metas, métodos e planos de ação (Letra A).\n- Do (Executar): execução do plano e treinamento de pessoal (Letra B).\n- Check (Verificar/Checar): acompanhamento, medição de indicadores e comparação entre o executado e o planejado (Letra C).\n- Act (Agir/Corrigir): padronização e correções de desvios (Letra D).\nPasso 2: A pergunta exige especificamente a descrição da etapa 'Check', que corresponde à Letra C.",
        deduced_answer: "C",
        pedagogical_explanation: "Gabarito: C. A etapa Check (Verificar/Controlar) é dedicada ao monitoramento e à avaliação periódica dos indicadores de desempenho, confrontando os resultados reais alcançados na fase Do com as metas e diretrizes estipuladas na fase Plan."
      }
    },
    {
      sequence_id: 5,
      metadata: {
        reference_code: "Q3950356",
        subject: "Noções de Informática",
        topics: ["Segurança da Informação", "Backup 3-2-1", "Autenticação em Dois Fatores"],
        year: 2025,
        exam_board: "CEBRASPE",
        institution: "Polícia Federal (PF)",
        exam_name: "CEBRASPE - 2025 - Agente Administrativo da PF",
        role: "Agente Administrativo"
      },
      associated_context: {
        has_associated_context: false,
        title: "",
        source: "",
        content: ""
      },
      stem: {
        full_text: "Na gestão da segurança da informação em ambientes corporativos e governamentais, a estratégia de backup conhecida como regra 3-2-1 preconiza que a organização deve:"
      },
      options: [
        { letter: "A", text: "Realizar backups 3 vezes ao dia, em 2 computadores diferentes, mantendo 1 técnico de suporte responsável." },
        { letter: "B", text: "Manter pelo menos 3 cópias dos dados, armazenadas em 2 tipos diferentes de mídias, com 1 dessas cópias guardada em local físico ou nuvem externamente separado (off-site)." },
        { letter: "C", text: "Utilizar 3 algoritmos de criptografia simultâneos, com 2 chaves de segurança e 1 senha mestra biométrica." },
        { letter: "D", text: "Garantir que a recuperação ocorra em até 3 horas, por 2 analistas seniores, com taxa de perda máxima de 1% dos dados." }
      ],
      resolution: {
        cot_reasoning: "Passo 1: A regra '3-2-1' é um padrão consagrado mundialmente pelo CERT e NIST em continuidade de negócios e proteção contra ransomware.\nPasso 2: Desmembramento da regra:\n- 3: Ter ao menos 3 cópias dos dados (1 original + 2 backups);\n- 2: Utilizar 2 tipos de mídias de armazenamento diferentes (ex: SSD/NAS local e fita/Storage);\n- 1: Manter 1 cópia fora do local principal (offsite / cloud backup).\nPasso 3: A alternativa B traduz com precisão técnica essa definição.",
        deduced_answer: "B",
        pedagogical_explanation: "Gabarito: B. A regra de ouro de backup 3-2-1 estabelece: 3 cópias dos dados vitais, armazenadas em 2 suportes/mídias distintas (ex: disco rígido local e servidor de arquivos) e 1 cópia mantida fora do ambiente físico da organização (off-site ou cloud), garantindo resiliência contra desastres e invasões."
      }
    },
    {
      sequence_id: 6,
      metadata: {
        reference_code: "Q3950357",
        subject: "Segurança e Saúde no Trabalho (SST)",
        topics: ["Ergonomia NR-17", "Postos de Trabalho", "Prevenção de LER/DORT"],
        year: 2024,
        exam_board: "FUNDATEC",
        institution: "Tribunal de Contas do Estado (TCE)",
        exam_name: "FUNDATEC - 2024 - TCE - Oficial de Controle Externo",
        role: "Oficial Administrativo"
      },
      associated_context: {
        has_associated_context: false,
        title: "",
        source: "",
        content: ""
      },
      stem: {
        full_text: "Em conformidade com as diretrizes da Norma Regulamentadora nº 17 (NR-17 - Ergonomia), a respeito do trabalho em atividades de digitação e operação em postos de trabalho informatizados, assinale a alternativa correta:"
      },
      options: [
        { letter: "A", text: "O número máximo de toques reais exigidos pelo empregador não deve ultrapassar o limite de 8.000 toques por hora trabalhada." },
        { letter: "B", text: "O tempo efetivo de trabalho de entrada de dados não deve exceder o limite máximo de 5 horas diárias, sendo que no período restante o trabalhador poderá exercer outras atividades que não exijam movimentos repetitivos." },
        { letter: "C", text: "As pausas ergonômicas devem ser descontadas da jornada normal de trabalho ou compensadas ao final do expediente." },
        { letter: "D", text: "O apoio para os pés é obrigatório exclusivamente para trabalhadores com altura inferior a 1,50m." }
      ],
      resolution: {
        cot_reasoning: "Passo 1: Analisar os preceitos da NR-17 (Anexo II e itens de digitação):\n- Letra A: O número máximo de toques reais por hora é de 8.000 toques. Correto conforme item específico da NR-17 para operadores de digitação.\n- Letra B: O limite máximo para entrada de dados é de 5 horas diárias e deve haver pausas de 10 minutos a cada 50 minutos trabalhados. Analisar A vs B: A redação de 8.000 toques por hora é a regra direta do item 17.6.4/anexo.\n- Letra C: As pausas ergonômicas devem ser computadas como tempo de trabalho efetivo (não podem ser descontadas nem compensadas). Incorreta.\n- Letra D: O apoio para pés deve ser fornecido sempre que os pés do trabalhador não alcancem o piso com a cadeira ajustada ergonomicamente (não há corte fixo de 1,50m). Incorreta.\nPasso 2: A assertiva A é a regra canônica expressa na NR-17.",
        deduced_answer: "A",
        pedagogical_explanation: "Gabarito: A. Conforme os parâmetros ergonômicos da NR-17 para operadores de digitação, o número de toques reais não pode ultrapassar 8.000 por hora de trabalho e o tempo total de digitação não pode exceder 5 horas diárias, com pausas obrigatórias inclusas na jornada."
      }
    },
    {
      sequence_id: 7,
      metadata: {
        reference_code: "Q3950358",
        subject: "Legislação Específica e Transparência",
        topics: ["Lei de Acesso à Informação (LAI)", "Lei 12.527/2011", "Classificação de Sigilo"],
        year: 2025,
        exam_board: "IBFC",
        institution: "Secretaria de Estado de Administração",
        exam_name: "IBFC - 2025 - Analista de Políticas Públicas e Gestão Governamental",
        role: "Analista de Gestão"
      },
      associated_context: {
        has_associated_context: false,
        title: "",
        source: "",
        content: ""
      },
      stem: {
        full_text: "A Lei Federal nº 12.527/2011 (Lei de Acesso à Informação - LAI) regulamenta o direito constitucional de acesso a informações públicas. Quanto aos prazos máximos de restrição de acesso a informações classificadas como sigilosas, assinale a alternativa que apresenta a correspondência CORRETA entre grau de sigilo e prazo:"
      },
      options: [
        { letter: "A", text: "Ultrassecreta: 50 anos | Secreta: 25 anos | Reservada: 10 anos." },
        { letter: "B", text: "Ultrassecreta: 25 anos | Secreta: 15 anos | Reservada: 5 anos." },
        { letter: "C", text: "Ultrassecreta: 30 anos | Secreta: 20 anos | Reservada: 5 anos." },
        { letter: "D", text: "Ultrassecreta: 20 anos | Secreta: 10 anos | Reservada: 2 anos." }
      ],
      resolution: {
        cot_reasoning: "Passo 1: Consultar o art. 24 da Lei nº 12.527/2011:\nArt. 24, § 1º Os prazos máximos de restrição de acesso à informação, vigorando a partir da data de sua produção, são:\nI - ultrassecreta: 25 (vinte e cinco) anos;\nII - secreta: 15 (quinze) anos;\nIII - reservada: 5 (cinco) anos.\nPasso 2: Mnemônico clássico: 25 - 15 - 5.\nPasso 3: A alternativa B apresenta a correspondência exata.",
        deduced_answer: "B",
        pedagogical_explanation: "Gabarito: B. De acordo com o art. 24, § 1º da Lei nº 12.527/2011 (LAI), os prazos máximos de sigilo são: Ultrassecreta = 25 anos; Secreta = 15 anos; Reservada = 5 anos. Lembrar da sequência decrescente: 25, 15, 5."
      }
    },
    {
      sequence_id: 8,
      metadata: {
        reference_code: "Q3950359",
        subject: "Arquivologia & Secretariado",
        topics: ["Gestão Documental", "Métodos de Arquivamento", "Teoria das Três Idades"],
        year: 2024,
        exam_board: "QUADRIX",
        institution: "Conselho Regional de Medicina",
        exam_name: "QUADRIX - 2024 - CRM - Assistente Administrativo",
        role: "Assistente Administrativo"
      },
      associated_context: {
        has_associated_context: false,
        title: "",
        source: "",
        content: ""
      },
      stem: {
        full_text: "A Teoria das Três Idades (ou Ciclo Vital dos Documentos) divide o acervo documental em três fases sequenciais de acordo com a frequência de consulta e o valor dos registros. Sobre a fase 'Intermediária' (2ª idade), é correto afirmar que nela os documentos:"
      },
      options: [
        { letter: "A", text: "Estão em curso ou são consultados frequentemente pelo setor gerador, devendo permanecer nos arquivos correntes setoriais." },
        { letter: "B", text: "Perderam o valor administrativo, mas adquiriram valor histórico, probatório ou cultural perpétuo, sendo inalienáveis e imprescritíveis." },
        { letter: "C", text: "Apresentam uso pouco frequente pelo órgão produtor, aguardando o cumprimento de prazos prescricionais ou precaucionais antes de sua destinação final (eliminação ou recolhimento permanente)." },
        { letter: "D", text: "Devem ser sumariamente incinerados ou triturados sem necessidade de elaboração de Tabela de Temporalidade Documental." }
      ],
      resolution: {
        cot_reasoning: "Passo 1: Rever as três idades documentais:\n1ª Idade (Corrente): valor primário/administrativo imediato, uso frequente, guardados junto aos setores criadores (Letra A).\n2ª Idade (Intermediária): valor primário remanescente, uso eventual/pouco frequente, aguardando prazos legais/precaucionais para destinação final (Letra C).\n3ª Idade (Permanente/Histórica): valor secundário (histórico/cultural), guarda definitiva, nunca eliminados (Letra B).\nPasso 2: A Letra C sintetiza com rigor o conceito do Arquivo Intermediário.",
        deduced_answer: "C",
        pedagogical_explanation: "Gabarito: C. No arquivo intermediário (segunda idade), encontram-se os documentos cujo uso corrente cessou, mas que ainda não podem ser eliminados nem recolhidos ao arquivo permanente, pois cumprem prazos de guarda pré-estabelecidos na Tabela de Temporalidade Documental (TTD)."
      }
    },
    {
      sequence_id: 9,
      metadata: {
        reference_code: "Q3950360",
        subject: "Contabilidade Geral, Pública e Custos",
        topics: ["Demonstrações Contábeis", "Balanço Patrimonial", "Equação Patrimonial"],
        year: 2025,
        exam_board: "FCC",
        institution: "Secretaria da Fazenda Estadual (SEFAZ)",
        exam_name: "FCC - 2025 - SEFAZ - Auditor Fiscal da Receita Estadual",
        role: "Auditor Fiscal"
      },
      associated_context: {
        has_associated_context: false,
        title: "",
        source: "",
        content: ""
      },
      stem: {
        full_text: "Uma determinada entidade comercial adquiriu mercadorias para revenda no valor de R$ 100.000,00, pagando 40% à vista por transferência bancária e o restante a prazo (com vencimento em 60 dias). Desconsiderando tributos, o registro contábil desse fato no Balanço Patrimonial da adquirente provoca:"
      },
      options: [
        { letter: "A", text: "Aumento do Ativo Circulante em R$ 60.000,00 e Aumento do Passivo Circulante em R$ 60.000,00, sem alteração no Patrimônio Líquido." },
        { letter: "B", text: "Aumento do Ativo Circulante em R$ 100.000,00 e Aumento do Patrimônio Líquido em R$ 100.000,00." },
        { letter: "C", text: "Diminuição do Ativo Circulante em R$ 40.000,00 e Aumento do Passivo Circulante em R$ 60.000,00." },
        { letter: "D", text: "Aumento do Patrimônio Líquido em R$ 40.000,00 devido à incorporação das mercadorias ao estoque." }
      ],
      resolution: {
        cot_reasoning: "Passo 1: Analisar os lançamentos:\n- Débito: Estoques (Ativo Circulante) -> + R$ 100.000,00\n- Crédito: Bancos Conta Movimento (Ativo Circulante) -> - R$ 40.000,00\n- Crédito: Fornecedores (Passivo Circulante) -> + R$ 60.000,00\nPasso 2: Variação líquida no Ativo Circulante:\n+100.000 (Estoque) - 40.000 (Caixa/Banco) = + R$ 60.000,00.\nPasso 3: Variação no Passivo Circulante:\n+ R$ 60.000,00 (Fornecedores).\nPasso 4: Fato permutativo patrimonial (não altera o Patrimônio Líquido no momento da compra).\nPasso 5: A alternativa A está perfeitamente correta.",
        deduced_answer: "A",
        pedagogical_explanation: "Gabarito: A. A operação é um fato permutativo: o Ativo aumenta em R$ 100.000 (estoque) e diminui em R$ 40.000 (banco), resultando em aumento líquido de R$ 60.000 no Ativo. O Passivo Circulante (fornecedores) aumenta simultaneamente em R$ 60.000, mantendo a equação patrimonial equilibrada sem alterar o PL."
      }
    },
    {
      sequence_id: 10,
      metadata: {
        reference_code: "Q3950361",
        subject: "Matemática & Gerência de Projetos",
        topics: ["Aritmética e Proporção", "Regra de Três Composta", "Raciocínio Lógico"],
        year: 2025,
        exam_board: "CESGRANRIO",
        institution: "Caixa Econômica Federal",
        exam_name: "CESGRANRIO - 2025 - CEF - Técnico Bancário",
        role: "Técnico Bancário"
      },
      associated_context: {
        has_associated_context: false,
        title: "",
        source: "",
        content: ""
      },
      stem: {
        full_text: "Para analisar 480 processos de auditoria interna, uma equipe de 6 analistas com igual produtividade trabalhou durante 8 dias, dedicando 6 horas por dia. Se a gerência receber uma nova demanda de 720 processos semelhantes e disponibilizar 9 analistas com o mesmo rendimento trabalhando 8 horas por dia, quantos dias serão necessários para concluir essa nova demanda?"
      },
      options: [
        { letter: "A", text: "4 dias." },
        { letter: "B", text: "6 dias." },
        { letter: "C", text: "8 dias." },
        { letter: "D", text: "10 dias." }
      ],
      resolution: {
        cot_reasoning: "Passo 1: Identificar grandezas:\nProcessos (P), Analistas (A), Dias (D), Horas/dia (H).\nSituação 1: P1 = 480, A1 = 6, D1 = 8, H1 = 6.\nSituação 2: P2 = 720, A2 = 9, D2 = x, H2 = 8.\n\nPasso 2: Montar a relação com a incógnita D (Dias):\n- Mais processos -> Mais dias (Diretamente Proporcional: 480 / 720 = 2 / 3)\n- Mais analistas -> Menos dias (Inversamente Proporcional: 9 / 6 = 3 / 2)\n- Mais horas/dia -> Menos dias (Inversamente Proporcional: 8 / 6 = 4 / 3)\n\nPasso 3: Equação da regra de três composta:\n8 / x = (480 / 720) * (9 / 6) * (8 / 6)\n8 / x = (2 / 3) * (3 / 2) * (4 / 3)\n8 / x = 1 * (4 / 3) = 4 / 3\n4 * x = 8 * 3 = 24\nx = 24 / 4 = 6 dias.\n\nPasso 4: Resultado: 6 dias (Letra B).",
        deduced_answer: "B",
        pedagogical_explanation: "Gabarito: B (6 dias). Aplicando a proporção composta: Dias = 8 * (720/480) * (6/9) * (6/8). Simplificando os fatores: (720/480 = 1.5), (6/9 = 2/3), (6/8 = 3/4). Multiplicando: 8 * 1.5 * (2/3) * (3/4) = 12 * 0.5 = 6 dias."
      }
    },
    {
      sequence_id: 11,
      metadata: {
        reference_code: "Q3950362",
        subject: "Português",
        topics: ["Morfologia", "Crase", "Regência Verbal"],
        year: 2025,
        exam_board: "FGV",
        institution: "Tribunal de Justiça (TJ)",
        exam_name: "FGV - 2025 - TJ - Analista Judiciário",
        role: "Analista Judiciário"
      },
      associated_context: {
        has_associated_context: false,
        title: "",
        source: "",
        content: ""
      },
      stem: {
        full_text: "Assinale a alternativa em que o sinal indicativo de crase foi empregado em estrita observância à norma-padrão da língua portuguesa:"
      },
      options: [
        { letter: "A", text: "O diretor comunicou à todos os servidores que haveria expediente normal no feriado." },
        { letter: "B", text: "O candidato declarou estar disposto à concorrer a qualquer vaga disponível no certame." },
        { letter: "C", text: "A audiência pública teve início às 14 horas, estendendo-se até o anoitecer." },
        { letter: "D", text: "O magistrado referiu-se à Vossa Excelência com elevado respeito e deferência." }
      ],
      resolution: {
        cot_reasoning: "Passo 1: Analisar letra A: 'todos' é pronome indefinido masculino plural. Crase proibida antes de pronomes indefinidos e palavras masculinas. Incorreta.\nPasso 2: Analisar letra B: 'concorrer' é verbo. Crase proibida antes de verbos. Incorreta.\nPasso 3: Analisar letra C: 'às 14 horas' indica hora exata determinada. O uso da crase antes de horas determinadas é de regra obrigatória. Correta.\nPasso 4: Analisar letra D: 'Vossa Excelência' é pronome de tratamento. Regra geral proíbe crase antes de pronomes de tratamento (com exceção de Senhora, Senhorita e Dona). Incorreta.",
        deduced_answer: "C",
        pedagogical_explanation: "Gabarito: C. É obrigatório o emprego do acento grave indicativo de crase antes da indicação de horas exatas/determinadas (ex: 'às 14 horas', 'às 8h30min'). As demais opções violam regras proibitivas: antes de pronome indefinido (A), antes de verbo (B) e antes de pronome de tratamento (D)."
      }
    },
    {
      sequence_id: 12,
      metadata: {
        reference_code: "Q3950363",
        subject: "Direito Administrativo",
        topics: ["Atos Administrativos", "Atributos do Ato", "Presunção de Legitimidade"],
        year: 2025,
        exam_board: "CEBRASPE",
        institution: "Controladoria-Geral da União (CGU)",
        exam_name: "CEBRASPE - 2025 - CGU - Auditor Federal de Finanças e Controle",
        role: "Auditor Federal"
      },
      associated_context: {
        has_associated_context: false,
        title: "",
        source: "",
        content: ""
      },
      stem: {
        full_text: "Acerca dos atributos dos atos administrativos (presunção de legitimidade/veracidade, imperatividade, autoexecutoriedade e tipicidade), assinale a opção correta:"
      },
      options: [
        { letter: "A", text: "A presunção de legitimidade possui caráter absoluto (jure et de jure), não admitindo prova em contrário por parte do administrado." },
        { letter: "B", text: "A autoexecutoriedade está presente em todos os atos administrativos indistintamente, autorizando inclusive a cobrança forçada de multas sem intervenção do Poder Judiciário." },
        { letter: "C", text: "A imperatividade é o atributo pelo qual os atos administrativos impõem obrigações a terceiros independentemente de sua concordância, não estando presente nos atos negociais ou enunciativos." },
        { letter: "D", text: "A tipicidade impede que a Administração Pública pratique atos discricionários, restringindo toda a atividade estatal a atos vinculados." }
      ],
      resolution: {
        cot_reasoning: "Passo 1: Analisar A: A presunção de legitimidade é relativa (juris tantum), admitindo prova em contrário com ônus da prova cabendo ao administrado. Incorreta.\nPasso 2: Analisar B: A autoexecutoriedade não existe em todos os atos (ex: cobrança de multa exige execução fiscal no Judiciário). Incorreta.\nPasso 3: Analisar C: Imperatividade (poder extroverso) impõe deveres unilaterais sem anuência do administrado; não existe em atos meramente negociais (licença, autorização) ou enunciativos (certidão). Correta.\nPasso 4: Analisar D: A tipicidade garante que o ato corresponda a figuras previamente delineadas em lei, mas não anula a discricionariedade quanto à conveniência e oportunidade. Incorreta.",
        deduced_answer: "C",
        pedagogical_explanation: "Gabarito: C. A imperatividade é o atributo pelo qual o ato administrativo se impõe coercitivamente ao particular, independentemente de sua prévia anuência. Ela não existe em atos negociais (onde há interesse e solicitação do particular) nem em atos enunciativos/declaratórios."
      }
    }
  ]
};
