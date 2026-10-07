/* GPS: encontra a unidade mais próxima (distância em linha reta até o centro da cidade da unidade) e abre a rota no Google Maps. Sem chave de API. */
(function () {
  var btn = document.getElementById('gps-btn'), st = document.getElementById('gps-status');
  if (!btn) return;
  var cards = [].slice.call(document.querySelectorAll('.unit-card'));
  function km(a, b, c, d) { var R = 6371, r = Math.PI / 180, x = (c - a) * r, y = (d - b) * r;
    var h = Math.sin(x / 2) * Math.sin(x / 2) + Math.cos(a * r) * Math.cos(c * r) * Math.sin(y / 2) * Math.sin(y / 2);
    return 2 * R * Math.asin(Math.sqrt(h)); }
  function msg(t) { st.textContent = t; }
  btn.addEventListener('click', function () {
    if (!('geolocation' in navigator)) { msg('Seu navegador não permite localização. Use os botões "Como chegar".'); return; }
    msg('Buscando sua localização…'); btn.disabled = true;
    navigator.geolocation.getCurrentPosition(function (p) {
      btn.disabled = false;
      var la = p.coords.latitude, lo = p.coords.longitude, best = null;
      cards.forEach(function (c) {
        var d = km(la, lo, +c.dataset.lat, +c.dataset.lng); c.classList.remove('unit-nearest');
        c.querySelector('.unit-dist').textContent = 'Aprox. ' + (d < 10 ? d.toFixed(1) : Math.round(d)) + ' km de você';
        c.querySelector('.unit-route').href = 'https://www.google.com/maps/dir/?api=1&origin=' + la + ',' + lo + '&destination=' + encodeURIComponent(c.dataset.dest);
        if (!best || d < best.d) best = { c: c, d: d };
      });
      best.c.classList.add('unit-nearest');
      msg('Unidade mais próxima: ' + best.c.querySelector('h3').textContent + '. Toque em "Como chegar" para ver a rota.');
      best.c.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, function () { btn.disabled = false; msg('Não foi possível obter sua localização. Use os botões "Como chegar".'); },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  });
})();
