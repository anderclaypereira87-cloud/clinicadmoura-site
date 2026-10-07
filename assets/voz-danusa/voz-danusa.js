/*
 * voz-danusa.js — falas pré-gravadas com a voz clonada por IA (autorizada) da Dra. Danusa Moura.
 * Uso: window.vozDanusa.falar(texto, fallbackFn, { onend, onaudio })
 *  - onaudio(audio): recebe o elemento <audio> do clipe antes de tocar (ex.: boca do avatar pela amplitude).
 *  - Se assets/voz-danusa/manifest.json tiver um clipe para o texto (igual ou normalizado), toca o MP3.
 *  - Senão, chama fallbackFn(texto) (ex.: a fala atual via speechSynthesis pt-BR) e registra no console que a fala está pendente.
 * Fica em assets/voz-danusa/ (scripts/ não é publicado pelo Dockerfile). Os MP3/manifest são resolvidos
 * a partir do próprio <script src>, então funciona em / e em /avatares/.
 */
(function () {
  'use strict';
  var me = document.currentScript;
  var BASE = new URL('./', (me && me.src) || (location.href.replace(/[^/]*$/, '') + 'assets/voz-danusa/x')).href;
  var mapa = null;   // texto -> URL do MP3
  var atual = null;  // Audio em reprodução

  function normalizar(t) {
    return String(t || '')
      .normalize('NFC')
      .replace(/[\u201C\u201D\u00AB\u00BB"]/g, '')
      .replace(/[\u2018\u2019\u00B4`]/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  var pronto = fetch(BASE + 'manifest.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (m) {
      mapa = {};
      ((m && m.clips) || []).forEach(function (c) {
        var url = new URL(c.file, BASE).href;
        mapa[c.text] = url;
        mapa['~' + normalizar(c.text)] = url;
      });
    })
    .catch(function () { mapa = {}; });

  function clipPara(texto) {
    if (!mapa) return null;
    return mapa[texto] || mapa['~' + normalizar(texto)] || null;
  }

  function pendente(texto, motivo) {
    console.info('[voz-danusa] fala pendente (' + motivo + '), usando a voz do navegador: "' + String(texto).slice(0, 90) + '"');
  }

  function parar() {
    if (atual) {
      try { atual.pause(); atual.currentTime = 0; } catch (_) {}
      atual = null;
    }
  }

  function falar(texto, fallbackFn, opts) {
    opts = opts || {};
    if (mapa === null) {
      return pronto.then(function () { return falar(texto, fallbackFn, opts); });
    }
    parar();
    var url = clipPara(texto);
    var usarFallback = function (motivo) {
      pendente(texto, motivo);
      if (typeof fallbackFn === 'function') fallbackFn(texto);
      return false;
    };
    if (!url) return Promise.resolve(usarFallback('sem clipe gravado'));

    var audio = new Audio(url);
    var caiu = false;
    atual = audio;
    audio.onended = function () {
      if (atual === audio) atual = null;
      if (typeof opts.onend === 'function') opts.onend();
    };
    audio.onerror = function () {
      if (caiu || atual !== audio) return;
      caiu = true; atual = null;
      usarFallback('erro ao carregar o MP3');
    };
    if (typeof opts.onaudio === 'function') { try { opts.onaudio(audio); } catch (_) {} }
    var p = audio.play();
    return Promise.resolve(p).then(function () { return true; }, function () {
      if (caiu || atual !== audio) return false;
      caiu = true; atual = null;
      return usarFallback('reprodução bloqueada');
    });
  }

  function temClip(texto) {
    var ok = !!clipPara(texto);
    if (!ok && mapa) pendente(texto, 'sem clipe gravado');
    return ok;
  }

  /* Não falar por cima de um vídeo */
  document.addEventListener('play', function (e) {
    if (e.target && e.target.tagName === 'VIDEO') parar();
  }, true);

  window.vozDanusa = { falar: falar, parar: parar, temClip: temClip, pronto: pronto, normalizar: normalizar };
})();
