/*
 * Ana: assistente virtual da recepção e vendas da Clínica D'Moura.
 * Widget de chat flutuante, igual em todas as páginas.
 * - Sem IA externa e sem chaves: entende o pedido por palavras-chave, no próprio navegador.
 * - Só usa o conteúdo do próprio site (index, procedimentos, livros, títulos de videos/manifest.json)
 *   e os fatos confirmados pela clínica. Nunca inventa preço, link ou procedimento.
 * - Voz: só a voz pt-BR do aparelho (voz de recepcionista), com a mesma preferência de vozes naturais
 *   da fala de videos.html. Nunca usa os clipes clonados da Dra. Danusa (a Ana não é a Danusa).
 *   Só fala depois de um toque ou clique; tem botão de mudo; para quando um vídeo começa.
 * - "Me ligue": botão tel: e formulário de pedido de ligação com consentimento LGPD.
 *   Envia JSON para window.ANA_CONFIG.callbackEndpoint. Se for null, guarda no localStorage.
 *   O navegador nunca faz ligações.
 *
 * Config opcional (antes ou depois deste script):
 *   window.ANA_CONFIG = { callbackEndpoint: 'https://.../callback-request' };
 */
(function () {
  'use strict';
  if (window.__anaCarregada) return;
  window.__anaCarregada = true;

  var SCRIPT = document.currentScript;
  var SITE = new URL('../../', (SCRIPT && SCRIPT.src) || location.href).href; // raiz do site
  function url(rel) { return new URL(rel, SITE).href; }

  var PADRAO = {
    callbackEndpoint: null,
    whatsapp: '5581997181046',
    telefone: '+5581997181046',
    telefoneVisivel: '(81) 99718-1046',
    email: 'diretoria@clinicadmoura.company'
  };
  function cfg(chave) {
    var c = window.ANA_CONFIG || {};
    return Object.prototype.hasOwnProperty.call(c, chave) ? c[chave] : PADRAO[chave];
  }

  /* ------------------------------------------------------------------
   * Conhecimento: tirado só do site + fatos confirmados
   * ------------------------------------------------------------------ */
  var UNIDADES = {
    recife: { cidade: 'Recife', bairro: 'Santo Amaro', no: 'no Santo Amaro', rotulo: 'Recife — Santo Amaro', end: 'Av. Agamenon Magalhães, 210, 1º andar, sala 05 — Galeria FDM, Santo Amaro' },
    caruaru: { cidade: 'Caruaru', bairro: 'Maurício de Nassau', no: 'no Maurício de Nassau', rotulo: 'Caruaru — Maurício de Nassau', end: 'Av. Agamenon Magalhães, 1020C, Maurício de Nassau' },
    garanhuns: { cidade: 'Garanhuns', bairro: 'Boa Vista', no: 'na Boa Vista', rotulo: 'Garanhuns — Boa Vista', end: 'Av. Capitão João Leite, 300 — Empresarial Leandro, Boa Vista' }
  };

  // livros.html: títulos, autores, resumos, links "Quero o curso" e valores exatamente como estão na página
  var LIVROS = [
    { id: 'ecosystem', titulo: "D'Moura Ecosystem", autor: 'Anderclay Pereira e Dra. Danusa Moura',
      resumo: 'o modelo de parceria e expansão da clínica, com níveis Start, Bronze, Prata e Ouro',
      valores: 'Na página, o investimento aparece assim: Start R$ 20 mil, Bronze R$ 50 mil, e a faixa vai até R$ 120 mil.',
      link: 'https://wa.me/5581997181046?text=Quero%20o%20curso%20Parceria%20DMoura%20Ecosystem',
      chaves: ['ecosystem', 'ecossistema', 'parceria', 'parceiro', 'franquia', 'franqueado', 'investir', 'investimento', 'rewards', 'nivel start', 'bronze', 'prata', 'ouro'] },
    { id: 'empreenda', titulo: 'Empreenda+', autor: 'Anderclay Pereira',
      resumo: 'crescimento para clínicas: demanda ativa, ocupação total das salas e parceria com participação nos resultados',
      link: 'https://wa.me/5581997181046?text=Quero%20o%20curso%20Operacao%20Empreenda%2B',
      chaves: ['empreenda'] },
    { id: 'guerra', titulo: 'A Fase da Guerra', autor: 'Anderclay Pereira',
      resumo: 'o Método G.E.R.A.: gestão de custos, margem alta, reserva e ativo escalável, em quatro fases',
      link: 'https://wa.me/5581997181046?text=Quero%20o%20curso%20Metodo%20GERA%20Fase%20da%20Guerra',
      chaves: ['fase da guerra', 'guerra', 'gera ', 'metodo gera', 'g e r a '] },
    { id: 'margem', titulo: 'Margem, Método e Milhão', autor: 'Anderclay Pereira',
      resumo: 'como construir riqueza previsível, com a jornada da Dra. Danusa e o G.E.R.A. aplicado à estética',
      link: 'https://wa.me/5581997181046?text=Quero%20o%20curso%20Margem%20Metodo%20e%20Milhao',
      chaves: ['margem', 'milhao'] },
    { id: '30passos', titulo: '30 Passos para o Sucesso', autor: 'Anderclay Pereira',
      resumo: 'estratégias práticas de metas, carreira, comunicação, resiliência e liderança',
      status: 'A inscrição desse curso ainda não foi aberta aqui no site.',
      chaves: ['30 passos', 'trinta passos', 'passos para o sucesso'] },
    { id: 'raabe', titulo: 'Raabe', autor: 'Anderclay Pereira',
      resumo: 'coragem, fé e redenção a partir da história de Raabe',
      status: 'A inscrição desse curso ainda não foi aberta aqui no site.',
      chaves: ['raabe'] },
    { id: 'depri', titulo: "Don't You Depri", autor: 'Anderclay Pereira',
      resumo: 'saúde emocional e bem-estar',
      status: 'Esse ainda está em breve. O material não foi publicado.',
      chaves: ['depri', 'dont you', 'don t you'] }
  ];

  // Títulos de videos/manifest.json (carregados do arquivo; esta lista é só um plano B)
  var VIDEOS = [
    'A importância da avaliação presencial', 'Tratamento para flacidez glútea', 'Preenchimento e bioestimuladores — verão',
    'Beleza natural sem filtros', 'Entendendo o Botox Full Face', 'Benefícios da Vitamina C pura', 'O verdadeiro custo da autoestima',
    'Risco de hematomas nos procedimentos', 'Resultados naturais — olhar descansado', 'Todo Botox é igual?', 'O Botox resolve o bigode chinês?'
  ];
  fetch(url('videos/manifest.json')).then(function (r) { return r.ok ? r.json() : null; }).then(function (m) {
    var lista = (m && (Array.isArray(m) ? m : m.videos)) || [];
    var t = lista.filter(function (v) { return v && v.safe !== false && v.public_gallery !== false && v.title; })
      .map(function (v) { return v.title; });
    if (t.length) VIDEOS = t;
  }).catch(function () {});

  /* ------------------------------------------------------------------
   * Estado (sessão)
   * ------------------------------------------------------------------ */
  var CH_ESTADO = 'ana_estado_v1', CH_HIST = 'ana_historico_v1', CH_MUDO = 'ana_mudo', CH_FILA = 'ana_fila_ligacoes';
  function ler(st, k, d) { try { var v = st.getItem(k); return v ? JSON.parse(v) : d; } catch (_) { return d; } }
  function gravar(st, k, v) { try { st.setItem(k, JSON.stringify(v)); } catch (_) {} }
  var estado = ler(sessionStorage, CH_ESTADO, null) || { ofertas: 0, recusou: false, pendente: null, unidade: null, assunto: null, saudou: false };
  var historico = ler(sessionStorage, CH_HIST, []);
  var mudo = ler(localStorage, CH_MUDO, false) === true;
  var interagiu = false; // vira true no primeiro toque/tecla dentro do widget
  function salvar() { gravar(sessionStorage, CH_ESTADO, estado); gravar(sessionStorage, CH_HIST, historico.slice(-40)); }

  /* ------------------------------------------------------------------
   * Texto: normalização e palavras-chave
   * ------------------------------------------------------------------ */
  function norm(t) {
    return ' ' + String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9+ ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  }
  function tem(n, chaves) { // casa no começo de palavra (aceita radicais: "agend" casa "agendar")
    for (var i = 0; i < chaves.length; i++) { if (n.indexOf(' ' + chaves[i]) !== -1) return true; }
    return false;
  }
  function conta(n, chaves) { var c = 0; for (var i = 0; i < chaves.length; i++) if (n.indexOf(' ' + chaves[i]) !== -1) c++; return c; }
  function palavras(n) { return n.trim() ? n.trim().split(' ').length : 0; }

  var K = {
    saudacao: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e ai', 'opa', 'tudo bem', 'hello'],
    agradecer: ['obrigad', 'brigad', 'valeu', 'agradec', 'grat'],
    recusa: ['nao', 'agora nao', 'depois', 'so olhando', 'sem interesse', 'dispenso', 'deixa pra la', 'nem', 'talvez depois', 'outra hora'],
    afirmar: ['sim', 'quero', 'pode', 'claro', 'bora', 'vamos', 'ok', 'beleza', 'manda', 'isso', 'com certeza', 'aceito', 'por favor', 'quero sim'],
    somenteVoz: ['nao sei ler', 'nao consigo ler', 'nao leio', 'so audio', 'so voz', 'prefiro audio', 'prefiro voz', 'por audio', 'por voz', 'mande audio', 'manda audio'],
    ligar: ['me liga', 'me ligue', 'me ligar', 'ligar', 'ligue', 'ligacao', 'liga pra mim', 'telefonema', 'retorno', 'chamada'],
    agendar: ['agend', 'marcar', 'marco ', 'marca um', 'marca uma', 'horario', 'consulta', 'vaga', 'reserv', 'atendimento'],
    avaliacao: ['avaliac', 'avaliar'],
    preco: ['quanto', 'preco', 'valor', 'custa', 'custo', 'pagar', 'pagamento', 'parcel', 'pix', 'cartao', 'orcamento', 'barato', 'caro'],
    unidades: ['unidade', 'endereco', 'onde fica', 'onde voces', 'onde e', 'localiza', 'cidade', 'perto', 'mapa', 'recife', 'caruaru', 'garanhuns', 'santo amaro', 'boa vista', 'mauricio de nassau', 'nassau'],
    procedimentos: ['procedimento', 'tratamento', 'servico', 'o que voces fazem', 'o que fazem', 'especialidade', 'estetic', 'harmoniz'],
    botox: ['botox', 'toxina', 'full face', 'ruga', 'sorriso gengival', 'gengival', 'bigode chines', 'pe de galinha', 'testa', 'linha de expressao', 'expressao'],
    corpo: ['flacidez', 'glute', 'bumbum', 'bioestimul', 'preenchimento', 'preencher', 'colageno', 'celulite', 'corporal', 'canetinha', 'caneta', 'emagrec'],
    pele: ['vitamina c', 'skincare', 'skin care', 'pele', 'dermocosmet', 'antioxidante'],
    intimo: ['intim', 'labioplast', 'ninfoplast', 'vagin', 'genital'],
    olhos: ['oftalm', 'olho ', 'olhos', 'exame de vista', 'minha vista', 'vista cansada', 'catarata', 'miopia', 'hipermetrop', 'astigmat', 'refrativ', 'lente', 'oculos', 'enxerg', 'henrique'],
    hematoma: ['hematoma', 'roxo', 'roxa', 'mancha roxa'],
    clinico: ['mancha', 'o que e isso', 'o que sera', 'estranh', 'caroco', 'ferida', 'coceira', 'vermelh', 'posso fazer', 'gravida', 'gestante', 'amament', 'alergi', 'remedio', 'medicament', 'doenca', 'diabet', 'pressao alta', 'contraindic', 'efeito colateral', 'dor ', 'doi', 'doer', 'inflam', 'infecc', 'inchad', 'sintoma', 'diagnost', 'receita', 'anticoagul', 'tenho problema', 'e perigoso', 'faz mal', 'risco'],
    livros: ['livro', 'curso', 'ebook', 'e book', 'formacao', 'leitura', 'comprar', 'compra', 'autor', 'anderclay', 'dmap', 'instituto'],
    videos: ['video', 'assistir', 'galeria', 'reels'],
    contato: ['whatsapp', 'whats', 'zap', 'wpp', 'contato', 'email', 'e mail', 'telefone', 'numero', 'fone', 'cnpj'],
    humano: ['atendente', 'humano', 'uma pessoa', 'alguem da equipe', 'falar com alguem', 'pessoa de verdade', 'recepcionista', 'gente de verdade'],
    quem: ['quem e voce', 'quem e vc', 'voce e robo', 'vc e robo', 'robo', 'bot ', 'inteligencia artificial', 'voce e real', 'seu nome'],
    danusa: ['danusa', 'doutora', 'dra', 'quem atende', 'medic', 'profissiona'],
    sara: ['sara', 'sarah'],
    labial: ['labial', 'labios', 'labio ', 'boca'],
    comparar: ['diferenca', 'qual e melhor', 'qual o melhor', 'o que e melhor', 'ou o', 'versus', ' vs '],
    equipe: ['conheca a equipe', 'conhecer a equipe', 'equipe', 'avatares', 'avatar', 'quem trabalha', 'especialistas'],
    funcionamento: ['que horas', 'horario de funcionamento', 'abre', 'fecha', 'funciona', 'sabado', 'domingo', 'feriado', 'aberto']
  };

  /* ------------------------------------------------------------------
   * Respostas
   * ------------------------------------------------------------------ */
  function wa(texto) { return 'https://wa.me/' + cfg('whatsapp') + '?text=' + encodeURIComponent(texto); }
  function msgAgendar() {
    var t = "Olá! Vim pelo site e falei com a Ana. Quero agendar";
    if (estado.assunto) t += ' (assunto: ' + estado.assunto + ')';
    if (estado.unidade) t += ' na unidade ' + UNIDADES[estado.unidade].rotulo;
    return t + '.';
  }
  var A = {
    whatsAgendar: function () { return { t: 'link', rotulo: 'Agendar no WhatsApp', href: wa(msgAgendar()), estilo: 'teal' }; },
    whats: function (texto, rotulo) { return { t: 'link', rotulo: rotulo || 'Chamar no WhatsApp', href: wa(texto || "Olá! Vim pelo site e falei com a Ana."), estilo: 'teal' }; },
    tel: function () { return { t: 'link', rotulo: 'Ligar agora', href: 'tel:' + cfg('telefone'), estilo: 'gold', mesmaAba: true }; },
    form: function (rotulo) { return { t: 'form', rotulo: rotulo || 'Quero que me liguem', estilo: 'ghost' }; },
    msg: function (rotulo, texto) { return { t: 'msg', rotulo: rotulo, texto: texto || rotulo, estilo: 'ghost' }; },
    pagina: function (rotulo, rel) { return { t: 'link', rotulo: rotulo, href: url(rel), estilo: 'ghost', mesmaAba: true }; }
  };

  // Oferece agendamento no máximo 2 vezes por sessão (oferta + 1 lembrete) e para de vez se a pessoa recusar.
  function oferecer(r, tipo, frase) {
    if (estado.recusou || estado.ofertas >= 2) return r;
    estado.ofertas++;
    estado.pendente = tipo || 'agendar';
    r.texto += '\n' + (frase || (estado.ofertas === 1 ? 'Quer que eu já deixe seu agendamento encaminhado com a equipe?' : 'E aí, quer que eu te ajude a agendar?'));
    return r;
  }
  function regraAvaliacao() {
    if (estado.unidade === 'garanhuns') return 'Em Garanhuns, a avaliação custa R$ 150.';
    if (estado.unidade === 'recife' || estado.unidade === 'caruaru') return 'Em ' + UNIDADES[estado.unidade].cidade + ' não tem avaliação. A equipe te explica pelo WhatsApp como funciona o atendimento aí.';
    return 'A avaliação custa R$ 150 e é feita só em Garanhuns e região. Em Recife e Caruaru não tem avaliação.';
  }
  function botoesCidades() { return [A.msg('Recife'), A.msg('Caruaru'), A.msg('Garanhuns')]; }
  function acharLivro(n) {
    for (var i = 0; i < LIVROS.length; i++) if (tem(n, LIVROS[i].chaves)) return LIVROS[i];
    return null;
  }
  function acharVideos(n) {
    var ws = n.trim().split(' ').filter(function (w) { return w.length >= 5 && ['video', 'videos', 'sobre', 'voces', 'tenho', 'quero', 'assistir'].indexOf(w) === -1; });
    return VIDEOS.filter(function (t) { var nt = norm(t); return ws.some(function (w) { return nt.indexOf(' ' + w.slice(0, Math.max(5, w.length - 2))) !== -1; }); });
  }
  function aqui(pagina) { return new RegExp('/' + pagina + '(\\.html)?$').test(location.pathname); }

  var R = {
    boasVindas: function () {
      return { texto: "Oi! Eu sou a Ana, assistente virtual da recepção da Clínica D'Moura.\nPosso te ajudar com procedimentos, agendamento, livros ou vídeos. Como posso te ajudar?" };
    },
    saudacao: function () { return { texto: 'Oi! Tudo bem? Me conta: o que você está procurando hoje?' }; },
    agradecer: function () { return { texto: 'Imagina! Precisando, é só me chamar aqui.' }; },
    quem: function () {
      return { texto: "Sou a Ana, assistente virtual da recepção da Clínica D'Moura. Respondo o básico por aqui e passo o resto pra nossa equipe, que é gente de verdade." };
    },
    procedimentos: function () {
      return { texto: 'Aqui no site a gente mostra:\n• Botox Full Face e sorriso gengival\n• Oftalmologia: exame de vista, catarata, miopia, cirurgia refrativa e lentes de contato\n• Procedimentos íntimos, só em consulta privada\nA equipe atende outras especialidades também, conforme a unidade. Qual te interessa?',
        acoes: [A.msg('Botox Full Face'), A.msg('Oftalmologia'), A.msg('Procedimento íntimo'), A.pagina('Ver procedimentos', 'procedimentos.html')] };
    },
    botox: function () {
      estado.assunto = 'Botox Full Face';
      var r = { texto: 'O Botox Full Face é harmonização facial, e a gente também trabalha o sorriso gengival. A Dra. Danusa explica bem nos vídeos "Entendendo o Botox Full Face" e "Todo Botox é igual?".\nSe é indicado pra você, só dá pra saber vendo você pessoalmente.',
        acoes: [A.pagina('Ver vídeos', 'videos.html')] };
      return oferecer(r);
    },
    corpo: function () {
      estado.assunto = 'flacidez / bioestimuladores';
      var r = { texto: 'Sobre isso, a Dra. Danusa tem vídeos na galeria: "Tratamento para flacidez glútea" e "Preenchimento e bioestimuladores — verão".\nO que serve pra você depende de ver o seu caso pessoalmente.',
        acoes: [A.pagina('Ver vídeos', 'videos.html')] };
      return oferecer(r);
    },
    pele: function () {
      estado.assunto = 'skincare / vitamina C';
      var r = { texto: 'Tem um vídeo da Dra. Danusa sobre isso: "Benefícios da Vitamina C pura". Pra saber o que combina com a sua pele, o melhor é falar com a equipe.',
        acoes: [A.pagina('Ver vídeos', 'videos.html')] };
      return oferecer(r);
    },
    intimo: function () {
      estado.assunto = 'consulta privada';
      var r = { texto: 'Procedimentos íntimos são tratados só em consulta privada, com toda a discrição. A gente não publica fotos disso na internet.' };
      return oferecer(r, 'agendar', 'Quer que eu encaminhe um agendamento reservado?');
    },
    olhos: function () {
      estado.assunto = 'oftalmologia';
      var r = { texto: 'Na oftalmologia tem exame de vista, catarata, miopia, hipermetropia, astigmatismo, cirurgia refrativa e lentes de contato. Se quiser entender melhor antes, o avatar educativo do Dr. Henrique explica.',
        acoes: [A.pagina('Falar com o Dr. Henrique (avatar)', 'avatares/henrique.html')] };
      return oferecer(r);
    },
    hematoma: function () {
      var r = { texto: 'Boa pergunta. A Dra. Danusa fala disso no vídeo "Risco de hematomas nos procedimentos". Sobre o seu caso, eu não consigo avaliar por aqui. Isso só vendo você pessoalmente.',
        acoes: [A.pagina('Ver vídeos', 'videos.html')] };
      return oferecer(r);
    },
    clinico: function () {
      var r = { texto: 'Essa pergunta precisa de alguém da equipe vendo você. Eu não faço diagnóstico nem indicação por aqui.\nO caminho é ver você pessoalmente. ' + regraAvaliacao() +
        '\nSe for algo que piorou rápido ou está doendo muito, procure atendimento médico.',
        acoes: [A.whats('Olá! Vim pelo site. Tenho uma dúvida sobre o meu caso e quero orientação da equipe.', 'Falar com a equipe')] };
      if (!estado.unidade) { r.acoes = r.acoes.concat(botoesCidades()); estado.aguardando = 'avaliacao'; }
      return r;
    },
    avaliacao: function () {
      var r = { texto: regraAvaliacao() };
      if (!estado.unidade) { r.texto += '\nVocê é de qual cidade?'; r.acoes = botoesCidades(); estado.aguardando = 'avaliacao'; return r; }
      if (estado.unidade === 'garanhuns') { estado.assunto = estado.assunto || 'avaliação'; r.acoes = [A.whatsAgendar()]; return oferecer(r, 'agendar', 'Quer marcar a sua?'); }
      r.acoes = [A.whats('Olá! Vim pelo site e quero saber como funciona o atendimento na unidade ' + UNIDADES[estado.unidade].rotulo + '.', 'Falar com a equipe')];
      return r;
    },
    precoProcedimento: function (consulta) {
      var r = { texto: (consulta
          ? 'O valor da consulta eu não tenho aqui, então não vou chutar. Quem confirma é a equipe, no WhatsApp.'
          : 'Valor de procedimento só sai depois que a equipe vê o seu caso, por isso eu não passo preço por aqui.') +
        '\nO que eu posso te adiantar: ' + regraAvaliacao().charAt(0).toLowerCase() + regraAvaliacao().slice(1),
        acoes: [A.whats('Olá! Vim pelo site e quero saber valores.', 'Perguntar valor no WhatsApp')] };
      return oferecer(r);
    },
    labial: function () {
      var r = { texto: 'Preenchimento labial não aparece confirmado aqui no site, então prefiro não te prometer. A equipe confirma pra você no WhatsApp.\nNa galeria tem o vídeo "Preenchimento e bioestimuladores — verão", da Dra. Danusa.',
        acoes: [A.whats('Olá! Vim pelo site e quero saber se vocês fazem preenchimento labial.', 'Perguntar no WhatsApp'), A.pagina('Ver vídeos', 'videos.html')] };
      return r;
    },
    comparar: function () {
      var r = { texto: 'São procedimentos diferentes, e qual faz sentido pra você só dá pra dizer vendo você pessoalmente. Eu não faço indicação por aqui.\nSe quiser entender antes, a Dra. Danusa fala de Botox em "Entendendo o Botox Full Face" e de preenchimento em "Preenchimento e bioestimuladores — verão".',
        acoes: [A.pagina('Ver vídeos', 'videos.html')] };
      return oferecer(r);
    },
    agendar: function (soCidade) {
      estado.pendente = null;
      var u = estado.unidade && UNIDADES[estado.unidade];
      var r = { texto: (soCidade && u
          ? 'Anotado: ' + u.cidade + ', unidade ' + u.bairro + '. Já coloquei a unidade na mensagem do WhatsApp, é só tocar no botão.'
          : 'Bora! O agendamento é feito pelo WhatsApp com a nossa equipe. Já deixei a mensagem pronta, é só tocar no botão.') +
        (estado.unidade ? '' : '\nSe puder, me diz a cidade: Recife, Caruaru ou Garanhuns.'),
        acoes: [A.whatsAgendar(), A.form('Prefiro que me liguem')] };
      if (!estado.unidade) { r.acoes = r.acoes.concat(botoesCidades()); estado.aguardando = 'agendar'; }
      return r;
    },
    unidades: function () {
      return { texto: 'A gente atende em três cidades:\n• Recife: ' + UNIDADES.recife.end + '\n• Caruaru: ' + UNIDADES.caruaru.end + '\n• Garanhuns: ' + UNIDADES.garanhuns.end + '\nNa aba Mapa você vê a rota e a unidade mais perto de você. Qual fica melhor pra você?',
        acoes: botoesCidades().concat([A.pagina('Ver unidades', 'index.html#unidades')]) };
    },
    cidade: function (pergunta) {
      var u = UNIDADES[estado.unidade];
      var r = { texto: pergunta ? 'Temos sim! Em ' + u.cidade + ', a unidade fica ' + u.no + '. Endereço: ' + u.end + ' (' + u.cidade + '-PE). A rota está na aba Mapa.' : 'Anotado: ' + u.cidade + ', unidade ' + u.bairro + '.' };
      if (estado.unidade === 'garanhuns') r.texto += ' Por aí a avaliação custa R$ 150.';
      return oferecer(r, 'agendar', 'Quer que eu encaminhe seu agendamento pra lá?');
    },
    contato: function () {
      return { texto: 'Nosso WhatsApp é ' + cfg('telefoneVisivel') + '. Se preferir e-mail: ' + cfg('email') + '.',
        acoes: [A.whats(), A.tel(), A.form()] };
    },
    humano: function () {
      return { texto: 'Claro! Te passo pra equipe. Pode chamar no WhatsApp ou, se preferir, a gente te liga.',
        acoes: [A.whats(), A.tel(), A.form()] };
    },
    ligar: function (somenteVoz) {
      var r = { texto: somenteVoz
        ? 'Sem problema nenhum. A gente resolve tudo por voz. O jeito mais fácil: toque no botão amarelo, Ligar agora. Ou deixe seu número que a equipe te liga.'
        : 'Claro! Você pode ligar agora pra gente, ou deixar seu número que a equipe te liga em horário comercial.',
        acoes: [A.tel(), A.form('Quero que me liguem')] };
      r.abrirForm = true; r.somenteVoz = !!somenteVoz;
      return r;
    },
    danusa: function () {
      return { texto: "A Dra. Danusa Moura faz parte da equipe clínica da D'Moura. É ela quem aparece nos vídeos da galeria, e você pode conversar com o avatar dela também.",
        acoes: [A.pagina('Avatar da Dra. Danusa', 'avatares/danusa.html'), A.pagina('Ver vídeos', 'videos.html')] };
    },
    videos: function (n) {
      var achados = n ? acharVideos(n) : [];
      if (achados.length) {
        return { texto: 'Tem sim! ' + (achados.length === 1 ? 'O vídeo' : 'Os vídeos') + ' ' + achados.slice(0, 3).map(function (t) { return '"' + t + '"'; }).join(', ') + (achados.length === 1 ? ' fala disso.' : ' falam disso.'),
          acoes: aqui('videos') ? [] : [A.pagina('Abrir a galeria', 'videos.html')] };
      }
      return { texto: 'A galeria tem ' + VIDEOS.length + ' vídeos com a Dra. Danusa. Alguns temas: Botox, flacidez glútea, vitamina C, hematomas e avaliação presencial.' +
        (aqui('videos') ? ' Você já está na galeria, é só rolar a página.' : ''),
        acoes: aqui('videos') ? [A.msg('Vídeos sobre Botox', 'video sobre botox')] : [A.pagina('Abrir a galeria', 'videos.html')] };
    },
    livros: function (comprar) {
      if (comprar) {
        return { texto: "Os que já dá pra garantir são D'Moura Ecosystem, Empreenda+, A Fase da Guerra e Margem, Método e Milhão. Cada um tem o botão \"Quero o curso\", que chama a equipe no WhatsApp. O valor quem passa é a equipe.\nQual deles te interessa?",
          acoes: LIVROS.filter(function (l) { return l.link; }).map(function (l) { return { t: 'link', rotulo: l.titulo, href: l.link, estilo: 'gold' }; }).concat([A.pagina('Ver livros', 'livros.html')]) };
      }
      return { texto: "Temos livros do ecossistema DMAP com curso associado: D'Moura Ecosystem, Empreenda+, A Fase da Guerra e Margem, Método e Milhão.\nTambém tem 30 Passos para o Sucesso e Raabe, ainda sem inscrição aberta, e Don't You Depri, que vem em breve. Quer saber de algum?",
        acoes: [A.msg("D'Moura Ecosystem"), A.msg('A Fase da Guerra'), A.msg('Margem, Método e Milhão'), A.msg('Empreenda+'), A.pagina('Ver livros', 'livros.html')] };
    },
    livro: function (l, perguntouPreco) {
      var r = { texto: l.titulo + ', de ' + l.autor + ': ' + l.resumo + '.', acoes: [] };
      if (perguntouPreco) r.texto += '\n' + (l.valores || 'O valor eu não tenho aqui. Quem passa é a equipe, no WhatsApp.');
      if (l.link) {
        r.texto += '\nPra garantir o seu, é pelo botão "Quero o curso", que chama a equipe no WhatsApp.';
        r.acoes.push({ t: 'link', rotulo: 'Quero o curso', href: l.link, estilo: 'gold' });
        estado.assunto = l.titulo;
      } else {
        r.texto += '\n' + l.status;
      }
      r.acoes.push(A.pagina('Ver livros', 'livros.html'));
      return r;
    },
    sara: function () {
      return { texto: 'Oi! Quem cuida da recepção agora sou eu, a Ana. A Sara era a recepcionista virtual de antes, e hoje eu atendo por aqui. Me conta: como posso te ajudar?',
        acoes: [A.msg('Procedimentos'), A.msg('Agendar'), A.pagina('Conheça a equipe', 'avatares/index.html')] };
    },
    equipe: function () {
      return { texto: "A equipe da Clínica D'Moura e do Instituto DMAP aparece nos avatares do site. Dá pra conhecer cada um por lá.",
        acoes: [A.pagina('Conheça a equipe', 'avatares/index.html')] };
    },
    funcionamento: function () { return R.naoSei('Sobre horário de funcionamento, eu não tenho a informação certinha aqui.'); },
    naoSei: function (inicio) {
      return { texto: (inicio || 'Essa eu não sei te responder com certeza.') + ' Vou deixar com a nossa equipe: chama no WhatsApp que eles te respondem certinho.',
        acoes: [A.whats(), A.form('Prefiro que me liguem')] };
    },
    recusa: function () {
      var tinha = !!estado.pendente;
      estado.pendente = null; estado.recusou = true;
      return { texto: tinha ? 'Tudo bem, sem pressão! Se mudar de ideia, é só me chamar aqui.' : 'Tudo bem! Fico por aqui se precisar de alguma coisa.' };
    }
  };

  // a mensagem fala de outro assunto? (aí um "quero ..." não é resposta à oferta pendente)
  function outroAssunto(n) {
    return ['ligar', 'humano', 'livros', 'videos', 'unidades', 'procedimentos', 'botox', 'corpo', 'pele', 'intimo', 'olhos', 'labial',
      'hematoma', 'clinico', 'preco', 'avaliacao', 'contato', 'quem', 'danusa', 'equipe', 'funcionamento'].some(function (k) { return tem(n, K[k]); }) || !!acharLivro(n);
  }

  function responder(entrada) {
    var n = norm(entrada);
    var curto = palavras(n) <= 5;

    // cidade citada: guarda a unidade
    var cidade = null;
    if (tem(n, ['recife', 'santo amaro'])) cidade = 'recife';
    else if (tem(n, ['caruaru', 'nassau', 'mauricio de nassau'])) cidade = 'caruaru';
    else if (tem(n, ['garanhuns', 'boa vista'])) cidade = 'garanhuns';
    if (cidade) estado.unidade = cidade;
    if (cidade && estado.aguardando && palavras(n) <= 4) {
      var ag = estado.aguardando; estado.aguardando = null;
      if (ag === 'avaliacao') return R.avaliacao();
      if (ag === 'agendar') return R.agendar(true);
    }

    if (tem(n, K.somenteVoz)) return R.ligar(true);
    if (tem(n, K.sara)) return R.sara();

    // sim / não a uma oferta pendente
    if (estado.pendente && curto) {
      if (tem(n, ['nao', 'agora nao', 'depois', 'dispenso', 'sem interesse', 'outra hora'])) return R.recusa();
      if (tem(n, K.afirmar) && !outroAssunto(n)) {
        var p = estado.pendente; estado.pendente = null;
        if (p.indexOf('livro:') === 0) { var l = LIVROS.filter(function (x) { return x.id === p.slice(6); })[0]; if (l) return R.livro(l, false); }
        return R.agendar();
      }
    }
    if (curto && tem(n, ['nao obrigad', 'nao valeu', 'nao quero', 'so olhando', 'sem interesse', 'dispenso', 'agora nao'])) return R.recusa();
    if (/^ nao( obrigad[a-z]*| valeu)? $/.test(n)) return R.recusa();

    var preco = tem(n, K.preco);
    var livro = acharLivro(n);

    if (tem(n, K.ligar)) return R.ligar(false);
    if (tem(n, K.humano)) return R.humano();
    if (tem(n, K.hematoma)) return R.hematoma();
    if (tem(n, K.clinico) && !livro) return R.clinico();
    if (livro && (tem(n, K.livros) || preco || palavras(n) <= 6)) return R.livro(livro, preco);
    if (tem(n, K.intimo)) return R.intimo();
    if (tem(n, K.avaliacao)) return R.avaliacao();
    if (preco && tem(n, K.livros)) return R.livros(true);
    if (tem(n, ['comprar', 'compra', 'adquirir', 'garantir']) && tem(n, K.livros)) return R.livros(true);
    if (preco) return R.precoProcedimento(tem(n, ['consulta']));
    if (tem(n, K.comparar) && (tem(n, K.botox) || tem(n, K.corpo) || tem(n, K.pele))) return R.comparar();
    if (tem(n, K.labial)) return R.labial();
    if (tem(n, K.agendar) && !tem(n, K.funcionamento.slice(1))) return R.agendar();
    if (tem(n, K.videos)) return R.videos(n);
    if (tem(n, K.botox)) return R.botox();
    if (tem(n, K.corpo)) return R.corpo();
    if (tem(n, K.olhos)) return R.olhos();
    if (tem(n, K.pele)) return R.pele();
    if (tem(n, K.livros)) return R.livros();
    if (tem(n, K.procedimentos)) return R.procedimentos();
    if (tem(n, K.funcionamento)) return R.funcionamento();
    if (cidade) return R.cidade(tem(n, ['tem', 'unidade', 'atende', 'fica']));
    if (tem(n, K.unidades)) return R.unidades();
    if (tem(n, K.contato)) return R.contato();
    if (tem(n, K.quem)) return R.quem();
    if (tem(n, K.danusa)) return R.danusa();
    if (tem(n, K.equipe)) return R.equipe();
    if (tem(n, K.agradecer)) return R.agradecer();
    if (curto && tem(n, K.saudacao)) return R.saudacao();
    if (curto && tem(n, K.afirmar)) return { texto: 'Certo! Me diz no que posso te ajudar: procedimentos, agendamento, livros ou vídeos.' };
    return R.naoSei();
  }

  /* ------------------------------------------------------------------
   * Voz (a mesma preferência de vozes da fala de boas-vindas de videos.html)
   * ------------------------------------------------------------------ */
  var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  function escolherVoz() {
    var vozes = synth.getVoices().filter(function (v) { return /^pt[-_]BR/i.test(v.lang); });
    var preferidas = [/natural/i, /online/i, /google/i, /francisca/i, /thalita/i, /luciana/i, /antonio/i];
    for (var i = 0; i < preferidas.length; i++) {
      var achou = vozes.find(function (v) { return preferidas[i].test(v.name); });
      if (achou) return achou;
    }
    return vozes[0] || null;
  }
  function paraFala(t) {
    return String(t)
      .replace(/R\$\s?(\d+)\s?mil/g, '$1 mil reais').replace(/R\$\s?(\d+)/g, '$1 reais')
      .replace(/\bDra\./g, 'Doutora').replace(/\bDr\./g, 'Doutor')
      .replace(/G\.E\.R\.A\./g, 'Gera').replace(/Empreenda\+/g, 'Empreenda Mais')
      .replace(/\(81\) 99718-1046/g, '81, 9 9 7 1 8, 10 46')
      .replace(/[•"]/g, '').replace(/—/g, ',').replace(/\n+/g, '. ').replace(/\.\s*\./g, '.');
  }
  function pararFala() {
    seqFala++;
    if (synth) synth.cancel();
  }
  function falar(texto) {
    if (mudo || !interagiu) return;
    falarSintese(texto);
  }
  var seqFala = 0;
  function falarSintese(texto) {
    if (!synth) return;
    var minha = ++seqFala;
    var dizer = function () {
      if (minha !== seqFala) return; // já veio outra resposta
      var u = new SpeechSynthesisUtterance(paraFala(texto));
      u.lang = 'pt-BR';
      var voz = escolherVoz();
      if (voz) u.voice = voz;
      u.rate = 1.0;
      u.pitch = 1.1;
      synth.cancel();
      synth.speak(u);
    };
    if (synth.getVoices().length) { dizer(); return; }
    // vozes ainda carregando: espera o evento, mas não fica mudo para sempre se ele nunca vier
    var feito = false;
    var uma = function () { if (feito) return; feito = true; dizer(); };
    synth.addEventListener('voiceschanged', uma, { once: true });
    setTimeout(uma, 700);
  }
  // Não falar por cima de um vídeo
  document.addEventListener('play', function (e) {
    if (e.target && e.target.tagName === 'VIDEO') pararFala();
  }, true);

  /* ------------------------------------------------------------------
   * Pedido de ligação (formulário dentro do chat)
   * ------------------------------------------------------------------ */
  var TEXTO_CONSENTIMENTO = "Autorizo a Clínica D'Moura a me ligar ou mandar mensagem de voz no WhatsApp neste número para tratar deste pedido. Sei que posso cancelar quando quiser.";
  var DDDS = [11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,68,69,71,73,74,75,77,79,81,82,83,84,85,86,87,88,89,91,92,93,94,95,96,97,98,99];
  function soDigitos(v) {
    var d = String(v || '').replace(/\D/g, '');
    if ((d.length === 12 || d.length === 13) && d.slice(0, 2) === '55') d = d.slice(2);
    return d.slice(0, 11);
  }
  function mascara(v) {
    var d = soDigitos(v);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  function telefoneValido(v) {
    var d = soDigitos(v);
    if (d.length !== 10 && d.length !== 11) return false;
    if (DDDS.indexOf(parseInt(d.slice(0, 2), 10)) === -1) return false;
    if (d.length === 11 && d[2] !== '9') return false;
    if (d.length === 10 && !/[2-5]/.test(d[2])) return false; // fixo
    if (/^(\d)\1+$/.test(d.slice(2))) return false;
    return true;
  }
  function enfileirar(lead) {
    var fila = ler(localStorage, CH_FILA, []);
    fila.push(lead);
    gravar(localStorage, CH_FILA, fila.slice(-20));
  }
  function enviarPedido(lead) {
    var endpoint = cfg('callbackEndpoint');
    if (!endpoint) {
      enfileirar(lead);
      console.info('[Ana] Pedido de ligação PENDENTE: window.ANA_CONFIG.callbackEndpoint não está configurado. Salvo só neste navegador (localStorage "' + CH_FILA + '").', lead);
      return Promise.resolve('fila');
    }
    return fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return 'enviado'; })
      .catch(function (err) {
        enfileirar(lead);
        console.info('[Ana] Falha ao enviar o pedido de ligação (' + err.message + '). Salvo em localStorage "' + CH_FILA + '".', lead);
        return 'fila';
      });
  }

  /* ------------------------------------------------------------------
   * Interface
   * ------------------------------------------------------------------ */
  function el(tag, attrs, filhos) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'texto') e.textContent = attrs[k];
      else if (k === 'classe') e.className = attrs[k];
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
    (filhos || []).forEach(function (f) { if (f) e.appendChild(f); });
    return e;
  }

  var root, painel, log, entrada, btnMudo, launcher, formAberto = null;

  function montar() {
    root = el('div', { id: 'ana-root' });
    launcher = el('button', { classe: 'ana-launcher', type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'ana-painel', onclick: abrir }, [
      el('span', { classe: 'ana-avatar', 'aria-hidden': 'true', texto: 'A' }),
      el('span', { classe: 'ana-launcher-label', texto: 'Fale com a Ana' })
    ]);
    btnMudo = el('button', { classe: 'ana-icon-btn', type: 'button', onclick: alternarMudo });
    atualizarMudo();
    log = el('div', { classe: 'ana-log', role: 'log', 'aria-live': 'polite', 'aria-relevant': 'additions' });
    entrada = el('input', { classe: 'ana-input', type: 'text', autocomplete: 'off', maxlength: '300', placeholder: 'Escreva sua pergunta…', 'aria-label': 'Sua mensagem para a Ana' });
    var form = el('form', { classe: 'ana-form-row', onsubmit: function (e) { e.preventDefault(); enviar(entrada.value); } }, [
      entrada, el('button', { classe: 'ana-send', type: 'submit', texto: 'Enviar' })
    ]);
    var chips = el('div', { classe: 'ana-chips', role: 'group', 'aria-label': 'Atalhos' },
      ['Procedimentos', 'Agendar', 'Livros', 'Vídeos', 'Unidades', 'Me ligue', 'Conheça a equipe'].map(function (c) {
        return el('button', { classe: 'ana-chip', type: 'button', texto: c, onclick: function () { enviar(c); } });
      }));
    painel = el('div', { classe: 'ana-panel', id: 'ana-painel', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'ana-titulo' }, [
      el('div', { classe: 'ana-head' }, [
        el('span', { classe: 'ana-avatar', 'aria-hidden': 'true', texto: 'A' }),
        el('div', { classe: 'ana-title' }, [
          el('strong', { id: 'ana-titulo', texto: "Ana · Recepção D'Moura" }),
          el('span', { texto: 'Assistente virtual · responde na hora' })
        ]),
        btnMudo,
        el('button', { classe: 'ana-icon-btn', type: 'button', 'aria-label': 'Fechar conversa', texto: '✕', onclick: fechar })
      ]),
      log, chips, form,
      el('p', { classe: 'ana-foot' }, [
        document.createTextNode('Respostas automáticas, sem diagnóstico. Atendimento humano: '),
        el('a', { href: wa('Olá! Vim pelo site.'), target: '_blank', rel: 'noopener', texto: 'WhatsApp' })
      ])
    ]);
    root.appendChild(painel);
    root.appendChild(launcher);
    root.addEventListener('pointerdown', marcarInteracao, true);
    root.addEventListener('keydown', function (e) {
      marcarInteracao(e);
      if (e.key === 'Escape' && root.classList.contains('ana-open')) fechar();
    }, true);
    // Toques e teclas dentro da Ana não chegam aos ouvintes da página (ex.: a fala de boas-vindas de videos.html),
    // para não ter duas vozes ao mesmo tempo.
    ['pointerdown', 'keydown'].forEach(function (tipo) { root.addEventListener(tipo, function (e) { e.stopPropagation(); }); });
    document.body.appendChild(root);
  }
  function marcarInteracao(e) { if (!e || e.isTrusted) interagiu = true; }

  function atualizarMudo() {
    btnMudo.textContent = mudo ? '🔇' : '🔊';
    btnMudo.setAttribute('aria-pressed', mudo ? 'true' : 'false');
    btnMudo.setAttribute('aria-label', mudo ? 'Ativar a voz da Ana' : 'Silenciar a voz da Ana');
    btnMudo.title = mudo ? 'Voz desligada' : 'Voz ligada';
  }
  function alternarMudo() {
    mudo = !mudo;
    gravar(localStorage, CH_MUDO, mudo);
    atualizarMudo();
    if (mudo) pararFala();
  }

  function abrir() {
    root.classList.add('ana-open');
    launcher.setAttribute('aria-expanded', 'true');
    if (!log.childNodes.length) {
      if (historico.length) historico.forEach(function (m) { desenhar(m, true); });
      if (!estado.saudou) { estado.saudou = true; bot(R.boasVindas()); }
    }
    setTimeout(function () { entrada.focus(); log.scrollTop = log.scrollHeight; }, 30);
  }
  function fechar() {
    root.classList.remove('ana-open');
    launcher.setAttribute('aria-expanded', 'false');
    pararFala();
    launcher.focus();
  }

  function desenhar(m, restaurando) {
    var bolha = el('div', { classe: 'ana-msg ' + (m.de === 'ana' ? 'ana-bot' : 'ana-user') });
    bolha.appendChild(el('span', { classe: 'ana-sr', texto: m.de === 'ana' ? 'Ana disse: ' : 'Você disse: ' }));
    bolha.appendChild(document.createTextNode(m.texto));
    if (m.acoes && m.acoes.length) {
      var box = el('div', { classe: 'ana-actions' });
      m.acoes.forEach(function (a) { box.appendChild(botaoAcao(a)); });
      bolha.appendChild(box);
    }
    log.appendChild(bolha);
    if (!restaurando) log.scrollTop = log.scrollHeight;
    return bolha;
  }
  function botaoAcao(a) {
    var classe = 'ana-action' + (a.estilo === 'gold' ? ' ana-gold' : a.estilo === 'ghost' ? ' ana-ghost' : '');
    if (a.t === 'link') {
      var attrs = { classe: classe, href: a.href, texto: a.rotulo };
      if (!a.mesmaAba) { attrs.target = '_blank'; attrs.rel = 'noopener'; }
      return el('a', attrs);
    }
    if (a.t === 'form') return el('button', { classe: classe, type: 'button', texto: a.rotulo, onclick: function () { mostrarFormulario(false); } });
    return el('button', { classe: classe, type: 'button', texto: a.rotulo, onclick: function () { enviar(a.texto); } });
  }

  function bot(r) {
    var m = { de: 'ana', texto: r.texto, acoes: r.acoes || [] };
    historico.push(m); salvar();
    desenhar(m);
    falar(r.texto);
    if (r.abrirForm) mostrarFormulario(r.somenteVoz);
  }
  function enviar(texto) {
    texto = String(texto || '').trim();
    if (!texto) return;
    entrada.value = '';
    var m = { de: 'voce', texto: texto };
    historico.push(m);
    desenhar(m);
    var r = responder(texto);
    salvar();
    setTimeout(function () { bot(r); }, 250);
  }

  function mostrarFormulario(somenteVoz) {
    if (formAberto && document.body.contains(formAberto) && !formAberto.getAttribute('data-enviado')) { formAberto.querySelector('input').focus(); return; }
    var erro = el('p', { classe: 'ana-error', role: 'alert' });
    var nome = el('input', { type: 'text', name: 'nome', autocomplete: 'name', maxlength: '80', required: 'required' });
    var tel = el('input', { type: 'tel', name: 'telefone', autocomplete: 'tel-national', inputmode: 'tel', placeholder: '(81) 99999-9999', maxlength: '16', required: 'required' });
    tel.addEventListener('input', function () { tel.value = mascara(tel.value); });
    var unidade = el('select', { name: 'unidade', required: 'required' }, [el('option', { value: '', texto: 'Escolha a unidade' })].concat(
      Object.keys(UNIDADES).map(function (k) { var o = el('option', { value: k, texto: UNIDADES[k].rotulo }); if (estado.unidade === k) o.selected = true; return o; })));
    var horario = el('select', { name: 'horario' }, [
      el('option', { value: 'manha', texto: 'Manhã (8h às 12h)' }),
      el('option', { value: 'tarde', texto: 'Tarde (12h às 18h)' }),
      el('option', { value: 'qualquer', texto: 'Qualquer horário comercial' })
    ]);
    horario.value = 'qualquer';
    var voz = el('input', { type: 'checkbox', name: 'somente_voz' });
    voz.checked = !!somenteVoz;
    var consent = el('input', { type: 'checkbox', name: 'consentimento', required: 'required' });
    var btn = el('button', { classe: 'ana-action ana-gold', type: 'submit', texto: 'Pedir ligação' });

    var f = el('form', { classe: 'ana-callback', novalidate: 'novalidate', 'aria-label': 'Pedido de ligação' }, [
      el('label', null, [document.createTextNode('Seu nome'), nome]),
      el('label', null, [document.createTextNode('Telefone com DDD'), tel]),
      el('label', null, [document.createTextNode('Unidade'), unidade]),
      el('label', null, [document.createTextNode('Melhor horário'), horario]),
      el('label', { classe: 'ana-check' }, [voz, el('span', { texto: 'Prefiro só áudio/voz (não preciso ler mensagens)' })]),
      el('label', { classe: 'ana-check' }, [consent, el('span', { texto: TEXTO_CONSENTIMENTO + ' (obrigatório)' })]),
      erro, btn
    ]);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var problemas = [];
      if (nome.value.trim().length < 2) problemas.push('seu nome');
      if (!telefoneValido(tel.value)) problemas.push('um telefone válido com DDD');
      if (!unidade.value) problemas.push('a unidade');
      if (problemas.length) { erro.textContent = 'Falta ' + problemas.join(', ') + '.'; return; }
      if (!consent.checked) { erro.textContent = 'Pra gente poder te ligar, preciso que você marque a autorização.'; consent.focus(); return; }
      erro.textContent = '';
      var agora = new Date().toISOString();
      var d = soDigitos(tel.value);
      var lead = {
        id: 'ana-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
        tipo: 'pedido_ligacao',
        nome: nome.value.trim(),
        telefone: '+55' + d,
        telefoneFormatado: mascara(d),
        unidade: unidade.value,
        unidadeRotulo: UNIDADES[unidade.value].rotulo,
        horarioPreferido: horario.value,
        somenteVoz: voz.checked,
        assunto: estado.assunto || null,
        consentimentoLGPD: { aceito: true, texto: TEXTO_CONSENTIMENTO, registradoEm: agora },
        origem: { canal: 'site-ana', pagina: location.pathname },
        criadoEm: agora,
        fusoHorario: 'America/Recife'
      };
      btn.disabled = true; btn.textContent = 'Enviando…';
      f.setAttribute('data-enviado', '1');
      enviarPedido(lead).then(function (status) {
        Array.prototype.forEach.call(f.elements, function (x) { x.disabled = true; });
        btn.textContent = 'Pedido registrado';
        estado.unidade = unidade.value; estado.pendente = null; salvar();
        var primeiro = lead.nome.split(' ')[0];
        var texto = 'Recebi seu pedido, ' + primeiro + '! Nossa equipe liga em horário comercial.';
        if (lead.somenteVoz) texto += '\nAnotei que você prefere só voz. A gente resolve tudo falando, sem precisar ler nada.';
        var acoes = [];
        if (status === 'fila') {
          texto += '\nSe for urgente, pode ligar agora ou chamar no WhatsApp.';
          acoes = [A.tel(), A.whats('Olá! Pedi uma ligação pelo site. Meu nome é ' + lead.nome + '.')];
        }
        bot({ texto: texto, acoes: acoes });
      });
    });
    var bolha = el('div', { classe: 'ana-msg ana-bot' }, [
      document.createTextNode(somenteVoz ? 'Deixa seu número que a gente te liga. Já marquei a opção de contato só por voz.' : 'Deixa seu contato que a equipe te liga:'),
      f
    ]);
    log.appendChild(bolha);
    log.scrollTop = log.scrollHeight;
    formAberto = f;
    nome.focus();
  }

  /* Exposto para testes no console. A Ana nunca faz ligações sozinha. */
  window.ana = {
    responder: function (t) { return responder(t); },
    abrir: function () { abrir(); },
    perguntar: function (t) { abrir(); interagiu = true; enviar(t); },
    filaLigacoes: function () { return ler(localStorage, CH_FILA, []); },
    validarTelefone: telefoneValido
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();
})();
