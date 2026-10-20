(function(){
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(function(){});
var standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
if(standalone){var go=function(){var here=/carteira/.test(location.pathname)?'c':'s';var n=document.createElement('nav');n.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;background:#0a1c22;border-top:1px solid #d4a24f;padding-bottom:env(safe-area-inset-bottom)';[['s','sara.html','💬 Sarah'],['c','carteira.html','💰 Carteira']].forEach(function(t){var a=document.createElement('a');a.href=t[1];a.textContent=t[2];a.style.cssText='flex:1;text-align:center;padding:13px 0;font:600 15px Inter,system-ui,sans-serif;text-decoration:none;color:'+(t[0]===here?'#e2b968':'#f3ece0');n.appendChild(a)});document.body.appendChild(n);document.body.style.paddingBottom='64px'};if(document.body)go();else document.addEventListener('DOMContentLoaded',go);return}
var ios=/iphone|ipad|ipod/i.test(navigator.userAgent),deferred=null;
var b=document.createElement('button');b.type='button';b.id='pwaInstall';b.textContent='📲 Instalar app';
b.style.cssText="position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:9999;display:none;padding:11px 18px;border-radius:999px;border:1px solid #e2b968;background:linear-gradient(135deg,#e2b968,#d4a24f);color:#030e12;font:600 15px Inter,system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.45);cursor:pointer";
var tip=document.createElement('div');
tip.style.cssText="position:fixed;left:14px;right:14px;bottom:calc(70px + env(safe-area-inset-bottom));z-index:9999;display:none;padding:14px 16px;border-radius:16px;background:#0f262d;border:1px solid #d4a24f;color:#f3ece0;font:15px/1.45 Inter,system-ui,sans-serif";
tip.innerHTML='Para instalar no iPhone: toque em <b>Compartilhar</b> <span aria-hidden="true">⬆️</span> e depois em <b>“Adicionar à Tela de Início”</b>.';
function add(){document.body.appendChild(b);document.body.appendChild(tip)}
if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
if(ios)b.style.display='block';
addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;b.style.display='block'});
addEventListener('appinstalled',function(){b.style.display='none';tip.style.display='none'});
b.onclick=function(){if(deferred){deferred.prompt();deferred.userChoice.finally(function(){deferred=null;b.style.display='none'})}else{tip.style.display=tip.style.display==='block'?'none':'block'}};
})();
