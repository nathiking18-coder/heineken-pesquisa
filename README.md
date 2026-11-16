# Pesquisa Heineken 0.0 · Neuromarketing UFPR

Link público em que o participante vê as campanhas, responde as perguntas, e as respostas caem numa planilha do Google Sheets. O painel de resultados lê essa planilha.

- **Pesquisa:** `https://nathiking18-coder.github.io/heineken-pesquisa/`
- **Painel (com senha):** `https://nathiking18-coder.github.io/heineken-pesquisa/painel.html`
- **Pré-teste:** acrescente `?teste=1` ao link da pesquisa. Essas respostas recebem código `PT…` e ficam fora dos resultados por padrão.

## Configuração (uma vez)

1. Crie uma planilha nova no Google Sheets.
2. *Extensões → Apps Script*, apague tudo e cole [`apps-script/Codigo.gs`](apps-script/Codigo.gs). Troque `CHAVE_PAINEL` por uma senha sua.
3. *Implantar → Nova implantação → App da Web* · Executar como: **Eu** · Quem pode acessar: **Qualquer pessoa**. Copie a URL que termina em `/exec`.
4. Cole a URL em [`config.js`](config.js), na linha `var SCRIPT_URL = '';`.
5. GitHub: *Settings → Pages → Source: Deploy from a branch*, escolha a branch e a pasta `/ (root)`.

## Como funciona

Sequência para o participante: boas-vindas e aceite → cruz de fixação → 1º estímulo → pergunta aberta → cruz → 2º estímulo → pergunta aberta → descrição das campanhas → tela comparativa (12 s) → questionário do Apêndice B.

- A ordem A→B / B→A alterna para equilibrar a amostra.
- Cada resposta vira uma linha na aba **respostas** da planilha, com código anônimo (P001, P002…) e o horário de início de cada etapa.
- Respostas com idade fora de 21 a 40 ou "Não consumo cerveja" são marcadas como excluídas.
- Perguntas, textos, imagens e tempos ficam em `config.js`. Mídias em `midia/`.

Se alterar o código do Apps Script, faça *Implantar → Gerenciar implantações → Editar → Nova versão* para a URL continuar a mesma.
