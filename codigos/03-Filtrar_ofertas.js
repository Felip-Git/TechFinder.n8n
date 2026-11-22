
const resposta = $input.first().json;

// Recupera o que o usuário pesquisou no formulário
const pesquisa = $('01 - Receber Pesquisa').first().json.produto || '';

// Lojas e marketplaces aceitos
const lojasPermitidas = [
  'net computadores',
  'kabum',
  'amazon.com.br',
  'amazon',
  'mercado livre',
  'mercadolivre',
  'magalu',
  'magazine luiza',
  'pichau',
  'terabyte',
  'terabyte shop',
  'patoloco',
  'gk infostore',
  'waz',
  'login informática',
  'login informatica',
  'guerra digital',
  'oficina dos bits',
  'chipart',
  'casas bahia',
  'fast shop'
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

// Normaliza a pesquisa e o título dos produtos
function normalizarModelo(texto) {
  return normalizar(texto)
    .replace(/\brtx\s*(\d{4})\b/g, 'rtx $1')
    .replace(/\b(\d+)\s*gb\b/g, '$1gb');
}

const pesquisaNormalizada = normalizarModelo(pesquisa);

// Identifica o número do modelo pesquisado
const modeloPesquisa = pesquisaNormalizada.match(/\brtx\s*(\d{4})\b/);

// Identifica variantes solicitadas
const pesquisaTi = /\bti\b/.test(pesquisaNormalizada);
const pesquisaSuper = /\bsuper\b/.test(pesquisaNormalizada);

// Identifica a memória solicitada, se houver
const memoriaPesquisa = pesquisaNormalizada.match(/\b(\d+)gb\b/);

// Produtos retornados pelo Serper
const produtos = resposta.shopping || [];

// Organiza os dados e converte os preços
const ofertas = produtos.map(produto => {
  const precoTexto = produto.price || '';
  const tituloOriginal = produto.title || '';

  // Procura possíveis códigos de fabricante no título
  const codigosEncontrados = tituloOriginal.match(
    /[A-Z0-9-]{8,25}/gi
  ) || [];

  // Mantém somente sequências que tenham letras e números
  const codigosValidos = codigosEncontrados.filter(codigo => {
    const temLetra = /[A-Z]/i.test(codigo);
    const temNumero = /[0-9]/.test(codigo);

    return temLetra && temNumero;
  });

  // Seleciona o último código encontrado
  const codigoModelo = codigosValidos.length > 0
    ? codigosValidos[codigosValidos.length - 1].toUpperCase()
    : null;

  // Converte o preço para número
  const correspondencia = precoTexto.match(/[\d.]+,\d{2}/);

  let precoNumerico = null;

  if (correspondencia) {
    precoNumerico = Number(
      correspondencia[0]
        .replace(/\./g, '')
        .replace(',', '.')
    );
  }

  // Identifica o tipo de link
  const link = produto.link || '';

  let tipoLink = 'Sem link disponível';

  if (link.includes('google.com/search?ibp=oshop')) {
    tipoLink = 'Google Shopping';
  } else if (link) {
    tipoLink = 'Link direto';
  }

  return {
    titulo: produto.title || 'Produto sem nome',
    loja: produto.source || 'Loja não informada',
    preco: precoTexto,
    precoNumerico,
    link,
    tipoLink,
    codigoModelo,
    imagem: produto.imageUrl || ''
  };
});

// Mantém somente lojas permitidas
const ofertasBrasileiras = ofertas.filter(produto => {
  const loja = normalizar(produto.loja);

  return lojasPermitidas.some(nome =>
    loja.includes(normalizar(nome))
  );
});

// Filtra os modelos para corresponder à pesquisa
const ofertasRelevantes = ofertasBrasileiras.filter(produto => {
  const titulo = normalizarModelo(produto.titulo);

  // Exclui computadores e equipamentos completos
  const termosEquipamentoCompleto = [
    'computador',
    'pc gamer',
    'pc completo',
    'computador gamer',
    'notebook',
    'laptop',
    'desktop',
    'cpu gamer',
    'cpu intel',
    'cpu amd',
    'gabinete gamer',
    'setup gamer',
    'kit gamer',
    'ryzen 5',
    'ryzen 7',
    'ryzen 9',
    'intel core i3',
    'intel core i5',
    'intel core i7',
    'intel core i9',
    'processador'
  ];

  const equipamentoCompleto = termosEquipamentoCompleto.some(
    termo => titulo.includes(termo)
  );

  if (equipamentoCompleto) {
    return false;
  }

  // Confere o número exato do modelo
  if (modeloPesquisa) {
    const numeroModelo = modeloPesquisa[1];
    const regexModelo = new RegExp(`\\brtx\\s*${numeroModelo}\\b`);

    if (!regexModelo.test(titulo)) {
      return false;
    }
  }

  // Se a pesquisa não pediu Ti, exclui produtos Ti
  const produtoTi = /\bti\b/.test(titulo);

  if (produtoTi !== pesquisaTi) {
    return false;
  }

  // Se a pesquisa não pediu Super, exclui produtos Super
  const produtoSuper = /\bsuper\b/.test(titulo);

  if (produtoSuper !== pesquisaSuper) {
    return false;
  }

  // Se a pesquisa informou memória, exige essa memória no título
  if (memoriaPesquisa) {
    const memoriaProduto = new RegExp(
      `\\b${memoriaPesquisa[1]}gb\\b`
    );

    if (!memoriaProduto.test(titulo)) {
      return false;
    }
  }

  return true;
});

// Remove ofertas sem preço
const ofertasComPreco = ofertasRelevantes.filter(
  produto => produto.precoNumerico !== null
);

// Remove duplicações da mesma oferta
const ofertasSemDuplicatas = ofertasComPreco.filter(
  (produto, indice, lista) =>
    lista.findIndex(outro =>
      normalizar(outro.titulo) === normalizar(produto.titulo) &&
      normalizar(outro.loja) === normalizar(produto.loja) &&
      outro.precoNumerico === produto.precoNumerico
    ) === indice
);

// Ordena do menor para o maior preço
const ofertasOrdenadas = ofertasSemDuplicatas.sort(
  (a, b) => a.precoNumerico - b.precoNumerico
);

// Adiciona a posição no ranking final
return ofertasOrdenadas.map((oferta, indice) => ({
  json: {
    posicao: indice + 1,
    ...oferta
  }
}));