# Memoriz

> *"Se a tecnologia não é capaz de abençoar a todos, então ela não pode salvar o mundo."*

O **Memoriz** é um aplicativo web leve e gratuito para resolução de questões e revisão por repetição espaçada (SRS). 

Ele foi feito para quem quer uma ferramenta de estudos rápida, sem propagandas, sem travas pagas e que funcione direto no navegador — inclusive em celulares, tablets antigos ou computadores mais básicos, sem engasgar e sem depender de internet para rodar.

---

## O que o app faz

* **Funciona 100% Offline (PWA):** Você pode instalar no celular ou computador e usar mesmo sem conexão à internet. O aplicativo e os bancos de questões ficam salvos no próprio aparelho.
* **Seus dados ficam com você:** Não precisa criar conta ou pagar assinatura para usar. Seu progresso, histórico e notas são seus e não saem do seu dispositivo, a menos que você queira sincronizar com o Google.
* **Importação Rápida de Questões:** Você pode criar seus próprios bancos de questões em formato JSON (gerando por IA, extraindo de provas ou digitando) e simplesmente arrastar o arquivo para dentro do app.
* **Modo Prática:** Resolva questões no seu tempo, com opção de riscar alternativas descartadas (clique direito ou deslizando o dedo), cronômetro, anotações pessoais e gabarito comentado.
* **Repetição Espaçada (SRS):** Algoritmo que calcula automaticamente a melhor data para você rever cada assunto antes de esquecer.
* **Caderno de Erros Automático:** Todas as questões que você errar ficam salvas em uma área própria para você treinar até acertar.
* **Modo Simulado:** Testes com contagem regressiva de tempo e relatório de desempenho por disciplina no final.
* **Conforto Visual:** Quatro temas pensados para diferentes momentos de estudo: Claro, Escuro, Leitura (tom de papel/sépia) e Noturno (tons quentes para não cansar a vista à noite).

---

Qualquer matéria, prova ou questionário pode ser usado no Memoriz. O formato básico é um arquivo `.json` simples. Basta arrastar o arquivo para o Gerenciador de Bancos dentro do app para começar a praticar.

---

## Como rodar o projeto localmente

Caso queira clonar e rodar o projeto no seu computador:

1. Tenha o **Node.js** (versão 18 ou superior) instalado.
2. Clone o repositório:
   ```bash
   git clone https://github.com/Syuliskav/Memoriz-site.git
   cd Memoriz-site
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor local:
   ```bash
   npm run dev
   ```
5. Abra o navegador no endereço indicado (geralmente `http://localhost:3000`).

---

>*"As circunstâncias em que fomos colocados não devem ser capazes de definir o alcance das nossas mentes."*