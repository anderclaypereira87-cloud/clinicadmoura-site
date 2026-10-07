(function(){'use strict';
var WA='5581997181046',SITE='https://anderclaypereira87-cloud.github.io/clinicadmoura-site/';
function wa(t){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(t);}
function $(s){return document.querySelector(s);}function $$(s){return [].slice.call(document.querySelectorAll(s));}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function ls(k,d){try{return JSON.parse(localStorage.getItem(k))||d;}catch(_){return d;}}

/* ===== Dados (mesma ordem e textos do app do AI Studio) ===== */
var PROCS=[
['Miomodulação Facial','45 min',"Botox Fullface — Protocolo Assinatura D'Moura",'Tratamento global dos terços superior, médio e inferior + bandas platismais (efeito Nefertiti) com dosimetria individualizada.','Prevenção e suavização de rugas dinâmicas, arqueamento sutil da cauda da sobrancelha e definição do contorno cervical.'],
['Reestruturação Volumétrica','60 min','Harmonização Facial Estrutural 4D','Sustentação malar, projeção de mento, contorno mandibular e refinamento labial com ácido hialurônico premium.','Reposicionamento de tecidos profundos, equilíbrio de proporções faciais e rejuvenescimento sem aspecto artificial.'],
['Medicina Regenerativa','50 min','Bioestimulação Dérmica de Alta Performance','Aplicação vetorial de bioestimuladores (Ácido Poli-L-Lático / Hidroxiapatita de Cálcio) para neocolagênese progressiva.','Flacidez tissular facial, pescoço, colo e áreas corporais estratégicas.'],
['Tração & Colágeno','60 min','Lifting Não-Cirúrgico com Fios de PDO','Vetores de tração reposicionam o SMAS superficial combinados a fios lisos para estímulo de matriz extracelular.','Ptose leve a moderada do terço médio/inferior e estímulo intenso de firmeza palpebral e glabelar.'],
['Qualidade de Pele','35 min','Protocolo Skinboster & Hidratação Profunda','Microinfusão dérmica de ácido hialurônico não reticulado e vitaminas para restauração imediata do viço.','Peles desidratadas, linhas finas periorbitais, código de barras e preparação pré-eventos.'],
['Tecnologias Avançadas','60 min','Lifting Tecnológico por Ultrassom Microfocado','Pontos de coagulação térmica desde a derme superficial até a fáscia muscular (SMAS) sem downtime.','Efeito lifting imediato e progressivo para face completa, papada e região periocular.']];
/* 12 vídeos reais (Google Drive do Anderclay = videos/ deste site) */
var VIDS=[['V01','A importância da avaliação presencial',56,'Consulta & Avaliação'],['V02','Tratamento para flacidez glútea',33,'Procedimentos · Corpo'],['V03','Preenchimento e bioestimuladores — verão',35,'Procedimentos'],['V04','Beleza natural sem filtros',32,'Experiência'],['V05','Entendendo o Botox Full Face',54,'Procedimentos · Botox'],['V06','Benefícios da Vitamina C pura',22,'Skincare'],['V07','O verdadeiro custo da autoestima',33,'Institucional'],['V08','Risco de hematomas nos procedimentos',25,'Segurança'],['V09','Resultados naturais — olhar descansado',43,'Resultados'],['V10','Todo Botox é igual?',52,'Procedimentos · Botox'],['V11','O Botox resolve o bigode chinês?',69,'Procedimentos · Botox'],['V12','Risco de hematomas (versão 2)',25,'Segurança']];
var AVS=[
['anderclay','Anderclay','Holding & Finanças','Anderclay — Founder & Estrategista-Chefe',"Arquitetura do Ecossistema D'Moura & Instituto DMAP, Expansão, Margem e Governança",'Visão 360° Holding',"Olá, eu sou o Anderclay Pereira, fundador da Clínica D'Moura e do Instituto DMAP. Meu trabalho é conectar talento, gestão e margem para construir negócios que crescem com propósito.",1],
['paula','Paula',"Clínica D'Moura",'Paula — Diretoria Clínica & Protocolos','Harmonização Fullface, Botox Estrutural e Excelência Técnica em Procedimentos','Excelência Clínica',"Oi, eu sou a Paula. Cuido dos protocolos clínicos da D'Moura, como o Botox Fullface e a harmonização facial, sempre com resultado natural e segurança.",0],
['thomaz','Thomaz','Instituto DMAP','Thomaz — Operações & Performance','Estruturação de Processos, Fluxo Operacional e Escala de Unidades','Eficiência Operacional',"Oi, eu sou o Thomaz. No Instituto DMAP eu organizo processos e o fluxo operacional para que cada unidade funcione bem e possa crescer.",1],
['marciana','Marciana',"Clínica D'Moura",'Marciana — Gestão de Experiência & Concierge','Jornada do Paciente VIP, Fidelização e Avaliações 5 Estrelas','NPS & Fidelização',"Olá, sou a Marciana. Cuido da sua experiência na clínica, do primeiro contato ao pós-procedimento, para você se sentir acolhida em cada etapa.",1],
['sarah','Sarah',"Clínica D'Moura",'Sarah — Consultoria Comercial High-Ticket','Conversão de Planos Terapêuticos Integrados e Fechamento Consultivo','Conversão High-Ticket',"Oi, eu sou a Sarah. Te ajudo a entender o plano de tratamento ideal para você e as condições para começar.",1],
['henrique','Henrique','Instituto DMAP','Henrique — Inteligência de Dados & Expansão','Geomarketing, Análise de Demanda Local e Indicadores Comerciais','Geo-Analytics',"Olá, eu sou o Henrique. Analiso dados e demanda local para levar a D'Moura para mais perto de quem precisa.",1],
['flavia','Flávia',"Clínica D'Moura",'Flávia — Coordenação de Atendimento & Relacionamento','Agendamento Inteligente, Confirmação Ativa e Retenção de Pacientes','Retenção Ativa',"Oi, eu sou a Flávia. Cuido do seu agendamento, das confirmações e do seu retorno. É só me chamar no WhatsApp.",0],
['danusa','Danusa','Instituto DMAP','Danusa — Sucesso do Mentorado & Educação Executiva','Implementação dos 30 Passos e Acompanhamento de Clínicas Parceiras','Mentoria DMAP',"Olá! Sou a Dra. Danusa Moura, biomédica esteta integrante do Instituto DMap e à frente da Clínica D'Moura. Minha missão é cuidar de você por inteiro, unindo ciência e tecnologia na harmonização facial, estética corporal e saúde íntima feminina. Como posso te ajudar hoje?",1,'assets/voz-danusa/avatares-danusa/01.mp3'],
['marketing-dmap','Marketing DMAP','Instituto DMAP','Marketing DMAP — Estrategista de Aquisição B2B','Funis de Educação Executiva, Eventos de Imersão e Captação de Clínicas','Growth B2B',"Sou o Marketing DMAP. Crio funis de educação executiva e eventos de imersão para atrair clínicas parceiras.",0],
['marketing-dmoura',"Marketing D'Moura","Clínica D'Moura","Marketing D'Moura — Branding & Tráfego Local",'Campanhas de Raio Local, Google Maps SEO e Desejo de Marca','Local Branding',"Sou o Marketing D'Moura. Cuido da marca e das campanhas locais em Recife, Caruaru e Garanhuns.",0]];
var BOOKS=[['30-passos','216 páginas','30 Passos','O Mapa Prático de Execução, Disciplina e Crescimento Sustentável','Um guia sequencial de 30 passos acionáveis para transformar visão empreendedora em rotina de alta execução e resultados mensuráveis.','30 passos'],
['raabe','184 páginas','Raabe','Visão Estratégica, Coragem e Alianças em Tempos de Mudança','Lições profundas sobre discernimento de cenários, proteção de propósito e decisões que mudam o destino de uma geração.','Raabe'],
['margem-metodo-milhao','248 páginas','Margem — O Método do Milhão','Engenharia Financeira, Precificação e Lucro Real para Negócios','Por que faturamento sem margem destrói empresas — e o método exato para construir operação enxuta, caixa forte e lucro previsível.','livro Margem Metodo e Milhao'],
['dmoura-ecosystem','264 páginas',"D'Moura Ecosystem",'A Arquitetura de um Ecossistema Integrado de Saúde, Educação e Gestão',"Os bastidores da construção da Clínica D'Moura e do Instituto DMAP: governança, avatares executivos, cultura e escala.",'livro DMoura Ecosystem'],
['empreenda-plus','198 páginas','Empreenda+','Mentalidade, Liderança Comercial e Tração no Mercado Moderno','Estratégias práticas para destravar vendas, formar líderes comerciais e posicionar sua marca acima da guerra de preços.','livro Empreenda+'],
['fase-da-guerra','212 páginas','A Fase da Guerra','Resiliência Executiva, Comando Sob Pressão e Vitória Estratégica','Como atravessar ciclos críticos de mercado, blindar a mente e reorganizar tropas e recursos para vencer.','livro A Fase da Guerra']];
var UNITS=[{id:'recife',nome:'Recife — Santo Amaro',end:'Avenida Agamenon Magalhães, 210, 1º andar, sala 05 — Galeria FDM, Santo Amaro, Recife-PE',dest:'Avenida Agamenon Magalhães, 210, Santo Amaro, Recife - PE',lat:-8.0476,lng:-34.877},
{id:'caruaru',nome:'Caruaru — Maurício de Nassau',end:'Avenida Agamenon Magalhães, 1020C, Maurício de Nassau, Caruaru-PE',dest:'Avenida Agamenon Magalhães, 1020C, Maurício de Nassau, Caruaru - PE',lat:-8.2846,lng:-35.9699},
{id:'garanhuns',nome:'Garanhuns — Boa Vista',end:'Avenida Capitão João Leite, 300 — Empresarial Leandro, Boa Vista, Garanhuns-PE',dest:'Avenida Capitão João Leite, 300, Boa Vista, Garanhuns - PE',lat:-8.8829,lng:-36.4966}];

/* ===== Abas e partes ===== */
var TABS={clinica:['hero','brandbar','p1','p2','p3','p4'],videos:['hero','brandbar','p2'],avatares:['hero','brandbar','p3','p4'],mapa:['pmapa'],avaliacoes:['prv']};
var ALL=['hero','brandbar','p1','p2','p3','p4','pmapa','prv'],cur='clinica';
function vis(ids){ALL.forEach(function(i){$('#'+i).style.display=ids.indexOf(i)>=0?'':'none';});}
function show(t,keep){if(!TABS[t])t='clinica';cur=t;vis(TABS[t]);
 $$('nav.tabs button').forEach(function(b){b.setAttribute('aria-selected',b.dataset.tab===t);});
 var sub={clinica:'all',videos:'p2',avatares:'p3'}[t];$$('#subnav button').forEach(function(b){b.classList.toggle('on',b.dataset.part===sub);});
 if(history.replaceState)history.replaceState(null,'','#'+t);
 if(t==='mapa')initMap();$$('video').forEach(function(v){v.pause();});if(!keep)window.scrollTo({top:0,behavior:'smooth'});}
function part(p){if(p==='all'){show('clinica');return;}vis(['hero','brandbar',p]);$$('#subnav button').forEach(function(b){b.classList.toggle('on',b.dataset.part===p);});
 $$('nav.tabs button').forEach(function(b){b.setAttribute('aria-selected',b.dataset.tab===({p1:'clinica',p2:'videos',p3:'avatares',p4:'avatares'})[p]);});$('#'+p).scrollIntoView({behavior:'smooth'});}
document.addEventListener('click',function(e){var b=e.target.closest('[data-tab],[data-go]');if(b){e.preventDefault();show(b.dataset.tab||b.dataset.go);return;}
 var s=e.target.closest('[data-part]');if(s)part(s.dataset.part);});

/* ===== Procedimentos ===== */
$('#procs').innerHTML=PROCS.map(function(p,i){return '<article class="card proc"><div class="meta"><span class="pill">'+p[0]+'</span><span>'+p[1]+'</span></div><h3>'+p[2]+'</h3><p>'+p[3]+'</p><p class="ind"><b>Indicação Clínica:</b> '+p[4]+'</p><p class="mut" style="font-size:12px">D\'Moura Clínica</p><div class="row"><button class="btn btn-gold" data-proc="'+i+'">Consultar Protocolo e Rota no Mapa</button><a class="btn btn-teal" target="_blank" rel="noopener" href="'+wa("Olá! Vim pelo site e quero agendar: "+p[2]+'.')+'">Agendar</a></div></article>';}).join('');
document.addEventListener('click',function(e){var b=e.target.closest('[data-proc]');if(!b)return;show('mapa');var p=PROCS[+b.dataset.proc];setTimeout(function(){perguntar('Quero saber sobre '+p[2]);},400);});

/* ===== Vídeos ===== */
function mmss(s){return ('0'+Math.floor(s/60)).slice(-2)+':'+('0'+s%60).slice(-2);}
$('#vcount').textContent=VIDS.length+' vídeos';
$('#vlist').innerHTML=VIDS.map(function(v,i){var f=v[0].toLowerCase();return '<button class="vitem" data-v="'+i+'"><img src="videos/'+f+'.jpg" alt="" loading="lazy"><span class="vcode">'+v[0]+'</span><span class="vt"><b>'+esc(v[1])+'</b><small>'+esc(v[3])+'</small></span><span class="vd">'+mmss(v[2])+'</span></button>';}).join('');
function playV(i,auto){var v=VIDS[i],f=v[0].toLowerCase(),el=$('#feat');el.poster='videos/'+f+'.jpg';el.src='videos/'+f+'.mp4';
 $('#feat-info').innerHTML='<p class="kick" style="margin:10px 0 2px">'+v[0]+' · '+esc(v[3])+' · '+mmss(v[2])+'</p><h3>'+esc(v[1])+'</h3><div class="row"><a class="btn btn-teal" target="_blank" rel="noopener" href="'+wa('Olá! Assisti ao vídeo "'+v[1]+'" no site e quero saber mais.')+'">Tirar dúvida no WhatsApp</a></div>';
 $$('.vitem').forEach(function(b){b.classList.toggle('on',+b.dataset.v===i);});if(auto)el.play().catch(function(){});}
playV(0,false);
document.addEventListener('click',function(e){var b=e.target.closest('[data-v]');if(!b)return;playV(+b.dataset.v,true);$('#feat').scrollIntoView({behavior:'smooth',block:'center'});});
document.addEventListener('play',function(e){if(e.target.tagName==='VIDEO')pararFala();},true);

/* ===== Avatares + falas ===== */
$('#avs').innerHTML=AVS.map(function(a,i){var ph=a[7]?'<img class="ph" src="assets/avatares/fotos/'+a[0]+'-mini.jpg" alt="'+esc(a[1])+'" loading="lazy">':'<div class="ph">'+a[1].split(' ').map(function(w){return w[0];}).join('').slice(0,2)+'</div>';
 return '<article class="card av"><div class="avtop">'+ph+'<span class="pill">'+esc(a[2])+'</span></div><h3>'+esc(a[3])+'</h3><p>'+esc(a[4])+'</p><span class="pill pill-gold">'+esc(a[5])+'</span><p class="fala">“'+esc(a[6])+'”</p><div class="row"><button class="btn btn-gold" data-fala="'+i+'">▶ Ouvir fala</button><button class="btn btn-teal" data-ativar="'+i+'">Ativar Avatar no Chat</button><a class="btn" href="avatares/'+a[0]+'.html">Página</a></div></article>';}).join('');
var audio=null,falando=null;
function pararFala(){if(audio){audio.pause();audio=null;}if(window.speechSynthesis)speechSynthesis.cancel();if(falando){falando.classList.remove('speaking');falando.textContent='▶ Ouvir fala';falando=null;}}
function vozBR(){var vs=speechSynthesis.getVoices().filter(function(v){return /pt[-_]BR/i.test(v.lang);});return vs.filter(function(v){return /natural|google|luciana|francisca|thalita/i.test(v.name);})[0]||vs[0]||null;}
function falar(i,b){var a=AVS[i];pararFala();falando=b||null;if(b){b.classList.add('speaking');b.textContent='■ Parar';}$$('video').forEach(function(v){v.pause();});
 function fim(){pararFala();}
 if(a[8]){audio=new Audio(a[8]);audio.onended=fim;audio.play().catch(fim);return;}
 if(!window.speechSynthesis){fim();return;}var u=new SpeechSynthesisUtterance(a[6]);u.lang='pt-BR';var v=vozBR();if(v)u.voice=v;u.onend=fim;u.onerror=fim;speechSynthesis.speak(u);}
document.addEventListener('click',function(e){var b=e.target.closest('[data-fala]');if(b){if(falando===b){pararFala();return;}falar(+b.dataset.fala,b);return;}
 var t=e.target.closest('[data-ativar]');if(t){show('mapa');$('#spec').value=t.dataset.ativar;spec();}});

/* ===== Livros ===== */
$('#books').innerHTML=BOOKS.map(function(b){return '<article class="card book"><img src="assets/livros/'+b[0]+'.jpg" alt="Capa — '+esc(b[2])+'" loading="lazy"><div class="meta"><span class="pill">Instituto DMAP</span><span>'+b[1]+'</span></div><h3>'+esc(b[2])+'</h3><p class="gold" style="font-size:13px">'+esc(b[3])+'</p><p>'+esc(b[4])+'</p><p class="mut" style="font-size:12px">Anderclay Pereira</p><div class="row"><button class="btn btn-gold" data-livro="'+esc(b[5])+'">Explorar no Chat</button><a class="btn" href="livros.html">Detalhes</a></div></article>';}).join('');
document.addEventListener('click',function(e){var b=e.target.closest('[data-livro]');if(!b)return;show('mapa');setTimeout(function(){perguntar('Me fala do '+b.dataset.livro);},400);});

/* ===== Assistente (Ana) ===== */
function perguntar(t){if(window.ana&&window.ana.perguntar)window.ana.perguntar(t);}
$('#spec').innerHTML='<option value="">Especialista: Concierge D\'Moura (Ana)</option>'+AVS.map(function(a,i){return '<option value="'+i+'">Avatar: '+esc(a[1])+' ('+esc(a[2])+')</option>';}).join('');
function spec(){var v=$('#spec').value,w=$('.welcome');var x=w.querySelector('.specbox');if(x)x.remove();if(v==='')return;var a=AVS[+v];
 w.insertAdjacentHTML('afterbegin','<div class="specbox"><b class="gold">'+esc(a[3])+'</b><p class="fala">“'+esc(a[6])+'”</p><div class="row"><button class="btn btn-gold" data-fala="'+v+'">▶ Ouvir fala</button><a class="btn" href="avatares/'+a[0]+'.html">Conversar com '+esc(a[1])+'</a></div></div>');}
$('#spec').addEventListener('change',spec);
$('#chat-form').addEventListener('submit',function(e){e.preventDefault();var t=$('#chat-in').value.trim();if(!t)return;$('#chat-in').value='';perguntar(t);});

/* ===== Mapa + GPS ===== */
var sel=UNITS[0],me=null,map=null,markers={},meMk=null,qMk=null;
function gdir(dest,mode,orig){return 'https://www.google.com/maps/dir/?api=1'+(orig?'&origin='+orig:'')+'&destination='+encodeURIComponent(dest)+(mode?'&travelmode='+mode:'');}
function waze(u){return 'https://waze.com/ul?q='+encodeURIComponent(u.dest)+'&navigate=yes';}
function setSel(u){sel=u;$('#coords').textContent=u.lat.toFixed(4)+', '+u.lng.toFixed(4);$('#coords-name').textContent="Clínica D'Moura & Instituto DMAP — "+u.nome;}
function renderUnits(){var o=me?me[0]+','+me[1]:'';$('#units').innerHTML=UNITS.map(function(u){return '<article class="card unit'+(u.near?' near':'')+'"><h3>📍 '+u.nome+'</h3><p>'+u.end+'</p>'+(u.km!=null?'<p class="dist">Aprox. '+(u.km<10?u.km.toFixed(1):Math.round(u.km))+' km de você'+(u.near?' · mais próxima':'')+'</p>':'')+'<div class="row"><a class="btn btn-teal" target="_blank" rel="noopener" href="'+gdir(u.dest,'',o)+'">Como chegar (Google Maps)</a><a class="btn" target="_blank" rel="noopener" href="'+waze(u)+'">Waze</a><button class="btn" data-ver="'+u.id+'">Ver no mapa</button></div></article>';}).join('');}
setSel(sel);renderUnits();
function initMap(){if(map){setTimeout(function(){map.invalidateSize();},60);return;}if(!window.L)return;
 map=L.map('map',{scrollWheelZoom:false}).setView([-8.45,-35.7],8);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
 UNITS.forEach(function(u){markers[u.id]=L.marker([u.lat,u.lng]).addTo(map).bindPopup('<b>'+u.nome+'</b><br>'+u.end+'<br><a target="_blank" rel="noopener" href="'+gdir(u.dest)+'">Como chegar</a>').on('click',function(){setSel(u);});});
 map.fitBounds(L.latLngBounds(UNITS.map(function(u){return[u.lat,u.lng];})),{padding:[40,40]});setTimeout(function(){map.invalidateSize();},120);}
document.addEventListener('click',function(e){var b=e.target.closest('[data-ver]');if(!b)return;initMap();var u=UNITS.filter(function(x){return x.id===b.dataset.ver;})[0];setSel(u);map.setView([u.lat,u.lng],14);markers[u.id].openPopup();$('#map').scrollIntoView({behavior:'smooth',block:'center'});});
function km(a,b,c,d){var R=6371,r=Math.PI/180,x=(c-a)*r,y=(d-b)*r,h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)*Math.sin(y/2);return 2*R*Math.asin(Math.sqrt(h));}
$('#gps-btn').addEventListener('click',function(){var st=$('#gps-status'),btn=this;
 if(!('geolocation' in navigator)){st.textContent='Seu navegador não permite localização. Use os botões "Como chegar".';return;}
 st.textContent='Buscando sua localização…';btn.disabled=true;
 navigator.geolocation.getCurrentPosition(function(p){btn.disabled=false;me=[p.coords.latitude,p.coords.longitude];var best=null;
  UNITS.forEach(function(u){u.km=km(me[0],me[1],u.lat,u.lng);u.near=false;if(!best||u.km<best.km)best=u;});best.near=true;setSel(best);renderUnits();initMap();
  if(meMk)map.removeLayer(meMk);meMk=L.circleMarker(me,{radius:8,color:'#2bb5b0',fillOpacity:.9}).addTo(map).bindPopup('Você está aqui');
  map.fitBounds(L.latLngBounds([me,[best.lat,best.lng]]),{padding:[40,40]});
  st.textContent='Unidade mais próxima: '+best.nome+' (aprox. '+Math.round(best.km)+' km). Toque em "Como chegar" para abrir a rota.';},
 function(){btn.disabled=false;st.textContent='Não foi possível obter sua localização (permissão negada ou sem sinal). Use os botões "Como chegar".';},{enableHighAccuracy:true,timeout:12000,maximumAge:60000});});
function origem(){return me?me[0]+','+me[1]:'';}
document.addEventListener('click',function(e){var b=e.target.closest('[data-maps]');if(b){var m=b.dataset.maps,d=b.dataset.dest,city=sel.nome.split(' — ')[0]+' - PE',url;
  if(m==='traffic')url='https://www.google.com/maps/@'+(me?me[0]+','+me[1]:sel.lat+','+sel.lng)+',14z/data=!5m1!1e1';
  else if(m==='transit')url=d?gdir(d+' '+city,'transit',sel.dest):gdir(sel.dest,'transit',origem());
  else url=d?gdir(d+' '+city,'driving',sel.dest):gdir(sel.dest,'driving',origem());
  window.open(url,'_blank','noopener');return;}
 var n=e.target.closest('[data-near]');if(n)window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(n.dataset.near+' perto de '+(me?me[0]+','+me[1]:sel.dest)),'_blank','noopener');});
function buscar(){var q=$('#map-q').value.trim();if(!q)return;initMap();$('#gps-status').textContent='Buscando "'+q+'"…';
 fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&accept-language=pt-BR&q='+encodeURIComponent(q)).then(function(r){return r.json();}).then(function(r){
  if(!r.length){$('#gps-status').textContent='Não encontrei "'+q+'". Tente com cidade e estado.';return;}var p=[+r[0].lat,+r[0].lon];
  if(qMk)map.removeLayer(qMk);qMk=L.marker(p).addTo(map).bindPopup(esc(r[0].display_name)+'<br><a target="_blank" rel="noopener" href="'+gdir(sel.dest,'',p.join(','))+'">Rota até '+esc(sel.nome)+'</a>').openPopup();map.setView(p,14);
  $('#gps-status').textContent=r[0].display_name;}).catch(function(){$('#gps-status').textContent='Busca indisponível agora. Use "Como chegar".';});}
$('#map-search').addEventListener('click',buscar);$('#map-q').addEventListener('keydown',function(e){if(e.key==='Enter')buscar();});

/* ===== Avaliações ===== */
var CATS=['Clínica & Negócios','Visita Geral','Gastronomia & Café','Transporte & Acesso','Família & Lazer','Visita Individual'];
$('#rv-filter').innerHTML+=CATS.map(function(c){return '<option>'+c+'</option>';}).join('');
function rvs(){return ls('dm_avaliacoes',[]);}
function renderRv(){var f=$('#rv-filter').value,l=rvs().filter(function(r){return !f||r.cat===f;});$$('.rv-count').forEach(function(x){x.textContent=rvs().length;});
 $('#rv-list').innerHTML=l.length?l.map(function(r){return '<article class="card" style="margin-bottom:10px"><div class="meta"><b>'+esc(r.local)+'</b><span class="gold">'+'★'.repeat(r.nota)+'☆'.repeat(5-r.nota)+'</span></div><p class="mut" style="font-size:12px">'+esc(r.end)+' · '+esc(r.cat)+' · '+esc(r.nome||'Visitante')+' · '+new Date(r.t).toLocaleDateString('pt-BR')+'</p><p>'+esc(r.txt)+'</p></article>';}).join('')
 :'<div class="card" style="text-align:center"><h3>Nenhuma avaliação encontrada para este filtro</h3><p>Envie sua nota de 1 a 5 estrelas e seu comentário sobre a Clínica D\'Moura ou qualquer ponto do mapa para que a Ana possa apresentá-la.</p><button class="btn btn-gold" data-modal="avaliar">Publicar Primeira Avaliação</button></div>';}
$('#rv-filter').addEventListener('change',renderRv);renderRv();

/* ===== Modais: Lojas, Avaliar Local, Entrar ===== */
var M=$('#modal');function open(h){$('#mbody').innerHTML=h;M.hidden=false;document.body.style.overflow='hidden';}
function close(){M.hidden=true;document.body.style.overflow='';}
M.addEventListener('click',function(e){if(e.target===M||e.target.closest('.mclose,[data-close]'))close();});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!M.hidden)close();});
var LOJA={play:'<h3>Google Play Store / Instalação Direta no Android:</h3><ol><li>No Chrome do Android, toque no menu ⋮ (3 pontos).</li><li>Selecione “Instalar aplicativo” (ou “Adicionar à tela inicial”).</li><li>O app D\'Moura DMAP aparece na sua tela inicial, como um aplicativo.</li></ol>',
ios:'<h3>Apple App Store / Instalação no iPhone &amp; iPad:</h3><ol><li>No Safari do iPhone, toque em Compartilhar.</li><li>Role para baixo e escolha “Adicionar à Tela de Início”.</li><li>Confirme em “Adicionar”.</li></ol>',
ms:'<h3>Microsoft Store (Windows 10 &amp; 11):</h3><ol><li>No Edge ou Chrome, clique no ícone Instalar aplicativo (+) na barra de endereços.</li><li>O aplicativo é instalado no Menu Iniciar e na Barra de Tarefas do Windows.</li></ol>',
kit:'<h3>Kit das 3 Lojas</h3><p>O aplicativo está publicado na web como app instalável (PWA), com ícones 192px e 512px.</p><ul><li><b>URL Web Oficial:</b> '+SITE+'</li><li><b>Política de Privacidade (LGPD):</b> <a href="privacy-policy.html">'+SITE+'privacy-policy.html</a></li><li><b>Package ID (Google Play / iOS):</b> br.com.clinicadmoura.dmap</li><li><b>Package ID (Microsoft Store):</b> ClinicaDMoura.InstitutoDMAP</li><li><b>Responsável:</b> Anderclay Pereira | CNPJ 60.412.110/0001-92</li></ul><div class="row"><button class="btn btn-gold" id="copy-url">Copiar URL do App</button><button class="btn btn-teal" id="install-now">Instalar agora</button></div>'};
var deferred=null;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;});
function lojas(k){open('<h2>Central de Instalação &amp; Publicação — Google Play, App Store &amp; Microsoft Store</h2><div class="logos mini"><img src="assets/logo-clinica-dmoura.jpg" alt=""><img src="assets/logo-instituto-dmap.jpeg" alt=""></div><p class="kick">Como procurar na Google Play, App Store (iOS) e Microsoft Store:</p><p class="mut">ID: br.com.clinicadmoura.dmap</p><div class="kv"><div><small>NOME PRINCIPAL NA BUSCA</small><b>Clínica D\'Moura &amp; Instituto DMAP</b></div><div><small>NOME CURTO DO APP</small><b>D\'Moura DMAP</b></div><div><small>BUSCAR POR DESENVOLVEDOR</small><b>Anderclay Pereira</b></div></div><div class="subnav" id="ltabs"><button data-l="play">Google Play</button><button data-l="ios">App Store (iOS)</button><button data-l="ms">Microsoft Store</button><button data-l="kit">Kit das 3 Lojas</button></div><div id="lbody"></div><div class="row"><button class="btn" data-close>Fechar</button></div>');lt(k||'kit');}
function lt(k){$('#lbody').innerHTML=LOJA[k];$$('#ltabs button').forEach(function(b){b.classList.toggle('on',b.dataset.l===k);});}
function avaliar(){var o=UNITS.map(function(u){return '<option>'+u.nome+'</option>';}).join('');
 open('<h2>Avaliar Local — D\'Moura Clínica &amp; Instituto DMAP</h2><p class="mut">Sua avaliação fica salva neste aparelho e é enviada para a equipe pelo WhatsApp (sem login).</p><label>Seu nome (opcional)<input id="f-nome"></label><label>Nome do Local ou Unidade<input id="f-local" list="f-units" value="Clínica D\'Moura — '+esc(sel.nome)+'"><datalist id="f-units">'+o+'</datalist></label><label>Endereço ou Região<input id="f-end" value="'+esc(sel.end)+'"></label><label>Nota (1 a 5 Estrelas) <b id="f-n">5/5</b><div class="stars" id="f-stars"></div></label><label>Categoria da Experiência<div class="cats" id="f-cat">'+CATS.map(function(c,i){return '<button type="button" class="chip'+(i?'':' on')+'">'+c+'</button>';}).join('')+'</div></label><label>Seu Comentário ou Avaliação <small id="f-cnt">0/1000</small><textarea id="f-txt" rows="4" maxlength="1000"></textarea></label><div class="row"><button class="btn" data-close>Cancelar</button><button class="btn btn-gold" id="f-pub">Publicar Avaliação</button></div><h3 style="margin-top:18px">Avaliações para Clínica D\'Moura &amp; Instituto DMAP — Anderclay Pereira</h3><p class="mut">'+rvs().length+' avaliação(ões)</p>'+(rvs().length?'':'<p>Ainda não há avaliações para este local. Seja o primeiro a avaliar!</p>'));
 var n=5;function st(){$('#f-stars').innerHTML=[1,2,3,4,5].map(function(i){return '<span data-n="'+i+'" class="'+(i<=n?'on':'')+'" role="button" aria-label="'+i+' estrelas">★</span>';}).join('');$('#f-n').textContent=n+'/5';}st();
 $('#f-stars').onclick=function(e){var s=e.target.closest('[data-n]');if(s){n=+s.dataset.n;st();}};
 $('#f-cat').onclick=function(e){var c=e.target.closest('.chip');if(!c)return;$$('#f-cat .chip').forEach(function(x){x.classList.toggle('on',x===c);});};
 $('#f-txt').oninput=function(){$('#f-cnt').textContent=this.value.length+'/1000';};
 $('#f-pub').onclick=function(){var r={nome:$('#f-nome').value.trim(),local:$('#f-local').value.trim(),end:$('#f-end').value.trim(),nota:n,cat:$('#f-cat .on').textContent,txt:$('#f-txt').value.trim(),t:Date.now()};
  var l=rvs();l.unshift(r);try{localStorage.setItem('dm_avaliacoes',JSON.stringify(l.slice(0,50)));}catch(_){}renderRv();close();
  window.open(wa('Avaliação pelo site — '+r.nota+'/5 — '+r.local+' ('+r.cat+')\n'+r.txt+(r.nome?'\n— '+r.nome:'')),'_blank','noopener');};}
function entrar(){open('<h2>Entrar — Área do Paciente</h2><p>Para agendar, confirmar horário, receber orientações ou falar com a equipe, entre pelo WhatsApp oficial da clínica. Não pedimos senha nem login no site.</p><div class="row"><a class="btn btn-teal" target="_blank" rel="noopener" href="'+wa('Olá! Quero entrar na área do paciente / falar com a equipe.')+'">Entrar pelo WhatsApp</a><a class="btn" href="tel:+5581997181046">Ligar (81) 99718-1046</a><button class="btn" data-close>Fechar</button></div>');}
document.addEventListener('click',function(e){var b=e.target.closest('[data-modal]');if(b){var m=b.dataset.modal;if(m==='lojas')lojas(b.dataset.loja);else if(m==='avaliar')avaliar();else entrar();return;}
 var l=e.target.closest('[data-l]');if(l)lt(l.dataset.l);
 if(e.target.id==='copy-url'){(navigator.clipboard?navigator.clipboard.writeText(SITE):Promise.reject()).then(function(){e.target.textContent='URL copiada!';}).catch(function(){prompt('Copie a URL:',SITE);});}
 if(e.target.id==='install-now'){if(deferred){deferred.prompt();deferred=null;}else alert('Use o menu do navegador: "Instalar aplicativo" ou "Adicionar à tela inicial".');}});

/* ===== Tema claro ===== */
function tema(l){document.body.classList.toggle('light',l);$('#theme-btn').textContent=l?'Tema Escuro':'Tema Claro';try{localStorage.setItem('dm_tema',l?'claro':'escuro');}catch(_){}}
tema(ls('dm_tema_x',null)===null&&localStorage.getItem('dm_tema')==='claro');$('#theme-btn').addEventListener('click',function(){tema(!document.body.classList.contains('light'));});

if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(function(){});
show((location.hash||'').slice(1),true);
})();
