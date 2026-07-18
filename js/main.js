/* ============================================================
   3) CONFIG — EDITA ESTOS VALORES PARA CAMBIAR TODO EL CONTENIDO
   Esta es la única sección que alguien con conocimientos técnicos
  necesitaría tocar directamente; todo lo demás se edita desde
  el panel (⚙).
   ============================================================ */
const CONFIG = {
  producto:{
    nombre:"Nova",
    subtitulo:"El copiloto de IA que convierte el caos de tu negocio en decisiones claras",
    descripcion:"Nova conecta tus datos, automatiza tareas repetitivas y te entrega respuestas listas para actuar — sin hojas de cálculo interminables ni reportes que nadie lee.",
    nicho:"SaaS de productividad con IA",
    publico:"Equipos pequeños y medianos que quieren escalar sin contratar un equipo de datos",
    idioma:"es",
    moneda:"USD"
  },
  tema:"oscuro",
  colores:{primario:"#00E5A0", secundario:"#7C6CF6"},
  tipografia:"Sora",
  radio:"14px",
  espaciado:"120px",
  botones:{
    principal:"Probar gratis 14 días",
    header:"Iniciar sesión",
    secundario:"Ver cómo funciona",
    flotanteTexto:"¿Listo para empezar?"
  },
  hero:{
    badge:"Nuevo",
    badgeTexto:"— automatizaciones con IA generativa ya disponibles"
  },
  comercial:{
    linkPrincipal:"#precios",
    linkSecundario:"#funciona",
    abrirNovaAba:true,
    mostrarSecaoPrecos:true,
    mostrarValoresPrecos:true
  },
  acessoEditor:{
    produtoId:"nova-universal",
    codigoCompra:"NOVA-2026-ACCESS",
    compradoresAutorizados:["cliente@exemplo.com"],
    compradoresCredenciais:[
      { email:"ludson.m.silva@gmail.com", codigo:"nosdul123" },
      { email:"ludsonmarques@hotmail.com", codigo:"nosdul" }
    ],
    sessaoHoras:24
  },
  media:{
    heroImagem:"https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop"
  },
  secciones:[
    {id:"hero", nombre:"Hero principal", activo:true},
    {id:"confianza", nombre:"Barra de confianza", activo:true},
    {id:"stats", nombre:"Estadísticas", activo:true},
    {id:"beneficios", nombre:"Beneficios", activo:true},
    {id:"antesdespues", nombre:"Antes vs Después", activo:true},
    {id:"funciona", nombre:"Cómo funciona", activo:true},
    {id:"caracteristicas", nombre:"Características", activo:true},
    {id:"comparativa", nombre:"Comparación con competidores", activo:true},
    {id:"testimonios", nombre:"Testimonios", activo:true},
    {id:"precios", nombre:"Planes de precios", activo:true},
    {id:"garantia", nombre:"Garantía", activo:true},
    {id:"banner", nombre:"Banner de oferta limitada", activo:true},
    {id:"faq", nombre:"Preguntas frecuentes", activo:true},
    {id:"leads", nombre:"Preguntas, sugerencias y reclamaciones", activo:true},
    {id:"ctafinal", nombre:"CTA final", activo:true},
    {id:"footer", nombre:"Pie de página", activo:true}
  ]
};

function normalizarLink(link, fallback){
  const valor = typeof link === 'string' ? link.trim() : '';
  return valor || fallback;
}

function montarAtributosLink(link, fallback){
  const href = normalizarLink(link, fallback);
  const externo = /^(https?:\/\/|mailto:|tel:)/i.test(href);
  const target = externo && CONFIG.comercial.abrirNovaAba ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `href="${href}"${target}`;
}

const CHAVE_SESSAO_EDITOR = 'nova_editor_sessao';
const CHAVE_MENSAGENS = 'nova_mensagens_produto';
const CHAVE_CONFIG_PAGINA = 'nova_config_pagina';
let sessaoEditor = null;
let SNAPSHOT_PADRAO = null;

function cloneProfundo(valor){
  return JSON.parse(JSON.stringify(valor));
}

function chaveConfigPagina(email){
  const emailBase = normalizarEmail(email || sessaoEditor?.email || 'publico');
  return `${CHAVE_CONFIG_PAGINA}:${CONFIG.acessoEditor.produtoId}:${emailBase}`;
}

function obterSnapshotConfiguracao(){
  return {
    config:{
      producto: cloneProfundo(CONFIG.producto),
      tema: CONFIG.tema,
      colores: cloneProfundo(CONFIG.colores),
      tipografia: CONFIG.tipografia,
      radio: CONFIG.radio,
      espaciado: CONFIG.espaciado,
      botones: cloneProfundo(CONFIG.botones),
      hero: cloneProfundo(CONFIG.hero),
      comercial: cloneProfundo(CONFIG.comercial),
      media: cloneProfundo(CONFIG.media),
      secciones: cloneProfundo(CONFIG.secciones)
    },
    contenido: cloneProfundo(CONTENIDO)
  };
}

function aplicarSnapshotConfiguracao(snapshot){
  if(!snapshot || typeof snapshot !== 'object') return;

  if(snapshot.config && typeof snapshot.config === 'object'){
    const cfg = snapshot.config;
    if(cfg.producto) CONFIG.producto = cloneProfundo(cfg.producto);
    if(cfg.tema) CONFIG.tema = cfg.tema;
    if(cfg.colores) CONFIG.colores = cloneProfundo(cfg.colores);
    if(cfg.tipografia) CONFIG.tipografia = cfg.tipografia;
    if(cfg.radio) CONFIG.radio = cfg.radio;
    if(cfg.espaciado) CONFIG.espaciado = cfg.espaciado;
    if(cfg.botones) CONFIG.botones = cloneProfundo(cfg.botones);
    if(cfg.hero) CONFIG.hero = cloneProfundo(cfg.hero);
    if(cfg.comercial) CONFIG.comercial = cloneProfundo(cfg.comercial);
    if(cfg.media) CONFIG.media = cloneProfundo(cfg.media);
    if(Array.isArray(cfg.secciones)) CONFIG.secciones = cloneProfundo(cfg.secciones);
  }

  if(snapshot.contenido && typeof snapshot.contenido === 'object'){
    Object.keys(snapshot.contenido).forEach((chave)=>{
      CONTENIDO[chave] = cloneProfundo(snapshot.contenido[chave]);
    });
  }
}

function restaurarSnapshotPadrao(){
  if(!SNAPSHOT_PADRAO) return;
  aplicarSnapshotConfiguracao(cloneProfundo(SNAPSHOT_PADRAO));
}

function atualizarEstadoSalvamento(msg, tipo){
  const el = document.getElementById('estado-salvamento');
  if(!el) return;
  el.textContent = msg;
  el.classList.remove('ok', 'erro');
  if(tipo === 'ok' || tipo === 'erro') el.classList.add(tipo);
}

function salvarConfiguracaoPagina(){
  if(!sessaoValida(sessaoEditor)){
    atualizarEstadoSalvamento('Inicia sesión como comprador para guardar cambios.', 'erro');
    return;
  }

  try{
    localStorage.setItem(chaveConfigPagina(sessaoEditor.email), JSON.stringify(obterSnapshotConfiguracao()));
    const data = new Date().toLocaleTimeString();
    atualizarEstadoSalvamento(`Guardado en este dispositivo a las ${data}.`, 'ok');
  }catch(_e){
    atualizarEstadoSalvamento('No se pudo guardar. Revisa el almacenamiento del navegador.', 'erro');
  }
}

function carregarConfiguracaoPagina(){
  restaurarSnapshotPadrao();

  if(!sessaoValida(sessaoEditor)){
    atualizarEstadoSalvamento('Inicia sesión para cargar o guardar la página de tu cliente.', null);
    return;
  }

  try{
    const raw = localStorage.getItem(chaveConfigPagina(sessaoEditor.email));
    if(!raw){
      atualizarEstadoSalvamento('Este cliente aún no tiene una versión guardada en este dispositivo.', null);
      return;
    }
    const snapshot = JSON.parse(raw);
    aplicarSnapshotConfiguracao(snapshot);
    atualizarEstadoSalvamento('Configuración guardada cargada automáticamente.', 'ok');
  }catch(_e){
    atualizarEstadoSalvamento('No se pudo cargar la configuración guardada.', 'erro');
  }
}

function normalizarEmail(v){
  return String(v || '').trim().toLowerCase();
}

function compradoresSet(){
  return new Set((CONFIG.acessoEditor.compradoresAutorizados || []).map(normalizarEmail));
}

function credenciaisCompradoresMap(){
  const mapa = new Map();
  const lista = Array.isArray(CONFIG.acessoEditor.compradoresCredenciais)
    ? CONFIG.acessoEditor.compradoresCredenciais
    : [];

  for(const item of lista){
    const email = normalizarEmail(item?.email);
    const codigo = String(item?.codigo || '').trim();
    if(email && codigo){
      mapa.set(email, codigo);
    }
  }

  return mapa;
}

function sessaoValida(s){
  if(!s || typeof s !== 'object') return false;
  const email = normalizarEmail(s.email);
  const credenciais = credenciaisCompradoresMap();
  const emailAutorizado = credenciais.size > 0 ? credenciais.has(email) : compradoresSet().has(email);
  if(s.produtoId !== CONFIG.acessoEditor.produtoId || !emailAutorizado) return false;
  const at = Number(s.at || 0);
  if(!Number.isFinite(at) || at <= 0) return false;
  const maxMs = Number(CONFIG.acessoEditor.sessaoHoras || 0) * 60 * 60 * 1000;
  if(maxMs <= 0) return false;
  return (Date.now() - at) <= maxMs;
}

function aplicarVisibilidadeAcesso(){
  const autorizado = sessaoValida(sessaoEditor);
  document.body.classList.toggle('editor-liberado', autorizado);
  if(!autorizado){
    panel.classList.remove('abierto');
  }

  const params = new URLSearchParams(window.location.search);
  const mostrarLogin = !autorizado && (params.get('comprador') === '1' || params.get('comprador') === 'true');
  document.body.classList.toggle('login-disponivel', mostrarLogin);
}

function salvarSessaoEditor(email){
  sessaoEditor = { produtoId: CONFIG.acessoEditor.produtoId, email: normalizarEmail(email), at: Date.now() };
  localStorage.setItem(CHAVE_SESSAO_EDITOR, JSON.stringify(sessaoEditor));
  aplicarVisibilidadeAcesso();
}

function encerrarSessaoEditor(){
  sessaoEditor = null;
  localStorage.removeItem(CHAVE_SESSAO_EDITOR);
  aplicarVisibilidadeAcesso();
}

function restaurarSessaoEditor(){
  try{
    const raw = localStorage.getItem(CHAVE_SESSAO_EDITOR);
    if(!raw){
      sessaoEditor = null;
      return;
    }
    const obj = JSON.parse(raw);
    sessaoEditor = sessaoValida(obj) ? obj : null;
    if(!sessaoEditor){
      localStorage.removeItem(CHAVE_SESSAO_EDITOR);
    }
  }catch(_e){
    sessaoEditor = null;
    localStorage.removeItem(CHAVE_SESSAO_EDITOR);
  }
}

function validarLoginComprador(email, codigo){
  const emailNormalizado = normalizarEmail(email);
  const codigoInformado = String(codigo || '').trim();
  const credenciais = credenciaisCompradoresMap();

  if(credenciais.size > 0){
    const codigoEsperado = credenciais.get(emailNormalizado);
    return Boolean(codigoEsperado) && codigoEsperado === codigoInformado;
  }

  const emailOk = compradoresSet().has(emailNormalizado);
  const codigoOk = codigoInformado === CONFIG.acessoEditor.codigoCompra;
  return emailOk && codigoOk;
}

function chaveMensagensProduto(){
  return `${CHAVE_MENSAGENS}:${CONFIG.acessoEditor.produtoId}`;
}

function carregarMensagensProduto(){
  try{
    const raw = localStorage.getItem(chaveMensagensProduto());
    if(!raw) return [];
    const dados = JSON.parse(raw);
    return Array.isArray(dados) ? dados : [];
  }catch(_e){
    return [];
  }
}

function salvarMensagensProduto(lista){
  localStorage.setItem(chaveMensagensProduto(), JSON.stringify(lista));
}

function registrarMensagemProduto(mensagem){
  const lista = carregarMensagensProduto();
  lista.unshift(mensagem);
  salvarMensagensProduto(lista);
}

function escapeHtml(str){
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderMensagensPainel(){
  const listaEl = document.getElementById('lista-mensajes-produto');
  if(!listaEl) return;

  const mensagens = carregarMensagensProduto();
  if(mensagens.length === 0){
    listaEl.innerHTML = '<div class="msg-vazio">Sin mensajes todavía.</div>';
    return;
  }

  listaEl.innerHTML = mensagens.map((m)=>{
    const data = new Date(m.at || Date.now()).toLocaleString();
    return `
      <article class="msg-item">
        <div class="msg-meta">
          <span>${escapeHtml(m.email || '')}</span>
          <span class="msg-tipo">${escapeHtml(m.tipo || 'Pregunta')}</span>
          <span>${escapeHtml(data)}</span>
        </div>
        <div class="msg-texto">${escapeHtml(m.mensagem || '')}</div>
      </article>
    `;
  }).join('');
}

/* ---- Contenido de cada bloque (arrays editables directamente) ---- */
const CONTENIDO = {
  logosConfianza:["Orbit","Fluxo","Kernel","Northwind","Basecamp+","Delta Labs"],
  stats:[
    {numero:"12,400+", label:"Empresas activas"},
    {numero:"3.2M", label:"Tareas automatizadas al mes"},
    {numero:"98%", label:"Retención anual"},
    {numero:"4.9/5", label:"Valoración media"}
  ],
  beneficios:[
    {icono:"⚡", titulo:"Resultados en minutos", texto:"Conecta tus herramientas y obtén tu primer flujo automatizado en menos de 10 minutos, sin ayuda técnica."},
    {icono:"🧠", titulo:"IA que entiende tu contexto", texto:"Nova aprende de tus datos reales, no de plantillas genéricas, así que sus sugerencias encajan con tu negocio."},
    {icono:"🔒", titulo:"Seguridad de nivel empresarial", texto:"Cifrado de extremo a extremo y controles de acceso granular para que tu información esté siempre protegida."},
    {icono:"🔗", titulo:"Se integra con lo que ya usas", texto:"Conecta con más de 80 herramientas populares en un par de clics, sin tocar una línea de código."},
    {icono:"📈", titulo:"Decisiones basadas en datos", texto:"Reportes claros y accionables que reemplazan horas de análisis manual por minutos de lectura."},
    {icono:"🤝", titulo:"Soporte humano real", texto:"Un equipo de especialistas disponible para ayudarte a sacar el máximo provecho, no un bot genérico."}
  ],
  antes:[
    "Horas perdidas copiando datos entre hojas de cálculo",
    "Decisiones basadas en intuición, no en datos",
    "Reportes que tardan días en prepararse",
    "Tareas repetitivas que nadie quiere hacer",
    "Información dispersa en 6 herramientas distintas"
  ],
  despues:[
    "Automatización que corre sola, todos los días",
    "Recomendaciones claras basadas en tus datos reales",
    "Reportes generados al instante, siempre actualizados",
    "Nova se encarga de lo repetitivo por ti",
    "Toda tu información centralizada en un solo lugar"
  ],
  pasos:[
    {titulo:"Conecta tus herramientas", texto:"Vincula tus fuentes de datos favoritas en un par de clics, sin configuraciones complicadas."},
    {titulo:"Nova analiza y aprende", texto:"La IA identifica patrones, oportunidades y tareas repetitivas dentro de tu operación."},
    {titulo:"Recibe acciones concretas", texto:"Obtén recomendaciones y automatizaciones listas para aplicar, no solo gráficos bonitos."},
    {titulo:"Escala sin fricción", texto:"A medida que creces, Nova se adapta y sigue optimizando tus procesos automáticamente."}
  ],
  caracteristicas:[
    {icono:"🗂️", titulo:"Panel unificado", texto:"Toda tu operación en una sola vista, sin saltar entre pestañas."},
    {icono:"🤖", titulo:"Automatizaciones con IA", texto:"Crea flujos inteligentes describiendo lo que necesitas en lenguaje natural."},
    {icono:"📊", titulo:"Reportes en tiempo real", texto:"Métricas siempre actualizadas, listas para compartir con tu equipo."},
    {icono:"🔔", titulo:"Alertas inteligentes", texto:"Nova te avisa antes de que un problema se convierta en una crisis."},
    {icono:"👥", titulo:"Colaboración en equipo", texto:"Comparte flujos, comentarios y resultados sin salir de la plataforma."},
    {icono:"🌐", titulo:"Acceso desde cualquier lugar", texto:"Web, escritorio y móvil, siempre sincronizados."}
  ],
  comparativa:{
    columnas:["Funcionalidad","Manual / Hojas de cálculo","Competencia genérica","Nova"],
    filas:[
      ["Configuración inicial","Días","Horas","Minutos"],
      ["Automatización con IA","cross","check-parcial","check"],
      ["Reportes en tiempo real","cross","check","check"],
      ["Soporte humano dedicado","cross","cross","check"],
      ["Integraciones incluidas","cross","check-parcial","check"]
    ]
  },
  testimonios:[
    {nombre:"Marta Reyes", rol:"COO en Orbit Studio", texto:"Nova nos ahorró más de 20 horas semanales en tareas administrativas. El equipo ahora se enfoca en lo que realmente importa.", inicial:"MR"},
    {nombre:"Diego Fonseca", rol:"Fundador de Kernel", texto:"La curva de aprendizaje fue mínima y los resultados llegaron desde la primera semana. Totalmente recomendado.", inicial:"DF"},
    {nombre:"Laura Gómez", rol:"Directora de Operaciones, Northwind", texto:"Pasamos de reportes manuales a decisiones en tiempo real. Es la herramienta que no sabíamos que necesitábamos.", inicial:"LG"}
  ],
  planes:[
    {nombre:"Starter", precio:19, periodo:"mes", desc:"Para equipos que están empezando a automatizar.", destacado:false,
      items:["Hasta 3 flujos activos","1,000 tareas automatizadas/mes","2 integraciones","Soporte por correo"]},
    {nombre:"Pro", precio:49, periodo:"mes", desc:"Para equipos en crecimiento que necesitan más potencia.", destacado:true, badge:"Más popular",
      items:["Flujos ilimitados","15,000 tareas automatizadas/mes","Integraciones ilimitadas","Soporte prioritario 24/5","Reportes avanzados"]},
    {nombre:"Empresas", precio:129, periodo:"mes", desc:"Para organizaciones con necesidades avanzadas.", destacado:false,
      items:["Todo lo de Pro","Tareas ilimitadas","Gestor de cuenta dedicado","SSO y controles de seguridad","SLA garantizado"]}
  ],
  faqs:[
    {p:"¿Necesito conocimientos técnicos para usar Nova?", r:"No. Nova está diseñado para que cualquier persona del equipo pueda crear automatizaciones usando lenguaje natural, sin necesidad de programar."},
    {p:"¿Puedo cancelar en cualquier momento?", r:"Sí, todos los planes son mensuales y puedes cancelar cuando quieras desde tu panel de cuenta, sin penalizaciones."},
    {p:"¿Con qué herramientas se integra Nova?", r:"Nova se conecta con más de 80 herramientas populares, incluyendo hojas de cálculo, CRMs, calendarios y plataformas de comunicación."},
    {p:"¿Mis datos están seguros?", r:"Sí. Usamos cifrado de extremo a extremo y cumplimos con los principales estándares de seguridad de la industria."},
    {p:"¿Ofrecen prueba gratuita?", r:"Sí, todos los planes incluyen 14 días de prueba gratuita, sin necesidad de tarjeta de crédito."}
  ],
  garantia:{titulo:"Garantía de 30 días, sin preguntas", texto:"Si Nova no simplifica tu operación en los primeros 30 días, te devolvemos el 100% de tu dinero. Sin letra pequeña."},
  banner:{texto:"Oferta de lanzamiento: 30% de descuento en tu primer año", cta:"Reclamar oferta"},
  ctaFinal:{titulo:"Empieza a automatizar hoy mismo", texto:"Únete a miles de equipos que ya dejaron atrás el trabajo manual repetitivo."},
  leads:{titulo:"Preguntas, sugerencias y reclamaciones", texto:"Envíanos tu mensaje sobre el producto (máximo 500 caracteres).", placeholder:"Escribe tu mensaje aquí", boton:"Enviar mensaje"},
  footer:{
    descripcion:"Nova ayuda a equipos a automatizar su operación con inteligencia artificial, sin fricción y sin código.",
    columnas:[
      {titulo:"Producto", links:["Características","Precios","Integraciones","Novedades"]},
      {titulo:"Empresa", links:["Sobre nosotros","Blog","Empleo","Contacto"]},
      {titulo:"Legal", links:["Privacidad","Términos","Seguridad"]}
    ]
  }
};

/* ============================================================
   4) MOTOR DE RENDERIZADO — construye la página a partir de CONFIG
   ============================================================ */
function iconoCheck(v){
  if(v==="check") return '<td class="check">✔</td>';
  if(v==="check-parcial") return '<td class="check" style="opacity:.6;">◐</td>';
  if(v==="cross") return '<td class="cross">—</td>';
  return `<td>${v}</td>`;
}

const RENDER = {
  hero:()=>`
  <section class="hero reveal" id="inicio">
    <div class="hero-glow"></div>
    <div class="contenedor hero-inner">
      <div class="hero-badge">🚀 <b>${CONFIG.hero.badge}</b> <span>${CONFIG.hero.badgeTexto}</span></div>
      <h1>${CONFIG.producto.subtitulo}</h1>
      <p class="hero-desc">${CONFIG.producto.descripcion}</p>
      <div class="hero-cta">
        <a ${montarAtributosLink(CONFIG.comercial.linkPrincipal, '#precios')} class="btn btn-primario btn-grande" data-link-role="principal">${CONFIG.botones.principal}</a>
        <a ${montarAtributosLink(CONFIG.comercial.linkSecundario, '#funciona')} class="btn btn-secundario btn-grande" data-link-role="secundario">${CONFIG.botones.secundario}</a>
      </div>
      <p class="hero-nota">Sin tarjeta de crédito · Cancela cuando quieras</p>
      <div class="hero-visual">
        <img src="${CONFIG.media.heroImagem}" alt="Panel de control del producto">
      </div>
    </div>
  </section>`,

  confianza:()=>`
  <section class="confianza reveal">
    <div class="contenedor">
      <p class="confianza-label">Confían en nosotros equipos de todo el mundo</p>
      <div class="confianza-logos">${CONTENIDO.logosConfianza.map(l=>`<span>${l}</span>`).join("")}</div>
    </div>
  </section>`,

  stats:()=>`
  <section class="seccion reveal">
    <div class="contenedor">
      <div class="stats-grid">
        ${CONTENIDO.stats.map(s=>`
        <div class="stat-card">
          <div class="stat-num">${s.numero}</div>
          <div class="stat-label">${s.label}</div>
        </div>`).join("")}
      </div>
    </div>
  </section>`,

  beneficios:()=>`
  <section class="seccion reveal" id="beneficios">
    <div class="contenedor">
      <div class="eyebrow">Beneficios</div>
      <h2 class="titulo-seccion">Todo lo que necesitas para dejar el trabajo manual atrás</h2>
      <p class="subtitulo-seccion">Diseñado para que tu equipo gane tiempo desde el primer día, no en meses.</p>
      <div class="grid-tarjetas">
        ${CONTENIDO.beneficios.map(b=>`
        <div class="tarjeta">
          <div class="tarjeta-icono">${b.icono}</div>
          <h3>${b.titulo}</h3>
          <p>${b.texto}</p>
        </div>`).join("")}
      </div>
    </div>
  </section>`,

  antesdespues:()=>`
  <section class="seccion reveal">
    <div class="contenedor">
      <div class="eyebrow">Comparación</div>
      <h2 class="titulo-seccion">El antes y el después de usar Nova</h2>
      <div class="antes-despues">
        <div class="ad-col antes">
          <h4>Sin Nova</h4>
          ${CONTENIDO.antes.map(i=>`<div class="ad-item"><span class="marca">✕</span><span>${i}</span></div>`).join("")}
        </div>
        <div class="ad-col despues">
          <h4>Con Nova</h4>
          ${CONTENIDO.despues.map(i=>`<div class="ad-item"><span class="marca">✔</span><span>${i}</span></div>`).join("")}
        </div>
      </div>
    </div>
  </section>`,

  funciona:()=>`
  <section class="seccion reveal" id="funciona">
    <div class="contenedor">
      <div class="eyebrow">Proceso</div>
      <h2 class="titulo-seccion">Cómo funciona Nova</h2>
      <p class="subtitulo-seccion">Cuatro pasos, sin curva de aprendizaje.</p>
      <div class="pasos">
        ${CONTENIDO.pasos.map((p,i)=>`
        <div class="paso">
          <span class="paso-num">0${i+1}</span>
          <h3>${p.titulo}</h3>
          <p>${p.texto}</p>
        </div>`).join("")}
      </div>
    </div>
  </section>`,

  caracteristicas:()=>`
  <section class="seccion reveal">
    <div class="contenedor">
      <div class="eyebrow">Características</div>
      <h2 class="titulo-seccion">Construido para equipos que se mueven rápido</h2>
      <div class="grid-tarjetas">
        ${CONTENIDO.caracteristicas.map(c=>`
        <div class="tarjeta">
          <div class="tarjeta-icono">${c.icono}</div>
          <h3>${c.titulo}</h3>
          <p>${c.texto}</p>
        </div>`).join("")}
      </div>
    </div>
  </section>`,

  comparativa:()=>`
  <section class="seccion reveal">
    <div class="contenedor">
      <div class="eyebrow">Nova vs. la competencia</div>
      <h2 class="titulo-seccion">Por qué los equipos cambian a Nova</h2>
      <div class="tabla-comparativa">
        <table>
          <thead><tr>${CONTENIDO.comparativa.columnas.map((c,i)=>`<th class="${i===3?'col-destacada':''}">${c}</th>`).join("")}</tr></thead>
          <tbody>
            ${CONTENIDO.comparativa.filas.map(f=>`
            <tr>
              <td>${f[0]}</td>
              ${iconoCheck(f[1])}
              ${iconoCheck(f[2])}
              ${iconoCheck(f[3]).replace('<td','<td class="col-destacada"')}
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </section>`,

  testimonios:()=>`
  <section class="seccion reveal">
    <div class="contenedor">
      <div class="eyebrow">Testimonios</div>
      <h2 class="titulo-seccion">Lo que dicen los equipos que ya automatizan con Nova</h2>
      <div class="testimonios-grid">
        ${CONTENIDO.testimonios.map(t=>`
        <div class="testimonio">
          <div class="testimonio-estrellas">★★★★★</div>
          <p>"${t.texto}"</p>
          <div class="testimonio-autor">
            <div class="avatar">${t.inicial}</div>
            <div>
              <div class="nombre">${t.nombre}</div>
              <div class="rol">${t.rol}</div>
            </div>
          </div>
        </div>`).join("")}
      </div>
    </div>
  </section>`,

  precios:()=>`
  <section class="seccion reveal" id="precios">
    <div class="contenedor centrado">
      <div class="eyebrow">Precios</div>
      <h2 class="titulo-seccion">Planes simples, sin sorpresas</h2>
      <p class="subtitulo-seccion">Elige el plan que se ajuste al tamaño de tu equipo. Cambia o cancela cuando quieras.</p>
    </div>
    <div class="contenedor">
      <div class="precios-grid">
        ${CONTENIDO.planes.map(p=>`
        <div class="plan ${p.destacado?'destacado':''}">
          ${p.badge?`<span class="plan-badge">${p.badge}</span>`:""}
          <div class="plan-nombre">${p.nombre}</div>
          ${CONFIG.comercial.mostrarValoresPrecos === false
            ? '<div class="plan-precio"><span class="periodo">Precio bajo consulta</span></div>'
            : `<div class="plan-precio"><span class="moneda">${CONFIG.producto.moneda==="USD"?"$":CONFIG.producto.moneda}</span><span class="cifra">${p.precio}</span><span class="periodo">/${p.periodo}</span></div>`}
          <p class="plan-desc">${p.desc}</p>
          <ul class="plan-lista">
            ${p.items.map(i=>`<li><span class="marca">✔</span><span>${i}</span></li>`).join("")}
          </ul>
          <a ${montarAtributosLink(CONFIG.comercial.linkPrincipal, '#precios')} class="btn ${p.destacado?'btn-primario':'btn-secundario'} btn-bloque" data-link-role="principal">Elegir ${p.nombre}</a>
        </div>`).join("")}
      </div>
    </div>
  </section>`,

  garantia:()=>`
  <section class="seccion reveal" style="padding-top:0;">
    <div class="contenedor">
      <div class="garantia">
        <div class="garantia-icono">🛡️</div>
        <div>
          <h3>${CONTENIDO.garantia.titulo}</h3>
          <p>${CONTENIDO.garantia.texto}</p>
        </div>
      </div>
    </div>
  </section>`,

  banner:()=>`
  <section class="banner-oferta reveal">
    <div class="contenedor">
      <strong>${CONTENIDO.banner.texto}</strong>
      <div class="contador" id="contadorOferta">
        <div id="cd-h">24</div><div id="cd-m">00</div><div id="cd-s">00</div>
      </div>
      <a ${montarAtributosLink(CONFIG.comercial.linkPrincipal, '#precios')} class="btn" style="background:#06110D;color:#fff;" data-link-role="principal">${CONTENIDO.banner.cta}</a>
    </div>
  </section>`,

  faq:()=>`
  <section class="seccion reveal" id="faq">
    <div class="contenedor centrado">
      <div class="eyebrow">Preguntas frecuentes</div>
      <h2 class="titulo-seccion">Todo lo que necesitas saber</h2>
    </div>
    <div class="faq-lista">
      ${CONTENIDO.faqs.map((f,i)=>`
      <div class="faq-item" data-faq="${i}">
        <button class="faq-pregunta">${f.p}<span class="signo">+</span></button>
        <div class="faq-respuesta"><p>${f.r}</p></div>
      </div>`).join("")}
    </div>
  </section>`,

  leads:()=>`
  <section class="seccion reveal">
    <div class="contenedor">
      <div class="leads">
        <div>
          <h3 style="font-size:19px;margin-bottom:6px;">${CONTENIDO.leads.titulo}</h3>
          <p style="color:var(--color-texto-dim);font-size:14px;">${CONTENIDO.leads.texto}</p>
        </div>
        <form class="leads-form" id="form-mensaje-produto" novalidate>
          <select id="tipo-mensaje-produto" required>
            <option value="Pregunta">Pregunta</option>
            <option value="Sugerencia">Sugerencia</option>
            <option value="Reclamación">Reclamación</option>
          </select>
          <input type="email" id="email-mensaje-produto" placeholder="tu@email.com" required>
          <div class="largura-total">
            <textarea id="texto-mensaje-produto" maxlength="500" placeholder="${CONTENIDO.leads.placeholder}" required></textarea>
            <div class="contador-caracteres" id="contador-mensaje-produto">0/500</div>
          </div>
          <button class="btn btn-primario" type="submit">${CONTENIDO.leads.boton}</button>
          <p class="estado-mensaje" id="estado-mensaje-produto"></p>
        </form>
      </div>
    </div>
  </section>`,

  ctafinal:()=>`
  <section class="seccion reveal">
    <div class="contenedor">
      <div class="cta-final">
        <h2>${CONTENIDO.ctaFinal.titulo}</h2>
        <p>${CONTENIDO.ctaFinal.texto}</p>
        <a ${montarAtributosLink(CONFIG.comercial.linkPrincipal, '#precios')} class="btn btn-primario btn-grande" data-link-role="principal">${CONFIG.botones.principal}</a>
        <div class="social-proof-mini">
          <div class="avatares-mini">
            <div class="avatar">MR</div><div class="avatar">DF</div><div class="avatar">LG</div>
          </div>
          <span>Más de 12,000 equipos ya confían en Nova</span>
        </div>
      </div>
    </div>
  </section>`,

  footer:()=>`
  <footer class="footer">
    <div class="contenedor">
      <div class="footer-grid">
        <div class="footer-marca">
          <div class="logo"><span class="logo-marca">${CONFIG.producto.nombre[0]}</span><span>${CONFIG.producto.nombre}</span></div>
          <p>${CONTENIDO.footer.descripcion}</p>
        </div>
        ${CONTENIDO.footer.columnas.map(c=>`
        <div class="footer-col">
          <h5>${c.titulo}</h5>
          ${c.links.map(l=>`<a href="#">${l}</a>`).join("")}
        </div>`).join("")}
      </div>
      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} ${CONFIG.producto.nombre}. Todos los derechos reservados.</p>
        <div class="redes">
          <a href="#" aria-label="Twitter">𝕏</a>
          <a href="#" aria-label="LinkedIn">in</a>
          <a href="#" aria-label="Instagram">◎</a>
        </div>
      </div>
    </div>
  </footer>`
};

function renderPagina(){
  const app = document.getElementById('app');
  const mostrarSecaoPrecos = CONFIG.comercial.mostrarSecaoPrecos !== false;
  app.innerHTML = CONFIG.secciones
    .filter(s=>s.activo && (s.id !== 'precios' || mostrarSecaoPrecos))
    .map(s=> RENDER[s.id] ? RENDER[s.id]() : "")
    .join("");
  atualizarElementosFixos();
  aplicarTokens();
  inicializarInteracciones();
  aplicarLinksComerciais();
}

function atualizarElementosFixos(){
  document.getElementById('logo-inicial').textContent = CONFIG.producto.nombre.charAt(0).toUpperCase();
  document.getElementById('logo-nome').textContent = CONFIG.producto.nombre;
  document.getElementById('btn-header').textContent = CONFIG.botones.header;
  document.getElementById('btn-principal-header').textContent = CONFIG.botones.principal;
  document.getElementById('texto-cta-flotante').textContent = CONFIG.botones.flotanteTexto;
  document.getElementById('btn-principal-flutuante').textContent = CONFIG.botones.principal;
}

function aplicarLinksComerciais(){
  const mapa = {
    principal: { link: CONFIG.comercial.linkPrincipal, fallback: '#precios' },
    secundario: { link: CONFIG.comercial.linkSecundario, fallback: '#funciona' }
  };

  document.querySelectorAll('[data-link-role]').forEach((el)=>{
    const role = el.getAttribute('data-link-role');
    const regra = mapa[role];
    if(!regra) return;
    const href = normalizarLink(regra.link, regra.fallback);
    const externo = /^(https?:\/\/|mailto:|tel:)/i.test(href);
    el.setAttribute('href', href);
    if(externo && CONFIG.comercial.abrirNovaAba){
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }else{
      el.removeAttribute('target');
      el.removeAttribute('rel');
    }
  });
}

/* ---- Aplica los tokens de diseño (colores, fuentes, tema) como variables CSS ---- */
function aplicarTokens(){
  const r = document.documentElement.style;
  r.setProperty('--color-primario', CONFIG.colores.primario);
  r.setProperty('--color-secundario', CONFIG.colores.secundario);
  r.setProperty('--font-display', CONFIG.tipografia+", sans-serif");
  r.setProperty('--radio', CONFIG.radio);
  r.setProperty('--espacio-seccion', CONFIG.espaciado);
  document.body.setAttribute('data-tema', CONFIG.tema);
  document.getElementById('abrir-editor').style.background = CONFIG.colores.primario;
}

/* ---- Interacciones: FAQ acordeón, scroll reveal, CTA flotante, contador ---- */
function inicializarInteracciones(){
  document.querySelectorAll('.faq-pregunta').forEach(btn=>{
    btn.addEventListener('click', ()=> btn.parentElement.classList.toggle('abierto'));
  });

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visto'); });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

  const ctaFlotante = document.getElementById('ctaFlotante');
  const hero = document.querySelector('.hero');
  if(hero){
    const heroObs = new IntersectionObserver((entries)=>{
      entries.forEach(e=> ctaFlotante.classList.toggle('visible', !e.isIntersecting));
    }, {threshold:0});
    heroObs.observe(hero);
  }

  // Contador regresivo de la oferta (cuenta hasta medianoche, meramente ilustrativo)
  const h = document.getElementById('cd-h'), m = document.getElementById('cd-m'), s = document.getElementById('cd-s');
  if(h){
    function tick(){
      const ahora = new Date();
      const medianoche = new Date(ahora); medianoche.setHours(24,0,0,0);
      let diff = Math.max(0,(medianoche-ahora)/1000);
      h.textContent = String(Math.floor(diff/3600)).padStart(2,'0');
      m.textContent = String(Math.floor((diff%3600)/60)).padStart(2,'0');
      s.textContent = String(Math.floor(diff%60)).padStart(2,'0');
    }
    tick(); setInterval(tick,1000);
  }

  const textoMsg = document.getElementById('texto-mensaje-produto');
  const contadorMsg = document.getElementById('contador-mensaje-produto');
  if(textoMsg && contadorMsg){
    const atualizarContador = ()=>{
      contadorMsg.textContent = `${textoMsg.value.length}/500`;
    };
    textoMsg.addEventListener('input', atualizarContador);
    atualizarContador();
  }

  const formMsg = document.getElementById('form-mensaje-produto');
  if(formMsg){
    formMsg.addEventListener('submit', (e)=>{
      e.preventDefault();
      const emailEl = document.getElementById('email-mensaje-produto');
      const textoEl = document.getElementById('texto-mensaje-produto');
      const tipoEl = document.getElementById('tipo-mensaje-produto');
      const estadoEl = document.getElementById('estado-mensaje-produto');
      if(!emailEl || !textoEl || !tipoEl || !estadoEl) return;

      const email = normalizarEmail(emailEl.value);
      const mensagem = String(textoEl.value || '').trim();
      const tipo = String(tipoEl.value || 'Pregunta');

      if(!email || !email.includes('@')){
        estadoEl.textContent = 'Ingresa un email válido para enviar tu mensaje.';
        return;
      }

      if(!mensagem){
        estadoEl.textContent = 'Escribe un mensaje.';
        return;
      }

      if(mensagem.length > 500){
        estadoEl.textContent = 'El mensaje debe tener hasta 500 caracteres.';
        return;
      }

      registrarMensagemProduto({
        produtoId: CONFIG.acessoEditor.produtoId,
        email,
        tipo,
        mensagem,
        at: Date.now()
      });

      estadoEl.textContent = 'Mensaje enviado con éxito.';
      formMsg.reset();
      if(contadorMsg) contadorMsg.textContent = '0/500';
      renderMensagensPainel();
    });
  }

}

/* ============================================================
   5) PANEL DE EDICIÓN — lógica de UI
   ============================================================ */
const panel = document.getElementById('panel-editor');
document.getElementById('abrir-editor').addEventListener('click', ()=>{
  if(!sessaoValida(sessaoEditor)) return;
  panel.classList.add('abierto');
  sincronizarPanelConConfig();
});
document.getElementById('cerrarPanel').addEventListener('click', ()=> panel.classList.remove('abierto'));

const modalLoginComprador = document.getElementById('modal-login-comprador');
const estadoLoginComprador = document.getElementById('login-estado');

function abrirModalLogin(){
  estadoLoginComprador.textContent = '';
  estadoLoginComprador.className = 'login-estado';
  modalLoginComprador.classList.add('aberto');
  modalLoginComprador.setAttribute('aria-hidden','false');
}

function fecharModalLogin(){
  modalLoginComprador.classList.remove('aberto');
  modalLoginComprador.setAttribute('aria-hidden','true');
}

document.getElementById('abrir-login-comprador').addEventListener('click', abrirModalLogin);
document.getElementById('cerrar-login-comprador').addEventListener('click', fecharModalLogin);
document.getElementById('sair-comprador').addEventListener('click', ()=>{
  encerrarSessaoEditor();
  carregarConfiguracaoPagina();
  renderPagina();
  fecharModalLogin();
});
modalLoginComprador.addEventListener('click', (e)=>{
  if(e.target === modalLoginComprador) fecharModalLogin();
});

document.getElementById('enviar-login-comprador').addEventListener('click', ()=>{
  const email = document.getElementById('login-email-comprador').value;
  const codigo = document.getElementById('login-codigo-comprador').value;
  if(!validarLoginComprador(email, codigo)){
    estadoLoginComprador.textContent = 'Acesso negado. Verifique email de compra e código.';
    estadoLoginComprador.className = 'login-estado erro';
    return;
  }
  salvarSessaoEditor(email);
  carregarConfiguracaoPagina();
  renderPagina();
  estadoLoginComprador.textContent = 'Acesso liberado para este produto.';
  estadoLoginComprador.className = 'login-estado ok';
  setTimeout(()=>{
    fecharModalLogin();
    panel.classList.add('abierto');
    sincronizarPanelConConfig();
  }, 350);
});

document.querySelectorAll('.panel-tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.panel-tab').forEach(t=>t.classList.remove('activa'));
    document.querySelectorAll('.panel-seccion').forEach(s=>s.classList.remove('activa'));
    tab.classList.add('activa');
    document.querySelector(`.panel-seccion[data-seccion="${tab.dataset.tab}"]`).classList.add('activa');
    if(tab.dataset.tab === 'mensajes'){
      renderMensagensPainel();
    }
  });
});

document.getElementById('atualizar-mensajes').addEventListener('click', ()=>{
  renderMensagensPainel();
});

document.getElementById('limpar-mensajes').addEventListener('click', ()=>{
  salvarMensagensProduto([]);
  renderMensagensPainel();
});

document.getElementById('salvar-configuracao').addEventListener('click', ()=>{
  salvarConfiguracaoPagina();
});

function sincronizarPanelConConfig(){
  document.getElementById('cfg-nombre').value = CONFIG.producto.nombre;
  document.getElementById('cfg-subtitulo').value = CONFIG.producto.subtitulo;
  document.getElementById('cfg-descripcion').value = CONFIG.producto.descripcion;
  document.getElementById('cfg-nicho').value = CONFIG.producto.nicho;
  document.getElementById('cfg-moneda').value = CONFIG.producto.moneda;
  document.getElementById('cfg-publico').value = CONFIG.producto.publico;
  document.getElementById('cfg-hero-badge').value = CONFIG.hero.badge;
  document.getElementById('cfg-hero-badge-texto').value = CONFIG.hero.badgeTexto;
  document.getElementById('cfg-btn-principal').value = CONFIG.botones.principal;
  document.getElementById('cfg-btn-secundario').value = CONFIG.botones.secundario;
  document.getElementById('cfg-btn-header').value = CONFIG.botones.header;
  document.getElementById('cfg-btn-flotante-texto').value = CONFIG.botones.flotanteTexto;
  document.getElementById('cfg-link-principal').value = CONFIG.comercial.linkPrincipal;
  document.getElementById('cfg-link-secundario').value = CONFIG.comercial.linkSecundario;
  document.getElementById('cfg-mostrar-secao-precos').value = CONFIG.comercial.mostrarSecaoPrecos === false ? '0' : '1';
  document.getElementById('cfg-mostrar-valores-precos').value = CONFIG.comercial.mostrarValoresPrecos === false ? '0' : '1';
  document.getElementById('cfg-precio-starter').value = CONTENIDO.planes[0].precio;
  document.getElementById('cfg-precio-pro').value = CONTENIDO.planes[1].precio;
  document.getElementById('cfg-precio-empresas').value = CONTENIDO.planes[2].precio;
  document.getElementById('cfg-hero-imagem').value = CONFIG.media.heroImagem;
  document.getElementById('cfg-primario').value = CONFIG.colores.primario;
  document.getElementById('cfg-secundario').value = CONFIG.colores.secundario;
  document.getElementById('cfg-tema').value = CONFIG.tema;
  document.getElementById('cfg-fuente').value = CONFIG.tipografia;
  document.getElementById('cfg-radio').value = CONFIG.radio;
  document.getElementById('cfg-espaciado').value = CONFIG.espaciado;
  renderEditorCaracteristicas();
  renderListaSecciones();
  renderMensagensPainel();
}

function renderEditorCaracteristicas(){
  const lista = document.getElementById('cfg-caracteristicas-lista');
  if(!lista) return;

  lista.innerHTML = CONTENIDO.caracteristicas.map((c, idx)=>`
    <div class="editor-item">
      <div class="indice">Caracteristica ${idx + 1}</div>
      <div class="campo">
        <label>Icone</label>
        <input type="text" data-idx="${idx}" data-campo="icono" value="${c.icono}">
      </div>
      <div class="campo">
        <label>Titulo</label>
        <input type="text" data-idx="${idx}" data-campo="titulo" value="${c.titulo}">
      </div>
      <div class="campo" style="margin-bottom:0;">
        <label>Descricao</label>
        <textarea data-idx="${idx}" data-campo="texto">${c.texto}</textarea>
      </div>
    </div>
  `).join('');

  const botaoRemover = document.getElementById('cfg-remover-caracteristica');
  if(botaoRemover){
    botaoRemover.disabled = CONTENIDO.caracteristicas.length <= 1;
  }
}

['cfg-nombre','cfg-subtitulo','cfg-descripcion','cfg-nicho','cfg-moneda','cfg-publico'].forEach(id=>{
  document.getElementById(id).addEventListener('input', (e)=>{
    const campo = id.replace('cfg-','');
    CONFIG.producto[campo] = e.target.value;
    renderPagina();
  });
});

document.getElementById('cfg-hero-badge').addEventListener('input', (e)=>{
  CONFIG.hero.badge = e.target.value;
  renderPagina();
});

document.getElementById('cfg-hero-badge-texto').addEventListener('input', (e)=>{
  CONFIG.hero.badgeTexto = e.target.value;
  renderPagina();
});

document.getElementById('cfg-btn-principal').addEventListener('input', (e)=>{
  CONFIG.botones.principal = e.target.value;
  renderPagina();
});

document.getElementById('cfg-btn-secundario').addEventListener('input', (e)=>{
  CONFIG.botones.secundario = e.target.value;
  renderPagina();
});

document.getElementById('cfg-btn-header').addEventListener('input', (e)=>{
  CONFIG.botones.header = e.target.value;
  renderPagina();
});

document.getElementById('cfg-btn-flotante-texto').addEventListener('input', (e)=>{
  CONFIG.botones.flotanteTexto = e.target.value;
  renderPagina();
});

document.getElementById('cfg-caracteristicas-lista').addEventListener('input', (e)=>{
  const alvo = e.target;
  const idx = Number(alvo.dataset.idx);
  const campo = alvo.dataset.campo;
  if(!Number.isInteger(idx) || idx < 0 || idx >= CONTENIDO.caracteristicas.length) return;
  if(!campo || !(campo in CONTENIDO.caracteristicas[idx])) return;
  CONTENIDO.caracteristicas[idx][campo] = alvo.value;
  renderPagina();
});

document.getElementById('cfg-add-caracteristica').addEventListener('click', ()=>{
  CONTENIDO.caracteristicas.push({
    icono:'📌',
    titulo:'Nueva caracteristica',
    texto:'Describe aqui el beneficio principal de esta caracteristica.'
  });
  renderEditorCaracteristicas();
  renderPagina();
});

document.getElementById('cfg-remover-caracteristica').addEventListener('click', ()=>{
  if(CONTENIDO.caracteristicas.length <= 1) return;
  CONTENIDO.caracteristicas.pop();
  renderEditorCaracteristicas();
  renderPagina();
});

document.getElementById('cfg-aplicar-pack-emojis').addEventListener('click', ()=>{
  const packBeneficios = ['⚙️','🧠','🔒','🔗','📊','🤝'];
  const packCaracteristicas = ['📋','🤖','📈','🔔','👥','🌐'];

  CONTENIDO.beneficios = CONTENIDO.beneficios.map((item, idx)=>(
    { ...item, icono: packBeneficios[idx % packBeneficios.length] }
  ));

  CONTENIDO.caracteristicas = CONTENIDO.caracteristicas.map((item, idx)=>(
    { ...item, icono: packCaracteristicas[idx % packCaracteristicas.length] }
  ));

  renderEditorCaracteristicas();
  renderPagina();
});

document.getElementById('cfg-link-principal').addEventListener('input', (e)=>{
  CONFIG.comercial.linkPrincipal = e.target.value;
  renderPagina();
});

document.getElementById('cfg-link-secundario').addEventListener('input', (e)=>{
  CONFIG.comercial.linkSecundario = e.target.value;
  renderPagina();
});

document.getElementById('cfg-mostrar-secao-precos').addEventListener('change', (e)=>{
  CONFIG.comercial.mostrarSecaoPrecos = e.target.value === '1';
  renderPagina();
});

document.getElementById('cfg-mostrar-valores-precos').addEventListener('change', (e)=>{
  CONFIG.comercial.mostrarValoresPrecos = e.target.value === '1';
  renderPagina();
});

document.getElementById('cfg-precio-starter').addEventListener('input', (e)=>{
  const v = Number(e.target.value);
  CONTENIDO.planes[0].precio = Number.isFinite(v) ? v : CONTENIDO.planes[0].precio;
  renderPagina();
});

document.getElementById('cfg-precio-pro').addEventListener('input', (e)=>{
  const v = Number(e.target.value);
  CONTENIDO.planes[1].precio = Number.isFinite(v) ? v : CONTENIDO.planes[1].precio;
  renderPagina();
});

document.getElementById('cfg-precio-empresas').addEventListener('input', (e)=>{
  const v = Number(e.target.value);
  CONTENIDO.planes[2].precio = Number.isFinite(v) ? v : CONTENIDO.planes[2].precio;
  renderPagina();
});

document.getElementById('cfg-hero-imagem').addEventListener('input', (e)=>{
  CONFIG.media.heroImagem = e.target.value || CONFIG.media.heroImagem;
  renderPagina();
});

document.getElementById('cfg-hero-upload').addEventListener('change', (e)=>{
  const arquivo = e.target.files && e.target.files[0];
  if(!arquivo) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    CONFIG.media.heroImagem = String(reader.result || '');
    document.getElementById('cfg-hero-imagem').value = CONFIG.media.heroImagem;
    renderPagina();
  };
  reader.readAsDataURL(arquivo);
});
document.getElementById('cfg-primario').addEventListener('input', e=>{ CONFIG.colores.primario = e.target.value; aplicarTokens(); });
document.getElementById('cfg-secundario').addEventListener('input', e=>{ CONFIG.colores.secundario = e.target.value; aplicarTokens(); });
document.getElementById('cfg-tema').addEventListener('change', e=>{ CONFIG.tema = e.target.value; aplicarTokens(); });
document.getElementById('cfg-fuente').addEventListener('change', e=>{ CONFIG.tipografia = e.target.value; aplicarTokens(); });
document.getElementById('cfg-radio').addEventListener('change', e=>{ CONFIG.radio = e.target.value; aplicarTokens(); });
document.getElementById('cfg-espaciado').addEventListener('change', e=>{ CONFIG.espaciado = e.target.value; aplicarTokens(); });

function renderListaSecciones(){
  const lista = document.getElementById('listaSecciones');
  lista.innerHTML = CONFIG.secciones.map((s,i)=>`
    <li data-idx="${i}">
      <div class="secao-edicao">
        <label>Seção</label>
        <input type="text" value="${s.nombre}" data-accion="nome" maxlength="60">
      </div>
      <div class="secao-edicao secao-exibir">
        <label>Exibir</label>
        <select data-accion="toggle">
          <option value="1" ${s.activo?'selected':''}>Sim</option>
          <option value="0" ${!s.activo?'selected':''}>Não</option>
        </select>
      </div>
      <div class="mover">
        <button data-accion="subir" ${i===0?'disabled':''}>▲</button>
        <button data-accion="bajar" ${i===CONFIG.secciones.length-1?'disabled':''}>▼</button>
      </div>
    </li>`).join("");

  lista.querySelectorAll('li').forEach(li=>{
    const idx = parseInt(li.dataset.idx);
    li.querySelector('[data-accion="nome"]').addEventListener('input', e=>{
      CONFIG.secciones[idx].nombre = e.target.value;
      renderPagina();
    });
    li.querySelector('[data-accion="toggle"]').addEventListener('change', e=>{
      CONFIG.secciones[idx].activo = e.target.value === '1';
      renderPagina();
    });
    const subir = li.querySelector('[data-accion="subir"]');
    const bajar = li.querySelector('[data-accion="bajar"]');
    if(subir) subir.addEventListener('click', ()=>{ moverSeccion(idx,-1); });
    if(bajar) bajar.addEventListener('click', ()=>{ moverSeccion(idx,1); });
  });
}
function moverSeccion(idx, dir){
  const nuevo = idx+dir;
  if(nuevo<0 || nuevo>=CONFIG.secciones.length) return;
  [CONFIG.secciones[idx], CONFIG.secciones[nuevo]] = [CONFIG.secciones[nuevo], CONFIG.secciones[idx]];
  renderPagina();
  renderListaSecciones();
}

/* ---- Exportar HTML personalizado ---- */
document.getElementById('exportarHTML').addEventListener('click', ()=>{
  const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
  const blob = new Blob([html], {type:'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (CONFIG.producto.nombre || 'pagina').toLowerCase().replace(/\s+/g,'-') + '-personalizada.html';
  a.click();
  URL.revokeObjectURL(url);
});

/* ---- Menú móvil simple ---- */
document.querySelector('.nav-toggle').addEventListener('click', ()=>{
  const nav = document.querySelector('.nav-links');
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
  if(nav.style.display==='flex'){
    nav.style.cssText += 'position:absolute;top:100%;left:0;right:0;flex-direction:column;background:var(--color-fondo-elev);padding:20px 24px;border-bottom:1px solid var(--color-borde);gap:16px;';
  }
});

/* ---- Inicio ---- */
restaurarSessaoEditor();
SNAPSHOT_PADRAO = obterSnapshotConfiguracao();
carregarConfiguracaoPagina();
aplicarVisibilidadeAcesso();
renderPagina();

