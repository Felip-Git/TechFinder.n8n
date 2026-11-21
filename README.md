# TechFinder — Comparador de Preços de Tecnologia

Automação desenvolvida no **n8n** para pesquisar, organizar e comparar ofertas de produtos de tecnologia em diferentes lojas.

## Sobre o projeto

Pesquisar preços de produtos em diversas lojas pode ser demorado. É necessário repetir buscas, analisar resultados, comparar valores e verificar se os links correspondem ao produto desejado.

O **TechFinder** foi desenvolvido para simplificar esse processo, automatizando a pesquisa e apresentando as ofertas em uma única interface.

## Como funciona?

1. O usuário informa o produto desejado em um formulário.
2. O n8n envia a pesquisa para a API Serper.
3. O Google Shopping retorna ofertas disponíveis.
4. Um código JavaScript organiza, filtra e ordena os resultados.
5. Uma nova pesquisa procura páginas dos produtos nos domínios das lojas.
6. O fluxo valida os links encontrados, verificando características como modelo, memória, marca e variantes.
7. Os resultados são apresentados em uma página personalizada.

## Tecnologias utilizadas

- **n8n:** construção e execução da automação.
- **Serper API:** pesquisa de produtos no Google Shopping e Google Search.
- **JavaScript:** tratamento, filtragem e validação dos dados.
- **HTML e CSS:** interface visual dos resultados.

## Funcionalidades

- Pesquisa de produtos de tecnologia.
- Consulta de ofertas no Google Shopping.
- Filtragem de lojas e produtos.
- Organização de ofertas por preço.
- Validação de links de produtos.
- Interface personalizada para apresentação dos resultados.

## Estrutura do projeto

```text
techfinder/
├── README.md
├── workflow/
│   └── techfinder-workflow.json
├── docs/
│   └── Documentacao_TechFinder.docx
└── evidencias/
    ├── 01-formulario.png
    ├── 02-workflow-completo.png
    ├── 03-execucao-n8n.png
    └── 04-resultados.png
```

## Como utilizar

1. Importe o arquivo `techfinder-workflow.json` no n8n.
2. Configure sua própria credencial da API Serper.
3. Verifique as configurações dos nós HTTP Request.
4. Salve e execute o workflow.
5. Utilize o formulário para pesquisar um produto.

**Importante:** a API Serper exige uma chave própria. Ela não deve ser publicada no repositório.

Os preços e a disponibilidade das ofertas podem mudar. Sempre confirme as condições diretamente na loja.

## Documentação

A documentação descritiva está disponível na pasta `docs/`, com explicações sobre o problema, a solução, a lógica da automação, as tecnologias e os testes.

## Evidências

As capturas de tela do formulário, do workflow e dos resultados estão disponíveis na pasta `evidencias/`.

---

**Projeto TechFinder**  
Automação de pesquisa e comparação de preços com n8n.