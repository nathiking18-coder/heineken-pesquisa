/* Pesquisa Heineken 0.0 — configuração compartilhada pela pesquisa e pelo painel. */

// URL do Apps Script (termina em /exec). Veja apps-script/PesquisaHeineken.gs
var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzx_4TTSgmQ8_qPh-694Yq8qX_9QO5uD4B4yFs4pIGSP0PzfisSokL4w0ra53093ggKmQ/exec';

var QUESTIONNAIRE_VERSION = 'apendice-b-v1-online';
var IMG_MS = 12000;      // tempo de cada imagem na tela
var CROSS_MS = 5000;     // cruz de fixação
var COMPARE_MS = 12000;  // tela comparativa

var LABEL = { A: 'Taça F1', B: 'Collab Carnan' };

// Peças exibidas como estímulo (na ordem)
var MEDIA = {
  A: [
    { kind: 'image', url: 'midia/a1-taca-f1-pdv.jpg' },
    { kind: 'image', url: 'midia/a2-taca-f1-banner.jpg' }
  ],
  B: [
    { kind: 'video', url: 'midia/b1-carnan-laps-of-memory.mp4' }
  ]
};
// Imagens da tela comparativa (lado a lado)
var COMPARE = {
  A: ['midia/a1-taca-f1-pdv.jpg', 'midia/a2-taca-f1-banner.jpg'],
  B: ['midia/b-foto1.jpg', 'midia/b-foto2.jpg', 'midia/b-foto3.jpg', 'midia/b-foto4.jpg']
};

var STIM_QUESTION = 'O que te chama mais atenção nessa campanha?';

var CAMPAIGN_INFO = {
  A: { title: 'Campanha A · Promoção Taça Exclusiva Fórmula 1', text: 'Ação da Heineken 0.0 em supermercados, com espaços decorados com o tema da Fórmula 1. Na promoção, quem compra R$ 30 em Heineken 0.0 ganha uma taça exclusiva de Fórmula 1.' },
  B: { title: 'Campanha B · Collab Heineken 0.0 x Carnan (Laps of Memory)', text: 'Coleção de roupas e acessórios em edição limitada, criada pela Heineken 0.0 em parceria com a Carnan, marca de moda urbana. A coleção tem jaquetas, bonés, camisas e bolsas, e foi fotografada em um autódromo.' }
};

var INSTRUCTION_SCRIPT = 'Olá! Agradecemos sua participação neste estudo sobre comunicação de marcas e comportamento de consumo. Nos próximos minutos, você verá algumas campanhas publicitárias. Pedimos que observe as imagens e o vídeo naturalmente, como faria ao navegar nas redes sociais. Após cada campanha, faremos uma pergunta rápida e, ao final, algumas perguntas sobre o que você viu. Não existem respostas certas ou erradas; buscamos apenas sua reação espontânea.';

var LIK = ['Discordo totalmente', 'Concordo totalmente'];

/* Apêndice B: Instrumento de coleta explícita */
var QUESTIONS = [
  { section: 'Perfil' },
  { id: 'q1_idade', n: 1, type: 'number', label: 'Idade (anos)' },
  { id: 'q2_genero', n: 2, type: 'choice', label: 'Gênero', options: ['Feminino', 'Masculino', 'Não-binário', 'Prefiro não responder'] },
  { id: 'q3_frequencia', n: 3, type: 'choice', label: 'Com que frequência você consome cerveja?', options: ['Semanalmente', 'Quinzenalmente', 'Mensalmente', 'Raramente', 'Não consumo cerveja'], exclude: 'Não consumo cerveja' },
  { id: 'q4_consumiu_zero', n: 4, type: 'choice', label: 'Você já consumiu a Heineken 0.0 (versão sem álcool)?', options: ['Sim, consumo com frequência', 'Sim, experimentei uma ou consumi poucas vezes', 'Não, nunca experimentei'] },
  { section: 'Sobre o Anúncio A (promoção taça exclusiva Fórmula 1)', note: 'Escala de 1 a 5, onde 1 = Discordo totalmente e 5 = Concordo totalmente.' },
  { id: 'q5_A_interesse_compra', n: 5, type: 'likert', group: 'A', label: 'Este anúncio desperta meu interesse em comprar Heineken 0.0 no supermercado.' },
  { id: 'q6_A_taca_atrativa', n: 6, type: 'likert', group: 'A', label: 'O quanto ganhar a taça exclusiva de F1 deixa a Heineken 0.0 mais atrativa para você?' },
  { id: 'q7_A_vantajoso', n: 7, type: 'likert', group: 'A', label: 'Esta campanha me faz sentir que consumir Heineken 0.0 é mais vantajoso do que consumir outras marcas de cerveja sem álcool.' },
  { section: 'Sobre o Anúncio B (Collab Heineken 0.0 x Carnan – Laps of Memory)', note: 'Escala de 1 a 5, onde 1 = Discordo totalmente e 5 = Concordo totalmente.' },
  { id: 'q8_B_interesse_social', n: 8, type: 'likert', group: 'B', label: 'Este anúncio desperta meu interesse em consumir Heineken 0.0 em momentos sociais.' },
  { id: 'q9_B_moderna_desejavel', n: 9, type: 'likert', group: 'B', label: 'A parceria com a marca de moda Carnan torna a Heineken 0.0 mais moderna e desejável.' },
  { id: 'q10_B_menos_resistencia', n: 10, type: 'likert', group: 'B', label: 'Esta campanha faria com que você tivesse menos resistências em beber cerveja sem álcool.' },
  { section: 'Escolha' },
  { id: 'q11_escolha', n: 11, type: 'choice', label: 'Se você tivesse que escolher apenas uma das duas campanhas como a mais atrativa para você hoje, qual escolheria?', options: ['Campanha A - Promoção Taça Exclusiva Fórmula 1', 'Campanha B - Collab de Moda Carnan'] },
  { id: 'q12_aberta', n: 12, type: 'text', label: 'O que mais chamou a sua atenção visualmente em cada um dos anúncios e qual foi o principal motivo que levou você a escolher a opção marcada acima?' }
];
var QS = QUESTIONS.filter(function (q) { return q.id; });

// Chamada JSONP ao Apps Script (funciona em qualquer navegador, sem bloqueio de CORS)
function jsonp(params) {
  return new Promise(function (res, rej) {
    if (!SCRIPT_URL) { rej(new Error('SCRIPT_URL vazia')); return; }
    var cb = 'cb' + Math.random().toString(36).slice(2);
    var s = document.createElement('script');
    var t = setTimeout(function () { done(); rej(new Error('tempo esgotado')); }, 20000);
    function done() { clearTimeout(t); try { delete window[cb]; } catch (_) { window[cb] = undefined; } s.remove(); }
    window[cb] = function (d) { done(); res(d); };
    var q = Object.keys(params).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
    s.src = SCRIPT_URL + '?' + q + '&callback=' + cb + '&_=' + Date.now();
    s.onerror = function () { done(); rej(new Error('rede')); };
    document.head.appendChild(s);
  });
}
