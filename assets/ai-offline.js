/* Sem chave de IA no site público: evita chamadas Gemini sem chave (as páginas usam as respostas e vozes de reserva). */
(function () {
  var f = window.fetch;
  window.fetch = function (u, o) {
    var s = String(u && u.url || u);
    if (/generativelanguage\.googleapis\.com/.test(s) && /[?&]key=(&|$)/.test(s)) {
      return Promise.resolve(new Response('{}', { status: 503, headers: { 'Content-Type': 'application/json' } }));
    }
    return f.apply(this, arguments);
  };
})();
