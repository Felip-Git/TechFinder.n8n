
const itens = $input.all();

// Domínios oficiais das lojas aceitas
const dominiosLojas = [
  { nome: 'amazon', dominio: 'amazon.com.br' },
  { nome: 'mercado livre', dominio: 'mercadolivre.com.br' },
  { nome: 'mercadolivre', dominio: 'mercadolivre.com.br' },
  { nome: 'kabum', dominio: 'kabum.com.br' },
  { nome: 'pichau', dominio: 'pichau.com.br' },
  { nome: 'terabyte', dominio: 'terabyteshop.com.br' },
  { nome: 'magalu', dominio: 'magazineluiza.com.br' },
  { nome: 'magazine luiza', dominio: 'magazineluiza.com.br' },
  { nome: 'patoloco', dominio: 'patoloco.com.br' },
  { nome: 'gk infostore', dominio: 'gkinfostore.com.br' },
  { nome: 'waz', dominio: 'waz.com.br' },
  { nome: 'login informatica', dominio: 'login.com.br' },
  { nome: 'guerra digital', dominio: 'gueradigital.com.br' },
  { nome: 'oficina dos bits', dominio: 'oficinadosbits.com.br' },
  { nome: 'chipart', dominio: 'chipart.com.br' },
  { nome: 'casas bahia', dominio: 'casasbahia.com.br' },
  { nome: 'fast shop', dominio: 'fastshop.com.br' }
];

// Normaliza textos
function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Identifica o domínio esperado pela loja
function identificarDominio(loja) {
  const nome = normalizar(loja);

  const correspondencia = dominiosLojas.find(item =>
    nome.includes(normalizar(item.nome))
  );

  return correspondencia ? correspondencia.dominio : null;
}

// Extrai características importantes do produto
function extrairCaracteristicas(titulo) {
  const texto = normalizar(titulo);

  const modelo = texto.match(/\brtx\s*(\d{4})\b/);
  const memoria = texto.match(/\b(8|12|16|24|32)\s*gb\b/);

  return {
    modelo: modelo ? modelo[1] : null,
    memoria: memoria ? memoria[1] : null,
    ti: /\bti\b/.test(texto),
    super: /\bsuper\b/.test(texto)
  };
}

// Analisa o endereço sem depender de new URL()
function analisarLink(link) {
  const linkLimpo = String(link || '').trim();

  const partes = linkLimpo.match(
    /^https?:\/\/([^/:?#]+)(?::\d+)?(\/[^?#]*)?/i
  );

  if (!partes) {
    return null;
  }

  return {
    dominio: partes[1].toLowerCase(),
    caminho: partes[2] || ''
  };
}

// Lista de marcas conhecidas
const marcas = [
  'peladn',
  'pcyes',
  'galax',
  'msi',
  'asus',
  'gigabyte',
  'zotac',
  'gainward',
  'palit',
  'loongscale',
  'inno3d',
  'pny',
  'sapphire',
  'xfx',
  'powercolor'
];

// Valida se o resultado corresponde à oferta original
function validarResultado(oferta, resultado, dominioEsperado) {
  if (!resultado || !resultado.link || !dominioEsperado) {
    return false;
  }

  const linkAnalisado = analisarLink(resultado.link);

  if (!linkAnalisado) {
    return false;
  }

  const dominioEncontrado = linkAnalisado.dominio;
  const caminho = linkAnalisado.caminho;

  // Confere o domínio da loja
  if (
    dominioEncontrado !== dominioEsperado &&
    !dominioEncontrado.endsWith('.' + dominioEsperado)
  ) {
    return false;
  }

  // Aceita somente páginas de produto
  if (!/\/dp\/|\/p\//i.test(caminho)) {
    return false;
  }

  const original = extrairCaracteristicas(oferta.titulo);

  const encontrado = extrairCaracteristicas(
    resultado.title + ' ' + (resultado.snippet || '')
  );

  // Exige o mesmo modelo RTX
  if (!original.modelo || original.modelo !== encontrado.modelo) {
    return false;
  }

  // Exige a mesma memória quando identificada
  if (
    original.memoria &&
    original.memoria !== encontrado.memoria
  ) {
    return false;
  }

  // Confere Ti e Super
  if (original.ti !== encontrado.ti) {
    return false;
  }

  if (original.super !== encontrado.super) {
    return false;
  }

  // Confere a marca quando identificada na oferta
  const textoOriginal = normalizar(oferta.titulo);

  const textoEncontrado = normalizar(
    resultado.title + ' ' + (resultado.snippet || '')
  );

  const marcaOriginal = marcas.find(marca =>
    textoOriginal.includes(marca)
  );

  if (
    marcaOriginal &&
    !textoEncontrado.includes(marcaOriginal)
  ) {
    return false;
  }

  return true;
}

// Processa cada oferta
return itens.map(item => {
  const oferta = item.json;

  const dominioEsperado = identificarDominio(oferta.loja);

  const resultados = Array.isArray(oferta.organic)
    ? oferta.organic
    : [];

  // Procura o primeiro resultado que passe em todas as validações
  const resultadoValido = resultados.find(resultado =>
    validarResultado(oferta, resultado, dominioEsperado)
  );

  return {
    json: {
      ...oferta,

      linkDireto: resultadoValido
        ? resultadoValido.link
        : null,

      tituloLinkValidado: resultadoValido
        ? resultadoValido.title
        : null,

      tipoLinkFinal: resultadoValido
        ? 'Link direto validado'
        : 'Link do Google Shopping',

      linkFinal: resultadoValido
        ? resultadoValido.link
        : oferta.link,

      validacaoLink: resultadoValido
        ? 'Correspondência encontrada'
        : 'Nenhuma correspondência confiável encontrada',

      dominioEsperado
    }
  };
});
