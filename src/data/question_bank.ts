import { QuestionBankRoot } from '../types/question';

export const initialQuestionBank: QuestionBankRoot = {
  schema_version: '1.0.2',
  title: 'Religião 250: Jesus Cristo e Seu Evangelho Eterno',
  question_bank: [
    {
      sequence_id: 1,
      content_hash: "a1b2c3d4e5f60001",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q01",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Aprender de Cristo", "Doutrina e Convênios 19:23", "Mudança de Coração"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "Kim B. Clark", "Aprender de Mim"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "Aprender com o Salvador",
        source: "Lição 1: Material de preparação para a aula, Seção 1",
        content: "Depois de testificar do preço incompreensível que Ele pagou para expiar nossos pecados, o Salvador disse: 'Aprende de mim e ouve minhas palavras; anda na mansidão de meu Espírito e terás paz em mim' (D&C 19:23). O élder Kim B. Clark explicou que esse convite possui dois significados profundamente interligados."
      },
      stem: {
        full_text: "Ao analisar a admoestação do Salvador em Doutrina e Convênios 19:23, o élder Kim B. Clark explicou que a expressão 'aprende de mim' reúne dois significados essenciais para um aprendizado profundo. Quais são esses dois aspectos fundamentais destacados pelo líder?"
      },
      options: [
        {
          letter: "A",
          text: "Conhecer a cronologia dos eventos bíblicos e memorizar os mandamentos revelados aos profetas antigos.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Foca no acúmulo de dados cronológicos e memorização de regras, o que difere da explicação do élder Clark sobre transformação interior e discipulado."
        },
        {
          letter: "B",
          text: "Compreender os debates teológicos contemporâneos e aprimorar a capacidade de oratória em discursos públicos.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Trata de habilidades seculares de debate e retórica, enquanto o ensinamento trata do relacionamento espiritual com Cristo."
        },
        {
          letter: "C",
          "text": "Analisar o contexto geográfico da Palestina e comparar a moralidade do Velho Testamento com a do Novo.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Aponta para análises geográficas e comparativas externas, desviando-se dos dois eixos espirituais definidos na lição."
        },
        {
          letter: "D",
          text: "Investigar as evidências arqueológicas das escrituras e cumprir os ritos cerimoniais da congregação.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Concentra-se em evidências científicas e observância externa, elementos não contemplados na definição citada."
        },
        {
          letter: "E",
          text: "Aprender a conhecê-Lo por meio do renascimento espiritual e aprender com Seu exemplo agindo com fé.",
          is_correct: true,
          why_wrong_or_right: "Correta. O élder Kim B. Clark ensinou que 'aprende de mim' significa: 1) 'Aprende a me conhecer' (nascer espiritualmente Dele e mudar o coração); e 2) 'Aprende comigo' (seguir Seu exemplo perfeito ao agir com fé)."
        }
      ],
      resolution: {
        cot_reasoning: "A questão aborda diretamente a citação do élder Kim B. Clark na Seção 1 da Lição 1 sobre os dois significados de 'Aprende de mim'. O primeiro é 'Aprende a me conhecer' (renascimento espiritual) e o segundo é 'Aprende comigo' (seguir Seu exemplo agindo com fé). A alternativa correta deve articular esses dois conceitos sem apelar para erudição secular ou meros fatos históricos.",
        deduced_answer: "E",
        pedagogical_explanation: "O élder Kim B. Clark esclarece que o aprendizado profundo do Salvador não é meramente acadêmico; ele engloba 'aprender a conhecê-Lo' (experimentando uma vigorosa mudança de coração) e 'aprender com Ele' (imitando Seu exemplo e permitindo que Ele magnifique nossa capacidade de agir em retidão)."
      },
      difficulty: {
        estimated_level: 2,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 60
    },
    {
      sequence_id: 2,
      content_hash: "a1b2c3d4e5f60002",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q02",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Aprendizado Espiritual", "Método Científico", "Espírito Santo"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "Paul V. Johnson", "Conhecimento Espiritual"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "Aprendizado Espiritual versus Secular",
        source: "Lição 1: Material de preparação para a aula, Seção 2",
        content: "O élder Paul V. Johnson, dos setenta, distinguiu entre o aprendizado espiritual e o científico: 'O aprendizado de coisas espirituais (...) requer um método diferente do que o aprendizado de coisas científicas. O método científico e intelectual é muito útil, mas sozinho não levará ao conhecimento espiritual. O aprendizado de coisas espirituais envolve o intelecto, mas isso não basta. As coisas espirituais são aprendidas pelo Espírito'."
      },
      stem: {
        full_text: "A respeito dos limites e particularidades da busca pela verdade, o élder Paul V. Johnson estabeleceu uma relação entre o intelecto e a revelação. De acordo com essa instrução, como se adquire o conhecimento das coisas espirituais?"
      },
      options: [
        {
          letter: "A",
          text: "O intelecto humano participa do processo, mas a compreensão espiritual é obtida mediante a influência do Espírito.",
          is_correct: true,
          why_wrong_or_right: "Correta. O élder Johnson afirma claramente que o aprendizado espiritual envolve o intelecto, mas exige fundamentalmente o Espírito Santo para ser alcançado."
        },
        {
          letter: "B",
          text: "A investigação científica substitui o testemunho pessoal quando aplicada com rigor aos textos canônicos sagrados.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. A investigação científica não substitui o testemunho pessoal nem tem essa capacidade no domínio espiritual."
        },
        {
          letter: "C",
          text: "O raciocínio lógico deve ser inteiramente evitado nos estudos doutrinários para não prejudicar a sensibilidade espiritual.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O élder Johnson destaca que o aprendizado espiritual envolve sim o intelecto, não exigindo seu descarte."
        },
        {
          letter: "D",
          text: "A experimentação física e as evidências materiais constituem a base indispensável para a validação da doutrina.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. A validação espiritual vem pelo Espírito e pela fé, e não pela confirmação empírica ou material."
        },
        {
          letter: "E",
          text: "O método secular e o espiritual utilizam os mesmos critérios de avaliação, divergindo no vocabulário adotado.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O texto explicita que o aprendizado de coisas espirituais requer um método diferente do aprendizado secular."
        }
      ],
      resolution: {
        cot_reasoning: "O élder Paul V. Johnson ensina que o método científico e intelectual é útil e que o intelecto é utilizado no estudo espiritual, mas o intelecto isolado não alcança o conhecimento espiritual, pois este depende do Espírito.",
        deduced_answer: "A",
        pedagogical_explanation: "O aprendizado espiritual não descarta a mente nem os processos intelectuais, mas reconhece que a revelação espiritual e o testemunho vêm por intermédio do Espírito Santo, superando a capacidade do método puramente analítico."
      },
      difficulty: {
        estimated_level: 2,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 60
    },
    {
      sequence_id: 3,
      content_hash: "a1b2c3d4e5f60003",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q03",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Estudo e Fé", "Doutrina e Convênios 88:118", "Limitações do Racionalismo"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "Estudo de Caso", "Chloe", "D&C 88:118"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "Situação Didática: Diálogo sobre Racionalismo e Fé",
        source: "Lição 1: Material do professor, seção 'O Senhor nos ensinou como aprender a verdade espiritual'",
        content: "Chloe, uma amiga sua, tende a pensar de forma racional. Ela parece ter a necessidade de provar as coisas antes de acreditar nelas. Como ela sabe que você acredita em Jesus Cristo, ela pergunta como pode saber que Ele é real."
      },
      stem: {
        full_text: "Ao responder ao questionamento de Chloe sobre como saber da realidade do Salvador sem depender de validação puramente empírica, qual abordagem reflete os princípios do evangelho apresentados na lição?"
      },
      options: [
        {
          letter: "A",
          text: "Explicar que a razão humana deve ser deixada de lado, pois a busca de conhecimento racional neutraliza a revelação.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O evangelho incentiva o estudo diligente nos melhores livros ('pelo estudo e pela fé'), sem rejeitar a faculdade intelectual."
        },
        {
          letter: "B",
          text: "Apresentar argumentos acadêmicos para que ela aceite a historicidade de Cristo antes de tentar qualquer oração.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Argumentos intelectuais isolados não geram testemunho espiritual de acordo com a lição."
        },
        {
          letter: "C",
          text: "Convidá-la a unir o estudo diligente com o exercício da fé, buscando a confirmação que vem por meio do Espírito Santo.",
          is_correct: true,
          why_wrong_or_right: "Correta. Alinha-se perfeitamente a D&C 88:118 e aos ensinamentos da lição sobre buscar a verdade tanto pelo estudo quanto pela fé, compreendendo o papel do Espírito."
        },
        {
          letter: "D",
          text: "Argumentar que a fé independe de qualquer tipo de evidência textual ou esforço de estudo reflexivo.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Desconsidera a orientação do Senhor em D&C 88:118 de buscar palavras de sabedoria nos melhores livros."
        },
        {
          letter: "E",
          text: "Indicar que o testemunho pessoal só pode ser desenvolvido após a constatação empírica dos milagres do Salvador.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Inverte o princípio bíblico e doutrinário ao condicionar a fé a sinais empíricos prévios."
        }
      ],
      resolution: {
        cot_reasoning: "O estudo de caso da Chloe é retirado diretamente do Manual do Professor (Lição 1). O manual orienta a debater as limitações da abordagem científica isolada e convidar ao padrão de D&C 88:118 ('procurai conhecimento pelo estudo e também pela fé') e o testemunho pelo Espírito.",
        deduced_answer: "C",
        pedagogical_explanation: "Para ajudar alguém de mente racional como Chloe, a lição ensina que os métodos intelectuais têm utilidade, mas o conhecimento das coisas divinas exige a combinação do estudo cuidadoso com a disposição de agir com fé para receber o testemunho do Espírito Santo."
      },
      difficulty: {
        estimated_level: 3,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      "estimated_time_seconds": 75
    },
    {
      sequence_id: 4,
      content_hash: "a1b2c3d4e5f60004",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q04",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Boas-Novas", "Expiação", "3 Néfi 27", "Jeffrey R. Holland"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "Assertivas Combinadas", "Evangelho"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "O Significado do Evangelho como Boas-Novas",
        source: "Lição 1: Material de preparação para a aula, Seção 1",
        content: "A palavra evangelho significa 'boas-novas'. Em 3 Néfi 27 e nos discursos dos líderes da Igreja, aprendemos que o evangelho é a mensagem de esperança de que Cristo realizou a Expiação para redimir a humanidade da morte física e espiritual."
      },
      stem: {
        full_text: "Com base nos ensinamentos de 3 Néfi 27:13–16, 20–21 e nas declarações do élder Jeffrey R. Holland sobre as 'boas-novas' do evangelho, analise as seguintes afirmações:\n\nI. As boas-novas declaram que a morte e o inferno foram vencidos e que os pecados podem ser superados pela Expiação de Jesus Cristo.\nII. O Salvador definiu Seu evangelho pela missão de fazer a vontade do Pai, sendo levantado na cruz para atrair as pessoas a Ele.\nIII. A mensagem do evangelho promete a imunidade contra tribulações temporais àqueles que cumprem os ritos da Igreja.\nIV. Os indivíduos são santificados pelo arrependimento, pelo batismo na água e pela recepção do dom do Espírito Santo.\n\nEstão corretas as afirmações:"
      },
      options: [
        {
          letter: "A",
          text: "I, II e III.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. A proposição III é falsa, pois o evangelho não ensina imunidade contra desafios e tribulações nesta vida mortal."
        },
        {
          letter: "B",
          text: "II, III e IV.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Inclui a afirmação III, que deturpa os propósitos e as promessas da Expiação e da vida mortal."
        },
        {
          letter: "C",
          text: "I, II e IV.",
          is_correct: true,
          why_wrong_or_right: "Correta. As afirmativas I, II e IV reproduzem fielmente o texto de 3 Néfi 27:13–21 e a citação do élder Holland sobre a vitória sobre o pecado e a morte."
        },
        {
          letter: "D",
          text: "I e IV.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Embora I e IV sejam verdadeiras, omite a afirmativa II, que é parte essencial da definição de Cristo sobre Seu próprio evangelho."
        }
      ],
      resolution: {
        cot_reasoning: "Examinando as assertivas: I é correta (élder Holland: escapar da morte e do inferno, erros superados). II é correta (3 Néfi 27:13-14: vim ao mundo para fazer a vontade de meu Pai, levantado na cruz). III é incorreta (não há promessa de ausência de aflições terrenas). IV é correta (3 Néfi 27:20: santificados pela recepção do Espírito Santo). Logo, I, II e IV estão corretas.",
        deduced_answer: "C",
        pedagogical_explanation: "As 'boas-novas' do evangelho de Cristo centram-se em Sua Expiação e na redenção oferecida por meio da submissão à vontade do Pai, exigindo de nós fé, arrependimento, batismo e santificação pelo Espírito, sem prometer ausência de provações na mortalidade."
      },
      difficulty: {
        estimated_level: 3,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 80
    },
    {
      sequence_id: 5,
      content_hash: "a1b2c3d4e5f60005",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q05",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Aprendizado pela Fé", "Russell M. Nelson", "Obediência"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "Presidente Nelson", "Aprender pela Fé"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "Aprender pela Fé",
        source: "Lição 1: Material de preparação para a aula, Seção 2",
        content: "O presidente Russell M. Nelson explicou: 'Fortalecemos nossa fé em Jesus Cristo ao nos esforçarmos para guardar Seus mandamentos e 'recordá-lo sempre' (Morôni 4:3). Além disso, nossa fé aumenta cada vez que exercemos nossa fé Nele. É isso o que significa aprender pela fé'."
      },
      stem: {
        full_text: "Em sua explicação sobre o significado de aprender pela fé, o presidente Russell M. Nelson descreveu a dinâmica espiritual que fortalece a confiança no Salvador. De acordo com o profeta, como essa fé é expandida no cotidiano?"
      },
      options: [
        {
          letter: "A",
          text: "A fé cresce à medida que a exercitamos ativamente ao obedecer aos mandamentos e resistir a ideias contrárias aos convênios.",
          is_correct: true,
          why_wrong_or_right: "Correta. O presidente Nelson ensina que a fé aumenta cada vez que a exercemos em obediência prática, inclusive quando confrontamos opiniões populares ou tentações."
        },
        {
          letter: "B",
          text: "A fé é fortalecida principalmente pelo acúmulo de leituras históricas sobre os povos do passado sem demandar decisões diárias.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. A leitura passiva ou puramente histórica não constitui o exercício ativo da fé descrito pelo profeta."
        },
        {
          letter: "C",
          text: "A fé se estabelece de forma definitiva após a participação nas ordenanças iniciais, tornando desnecessários novos esforços.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Aprender pela fé é um processo dinâmico e contínuo, não estático após ordenanças."
        },
        {
          letter: "D",
          text: "A fé se desenvolve quando as circunstâncias externas eliminam as oposições e facilitam a observância das normas sociais.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O presidente Nelson destaca que a fé se fortalece justamente ao mantermos os padrões 'mesmo quando as opiniões populares nos menosprezam'."
        },
        {
          letter: "E",
          text: "A fé depende da validação de conceitos doutrinários por meio de debates acadêmicos estruturados.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O alicerce da fé no evangelho provém da ação em retidão e da revelação espiritual, não de debates seculares."
        }
      ],
      resolution: {
        cot_reasoning: "O presidente Russell M. Nelson enfatiza que aprender pela fé ocorre ao guardarmos os mandamentos, recordarmos o Salvador e exercitarmos a fé na prática (como ao resistir a entretenimentos ou ideologias que quebram convênios e ao estudar o Livro de Mórmon).",
        deduced_answer: "A",
        pedagogical_explanation: "Aprender pela fé é um processo contínuo de ação e obediência. Quando escolhemos seguir as leis de Deus diante da oposição do mundo, a prática deliberada da fé resulta em maior força e convicção espiritual."
      },
      difficulty: {
        estimated_level: 2,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 60
    },
    {
      sequence_id: 6,
      content_hash: "a1b2c3d4e5f60006",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q06",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Aprendizado pela Fé", "David A. Bednar", "Doutrina e Convênios 88:118"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "David A. Bednar", "Ação do Aluno"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "A Exigência do Aprendizado pela Fé",
        source: "Introdução ao curso e Lição 1: Material de preparação para a aula, Seção 2",
        content: "O élder David A. Bednar, do Quórum dos Doze Apóstolos, ensinou: 'O aprendizado pela fé exige esforço físico, mental e espiritual e não apenas uma receptividade passiva. (...) O aluno precisa exercer fé e agir para obter tal conhecimento por si mesmo'."
      },
      stem: {
        full_text: "Ao analisar as condições necessárias para que os alunos recebam conhecimento espiritual, o élder David A. Bednar definiu a postura esperada do estudante no processo de aprendizagem. Qual é essa característica fundamental?"
      },
      options: [
        {
          letter: "A",
          text: "Adotar uma atitude receptiva e silenciosa, aguardando que o instrutor apresente todas as interpretações doutrinárias.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O élder Bednar adverte expressamente contra 'uma receptividade passiva' no aprendizado do evangelho."
        },
        {
          letter: "B",
          text: "Empenhar esforço físico, mental e espiritual ativo, agindo com fé para adquirir o conhecimento por si mesmo.",
          is_correct: true,
          why_wrong_or_right: "Correta. O apóstolo ensina que o aluno precisa exercer esforço tridimensional (físico, mental e espiritual) e agir para obter o conhecimento."
        },
        {
          letter: "C",
          text: "Confiar exclusivamente na oração durante as aulas, dispensando a leitura individual prévia do material de preparação.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. A lição orienta o estudo diligente antes das aulas como parte essencial da preparação."
        },
        {
          letter: "D",
          text: "Priorizar a memorização rápida de termos em hebraico e grego para apoiar a leitura técnica dos livros canônicos.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Introduz um foco linguístico que não corresponde à postura espiritual ensinada pelo élder Bednar."
        },
        {
          letter: "E",
          text: "Aguardar a conclusão do semestre para avaliar o impacto prático dos princípios ensinados nas aulas regulares.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. A aplicação e a ação pela fé devem ocorrer de forma contínua durante todo o processo de estudo."
        }
      ],
      resolution: {
        cot_reasoning: "A declaração do élder David A. Bednar enfatiza que o aprendizado pela fé não é passivo, mas exige esforço mental, físico e espiritual ativo, agindo para obter conhecimento.",
        deduced_answer: "B",
        pedagogical_explanation: "O modelo de aprendizado pela fé estabelece que o aluno é um agente que precisa agir em retidão e despender empenho consciente para que o Espírito Santo confirme a verdade e amplie seu entendimento."
      },
      difficulty: {
        estimated_level: 2,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 60
    },
    {
      sequence_id: 7,
      content_hash: "a1b2c3d4e5f60007",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q07",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Aplicação do Evangelho", "João 7:17", "Discipulado Prático"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "Estudo de Caso", "Jeffrey R. Holland", "Ação"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "A Prática da Verdade",
        source: "Lição 1: Material de preparação para a aula, Seção 1 e 2",
        content: "O élder Jeffrey R. Holland observou: ''E agora, o que fazer?' Acho que é isso que o Salvador respondia diariamente como um elemento inseparável de Seu ensino e Sua pregação. Seus sermões e exortações seriam em vão se não provocassem mudanças na vida dos Seus discípulos'."
      },
      stem: {
        full_text: "Marcos é um estudante que aprecia participar dos debates em sala e expressa grande apreço pelos conceitos teológicos do evangelho. Contudo, ele admite que raramente reflete sobre como aplicar as lições em seus relacionamentos familiares ou em sua conduta pessoal, sentindo pouca mudança duradoura em seu caráter. Considerando os ensinamentos da lição sobre o propósito da instrução do Salvador, que princípio fundamental Marcos deixou de aplicar?"
      },
      options: [
        {
          letter: "A",
          text: "A necessidade de buscar comprovação lógica para as doutrinas antes de realizar mudanças de comportamento.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Condiciona a obediência à comprovação lógica, contrariando o princípio de agir com fé para conhecer a doutrina."
        },
        {
          letter: "B",
          text: "A importância de memorizar referências escriturísticas adicionais para embasar suas colocações durante as aulas.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Foca na exibição acadêmica em sala em vez da aplicação transformadora na vida pessoal."
        },
        {
          letter: "C",
          text: "O valor de restringir a reflexão doutrinária ao ambiente sagrado da capela para evitar influências seculares.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Isola a religião do cotidiano, enquanto o discipulado exige prática constante em todos os ambientes."
        },
        {
          letter: "D",
          text: "A exigência de evitar o exame de textos dos profetas antigos quando surgirem dúvidas práticas sobre a conduta diária.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O estudo das escrituras antigas e modernas é incentivado continuamente no curso."
        },
        {
          letter: "E",
          text: "O princípio de que os ensinamentos de Cristo têm a finalidade de produzir ação prática e transformação real na vida.",
          is_correct: true,
          why_wrong_or_right: "Correta. Alinha-se ao ensinamento do élder Holland e a passagens como João 7:17 e 13:17, demonstrando que a doutrina precisa provocar mudanças no modo de viver."
        }
      ],
      resolution: {
        cot_reasoning: "A situação de Marcos descreve um aluno que tem conhecimento teórico e aprecia a teologia, mas não faz a ponte para a ação cotidiana. O élder Holland pergunta 'E agora, o que fazer?' e ensina que a pregação de Cristo visava transformar a vida.",
        deduced_answer: "E",
        pedagogical_explanation: "O conhecimento doutrinário atinge seu verdadeiro objetivo quando motiva o arrependimento e a retidão prática. Como ensinaram o Salvador (João 13:17) e Seus apóstolos, somos abençoados ao praticar a verdade, e não apenas ao ouvi-la."
      },
      difficulty: {
        estimated_level: 3,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 75
    },
    {
      sequence_id: 8,
      content_hash: "a1b2c3d4e5f60008",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q08",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Evangelho de Jesus Cristo", "3 Néfi 27:13-14", "Doutrina de Cristo"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "3 Néfi 27", "Vontade do Pai"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "A Definição do Evangelho pelo Salvador",
        source: "Lição 1: Material de preparação para a aula, Seção 1",
        content: "Quase no fim de Seu ministério na terra de Abundância, o Salvador explicou: 'Eis que vos dei o meu evangelho, e este é o evangelho que vos dei — que vim ao mundo para fazer a vontade de meu Pai, porque meu Pai me enviou. E meu Pai enviou-me para que eu fosse levantado na cruz' (3 Néfi 27:13–14)."
      },
      stem: {
        full_text: "Ao ensinar os nefitas sobre o significado e o propósito de Seu evangelho em 3 Néfi 27:13–14, qual verdade central Jesus Cristo destacou sobre Sua missão?"
      },
      options: [
        {
          letter: "A",
          text: "Que Sua meta primordial consistia em restaurar a monarquia política na terra prometida de seus antepassados.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Confunde a missão espiritual do Messias com ambições de poder temporal e político da época."
        },
        {
          letter: "B",
          text: "Que Seu propósito era compilar novas leis civis para substituir a administração jurídica existente entre o povo.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Reduz o evangelho a uma reforma administrativa ou código legislativo civil."
        },
        {
          letter: "C",
          text: "Que Sua missão envolvia a organização de escolas seculares para acelerar o progresso científico da sociedade.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Desvia do conteúdo sagrado e soteriológico da mensagem de Cristo."
        },
        {
          letter: "D",
          text: "Que Ele veio ao mundo com o propósito de fazer a vontade do Pai e ser levantado na cruz para redimir a humanidade.",
          is_correct: true,
          why_wrong_or_right: "Correta. Expressa com exatidão a declaração do Salvador em 3 Néfi 27:13–14 sobre o cumprimento da vontade de Seu Pai por meio de Seu sacrifício na cruz."
        },
        {
          letter: "E",
          text: "Que Seu objetivo central residia em unificar as nações por meio de tratados de cooperação econômica mútua.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Insere temas geopolíticos modernos alheios ao evangelho ensinado no Livro de Mórmon."
        }
      ],
      resolution: {
        cot_reasoning: "O texto de 3 Néfi 27:13–14 define o evangelho como a vinda de Cristo para fazer a vontade do Pai e ser levantado na cruz, possibilitando que todos os homens sejam atraídos a Ele e julgados por suas obras.",
        deduced_answer: "D",
        pedagogical_explanation: "O cerne do evangelho é o sacrifício voluntário de Jesus Cristo em cumprimento ao plano do Pai Celestial, tornando possível a redenção e a ressurreição de todos os Seus filhos."
      },
      difficulty: {
        estimated_level: 2,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 60
    },
    {
      sequence_id: 9,
      content_hash: "a1b2c3d4e5f60009",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q09",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Didática do Evangelho", "Jeffrey R. Holland", "Papel do Aluno"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Introdução", "Jeffrey R. Holland", "Fogo a ser aceso"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "A Visão sobre o Estudante do Evangelho",
        source: "Introdução ao curso: Como esse curso está estruturado?",
        content: "Ao orientar os educadores religiosos no treinamento de 2019, o élder Jeffrey R. Holland afirmou: 'Lembrem-se de que um aluno não é um recipiente a ser preenchido; um aluno é um fogo a ser aceso' ('Anjos e assombro')."
      },
      stem: {
        full_text: "Ao instruir os professores sobre a abordagem correta a ser adotada em sala de aula, o élder Jeffrey R. Holland usou uma metáfora sobre a natureza do estudante. Qual princípio essa declaração transmite sobre o papel do aluno no aprendizado do evangelho?"
      },
      options: [
        {
          letter: "A",
          text: "O aluno deve acumular o maior volume possível de informações fornecidas pelo professor durante as apresentações.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Corresponde à visão ultrapassada de 'recipiente a ser preenchido', rejeitada pelo élder Holland."
        },
        {
          letter: "B",
          text: "O aluno possui potencial espiritual ativo e deve ser inspirado a despertar seu próprio testemunho e capacidade de agir.",
          is_correct: true,
          why_wrong_or_right: "Correta. A metáfora do 'fogo a ser aceso' significa despertar o desejo interior, o arbítrio e a chama espiritual do próprio estudante."
        },
        {
          letter: "C",
          text: "O estudante atua como um observador neutro que avalia criticamente as teorias expostas pelos instrutores.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Descaracteriza o aprendizado espiritual e a busca pela edificação mútua sob a influência do Espírito."
        },
        {
          letter: "D",
          text: "O jovem depende exclusivamente da elucidação do mestre para formular qualquer pensamento sobre as escrituras.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Nega a capacidade do aluno de receber revelação pessoal e agir com fé no estudo do evangelho."
        },
        {
          letter: "E",
          text: "O aprendiz deve evitar expressar sentimentos pessoais para manter o foco restrito a aspectos históricos dos textos.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O compartilhamento de experiências e sentimentos espirituais é um dos pontos centrais do currículo do Instituto."
        }
      ],
      resolution: {
        cot_reasoning: "A metáfora do élder Holland ('não é um recipiente a ser preenchido, mas um fogo a ser aceso') foca na capacidade do aluno de se engajar espiritualmente, ter seu coração tocado e agir como agente de seu aprendizado.",
        deduced_answer: "B",
        pedagogical_explanation: "O ensino no Instituto busca inspirar os alunos a buscar revelação pessoal e aplicar a doutrina, em vez de tratá-los como receptores passivos de aulas expositivas."
      },
      difficulty: {
        estimated_level: 2,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 60
    },
    {
      sequence_id: 10,
      content_hash: "a1b2c3d4e5f60010",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q10",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Aprendizado Profundo", "Kim B. Clark", "Semelhança com Cristo"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "Assertivas Combinadas", "Kim B. Clark"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "Maneira do Senhor de Aprender Profundamente",
        source: "Lição 1: Material de preparação para a aula, Seção 1",
        content: "Referindo-se ao convite do Salvador, o élder Kim B. Clark explicou que o aprendizado profundo une o conhecimento experiencial de Cristo com a imitação fiel de Seu caráter por meio da obediência nas escrituras."
      },
      stem: {
        full_text: "Em relação à exposição do élder Kim B. Clark sobre a maneira do Senhor de proporcionar um aprendizado profundo, avalie as seguintes proposições:\n\nI. Conhecer a Cristo de forma verdadeira equivale a nascer espiritualmente Dele e experimentar uma mudança de coração.\nII. Ao estudarmos com profundidade as escrituras, aprendemos com o exemplo perfeito do Mestre e somos motivados a agir com fé.\nIII. O empenho sincero em fazer nossa parte é acompanhado da promessa divina de que o Salvador magnifica nossa capacidade de viver em retidão.\n\nEstão corretas as proposições:"
      },
      options: [
        {
          letter: "A",
          text: "I e II.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Embora I e II estejam corretas, a proposição III também é um elemento explícito do ensinamento do élder Clark."
        },
        {
          letter: "B",
          text: "I e III.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Omite a proposição II, que descreve o segundo significado de aprender com o Salvador."
        },
        {
          letter: "C",
          text: "II e III.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Desconsidera a proposição I, que estabelece a base do renascimento espiritual."
        },
        {
          letter: "D",
          text: "I, II e III.",
          is_correct: true,
          why_wrong_or_right: "Correta. Todas as três proposições expressam de forma precisa o discurso 'Aprende de mim' proferido pelo élder Kim B. Clark aos educadores do SEI."
        }
      ],
      resolution: {
        cot_reasoning: "Análise das proposições: I reflete o 1º significado (conhecê-Lo é nascer espiritualmente Dele). II reflete o 2º significado (aprender com o exemplo ao imergir nas escrituras). III reflete a promessa do Salvador de magnificar nossa capacidade de agir em retidão. Portanto, I, II e III estão corretas.",
        deduced_answer: "D",
        pedagogical_explanation: "O élder Kim B. Clark articula o aprendizado profundo como uma jornada de transformação espiritual interior (conhecer o Salvador) aliada à ação prática orientada pelas escrituras (aprender com Seu exemplo), sob o poder capacitador da graça divina."
      },
      difficulty: {
        estimated_level: 2,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 70
    },
    {
      sequence_id: 11,
      content_hash: "a1b2c3d4e5f60011",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q11",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Exercício da Fé", "Russell M. Nelson", "Pressão Social"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "Estudo de Caso", "Pressão do Mundo"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "Fidelidade em Meio a Ideologias Populares",
        source: "Lição 1: Material de preparação para a aula, Seção 2",
        content: "O presidente Russell M. Nelson declarou: 'Cada vez que temos fé para obedecermos às leis de Deus — mesmo quando as opiniões populares nos menosprezam —, ou cada vez que resistimos a entretenimentos ou ideologias que celebram a quebra de convênios, estamos exercendo nossa fé, o que, por sua vez, aumenta nossa fé'."
      },
      stem: {
        full_text: "Gabriel, um jovem universitário, nota que vários colegas de curso zombam publicamente dos padrões de castidade e modéstia ensinados pelos profetas. Ele se depara frequentemente com conversas e conteúdos que ridicularizam seus princípios religiosos. De acordo com os ensinamentos do presidente Russell M. Nelson na lição 1, que bênção decorre quando Gabriel decide manter seus convênios apesar dessas opiniões populares?"
      },
      options: [
        {
          letter: "A",
          text: "Ele adquire o direito de evitar futuros conflitos sociais com aqueles que discordam de suas convicções morais.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. A obediência não promete ausência de desacordos no meio social terreno."
        },
        {
          letter: "B",
          text: "Sua atitude garante a admiração imediata das pessoas ao seu redor em relação aos seus valores pessoais.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O texto bíblico e profético lembra que o mundo muitas vezes menospreza a retidão."
        },
        {
          letter: "C",
          text: "Sua capacidade de memorizar conteúdos acadêmicos é ampliada de maneira independente de seu estudo secular.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Desvia o foco para ganhos acadêmicos automáticos, não abordados no contexto da fé."
        },
        {
          letter: "D",
          text: "Ele recebe a garantia de que não enfrentará mais tentações ou incertezas durante sua jornada universitária.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. As provações e tentações continuam fazendo parte da experiência mortal."
        },
        {
          letter: "E",
          text: "O ato de obedecer e resistir exerce sua fé no Salvador, o que resulta no próprio aumento e fortalecimento dessa fé.",
          is_correct: true,
          why_wrong_or_right: "Correta. Alinha-se diretamente com o presidente Nelson: exercer a fé em face da desaprovação popular gera um aumento real da fé em Jesus Cristo."
        }
      ],
      resolution: {
        cot_reasoning: "O dilema de Gabriel reflete a citação do presidente Russell M. Nelson: ao ter fé para obedecer às leis de Deus quando a opinião popular desdenha, a pessoa exercita a fé e, por conseguinte, sua fé cresce.",
        deduced_answer: "E",
        pedagogical_explanation: "A fidelidade diante de pressões e zombarias sociais não é uma perda, mas um ato deliberado de exercício de fé que fortifica a conexão espiritual com o Salvador e traz paz ao coração."
      },
      difficulty: {
        estimated_level: 3,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 75
    },
    {
      sequence_id: 12,
      content_hash: "a1b2c3d4e5f60012",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q12",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["O Cristo Vivo", "Testemunho Apostólico", "Influência do Salvador"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "O Cristo Vivo", "Primeira Presidência"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "A Relevância Incomparável do Salvador",
        source: "Lição 1: Material de preparação para a aula, Introdução",
        content: "Na abertura da lição 1, cita-se a declaração da Primeira Presidência e do Quórum dos Doze Apóstolos contida em 'O Cristo Vivo': 'Ninguém mais exerceu uma influência tão profunda sobre todos os que já viveram e ainda viverão sobre a face da Terra'."
      },
      stem: {
        full_text: "Ao apresentar a relevância singular de Jesus Cristo para cada indivíduo, a declaração oficial dos profetas modernos em 'O Cristo Vivo' destaca a amplitude do impacto do Redentor. Qual é essa verdade solene professada pelos apóstolos?"
      },
      options: [
        {
          letter: "A",
          text: "Seus ensinamentos serviram de inspiração para modelos jurídicos sem exercer influência direta sobre as escolhas individuais.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Minimiza a influência pessoal e eterna do Salvador ao reduzi-la a mera referência jurídica."
        },
        {
          letter: "B",
          text: "Sua atuação histórica limitou-se aos povos do Oriente Médio durante as primeiras décadas do primeiro século.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Contraria o testemunho apostólico de que Sua influência alcança todas as gerações da Terra."
        },
        {
          letter: "C",
          text: "Nenhum outro personagem exerceu uma influência tão abrangente e profunda sobre toda a humanidade passada, presente e futura.",
          is_correct: true,
          why_wrong_or_right: "Correta. Reflete fielmente a declaração contida no documento histórico 'O Cristo Vivo: O Testemunho dos Apóstolos'."
        },
        {
          letter: "D",
          text: "Seu ministério destinou-se primariamente a estabelecer reformas nas práticas rituais da antiga lei mosaica.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Apresenta uma visão limitada e sectária da missão cósmica e salvadora do Redentor."
        },
        {
          letter: "E",
          text: "Sua vida foi um modelo ético admirável cuja relevância depende da afinidade cultural de cada sociedade.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Trata a missão de Cristo com relativismo cultural, quando os profetas afirmam sua universalidade e centralidade eterna."
        }
      ],
      resolution: {
        cot_reasoning: "A questão testa o conhecimento da citação de abertura de 'O Cristo Vivo' incluída no Material de Preparação da Lição 1 sobre o Salvador e Sua influência inigualável sobre a humanidade.",
        deduced_answer: "C",
        pedagogical_explanation: "Os apóstolos e profetas modernos testificam que Jesus Cristo é a figura central de toda a história humana, exercendo uma influência espiritual e redentora profunda e insubstituível sobre cada alma mortal."
      },
      difficulty: {
        estimated_level: 1,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 45
    },
    {
      sequence_id: 13,
      content_hash: "a1b2c3d4e5f60013",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q13",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Objetivos dos Institutos", "Plano de Redenção", "Vida Eterna"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Introdução", "Manual do Professor", "Objetivo do Curso"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "Propósito dos Seminários e Institutos",
        source: "Introdução ao curso: Quais são os objetivos deste curso?",
        content: "O objetivo dos Seminários e Institutos de Religião é ajudar os jovens e jovens adultos a entender os ensinamentos e a Expiação de Jesus Cristo e a confiar neles, a qualificar-se para as bênçãos do templo e preparar-se para a vida eterna."
      },
      stem: {
        full_text: "De acordo com o manual do curso 'Jesus Cristo e Seu Evangelho Eterno', qual das alternativas a seguir expressa um dos objetivos centrais estabelecidos para os alunos nesta disciplina?"
      },
      options: [
        {
          letter: "A",
          text: "Adquirir habilidades para vencer controvérsias públicas sobre textos apócrifos não canonizados.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O curso não visa treinar debatedores de textos apócrifos, mas aproximar os alunos do Salvador."
        },
        {
          letter: "B",
          text: "Aumentar a capacidade de receber revelação pessoal e aprofundar a confiança no poder purificador da Expiação.",
          is_correct: true,
          why_wrong_or_right: "Correta. Alinha-se diretamente aos objetivos listados no manual do professor na introdução do curso."
        },
        {
          letter: "C",
          text: "Completar pesquisas etnográficas sobre as diferentes religiões do mundo moderno sem compromisso de fé.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O objetivo do Instituto é o fortalecimento da fé e o discipulado em Cristo, não mero estudo etnográfico secular."
        },
        {
          letter: "D",
          text: "Aprender métodos de liderança secular aplicáveis à gestão de recursos financeiros corporativos.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Desvia do propósito espiritual e das ordenanças do templo indicadas nas metas do programa."
        },
        {
          letter: "E",
          text: "Restringir o estudo das escrituras aos aspectos poéticos e narrativos sem abordar convênios.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Os convênios e os mandamentos são partes centrais do propósito formativo do Instituto."
        }
      ],
      resolution: {
        cot_reasoning: "Na introdução do curso (p. v do manual), os cinco objetivos incluem: aumentar a fé em Cristo e em Sua Expiação para purificar e aperfeiçoar; aumentar a capacidade de receber revelação; explicar os papéis divinos de Cristo; fortalecer o compromisso no convênio; e aumentar o amor e gratidão.",
        deduced_answer: "B",
        pedagogical_explanation: "O curso de Religião 250 tem como propósito orientar os jovens adultos a acessar o poder expiatório do Senhor, desenvolver sensibilidade à revelação do Espírito Santo e viver como discípulos comprometidos em seus convênios."
      },
      difficulty: {
        estimated_level: 2,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 60
    },
    {
      sequence_id: 14,
      content_hash: "a1b2c3d4e5f60014",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q14",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Mansidão", "Paz em Cristo", "Mateus 11:28-30"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "Mateus 11:28-30", "D&C 19:23", "Paz"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "O Jugo do Salvador e a Promessa de Paz",
        source: "Lição 1: Material de preparação para a aula, Seção 1",
        content: "Ao convidar Seus discípulos a aprender com Ele em Mateus 11:28–30 e Doutrina e Convênios 19:23, Jesus relacionou o aprendizado de Suas palavras e a mansidão com o descanso e a paz."
      },
      stem: {
        full_text: "Ao examinar o convite de Jesus registrado em Mateus 11:28–30 e reiterado em Doutrina e Convênios 19:23 ('Aprende de mim e ouve minhas palavras; anda na mansidão de meu Espírito...'), qual bênção direta é prometida àqueles que aceitam esse chamado?"
      },
      options: [
        {
          letter: "A",
          text: "Receber descanso para a alma, paz interior e alívio nos fardos ao caminhar em comunhão com o Salvador.",
          is_correct: true,
          why_wrong_or_right: "Correta. Tanto Mateus 11 quanto D&C 19:23 prometem paz e descanso para a alma dos que tomam Seu jugo e andam na mansidão de Seu Espírito."
        },
        {
          letter: "B",
          text: "Alcançar imunidade contra provações financeiras e superação automática de todas as enfermidades físicas.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. A promessa das escrituras é de paz espiritual e força para carregar fardos, não de isenção de desafios temporais."
        },
        {
          letter: "C",
          text: "Garantir o reconhecimento social na comunidade e a resolução imediata de controvérsias de vizinhança.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. As dádivas do evangelho são de natureza espiritual e transcendem aspirações sociais mundanas."
        },
        {
          letter: "D",
          text: "Obter compreensão imediata e detalhada sobre todos os mistérios do universo sem necessidade de estudo contínuo.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O conhecimento espiritual é concedido linha sobre linha, exigindo diligência e obediência constante."
        },
        {
          letter: "E",
          text: "Desenvolver autoridade para impor opiniões pessoais em debates doutrinários na congregação.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. A postura ensinada pelo Salvador é de mansidão e serviço humilde, oposta à imposição ou contenda."
        }
      ],
      resolution: {
        cot_reasoning: "Em Mateus 11:28-30 ('encontrareis descanso para vossa alma') e D&C 19:23 ('terás paz em mim'), a bênção explícita atrelada ao aprender de Cristo e andar na mansidão de Seu Espírito é a paz, o descanso e o alívio espiritual.",
        deduced_answer: "A",
        pedagogical_explanation: "Andar na mansidão do Espírito e tomar sobre si o jugo do Salvador permite que o fardo da vida mortal seja compartilhado com Cristo, gerando consolo, alívio e a doce paz que o mundo não pode oferecer."
      },
      difficulty: {
        estimated_level: 1,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 50
    },
    {
      sequence_id: 15,
      content_hash: "a1b2c3d4e5f60015",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q15",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Preparação da Aula", "Papel do Professor", "Edificação Mútua"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "Estudo de Caso", "Pedagogia do Manual"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "Diretrizes de Ensino para o Professor",
        source: "Introdução ao curso e Lição 1: Material do professor, seção 'Melhorar o ensino e o aprendizado'",
        content: "O material do professor instrui: 'Confiar de maneira consistente na preparação dos alunos os ajudará a sentir a importância de se prepararem para cada aula. Tenha em mente que, se você apresentar um conteúdo adicional durante a aula, o tempo despendido nesse assunto pode impedir que os alunos compartilhem o que aprenderam e sentiram ao estudar o material de preparação'."
      },
      stem: {
        full_text: "Durante o planejamento da aula da Lição 1, um professor decide adicionar várias teses acadêmicas e comentários históricos externos, utilizando praticamente todo o tempo da classe em uma preleção contínua. Em virtude disso, os alunos não tiveram oportunidade de compartilhar as experiências que registraram durante o estudo pessoal do material prévio. Considerando a recomendação do manual do professor, qual orientação pedagógica foi desconsiderada?"
      },
      options: [
        {
          letter: "A",
          text: "A utilização de tempo excessivo com materiais adicionais impede os estudantes de expressar seus sentimentos e percepções espirituais.",
          is_correct: true,
          why_wrong_or_right: "Correta. O manual do professor alerta especificamente que despender tempo com conteúdo adicional pode impedir que os alunos compartilhem o que aprenderam com o material de preparação."
        },
        {
          letter: "B",
          text: "O professor deve concentrar-se exclusivamente em tópicos seculares para atender às demandas intelectuais dos jovens adultos.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O objetivo do Instituto é espiritual e centrado no evangelho de Jesus Cristo, não no ensino secular."
        },
        {
          letter: "C",
          text: "A apresentação magistral do instrutor é a maneira mais eficaz de garantir a conversão e o aprendizado pela fé dos alunos.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. As diretrizes enfatizam que o aprendizado ativo e o compartilhamento pelos alunos são cruciais para a conversão."
        },
        {
          letter: "D",
          text: "A preparação individual do aluno torna-se dispensável quando o instrutor possui amplo domínio das escrituras e de sua história.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O currículo foi desenvolvido justamente sobre a premissa de que a preparação prévia do aluno é fundamental."
        },
        {
          letter: "E",
          text: "Os debates em sala devem ser substituídos por exames escritos formais para comprovar a retenção de dados históricos.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O foco do Instituto é a edificação espiritual mútua por meio de conversas significativas, e não avaliações mecânicas."
        }
      ],
      resolution: {
        cot_reasoning: "O manual instrui explicitamente o professor a valorizar a preparação dos alunos e alerta que apresentar muito conteúdo adicional pode consumir o tempo e sufocar a participação e os sentimentos dos alunos.",
        deduced_answer: "A",
        pedagogical_explanation: "O currículo do Instituto é centrado no aluno como agente de seu aprendizado. Os professores são incentivados a criar espaço para que os estudantes compartilhem suas reflexões espirituais do material preparatório em vez de dominar a aula com apresentações teóricas suplementares."
      },
      difficulty: {
        estimated_level: 2,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 65
    },
    {
      sequence_id: 16,
      content_hash: "a1b2c3d4e5f60016",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q16",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Requisitos de Crédito", "Elevar o Aprendizado", "Instituto"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Introdução", "Assertivas Combinadas", "Créditos"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "Requisitos para Recebimento de Créditos",
        source: "Introdução ao curso: Para os alunos receberem os créditos, o que é esperado deles?",
        content: "Para receber créditos que contam para a formatura do instituto, os alunos devem: 1. Estudar no mínimo 75% do material de preparação das lições; 2. Assistir a 75% das aulas; e 3. Concluir uma de três experiências de aprendizado designadas."
      },
      stem: {
        full_text: "Em relação às exigências estabelecidas na introdução do curso para que os alunos recebam os créditos destinados à formatura do Instituto, avalie as seguintes proposições:\n\nI. Estudar no mínimo 75 por cento do material de preparação elaborado para as lições.\nII. Cumprir a frequência mínima de 75 por cento das aulas ministradas no período.\nIII. Realizar uma das experiências de aprendizado indicadas, como manter um diário de estudo, responder a questionários ou registrar as respostas do material preparatório.\n\nEstão corretas as proposições:"
      },
      options: [
        {
          letter: "A",
          text: "I e II.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Embora I e II sejam exigências reais, a proposição III também faz parte dos critérios oficiais."
        },
        {
          letter: "B",
          text: "II e III.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Desconsidera o requisito I referente ao estudo do material prévio."
        },
        {
          letter: "C",
          text: "I e III.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Omite a exigência de frequência descrita na proposição II."
        },
        {
          letter: "D",
          text: "I, II e III.",
          is_correct: true,
          why_wrong_or_right: "Correta. As três proposições detalham com fidelidade os três critérios oficiais necessários para o recebimento de créditos do curso."
        }
      ],
      resolution: {
        cot_reasoning: "Na página viii do manual (Introdução), são listados exatamente 3 requisitos para créditos de formatura: 1. Estudar no mínimo 75% do material de preparação; 2. Assistir a 75% das aulas; 3. Concluir uma de três experiências de aprendizado. Portanto, I, II e III estão corretas.",
        deduced_answer: "D",
        pedagogical_explanation: "Para obter créditos para a formatura do Instituto, os alunos se comprometem com a preparação pessoal prévia (75%), a pontualidade na frequência às aulas (75%) e o aprofundamento por meio de uma experiência avaliativa aprovada (diário, questionários, projeto ou anotações do material)."
      },
      difficulty: {
        estimated_level: 1,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 60
    },
    {
      sequence_id: 17,
      content_hash: "a1b2c3d4e5f60017",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q17",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Livro de Mórmon", "Testemunho de Cristo", "Russell M. Nelson"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "Livro de Mórmon", "Edificação da Fé"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "O Poder do Livro de Mórmon na Edificação da Fé",
        source: "Lição 1: Material de preparação para a aula, Seção 2",
        content: "Ao discursar sobre como fortalecer nossa fé, o presidente Russell M. Nelson declarou: 'Poucas coisas edificam a fé mais do que a imersão regular no Livro de Mórmon. Nenhum outro livro testifica de Jesus Cristo com tanto poder e clareza' ('Abraçar o futuro com fé')."
      },
      stem: {
        full_text: "Em seus conselhos sobre como edificar a fé no Salvador para os dias atuais, o presidente Russell M. Nelson deu destaque especial a uma prática de estudo diário. Qual recurso escriturístico foi apontado pelo profeta como incomparável em testificar de Jesus Cristo?"
      },
      options: [
        {
          letter: "A",
          text: "O exame de enciclopédias e comentários exegéticos do período bíblico pós-exílico.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Refere-se a obras de erudição bíblica secular, não mencionadas pelo presidente Nelson nesse contexto."
        },
        {
          letter: "B",
          text: "A memorização das listas cronológicas das gerações registradas no Velho Testamento.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Trata de genealogias do Velho Testamento em vez do volume enfatizado pelo profeta."
        },
        {
          letter: "C",
          text: "A imersão regular no Livro de Mórmon, em virtude da clareza e do poder com que testifica do Senhor.",
          is_correct: true,
          why_wrong_or_right: "Correta. O presidente Nelson enfatiza que poucas coisas edificam a fé mais do que a imersão regular no Livro de Mórmon, que testifica de Cristo com clareza e poder singulares."
        },
        {
          letter: "D",
          text: "A análise comparativa dos tratados teológicos elaborados durante os primeiros séculos da era cristã.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Foca na história dos credos e da teologia patrística, desconsiderando a escritura apontada."
        },
        {
          letter: "E",
          text: "A leitura de manuais de retórica para defender publicamente as decisões administrativas da Igreja.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Apresenta uma abordagem argumentativa que não edifica a fé pessoal no Redentor."
        }
      ],
      resolution: {
        cot_reasoning: "A questão aborda diretamente o trecho do presidente Nelson na Seção 2 da Lição 1 sobre o Livro de Mórmon como instrumento preeminente para edificar a fé em Jesus Cristo.",
        deduced_answer: "C",
        pedagogical_explanation: "O Livro de Mórmon é a pedra angular de nossa religião e foi escrito com o propósito explícito de convencer o mundo de que Jesus é o Cristo. A imersão diária em suas páginas edifica a fé como nenhum outro livro."
      },
      difficulty: {
        estimated_level: 1,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 45
    },
    {
      sequence_id: 18,
      content_hash: "a1b2c3d4e5f60018",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q18",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Aprendizado pela Fé", "David A. Bednar", "Ação Espiritual"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "Estudo de Caso", "David A. Bednar", "Esforço do Aluno"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "A Busca Ativa de Conhecimento Espiritual",
        source: "Lição 1: Material de preparação para a aula, Seção 2",
        content: "O élder David A. Bednar explicou que o aprendizado pela fé não pode ser reduzido a um processo de receptividade passiva, pois o Senhor prometeu revelação àqueles que exercem fé e agem com esforço pessoal."
      },
      stem: {
        full_text: "Bruno frequenta pontualmente as aulas do curso de Religião 250, mas adota uma postura descomprometida: não lê o material prévio, não faz anotações e limita-se a ouvir as discussões sem interagir, esperando que a conversão ocorra espontaneamente. Com base nos ensinamentos do élder David A. Bednar sobre o aprendizado pela fé, que mudança de perspectiva é necessária para que Bruno vivencie um aprendizado espiritual real?"
      },
      options: [
        {
          letter: "A",
          text: "Reconhecer que o conhecimento espiritual deve ser transmitido de forma acabada pelo instrutor sem requerer participação dos ouvintes.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Defende uma postura passiva contrária a todo o modelo de aprendizado por fé ensinado pelo élder Bednar."
        },
        {
          letter: "B",
          text: "Aguardar que uma experiência extraordinária aconteça durante a reunião dominical antes de realizar qualquer esforço mental.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Esperar sinais passivamente sem agir contradiz a responsabilidade individual no evangelho."
        },
        {
          letter: "C",
          text: "Transferir para a liderança da ala a tarefa de selecionar quais mandamentos ele deve priorizar em sua rotina.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O arbítrio e a responsabilidade pelo crescimento espiritual pertencem ao próprio discípulo."
        },
        {
          letter: "D",
          text: "Limitar sua atuação ao estudo de ciências humanas para encontrar respostas às suas inquietações existenciais.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. Os métodos seculares sozinhos não conferem conhecimento espiritual, conforme ensina a lição."
        },
        {
          letter: "E",
          text: "Compreender que o aprendizado pela fé exige agir ativamente com esforço físico, mental e espiritual para obter conhecimento por si mesmo.",
          is_correct: true,
          why_wrong_or_right: "Correta. O élder Bednar ensina exatamente que o aprendizado pela fé requer esforço multidimensional e ação deliberada do aluno para receber a luz da verdade."
        }
      ],
      resolution: {
        cot_reasoning: "O caso de Bruno descreve um ouvinte passivo. O élder Bednar explica que o aprendizado pela fé requer esforço físico, mental e espiritual ativo, no qual o aluno age para adquirir conhecimento por si próprio.",
        deduced_answer: "E",
        pedagogical_explanation: "A conversão e a revelação pessoal exigem que o estudante aja como um agente que busca, estuda e ora diligentemente. Uma postura puramente passiva limita a capacidade de receber os dons espirituais prometidos pelo Salvador."
      },
      difficulty: {
        estimated_level: 2,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 65
    },
    {
      sequence_id: 19,
      content_hash: "a1b2c3d4e5f60019",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q19",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Doutrina e Convênios 88:118", "Palavras de Sabedoria", "Estudo e Fé"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Lição 1", "D&C 88:118", "Melhores Livros"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "A Busca Diligente de Conhecimento",
        source: "Lição 1: Material de preparação para a aula, Seção 2",
        content: "Ao abordar a edificação mútua dos santos, o Senhor revelou a Joseph Smith: 'E como nem todos têm fé, buscai diligentemente e ensinai-vos uns aos outros palavras de sabedoria; sim, nos melhores livros buscai palavras de sabedoria; procurai conhecimento, sim, pelo estudo e também pela fé' (Doutrina e Convênios 88:118)."
      },
      stem: {
        full_text: "Em Doutrina e Convênios 88:118, o Senhor estabeleceu um modelo divinamente inspirado para o aprendizado e o fortalecimento mútuo dos membros. Qual é o padrão de conduta revelado nessa escritura?"
      },
      options: [
        {
          letter: "A",
          text: "Confiar exclusivamente na oração silenciosa, prescindindo da instrução mútua e do estudo de registros.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. A passagem incentiva explicitamente o ensino mútuo e a busca em livros."
        },
        {
          letter: "B",
          text: "Buscar diligentemente palavras de sabedoria nos melhores livros e procurar conhecimento tanto pelo estudo quanto pela fé.",
          is_correct: true,
          why_wrong_or_right: "Correta. Expressa com exatidão a ordem do Senhor em D&C 88:118 de procurar conhecimento pelo estudo e pela fé e buscar sabedoria nos melhores livros."
        },
        {
          letter: "C",
          text: "Substituir a busca espiritual individual pelas opiniões de pensadores renomados da literatura clássica.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O versículo não substitui o aprendizado pela fé por fontes seculares, mas harmoniza ambas."
        },
        {
          letter: "D",
          text: "Restringir o ensino religioso aos que já possuem uma convicção madura, excluindo aqueles que enfrentam incertezas.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O texto bíblico e de D&C inicia com 'E como nem todos têm fé', demonstrando acolhimento a quem busca crer."
        },
        {
          letter: "E",
          text: "Evitar qualquer esforço analítico para não interferir na ação livre da inspiração do Espírito.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. A revelação ordena 'buscai diligentemente' e 'pelo estudo', exigindo atividade mental e diligência."
        }
      ],
      resolution: {
        cot_reasoning: "A questão analisa diretamente o texto de D&C 88:118, que comanda a busca de sabedoria nos melhores livros e o aprendizado 'pelo estudo e também pela fé'.",
        deduced_answer: "B",
        pedagogical_explanation: "O padrão do Senhor para o discipulado valoriza a combinação equilibrada do estudo atento das melhores fontes com a busca fervorosa da confirmação espiritual pela fé, promovendo o crescimento integral da mente e do espírito."
      },
      difficulty: {
        estimated_level: 1,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 45
    },
    {
      sequence_id: 20,
      content_hash: "a1b2c3d4e5f60020",
      provenance: {
        source_type: "ai_generated_original",
        human_reviewed: false,
        external_reference_url: null,
        generation_model: "gemini-2.5-pro",
        licensing_note: null,
        reviewed_at: null,
        reviewed_by: null
      },
      metadata: {
        reference_code: "REL250-L01-Q20",
        subject: "Religião 250: Jesus Cristo e Seu Evangelho Eterno",
        topics: ["Flexibilidade Didática", "Jeffrey R. Holland", "Sensibilidade ao Espírito"],
        year: 2023,
        exam_board: "Seminários e Institutos de Religião",
        institution: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
        exam_name: "Avaliação de Instituto - Religião 250",
        role: "Aluno de Instituto",
        language: "pt-BR",
        tags: ["Introdução", "Jeffrey R. Holland", "Margem de Manobra"]
      },
      question_format: "multiple_choice",
      associated_context: {
        has_associated_context: true,
        title: "A Sensibilidade ao Espírito no Ensino",
        source: "Introdução ao curso: Como esse curso está estruturado?",
        content: "O élder Jeffrey R. Holland ensinou: 'Estejam abertos — estejam abertos especialmente ao Espírito. Deixem alguma margem de manobra em seu plano de aula. Se precisarem encurtar um pouco a lição para prestar seu testemunho e estimular um debate sobre uma questão contemporânea, façam-no quando forem inspirados pelo Espírito'."
      },
      stem: {
        full_text: "Ao aconselhar os professores sobre a condução das aulas do Instituto, o élder Jeffrey R. Holland destacou a importância de haver sensibilidade espiritual no cumprimento do cronograma. Qual conselho o apóstolo deu a respeito de ajustar o plano de aula diante dos sussurros do Espírito?"
      },
      options: [
        {
          letter: "A",
          text: "Seguir rigorosamente o roteiro preparado sem omitir tópicos, assegurando que o tempo seja preenchido com a matéria planejada.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O conselho do élder Holland defende expressamente a flexibilidade e a margem de manobra em detrimento do rigor inflexível."
        },
        {
          letter: "B",
          text: "Evitar conversas sobre dúvidas contemporâneas dos alunos para não alterar a ordem didática dos manuais.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O apóstolo indica que é apropriado abordar questões contemporâneas quando inspirado pelo Espírito."
        },
        {
          letter: "C",
          text: "Transferir a prestação de testemunho para os minutos finais das atividades de encerramento do semestre.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O testemunho deve ser compartilhado conforme o Espírito orientar durante as aulas ordinárias."
        },
        {
          letter: "D",
          text: "Manter margem de manobra no plano de aula e, se necessário, encurtar a lição para prestar testemunho e debater sob inspiração.",
          is_correct: true,
          why_wrong_or_right: "Correta. Alinha-se perfeitamente com a citação do élder Holland na introdução do manual do professor."
        },
        {
          letter: "E",
          text: "Delegar aos estudantes a elaboração do plano de ensino para dispensar a preparação prévia do professor.",
          is_correct: false,
          why_wrong_or_right: "Incorreta. O professor mantém o dever de se preparar diligentemente e orar pelas necessidades de sua classe."
        }
      ],
      resolution: {
        cot_reasoning: "Na introdução do curso (p. v do manual), o élder Holland instrui os professores a deixarem 'margem de manobra' no plano de aula e encurtarem a lição quando o Espírito indicar que é apropriado prestar testemunho ou debater um assunto relevante.",
        deduced_answer: "D",
        pedagogical_explanation: "O ensino eficaz do evangelho prioriza a orientação do Espírito Santo sobre a rigidez de planos formais. Os professores devem ser flexíveis para atender às reais necessidades espirituais dos alunos quando inspirados pelo Espírito."
      },
      difficulty: {
        estimated_level: 2,
        estimation_method: "ai_estimated",
        observed_accuracy_rate: null,
        observed_sample_size: null
      },
      estimated_time_seconds: 55
    }
  ]
};
