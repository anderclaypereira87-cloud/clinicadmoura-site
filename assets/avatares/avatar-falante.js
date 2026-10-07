/*
 * avatar-falante.js — avatar falante a partir da FOTO REAL de cada pessoa (nenhum rosto é gerado/sintetizado).
 * A foto recortada é animada em <canvas>: respiração, leve balanço de cabeça, piscar e a região da boca
 * (o queixo/lábio inferior da própria foto desce e revela a boca aberta) sincronizada com a fala.
 *
 * Uso (uma tag por página, em avatares/*.html):
 *   <script src="../assets/avatares/avatar-falante.js" data-pessoa="thomaz" data-alvo="#avatar-frame svg"></script>
 *   - data-alvo: elemento visual antigo (SVG/canvas desenhado). Ele é escondido (não removido) e o canvas
 *     da foto entra no lugar. Se o script falhar, o visual antigo continua aparecendo.
 * API:
 *   AvatarFalante.ativo()                 -> true se a foto carregou e o avatar está montado
 *   AvatarFalante.falar(texto, {onstart, onend})
 *        Voz do aparelho (Web Speech pt-BR). Boca guiada por eventos onboundary; se o navegador não
 *        disparar boundary, um temporizador estima as sílabas pelo texto.
 *   AvatarFalante.conectarAudio(audio)    -> boca guiada pela amplitude do <audio> (WebAudio AnalyserNode).
 *        Usado SOMENTE na página da Dra. Danusa, com os clipes da voz clonada dela (assets/voz-danusa).
 *   AvatarFalante.parar()                 -> para a fala e fecha a boca.
 * Nunca fala sem um clique/toque do visitante.
 */
(function () {
  'use strict';
  var script = document.currentScript;
  var BASE = new URL('./', (script && script.src) || location.href).href;

  /* Coordenadas normalizadas (0–1) medidas em cada foto recortada (assets/avatares/fotos/*.jpg).
     boca.c1/c2 = cantos da boca (esq./dir.); boca.s = quanto o centro da linha entre os lábios (ou a borda de
     baixo dos dentes de cima, em quem sorri) fica abaixo da reta entre os cantos; boca.queixo = até onde a
     região que desce vai (base do queixo). olhos: centros; ol = largura e oa = altura da abertura do olho.
     piscar:false onde a piscada sintética não fica natural nesta foto (sombra/maquiagem escura nas pálpebras,
     cabeça inclinada, óculos, franja sobre as pálpebras, ilustração). Hoje só o Anderclay pisca. */
  var PESSOAS = {
    thomaz:    { foto: 'fotos/thomaz.jpg',    nome: 'Dr. Thomaz',           sexo: 'm', boca: { c1: [.445, .490], c2: [.575, .487], s: .006, queixo: .60 }, olhos: [[.427, .33], [.568, .332]], ol: .08, oa: .03, piscar: false },
    danusa:    { foto: 'fotos/danusa.jpg',    nome: 'Dra. Danusa Moura',    sexo: 'f', boca: { c1: [.419, .526], c2: [.600, .566], s: .023, queixo: .70 }, olhos: [[.445, .365], [.593, .394]], ol: .09, oa: .026, piscar: false },
    anderclay: { foto: 'fotos/anderclay.jpg', nome: 'Anderclay Pereira',    sexo: 'm', boca: { c1: [.420, .535], c2: [.545, .538], s: .006, queixo: .67 }, olhos: [[.42, .362], [.585, .369]], ol: .08, oa: .021 },
    marciana:  { foto: 'fotos/marciana.jpg',  nome: 'Marciana Rodrigues',   sexo: 'f', boca: { c1: [.397, .645], c2: [.650, .624], s: .034, queixo: .82 }, olhos: [[.36, .395], [.635, .372]], ol: .11, piscar: false },
    henrique:  { foto: 'fotos/henrique.jpg',  nome: 'Dr. Henrique Furtado', sexo: 'm', boca: { c1: [.423, .449], c2: [.570, .456], s: .025, queixo: .59 }, olhos: [[.42, .32], [.575, .325]], ol: .08, piscar: false },
    sarah:     { foto: 'fotos/sarah.jpg',     nome: 'Sarah (ilustração)',   sexo: 'f', boca: { c1: [.447, .609], c2: [.730, .603], s: .073, queixo: .80 }, olhos: [[.49, .415], [.71, .405]], ol: .1, piscar: false, ilustracao: true }
    // TODO foto Flávia/Paula: usuário envia em 08/10/2026 — ainda sem foto; cadastrar flavia/paula aqui só quando as fotos chegarem (não inventar dados/coordenadas).
  };

  var cfg = null, img = null, canvas = null, ctx = null, quadro = null, qctx = null;
  var patchBoca = null, patchOlhos = [];
  var montado = false, visivel = true;
  var nivel = 0, alvo = 0;                  // abertura da boca (0..1) atual e desejada
  var piscada = { ini: 0, prox: 0 };
  var congelado = null, piscadaFixa = null; // só para testes/capturas (AvatarFalante._congelar/_piscar)
  var t0 = performance.now();

  /* ---------------- desenho ---------------- */
  function feather(c, w, h, topoDuro) {
    var g = c.getContext('2d');
    g.globalCompositeOperation = 'destination-in';
    var lin = g.createLinearGradient(0, 0, w, 0);
    lin.addColorStop(0, 'rgba(0,0,0,0)'); lin.addColorStop(0.2, 'rgba(0,0,0,1)');
    lin.addColorStop(0.8, 'rgba(0,0,0,1)'); lin.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = lin; g.fillRect(0, 0, w, h);
    var v = g.createLinearGradient(0, 0, 0, h);
    if (topoDuro) {          // boca: opaca na vertical (o deslocamento é que vai a zero embaixo, sem emenda)
      v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,1)');
    } else {                 // pálpebra: topo esmaece na pele, base cobre o olho
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.35, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,1)');
    }
    g.fillStyle = v; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
  }

  function prepararPatches() {
    var W = img.naturalWidth, H = img.naturalHeight, b = cfg.boca;
    // Referencial da boca: origem no meio entre os cantos, eixo x ao longo da boca (acompanha a inclinação da cabeça).
    var x1 = b.c1[0] * W, y1 = b.c1[1] * H, x2 = b.c2[0] * W, y2 = b.c2[1] * H;
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ang = Math.atan2(y2 - y1, x2 - x1), mw = Math.hypot(x2 - x1, y2 - y1);
    var sp = b.s * H, jw = mw * 1.7, jh = Math.max(mw * 0.5, b.queixo * H - my);
    var c = document.createElement('canvas'); c.width = Math.ceil(jw); c.height = Math.ceil(jh);
    var g = c.getContext('2d');
    g.translate(jw / 2, 0); g.rotate(-ang); g.translate(-mx, -my); g.drawImage(img, 0, 0);
    g.setTransform(1, 0, 0, 1, 0, 0);
    // corta tudo acima da linha entre os lábios (curva do sorriso): só o lábio inferior/queixo se movem
    g.globalCompositeOperation = 'destination-in';
    g.beginPath(); g.moveTo(0, 0);
    for (var u = -1; u <= 1.0001; u += 0.1) g.lineTo(jw / 2 + u * mw / 2, sp * (1 - u * u));
    g.lineTo(jw, 0); g.lineTo(jw, jh); g.lineTo(0, jh); g.closePath(); g.fill();
    g.globalCompositeOperation = 'source-over';
    feather(c, c.width, c.height, true);
    patchBoca = { c: c, mx: mx, my: my, ang: ang, mw: mw, sp: sp, w: jw, h: jh };
    // Pálpebras: pele logo acima de cada olho, esticada para baixo na piscada.
    patchOlhos = [];
    if (cfg.piscar === false) return;
    cfg.olhos.forEach(function (o) {
      // pele da pálpebra logo acima da abertura do olho (sem pegar a sobrancelha)
      var ew = cfg.ol * W, oa = cfg.oa * H, pele = oa * 0.6, sw = ew * 1.25;
      var sx = o[0] * W - sw / 2, sy = o[1] * H - oa / 2 - pele;
      var p = document.createElement('canvas'); p.width = Math.ceil(sw); p.height = Math.max(2, Math.ceil(pele));
      p.getContext('2d').drawImage(img, sx, sy, sw, pele, 0, 0, p.width, p.height);
      feather(p, p.width, p.height, false);
      patchOlhos.push({ c: p, x: sx, y: sy, w: sw, h: pele, ey: o[1] * H, eh: oa, ex: o[0] * W, ew: ew });
    });
  }

  function desenharQuadro(agora) {
    var W = img.naturalWidth, H = img.naturalHeight;
    qctx.globalAlpha = 1;
    qctx.drawImage(img, 0, 0);
    // piscar (~130 ms a cada 3–6 s)
    if (patchOlhos.length) {
      if (!piscada.prox) piscada.prox = agora + 1800 + Math.random() * 2500;
      if (agora >= piscada.prox && !piscada.ini) piscada.ini = agora;
      if (piscada.ini) {
        var k = (agora - piscada.ini) / 140;
        if (piscadaFixa !== null) k = 0.5;
        if (k >= 1) { piscada.ini = 0; piscada.prox = agora + 3000 + Math.random() * 3000; }
        else {
          var fech = piscadaFixa !== null ? piscadaFixa : Math.sin(Math.PI * k);
          patchOlhos.forEach(function (p) {
            var extra = fech * p.eh * 1.05;
            qctx.drawImage(p.c, p.x, p.y, p.w, p.h + extra);
            if (fech > 0.6) {   // linha dos cílios do olho fechado
              qctx.globalAlpha = 0.5 * fech;
              qctx.strokeStyle = '#24160f'; qctx.lineWidth = Math.max(1, p.eh * 0.12);
              qctx.beginPath();
              qctx.moveTo(p.ex - p.ew * 0.45, p.ey);
              qctx.quadraticCurveTo(p.ex, p.ey + p.eh * 0.55, p.ex + p.ew * 0.45, p.ey);
              qctx.stroke(); qctx.globalAlpha = 1;
            }
          });
        }
      }
    }
    // boca
    if (nivel > 0.02 && patchBoca) {
      var pb = patchBoca, d = nivel * pb.mw * 0.15, half = pb.mw / 2, u, i, k;
      qctx.save();
      qctx.translate(pb.mx, pb.my); qctx.rotate(pb.ang);
      // interior da boca: "lente" entre a linha dos lábios e o lábio inferior deslocado (fina nos cantos)
      qctx.beginPath();
      for (u = -1; u <= 1.0001; u += 0.1) qctx.lineTo(u * half, pb.sp * (1 - u * u) - 0.5);
      for (u = 1; u >= -1.0001; u -= 0.1) qctx.lineTo(u * half, (pb.sp + d) * (1 - u * u) + 0.5);
      qctx.closePath();
      var gr = qctx.createLinearGradient(0, pb.sp, 0, pb.sp + d);
      gr.addColorStop(0, 'rgba(30,8,10,0.97)'); gr.addColorStop(1, 'rgba(62,20,22,0.95)');
      qctx.fillStyle = gr; qctx.fill();
      // lábio inferior + queixo da própria foto descem: mais no centro da boca, nada nos cantos/bochechas,
      // e o deslocamento vai a zero abaixo do queixo (sem emendas).
      var nx = 24, ny = 12, tw = pb.w / nx, th = pb.h / ny, esx = pb.c.width / pb.w, esy = pb.c.height / pb.h;
      for (i = 0; i < nx; i++) {
        u = (-pb.w / 2 + (i + 0.5) * tw) / half;
        var gx = Math.max(0, 1 - u * u);
        for (k = 0; k < ny; k++) {
          var v = k / ny, f = v < 0.55 ? 1 : Math.max(0, (1 - v) / 0.45), dy = d * gx * f;
          qctx.drawImage(pb.c, i * tw * esx, k * th * esy, tw * esx + 1, th * esy + 1,
            -pb.w / 2 + i * tw, k * th + dy, tw + 1, th + 1);
        }
      }
      qctx.restore();
    }
  }

  function redimensionar() {
    if (!canvas) return;
    var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  function loop(agora) {
    requestAnimationFrame(loop);
    if (!montado || !visivel) return;
    medirAnalisador();
    atualizarSintetico(agora);
    nivel += (alvo - nivel) * (alvo > nivel ? 0.6 : 0.3);
    if (nivel < 0.01) nivel = 0;
    if (congelado !== null) nivel = congelado;
    desenharQuadro(agora);
    redimensionar();
    var W = canvas.width, H = canvas.height, t = (agora - t0) / 1000;
    var esc = Math.max(W / quadro.width, H / quadro.height) * 1.04;
    var resp = 1 + 0.006 * Math.sin(t * 2 * Math.PI / 4.2);          // respiração
    var ang = 0.006 * Math.sin(t * 2 * Math.PI / 7.3) + (falando ? 0.004 * Math.sin(t * 5.1) : 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.translate(W / 2, H * 0.98);
    ctx.rotate(ang);
    ctx.scale(esc * resp, esc * resp);
    ctx.translate(-quadro.width / 2, -quadro.height * 0.98 + nivel * 0.6);
    ctx.drawImage(quadro, 0, 0);
  }

  /* ---------------- voz do aparelho (Web Speech) + boca por onboundary ---------------- */
  var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  var seq = 0, falando = false, fila = [], fonteAtual = null;
  var bnd = { usou: false, fimPalavra: 0, iniPalavra: 0, silabas: 1 };
  var sint = null;   // temporizador de reserva (quando onboundary não dispara)

  var FEMININAS = [/natural/i, /online/i, /google/i, /francisca/i, /thalita/i, /luciana/i, /antonio/i];
  var MASC = /antonio|daniel|luciano|felipe|donato|fabio|f\u00e1bio|humberto|julio|j\u00falio|nicolau|valerio|val\u00e9rio|male|masculin/i;
  var vozMasculinaAchada = false;
  function escolherVoz() {
    var vozes = synth.getVoices().filter(function (v) { return /^pt[-_]BR/i.test(v.lang); });
    vozMasculinaAchada = false;
    if (cfg && cfg.sexo === 'm') {
      var m = vozes.find(function (v) { return MASC.test(v.name) && /natural|online/i.test(v.name); }) ||
              vozes.find(function (v) { return MASC.test(v.name); });
      if (m) { vozMasculinaAchada = true; return m; }
    }
    for (var i = 0; i < FEMININAS.length; i++) {
      var achou = vozes.find(function (v) { return FEMININAS[i].test(v.name); });
      if (achou) return achou;
    }
    return vozes[0] || null;
  }
  function paraFala(t) {
    return String(t)
      .replace(/R\$\s?(\d+)/g, '$1 reais')
      .replace(/\bDra\./g, 'Doutora').replace(/\bDr\./g, 'Doutor')
      .replace(/D'Moura/g, 'Dê Moura')
      .replace(/[•"“”]/g, '').replace(/—/g, ',').replace(/\s+/g, ' ').trim();
  }
  function frases(t) {
    var partes = t.match(/[^.!?…]+[.!?…]*\s*/g) || [t], out = [], buf = '';
    partes.forEach(function (p) {
      if ((buf + p).length > 220 && buf) { out.push(buf.trim()); buf = ''; }
      buf += p;
    });
    if (buf.trim()) out.push(buf.trim());
    return out;
  }
  function silabasDe(palavra) {
    var v = String(palavra).toLowerCase().match(/[aeiouáéíóúâêôãõà]+/g);
    return Math.max(1, v ? v.length : 1);
  }
  function plano(texto) {   // agenda estimada de palavras/pausas, para o temporizador de reserva
    var itens = [], re = /([^\s.,;:!?…]+)|([.,;:!?…])/g, m, t = 0;
    while ((m = re.exec(texto))) {
      if (m[1]) { var s = silabasDe(m[1]); var dur = 70 + s * 165; itens.push({ ini: t, fim: t + dur, s: s }); t += dur + 25; }
      else t += /[,;:]/.test(m[2]) ? 200 : 360;
    }
    return { itens: itens, total: t };
  }
  function iniciarSintetico(texto) {
    sint = { ini: performance.now(), plano: plano(texto) };
  }
  function atualizarSintetico(agora) {
    if (fonteAtual) return;                       // áudio (analisador) manda na boca
    if (!falando) { alvo = 0; return; }
    if (bnd.usou) {
      if (agora < bnd.fimPalavra) {
        var p = (agora - bnd.iniPalavra) / (bnd.fimPalavra - bnd.iniPalavra);
        alvo = 0.3 + 0.7 * Math.abs(Math.sin(Math.PI * bnd.silabas * p));
      } else alvo = 0.05;
      return;
    }
    if (!sint) { alvo = 0; return; }
    var dt = agora - sint.ini, it = sint.plano.itens, a = 0.05;
    if (dt > sint.plano.total) dt = dt % Math.max(1, sint.plano.total);   // fala mais longa que o estimado
    for (var i = 0; i < it.length; i++) {
      if (dt >= it[i].ini && dt < it[i].fim) {
        var q = (dt - it[i].ini) / (it[i].fim - it[i].ini);
        a = 0.3 + 0.7 * Math.abs(Math.sin(Math.PI * it[i].s * q)); break;
      }
    }
    alvo = a;
  }

  function parar() {
    seq++;
    fila = [];
    if (synth) synth.cancel();
    if (fonteAtual) desconectarAudio();
    falando = false; sint = null; bnd.usou = false; alvo = 0;
    marcar(false);
  }

  function falar(texto, opts) {
    opts = opts || {};
    parar();
    var meu = seq;
    var fim = function () { if (meu !== seq) return; falando = false; sint = null; alvo = 0; marcar(false); if (opts.onend) opts.onend(); };
    var ativado = !navigator.userActivation || navigator.userActivation.hasBeenActive;
    if (!synth || !ativado || !String(texto || '').trim()) { setTimeout(fim, 0); return; }
    var pedacos = frases(paraFala(texto));
    var comecou = false;
    var proximo = function () {
      if (meu !== seq) return;
      var frase = pedacos.shift();
      if (!frase) return fim();
      var u = new SpeechSynthesisUtterance(frase);
      u.lang = 'pt-BR';
      var voz = escolherVoz();
      if (voz) u.voice = voz;
      u.rate = 1.0;
      u.pitch = cfg && cfg.sexo === 'm' ? (vozMasculinaAchada ? 0.95 : 0.8) : 1.05;
      var reserva = setTimeout(function () { if (meu === seq && !bnd.usou) iniciarSintetico(frase); }, 450);
      // trava de segurança: alguns motores não disparam onend; não deixa a boca mexendo para sempre
      var pp = plano(frase), terminou = false;
      var trava = setTimeout(function () { if (meu === seq && !terminou) { terminou = true; proximo(); } }, pp.total * 2.5 + 4000);
      u.onstart = function () {
        if (meu !== seq) return;
        falando = true; marcar(true);
        iniciarSintetico(frase); bnd.usou = false;
        if (!comecou) { comecou = true; if (opts.onstart) opts.onstart(); }
      };
      u.onboundary = function (e) {
        if (meu !== seq || (e.name && e.name !== 'word')) return;
        var len = e.charLength || ((frase.slice(e.charIndex).match(/^[^\s.,;:!?]+/) || [''])[0].length) || 3;
        var palavra = frase.substr(e.charIndex, len);
        var agora = performance.now();
        bnd.usou = true; sint = null;
        bnd.iniPalavra = agora; bnd.silabas = silabasDe(palavra);
        bnd.fimPalavra = agora + (70 + bnd.silabas * 165) / (u.rate || 1);
      };
      u.onend = function () { clearTimeout(reserva); clearTimeout(trava); if (meu === seq && !terminou) { terminou = true; bnd.usou = false; proximo(); } };
      u.onerror = function (e) { clearTimeout(reserva); clearTimeout(trava); if (meu === seq && !terminou && e.error !== 'interrupted' && e.error !== 'canceled') { terminou = true; proximo(); } };
      falando = true; marcar(true);
      synth.speak(u);
    };
    var vozes = synth.getVoices();
    if (vozes.length) proximo();
    else {
      var foi = false, go = function () { if (!foi) { foi = true; proximo(); } };
      synth.addEventListener('voiceschanged', go, { once: true });
      setTimeout(go, 600);
    }
  }

  /* ---------------- clipes de áudio (Danusa) + boca por amplitude (AnalyserNode) ---------------- */
  var actx = null, analisador = null, buf = null, origem = null, mudoDesde = 0;
  function garantirContexto() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!actx) { try { actx = new AC(); } catch (_) { return null; } }
    if (actx.state === 'suspended') actx.resume().catch(function () {});
    return actx;
  }
  // O contexto só é criado/retomado num gesto do visitante (política de autoplay).
  ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) {
    document.addEventListener(ev, function () { if (cfg && cfg.usaClipes) garantirContexto(); }, { capture: true, passive: true });
  });
  function conectarAudio(audio) {
    if (!audio) return;
    parar();
    var meu = seq;
    fonteAtual = { audio: audio, conectado: false, ini: performance.now() };
    falando = true; marcar(true);
    var c = garantirContexto();
    // Só roteia pelo WebAudio se o contexto estiver rodando; senão o áudio poderia ficar mudo.
    if (c && c.state === 'running') {
      try {
        origem = c.createMediaElementSource(audio);
        analisador = c.createAnalyser(); analisador.fftSize = 1024; analisador.smoothingTimeConstant = 0.2;
        buf = new Float32Array(analisador.fftSize);
        origem.connect(analisador); analisador.connect(c.destination);
        fonteAtual.conectado = true;
      } catch (e) { origem = null; analisador = null; }
    }
    if (!fonteAtual.conectado) iniciarSintetico('');
    var acabou = function () { if (meu !== seq) return; desconectarAudio(); falando = false; alvo = 0; marcar(false); };
    audio.addEventListener('ended', acabou);
    audio.addEventListener('pause', acabou);
    audio.addEventListener('error', acabou);
  }
  function desconectarAudio() {
    // o MediaElementSource fica ligado ao destino até o elemento ser descartado; só soltamos a referência
    fonteAtual = null; analisador = null; origem = null;
  }
  function medirAnalisador() {
    if (!fonteAtual) return;
    var a = fonteAtual.audio;
    if (a.paused || a.ended) { alvo = 0; return; }
    if (analisador) {
      analisador.getFloatTimeDomainData(buf);
      var s = 0; for (var i = 0; i < buf.length; i++) s += buf[i] * buf[i];
      var rms = Math.sqrt(s / buf.length);
      if (rms < 1e-5) { if (!mudoDesde) mudoDesde = performance.now(); } else mudoDesde = 0;
      // silêncio digital por muito tempo com o áudio andando = fonte "tainted" -> estimativa por tempo
      if (mudoDesde && performance.now() - mudoDesde > 500 && a.currentTime > 0.6) { analisador = null; }
      else { alvo = Math.min(1, Math.pow(Math.max(0, rms - 0.012) * 7, 0.75)); return; }
    }
    var t = a.currentTime;   // reserva: pulso de sílabas (~5/s) enquanto o clipe toca
    alvo = 0.25 + 0.6 * Math.abs(Math.sin(t * Math.PI * 5)) * (0.6 + 0.4 * Math.sin(t * 1.7));
  }

  /* ---------------- montagem ---------------- */
  function marcar(sim) {
    if (canvas && canvas.parentNode) canvas.parentNode.classList.toggle('af-falando', !!sim);
  }
  function montar(nomePessoa, seletor) {
    cfg = PESSOAS[nomePessoa];
    if (!cfg) { console.warn('[avatar-falante] pessoa sem foto cadastrada:', nomePessoa); return; }
    cfg.usaClipes = nomePessoa === 'danusa';
    var alvoEl = seletor ? document.querySelector(seletor) : null;
    if (!alvoEl) { console.warn('[avatar-falante] alvo não encontrado:', seletor); return; }
    img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      quadro = document.createElement('canvas');
      quadro.width = img.naturalWidth; quadro.height = img.naturalHeight;
      qctx = quadro.getContext('2d');
      prepararPatches();
      canvas = document.createElement('canvas');
      canvas.className = 'af-canvas' + (alvoEl.tagName === 'CANVAS' ? ' af-retrato' : '');
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', cfg.ilustracao ? 'Ilustração animada da ' + cfg.nome.replace(/ \(.*\)/, '') : 'Foto animada de ' + cfg.nome);
      canvas.addEventListener('click', function () { if (typeof alvoEl.click === 'function' && alvoEl.getAttribute('onclick')) alvoEl.click(); });
      if (alvoEl.getAttribute('onclick')) canvas.style.cursor = 'pointer';
      var caixa = document.createElement('div');
      caixa.className = 'af-caixa' + (alvoEl.tagName === 'CANVAS' ? ' af-caixa-retrato' : '');
      // moldura própria só quando o contêiner original não já é um círculo com borda
      if (alvoEl.tagName !== 'CANVAS' && !/rounded-full/.test(alvoEl.parentNode.className || '')) caixa.classList.add('af-anel');
      caixa.appendChild(canvas);
      if (cfg.ilustracao) {
        var tag = document.createElement('span'); tag.className = 'af-tag'; tag.textContent = 'Ilustração';
        caixa.appendChild(tag);
      }
      alvoEl.parentNode.insertBefore(caixa, alvoEl);
      alvoEl.style.display = 'none';
      alvoEl.setAttribute('aria-hidden', 'true');
      ctx = canvas.getContext('2d');
      montado = true;
      redimensionar();
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; }).observe(caixa);
      }
    };
    img.onerror = function () { console.warn('[avatar-falante] foto não carregou:', img.src); };
    img.src = new URL(cfg.foto, BASE).href;
  }

  // não falar por cima de um vídeo
  document.addEventListener('play', function (e) { if (e.target && e.target.tagName === 'VIDEO') parar(); }, true);

  window.AvatarFalante = {
    ativo: function () { return montado; },
    falar: falar,
    parar: parar,
    conectarAudio: conectarAudio,
    _nivel: function () { return nivel; },               // para testes
    _modo: function () {
      if (fonteAtual) return analisador ? 'audio-amplitude' : 'audio-estimado';
      if (!falando) return 'parado';
      return bnd.usou ? 'onboundary' : (sint ? 'temporizador' : 'aguardando');
    },
    _congelar: function (v) { congelado = (v === null || v === undefined) ? null : +v; },   // só testes
    _piscar: function (fixa) { piscada.ini = performance.now(); piscadaFixa = (fixa === undefined) ? null : fixa; }
  };

  var pessoa = script && script.getAttribute('data-pessoa');
  var sel = script && script.getAttribute('data-alvo');
  if (pessoa) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { montar(pessoa, sel); });
    else montar(pessoa, sel);
  }
  requestAnimationFrame(loop);
})();
