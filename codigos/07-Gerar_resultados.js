const itens = $input.all();

// Escapa caracteres especiais para evitar problemas no HTML
function escaparHTML(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Converte o preço para número
function obterPrecoNumerico(oferta) {
  if (typeof oferta.precoNumerico === 'number') {
    return oferta.precoNumerico;
  }

  const texto = String(oferta.preco || '');
  const encontrado = texto.match(/[\d.]+,\d{2}/);

  if (!encontrado) return null;

  return Number(
    encontrado[0]
      .replace(/\./g, '')
      .replace(',', '.')
  );
}

// Formata o preço em reais
function formatarPreco(oferta) {
  const valor = obterPrecoNumerico(oferta);

  if (valor !== null && Number.isFinite(valor)) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  return oferta.preco || 'Preço não informado';
}

// Descobre a oferta mais barata
const precos = itens
  .map(item => obterPrecoNumerico(item.json))
  .filter(valor => valor !== null && Number.isFinite(valor));

const menorPreco = precos.length
  ? Math.min(...precos)
  : null;

// Monta os cartões dos produtos
const cartoes = itens.map((item, indice) => {
  const oferta = item.json;

  const titulo = escaparHTML(oferta.titulo || 'Produto sem título');
  const loja = escaparHTML(oferta.loja || 'Loja não informada');
  const preco = escaparHTML(formatarPreco(oferta));
  const valorNumerico = obterPrecoNumerico(oferta);

  // Procura a imagem do produto
  const imagemOriginal = oferta.imagem || oferta.imageUrl || '';
  const imagem = /^https?:\/\/[^\s"'<>]+$/i.test(String(imagemOriginal))
    ? escaparHTML(imagemOriginal)
    : '';

  // Valida o link de acesso
  const linkOriginal = String(oferta.linkFinal || '').trim();
  const linkSeguro = /^https?:\/\/[^\s"'<>]+$/i.test(linkOriginal)
    ? escaparHTML(linkOriginal)
    : '';

  const tipoLink = escaparHTML(
    oferta.tipoLinkFinal || 'Link de acesso'
  );

  const maisBarato =
    menorPreco !== null &&
    valorNumerico !== null &&
    valorNumerico === menorPreco;

  return `
    <article class="produto">

      <div class="produto-topo">
        <span class="numero">OFERTA ${indice + 1}</span>
        ${
          maisBarato
            ? '<span class="selo">MENOR PREÇO</span>'
            : ''
        }
      </div>

      <div class="imagem-container">
        ${
          imagem
            ? `<img
                class="imagem-produto"
                src="${imagem}"
                alt="${titulo}"
                loading="lazy"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
              >
              <div class="imagem-fallback" style="display:none;">
                <span>Imagem indisponível</span>
              </div>`
            : `<div class="imagem-fallback">
                <span>Imagem indisponível</span>
              </div>`
        }
      </div>

      <div class="produto-info">
        <h2>${titulo}</h2>

        <p class="loja">
          <span class="icone-loja">▣</span>
          ${loja}
        </p>

        <div class="preco-container">
          <span class="preco-legenda">Preço anunciado</span>
          <p class="preco">${preco}</p>
        </div>

        <div class="rodape-card">
          <span class="tipo-link">${tipoLink}</span>

          ${
            linkSeguro
              ? `<a
                  class="botao"
                  href="${linkSeguro}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver oferta <span>↗</span>
                </a>`
              : `<span class="botao-indisponivel">
                  Link indisponível
                </span>`
          }
        </div>
      </div>

    </article>
  `;
}).join('');

// Resumo da pesquisa
const resumoMenorPreco = menorPreco !== null
  ? menorPreco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  : 'Não disponível';

// Página HTML
const html = `
<!DOCTYPE html>
<html lang="pt-BR">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>TechFinder | Resultados</title>

<style>
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    background: #f5f7fc;
    font-family: Arial, Helvetica, sans-serif;
    color: #172033;
  }

  .pagina {
    min-height: 100vh;
  }

  /* CABEÇALHO */

  .cabecalho {
    background: linear-gradient(120deg, #102b63, #1746a2, #2563eb);
    padding: 32px 24px 42px;
    color: white;
  }

  .cabecalho-conteudo {
    max-width: 1180px;
    margin: auto;
  }

  .marca {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 34px;
  }

  .logo {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: rgba(255,255,255,0.16);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 23px;
    font-weight: bold;
  }

  .marca h1 {
    margin: 0;
    font-size: 25px;
    letter-spacing: -0.7px;
  }

  .marca span {
    display: block;
    font-size: 11px;
    color: #c8d8ff;
    margin-top: 3px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .titulo-pagina {
    margin: 0;
    font-size: 30px;
    letter-spacing: -0.8px;
  }

  .subtitulo {
    margin: 10px 0 0;
    color: #dbe7ff;
    font-size: 15px;
  }

  /* CONTEÚDO */

  .conteudo {
    max-width: 1180px;
    margin: -20px auto 0;
    padding: 0 24px 50px;
    position: relative;
  }

  /* RESUMO */

  .resumo {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 30px;
  }

  .resumo-card {
    background: white;
    border: 1px solid #e6eaf2;
    border-radius: 13px;
    padding: 19px 22px;
    box-shadow: 0 5px 18px rgba(20, 40, 80, 0.06);
  }

  .resumo-label {
    color: #718096;
    font-size: 13px;
    margin-bottom: 8px;
  }

  .resumo-valor {
    color: #183b80;
    font-size: 23px;
    font-weight: 700;
  }

  .resumo-card.destaque .resumo-valor {
    color: #07834d;
  }

  /* LISTA DE PRODUTOS */

  .secao-titulo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }

  .secao-titulo h2 {
    margin: 0;
    font-size: 20px;
    color: #1c2c48;
  }

  .ordenacao {
    color: #718096;
    font-size: 12px;
  }

  .produtos {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }

  /* CARTÃO */

  .produto {
    background: white;
    border: 1px solid #e5eaf3;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 5px 18px rgba(25, 45, 85, 0.045);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .produto:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 26px rgba(25, 45, 85, 0.10);
  }

  .produto-topo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 17px 0;
    min-height: 35px;
  }

  .numero {
    color: #718096;
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 1px;
  }

  .selo {
    color: #087a49;
    background: #e6f7ee;
    padding: 6px 9px;
    border-radius: 20px;
    font-size: 9px;
    font-weight: bold;
    letter-spacing: 0.5px;
  }

  /* IMAGEM */

  .imagem-container {
    height: 175px;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }

  .imagem-produto {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .imagem-fallback {
    width: 100%;
    height: 100%;
    background: #f3f6fb;
    border: 1px dashed #d5deed;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 12px;
  }

  /* INFORMAÇÕES */

  .produto-info {
    padding: 17px 19px 20px;
    border-top: 1px solid #f0f2f7;
  }

  .produto h2 {
    font-size: 15px;
    line-height: 1.5;
    font-weight: 700;
    color: #202e45;
    margin: 0 0 13px;
    min-height: 67px;
  }

  .loja {
    color: #718096;
    font-size: 12px;
    margin: 0 0 18px;
  }

  .icone-loja {
    color: #2563eb;
    margin-right: 5px;
  }

  .preco-container {
    border-top: 1px solid #edf0f5;
    padding-top: 14px;
  }

  .preco-legenda {
    color: #8a96a9;
    font-size: 11px;
  }

  .preco {
    color: #07834d;
    font-size: 25px;
    font-weight: 800;
    letter-spacing: -0.7px;
    margin: 5px 0 16px;
  }

  .rodape-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .tipo-link {
    color: #718096;
    font-size: 11px;
  }

  .botao {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    background: #2563eb;
    color: white;
    text-decoration: none;
    font-size: 13px;
    font-weight: bold;
    transition: background 0.2s ease;
  }

  .botao:hover {
    background: #1746b5;
  }

  .botao-indisponivel {
    display: block;
    text-align: center;
    padding: 12px;
    border-radius: 8px;
    background: #f1f3f7;
    color: #8a96a9;
    font-size: 12px;
  }

  /* RODAPÉ */

  .rodape {
    max-width: 1180px;
    margin: 0 auto;
    padding: 20px 24px 30px;
    border-top: 1px solid #e4e9f1;
    color: #8995a8;
    font-size: 11px;
    text-align: center;
  }

  /* RESPONSIVIDADE */

  @media (max-width: 900px) {
    .produtos {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 580px) {
    .cabecalho {
      padding: 25px 18px 38px;
    }

    .titulo-pagina {
      font-size: 24px;
    }

    .conteudo {
      padding: 0 14px 35px;
    }

    .resumo {
      gap: 10px;
    }

    .resumo-card {
      padding: 15px;
    }

    .resumo-valor {
      font-size: 18px;
    }

    .produtos {
      grid-template-columns: 1fr;
    }

    .imagem-container {
      height: 190px;
    }

    .produto h2 {
      min-height: auto;
    }
  }
</style>
</head>

<body>

<div class="pagina">

  <header class="cabecalho">
    <div class="cabecalho-conteudo">

      <div class="marca">
        <div class="logo">T</div>
        <div>
          <h1>TechFinder</h1>
          <span>Compare. Encontre. Economize.</span>
        </div>
      </div>

      <h2 class="titulo-pagina">
        Resultados da sua pesquisa
      </h2>

      <p class="subtitulo">
        Encontramos ofertas para você comparar.
      </p>

    </div>
  </header>

  <main class="conteudo">

    <section class="resumo">

      <div class="resumo-card">
        <div class="resumo-label">Ofertas encontradas</div>
        <div class="resumo-valor">${itens.length}</div>
      </div>

      <div class="resumo-card destaque">
        <div class="resumo-label">Menor preço encontrado</div>
        <div class="resumo-valor">${resumoMenorPreco}</div>
      </div>

    </section>

    <section>

      <div class="secao-titulo">
        <h2>Ofertas disponíveis</h2>
        <span class="ordenacao">Compare as opções</span>
      </div>

      <div class="produtos">

        ${
          cartoes ||
          '<p>Nenhuma oferta foi encontrada para sua pesquisa.</p>'
        }

      </div>

    </section>

  </main>

  <footer class="rodape">
    TechFinder © 2026 — Pesquisa e comparação de preços.
    Preços e condições podem mudar. Confira os detalhes na loja.
  </footer>

</div>

</body>
</html>
`;

return [
  {
    json: {
      html,
      totalOfertas: itens.length
    }
  }
];