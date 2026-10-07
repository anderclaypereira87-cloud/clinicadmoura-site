(function(){'use strict';
var WA='5581997181046';function wa(t){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(t);}
function $(s){return document.querySelector(s);}function el(h){var d=document.createElement('div');d.innerHTML=h.trim();return d.firstChild;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

/* ---------- Abas ---------- */
var tabs=['clinica','videos','avatares','mapa','avaliacoes'];
function show(t){if(tabs.indexOf(t)<0)t='clinica';
  tabs.forEach(function(x){$('#tab-'+x).classList.toggle('on',x===t);});
  document.querySelectorAll('nav.tabs button').forEach(function(b){b.setAttribute('aria-selected',b.dataset.tab===t);});
  if(history.replaceState)history.replaceState(null,'','#'+t);
  if(t==='mapa')initMap();
  document.querySelectorAll('video').forEach(function(v){v.pause();});}
document.addEventListener('click',function(e){var b=e.target.closest('[data-tab],[data-go]');if(!b)return;e.preventDefault();show(b.dataset.tab||b.dataset.go);
  var s=$('#tab-'+(b.dataset.tab||b.dataset.go));if(s)window.scrollTo({top:s.offsetTop-80,behavior:'smooth'});});

/* ---------- Procedimentos ---------- */
var PROCS=[
['Miomodulação Facial','45 min',"Botox Fullface — Protocolo Assinatura D'Moura",'Tratamento global dos terços superior, médio e inferior + bandas platismais (efeito Nefertiti) com dosimetria individualizada.','Prevenção e suavização de rugas dinâmicas, arqueamento sutil da cauda da sobrancelha e definição do contorno cervical.'],
['Reestruturação Volumétrica','60 min','Harmonização Facial Estrutural 4D','Sustentação malar, projeção de mento, contorno mandibular e refinamento labial com ácido hialurônico premium.','Reposicionamento de tecidos profundos, equilíbrio de proporções faciais e rejuvenescimento sem aspecto artificial.'],
['Medicina Regenerativa','50 min','Bioestimulação Dérmica de Alta Performance','Aplicação vetorial de bioestimuladores (Ácido Poli-L-Lático / Hidroxiapatita de Cálcio) para neocolagênese progressiva.','Flacidez tissular facial, pescoço, colo e áreas corporais estratégicas.'],
['Tração & Colágeno','60 min','Lifting Não-Cirúrgico com Fios de PDO','Vetores de tração reposicionam o SMAS superficial combinados a fios lisos para estímulo de matriz extracelular.','Ptose leve a moderada do terço médio/inferior e estímulo intenso de firmeza palpebral e glabelar.'],
['Qualidade de Pele','35 min','Protocolo Skinbooster & Hidratação Profunda','Microinfusão dérmica de ácido hialurônico não reticulado e vitaminas para restauração imediata do viço.','Peles desidratadas, linhas finas periorbitais, código de barras e preparação pré-eventos.'],
['Tecnologias Avançadas','60 min','Lifting Tecnológico por Ultrassom Microfocado','Pontos de coagulação térmica desde a derme superficial até a fáscia muscular (SMAS) sem downtime.','Efeito lifting imediato e progressivo para face completa, papada e região periocular.']];
$('#procs').innerHTML=PROCS.map(function(p){return '<article class="card"><div class="meta"><span class="pill">'+p[0]+'</span><span>'+p[1]+'</span></div><h3>'+p[2]+'</h3><p>'+p[3]+'</p><p class="ind"><b>Indicação clínica:</b> '+p[4]+'</p><div class="row"><a class="btn btn-teal" target="_blank" rel="noopener" href="'+wa("Olá! Vim pelo site e quero saber sobre "+p[2]+'.')+'">Agendar</a><button class="btn" data-go="mapa">Rota no mapa</button></div></article>';}).join('');

/* ---------- Vídeos (lista pública; sem painel técnico) ---------- */
var VIDS=[['v01','A importância da avaliação presencial'],['v02','Tratamento para flacidez glútea'],['v03','Preenchimento e bioestimuladores — verão'],['v04','Beleza natural sem filtros'],['v05','Entendendo o Botox Full Face'],['v06','Benefícios da Vitamina C pura'],['v07','O verdadeiro custo da autoestima'],['v08','Risco de hematomas nos procedimentos'],['v09','Resultados naturais — olhar descansado'],['v10','Todo Botox é igual?'],['v11','O Botox resolve o bigode chinês?']];
$('#vids').innerHTML=VIDS.map(function(v){return '<div class="vcard"><video controls playsinline preload="none" poster="videos/'+v[0]+'.jpg"><source src="videos/'+v[0]+'.mp4" type="video/mp4"></video><div>'+esc(v[1])+'</div></div>';}).join('');
document.addEventListener('play',function(e){if(e.target.tagName!=='VIDEO')return;document.querySelectorAll('video').forEach(function(o){if(o!==e.target)o.pause();});pararFala();},true);

/* ---------- Avatares com fala ---------- */
var AVS=[
['anderclay','Anderclay','Founder & Estrategista-Chefe','Holding & Finanças',"Olá, eu sou o Anderclay Pereira, fundador da Clínica D'Moura e do Instituto DMAP. Meu trabalho é conectar talento, gestão e margem para construir negócios que crescem com propósito.",1],
['paula','Paula','Diretoria Clínica & Protocolos',"Clínica D'Moura","Oi, eu sou a Paula. Cuido dos protocolos clínicos da D'Moura, como o Botox Fullface e a harmonização facial, sempre com resultado natural e segurança.",0],
['thomaz','Thomaz','Operações & Performance','Instituto DMAP',"Oi, eu sou o Thomaz. No Instituto DMAP eu organizo processos e o fluxo operacional para que cada unidade funcione bem e possa crescer.",1],
['marciana','Marciana','Experiência & Concierge',"Clínica D'Moura","Olá, sou a Marciana. Cuido da sua experiência na clínica, do primeiro contato ao pós-procedimento, para você se sentir acolhida em cada etapa.",1],
['sarah','Sarah','Consultoria Comercial',"Clínica D'Moura","Oi, eu sou a Sarah. Te ajudo a entender o plano de tratamento ideal para você e as condições para começar.",1],
['henrique','Henrique','Dados & Expansão','Instituto DMAP',"Olá, eu sou o Henrique. Analiso dados e demanda local para levar a D'Moura para mais perto de quem precisa.",1],
['flavia','Flávia','Atendimento & Relacionamento',"Clínica D'Moura","Oi, eu sou a Flávia. Cuido do seu agendamento, das confirmações e do seu retorno. É só me chamar no WhatsApp.",0],
['danusa','Dra. Danusa','Biomédica esteta',"Clínica D'Moura · DMAP","Olá! Sou a Dra. Danusa Moura, biomédica esteta integrante do Instituto DMap e à frente da Clínica D'Moura. Minha missão é cuidar de você por inteiro, unindo ciência e tecnologia na harmonização facial, estética corporal e saúde íntima feminina. Como posso te ajudar hoje?",1,'assets/voz-danusa/avatares-danusa/01.mp3'],
['proposta-dmap','Proposta DMAP','Propostas Executivas','Instituto DMAP',"Eu sou o assistente de propostas do Instituto DMAP. Faço o diagnóstico estratégico da sua clínica e monto o escopo da mentoria com o retorno projetado.",0],
['marketing-dmap','Marketing DMAP','Aquisição B2B','Instituto DMAP',"Sou o Marketing DMAP. Crio funis de educação executiva e eventos de imersão para atrair clínicas parceiras.",0],
['marketing-dmoura',"Marketing D'Moura",'Branding & Tráfego Local',"Clínica D'Moura","Sou o Marketing D'Moura. Cuido da marca e das campanhas locais em Recife, Caruaru e Garanhuns.",0],
['dre-executiva','DRE Executiva','Auditoria de Margem & Finanças','Holding & Finanças',"Sou a DRE Executiva. Analiso margem líquida, custos fixos e variáveis com o Método Milhão, para o lucro ficar previsível.",0]];
$('#avs').innerHTML=AVS.map(function(a,i){var ph=a[5]?'<img class="ph" src="assets/avatares/fotos/'+a[0]+'-mini.jpg" alt="'+esc(a[1])+'" loading="lazy">':'<div class="ph">'+a[1].replace(/^Dra\. /,'').split(' ').map(function(w){return w[0];}).join('').slice(0,2)+'</div>';
 return '<article class="card av">'+ph+'<span class="pill">'+esc(a[3])+'</span><h3 style="margin-top:8px">'+esc(a[1])+' — '+esc(a[2])+'</h3><p class="fala">“'+esc(a[4])+'”</p><div class="row"><button class="btn btn-gold" data-fala="'+i+'">▶ Ouvir fala</button><a class="btn" href="avatares/'+a[0]+'.html">Conversar</a></div></article>';}).join('');
var audio=null,falando=null;
function pararFala(){if(audio){audio.pause();audio=null;}if(window.speechSynthesis)speechSynthesis.cancel();if(falando){falando.classList.remove('speaking');falando.textContent='▶ Ouvir fala';falando=null;}}
function vozBR(){var vs=speechSynthesis.getVoices().filter(function(v){return /pt[-_]BR/i.test(v.lang);});return vs.filter(function(v){return /natural|google|luciana|francisca|thalita/i.test(v.name);})[0]||vs[0]||null;}
document.addEventListener('click',function(e){var b=e.target.closest('[data-fala]');if(!b)return;var was=falando===b;pararFala();if(was)return;
 var a=AVS[+b.dataset.fala];falando=b;b.classList.add('speaking');b.textContent='■ Parar';
 document.querySelectorAll('video').forEach(function(v){v.pause();});
 function fim(){if(falando===b)pararFala();}
 if(a[6]){audio=new Audio(a[6]);audio.onended=fim;audio.play().catch(fim);return;}
 if(!window.speechSynthesis){fim();return;}
 var u=new SpeechSynthesisUtterance(a[4]);u.lang='pt-BR';var v=vozBR();if(v)u.voice=v;u.onend=fim;u.onerror=fim;speechSynthesis.speak(u);});

/* ---------- Livros ---------- */
var BOOKS=[["dmoura-ecosystem","D'Moura Ecosystem",'O modelo de parceria e expansão da clínica, com níveis Start, Bronze, Prata e Ouro.','Parceria DMoura Ecosystem'],
['empreenda-plus','Empreenda+','Crescimento para clínicas: demanda ativa, ocupação total das salas e parceria com participação nos resultados.','Operacao Empreenda+'],
['fase-da-guerra','A Fase da Guerra','O Método G.E.R.A.: gestão de custos, margem alta, reserva e ativo escalável, em quatro fases.','Metodo GERA Fase da Guerra'],
['margem-metodo-milhao','Margem, Método e Milhão','Como construir riqueza previsível, com a jornada da Dra. Danusa e o G.E.R.A. aplicado à estética.','Margem Metodo e Milhao'],
['30-passos','30 Passos para o Sucesso','Estratégias práticas de metas, carreira, comunicação, resiliência e liderança.',''],
['raabe','Raabe','Coragem, fé e redenção a partir da história de Raabe.','']];
$('#books').innerHTML=BOOKS.map(function(b){return '<article class="card book"><img src="assets/livros/'+b[0]+'.jpg" alt="Capa — '+esc(b[1])+'" loading="lazy"><span class="pill">Instituto DMAP</span><h3 style="margin-top:8px">'+esc(b[1])+'</h3><p class="mut" style="font-size:13px">Anderclay Pereira</p><p>'+esc(b[2])+'</p><div class="row">'+(b[3]?'<a class="btn btn-gold" target="_blank" rel="noopener" href="'+wa('Quero o curso '+b[3])+'">Quero o curso</a>':'<span class="pill">Inscrições em breve</span>')+'<a class="btn" href="livros.html">Detalhes</a></div></article>';}).join('');

/* ---------- Mapa + GPS ---------- */
var UNITS=[{id:'recife',nome:'Recife — Santo Amaro',end:'Avenida Agamenon Magalhães, 210, 1º andar, sala 05 — Galeria FDM, Santo Amaro, Recife-PE',dest:'Avenida Agamenon Magalhães, 210, Santo Amaro, Recife - PE',lat:-8.0476,lng:-34.877},
{id:'caruaru',nome:'Caruaru — Maurício de Nassau',end:'Avenida Agamenon Magalhães, 1020C, Maurício de Nassau, Caruaru-PE',dest:'Avenida Agamenon Magalhães, 1020C, Maurício de Nassau, Caruaru - PE',lat:-8.2846,lng:-35.9699},
{id:'garanhuns',nome:'Garanhuns — Boa Vista',end:'Avenida Capitão João Leite, 300 — Empresarial Leandro, Boa Vista, Garanhuns-PE',dest:'Avenida Capitão João Leite, 300, Boa Vista, Garanhuns - PE',lat:-8.8829,lng:-36.4966}];
function gmaps(u,o){return 'https://www.google.com/maps/dir/?api=1'+(o?'&origin='+o[0]+','+o[1]:'')+'&destination='+encodeURIComponent(u.dest);}
function waze(u){return 'https://waze.com/ul?q='+encodeURIComponent(u.dest)+'&navigate=yes';}
function renderUnits(o){$('#units').innerHTML=UNITS.map(function(u){return '<article class="card unit'+(u.near?' near':'')+'" id="u-'+u.id+'"><h3>📍 '+u.nome+'</h3><p>'+u.end+'</p>'+(u.km!=null?'<p class="dist">Aprox. '+(u.km<10?u.km.toFixed(1):Math.round(u.km))+' km de você'+(u.near?' · mais próxima':'')+'</p>':'')+'<div class="row"><a class="btn btn-teal" target="_blank" rel="noopener" href="'+gmaps(u,o)+'">Como chegar (Google Maps)</a><a class="btn" target="_blank" rel="noopener" href="'+waze(u)+'">Waze</a><button class="btn" data-ver="'+u.id+'">Ver no mapa</button></div></article>';}).join('');}
renderUnits();
var map=null,markers={},me=null;
function initMap(){if(map||!window.L){if(map)setTimeout(function(){map.invalidateSize();},50);return;}
 map=L.map('map',{scrollWheelZoom:false}).setView([-8.45,-35.7],8);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
 UNITS.forEach(function(u){markers[u.id]=L.marker([u.lat,u.lng]).addTo(map).bindPopup('<b>'+u.nome+'</b><br>'+u.end+'<br><a target="_blank" rel="noopener" href="'+gmaps(u)+'">Como chegar</a>');});
 map.fitBounds(L.latLngBounds(UNITS.map(function(u){return[u.lat,u.lng];})),{padding:[40,40]});setTimeout(function(){map.invalidateSize();},100);}
document.addEventListener('click',function(e){var b=e.target.closest('[data-ver]');if(!b)return;initMap();var u=UNITS.filter(function(x){return x.id===b.dataset.ver;})[0];map.setView([u.lat,u.lng],14);markers[u.id].openPopup();$('#map').scrollIntoView({behavior:'smooth',block:'center'});});
function km(a,b,c,d){var R=6371,r=Math.PI/180,x=(c-a)*r,y=(d-b)*r,h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)*Math.sin(y/2);return 2*R*Math.asin(Math.sqrt(h));}
$('#gps-btn').addEventListener('click',function(){var st=$('#gps-status'),btn=this;
 if(!('geolocation' in navigator)){st.textContent='Seu navegador não permite localização. Use os botões "Como chegar".';return;}
 st.textContent='Buscando sua localização…';btn.disabled=true;
 navigator.geolocation.getCurrentPosition(function(p){btn.disabled=false;var o=[p.coords.latitude,p.coords.longitude],best=null;
  UNITS.forEach(function(u){u.km=km(o[0],o[1],u.lat,u.lng);u.near=false;if(!best||u.km<best.km)best=u;});best.near=true;renderUnits(o);initMap();
  if(me)map.removeLayer(me);me=L.circleMarker(o,{radius:8,color:'#2bb5b0',fillOpacity:.9}).addTo(map).bindPopup('Você está aqui');
  map.fitBounds(L.latLngBounds([o,[best.lat,best.lng]]),{padding:[40,40]});
  st.textContent='Unidade mais próxima: '+best.nome+' (aprox. '+Math.round(best.km)+' km). Toque em "Como chegar" para abrir a rota.';},
 function(){btn.disabled=false;st.textContent='Não foi possível obter sua localização (permissão negada ou sem sinal). Use os botões "Como chegar".';},{enableHighAccuracy:true,timeout:12000,maximumAge:60000});});

/* ---------- Ana ---------- */
$('#abrir-ana').addEventListener('click',function(){if(window.ana)window.ana.abrir();});
document.addEventListener('click',function(e){var b=e.target.closest('[data-ask]');if(b&&window.ana)window.ana.perguntar(b.dataset.ask);});

/* ---------- Avaliações ---------- */
var nota=5;function stars(){$('#stars').innerHTML=[1,2,3,4,5].map(function(n){return '<span role="radio" tabindex="0" aria-checked="'+(n===nota)+'" aria-label="'+n+' estrelas" data-n="'+n+'" class="'+(n<=nota?'on':'')+'">★</span>';}).join('');}stars();
$('#stars').addEventListener('click',function(e){var s=e.target.closest('[data-n]');if(s){nota=+s.dataset.n;stars();}});
$('#rv-send').addEventListener('click',function(){window.open(wa('Avaliação do site — '+nota+' estrela(s) — '+$('#rv-unit').value+'\n'+$('#rv-txt').value.trim()),'_blank','noopener');});

show((location.hash||'').slice(1));
})();
