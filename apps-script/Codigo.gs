// Pesquisa Heineken 0.0 — recebe as respostas do link público e grava na planilha.
//
// Como instalar (uma vez):
// 1. Crie uma planilha nova no Google Sheets (ex.: "Respostas Pesquisa Heineken").
// 2. Extensões → Apps Script. Apague tudo e cole este código inteiro.
// 3. Troque a CHAVE_PAINEL abaixo por uma senha só sua.
// 4. Implantar → Nova implantação → App da Web
//      Executar como: Eu · Quem pode acessar: Qualquer pessoa
//    Autorize quando o Google pedir e copie a URL que termina em /exec.
// 5. Cole essa URL em config.js (SCRIPT_URL).
//
// Se alterar este código depois: Implantar → Gerenciar implantações → Editar → Nova versão
// (assim a URL continua a mesma).

var CHAVE_PAINEL = 'troque-esta-senha';   // senha para abrir o painel de resultados
var ABA = 'respostas';
var FIXAS = ['id', 'recebido_em', 'codigo', 'teste', 'ordem', 'excluido', 'motivo_exclusao'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var doc = JSON.parse(e.postData.contents);
    if (!doc || typeof doc !== 'object' || !doc.id) return texto('erro: corpo inválido');
    var sheet = abaRespostas();
    if (acharLinha(sheet, doc.id) > 0) return texto('ok (já recebido)');

    var prefixo = doc.teste ? 'PT' : 'P';
    var codigo = prefixo + ('000' + (contarPrefixo(sheet, prefixo) + 1)).slice(-3);

    var linha = {
      id: String(doc.id).slice(0, 64),
      recebido_em: new Date().toISOString(),
      codigo: codigo,
      teste: doc.teste ? 'sim' : 'nao',
      ordem: doc.order === 'BA' ? 'B>A' : 'A>B',
      excluido: doc.excluded ? 'sim' : 'nao',
      motivo_exclusao: (doc.exclusionReasons || []).join(', ')
    };
    linha.atencao_A = limpar(doc.stimulusOpen && doc.stimulusOpen.A);
    linha.atencao_B = limpar(doc.stimulusOpen && doc.stimulusOpen.B);
    var ans = doc.answers || {};
    Object.keys(ans).forEach(function (k) { linha[k] = limpar(ans[k]); });
    (doc.timeline || []).forEach(function (t) { linha['t_' + String(t.etapa).slice(0, 60)] = t.inicio; });
    linha.dispositivo = limpar(doc.device);
    linha.versao_questionario = limpar(doc.questionnaire);
    linha.json = JSON.stringify(doc).slice(0, 45000);

    var cab = garantirColunas(sheet, Object.keys(linha));
    sheet.appendRow(cab.map(function (c) { return linha[c] === undefined ? '' : linha[c]; }));
    return texto('ok');
  } catch (err) {
    return texto('erro: ' + err);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var sheet = abaRespostas();
  if (p.acao === 'ordem') {
    var linhas = lerLinhas(sheet), ab = 0, ba = 0;
    linhas.forEach(function (r) {
      if (r.teste === 'sim' || r.excluido === 'sim') return;
      if (r.ordem === 'B>A') ba++; else ab++;
    });
    return responder({ AB: ab, BA: ba }, p);
  }
  if (p.acao === 'confirmar') {
    return responder({ ok: acharLinha(sheet, p.id) > 0 }, p);
  }
  if (p.acao === 'respostas') {
    if (p.chave !== CHAVE_PAINEL) return responder({ erro: 'senha' }, p);
    var docs = lerLinhas(sheet).map(function (r) {
      var d = {};
      try { d = JSON.parse(r.json || '{}'); } catch (x) {}
      d.code = r.codigo; d.receivedAt = r.recebido_em;
      return d;
    });
    return responder({ respostas: docs, atualizado: new Date().toISOString() }, p);
  }
  return responder({ ok: true }, p);
}

/* ---------- auxiliares ---------- */
function abaRespostas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ABA);
  if (!sh) {
    sh = ss.insertSheet(ABA);
    sh.appendRow(FIXAS);
    sh.setFrozenRows(1);
  }
  return sh;
}
function cabecalho(sheet) {
  var lc = sheet.getLastColumn();
  return lc ? sheet.getRange(1, 1, 1, lc).getValues()[0].map(String) : [];
}
function garantirColunas(sheet, chaves) {
  var cab = cabecalho(sheet);
  var novas = chaves.filter(function (k) { return cab.indexOf(k) < 0; });
  if (novas.length) {
    sheet.getRange(1, cab.length + 1, 1, novas.length).setValues([novas]);
    cab = cab.concat(novas);
  }
  return cab;
}
function lerLinhas(sheet) {
  var v = sheet.getDataRange().getValues();
  if (v.length < 2) return [];
  var cab = v[0].map(String);
  return v.slice(1).map(function (row) {
    var o = {};
    cab.forEach(function (c, i) { o[c] = row[i] instanceof Date ? row[i].toISOString() : String(row[i]); });
    return o;
  });
}
function acharLinha(sheet, id) {
  if (!id) return -1;
  var n = sheet.getLastRow();
  if (n < 2) return -1;
  var ids = sheet.getRange(2, 1, n - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 2;
  return -1;
}
function contarPrefixo(sheet, prefixo) {
  var cab = cabecalho(sheet), col = cab.indexOf('codigo') + 1, n = sheet.getLastRow();
  if (!col || n < 2) return 0;
  var re = new RegExp('^' + prefixo + '\\d+$');
  return sheet.getRange(2, col, n - 1, 1).getValues().filter(function (r) { return re.test(String(r[0])); }).length;
}
// Evita que respostas começando com = + - @ virem fórmulas na planilha
function limpar(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return v;
  var s = String(v).slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function texto(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT); }
function responder(obj, p) {
  var json = JSON.stringify(obj);
  var cb = p && p.callback;
  if (cb && /^[\w$]+$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + json + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
