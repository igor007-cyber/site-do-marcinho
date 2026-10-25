# Corra Sem Limites — Front-end HTML, Tailwind CSS e JavaScript

Recriação independente da **estrutura funcional** de [corrasemlimites.com](https://corrasemlimites.com), feita em HTML5 sem frameworks JavaScript de interface. Implementa 14 seções no corpo (hero, perguntas, história, problema, método, transição visual, origem, módulos, depoimentos, oferta, garantia, comparação, FAQ e chamada final), além da faixa de anúncio, cabeçalho e rodapé e adaptações para mobile, tablet, notebook e desktop.

## Como executar

1. Descompacte o ZIP, preservando as pastas.
2. Abra `index.html` no navegador, **ou** execute um servidor local na pasta do projeto:

   ```bash
   python3 -m http.server 8080
   ```

3. Abra [http://localhost:8080](http://localhost:8080).

Não há etapa de build. A página funciona sem Node.js e sem backend.

## Estrutura

```
index.html
assets/
  css/styles.css
  js/main.js
  icons/favicon.svg
  images/corrida-prova-hidratacao.jpg
  images/corrida-dupla-calcadao.jpg
  images/treinador-praia.jpg
  images/treino-coletivo-praia.jpg
  images/treino-futebol.jpg
  images/conquista-trofeu.jpg
  images/runner-fallback.svg
  images/coach-placeholder.svg
README.md
```

## Tecnologias

- **HTML5** semântico.
- **Tailwind CSS** por CDN; CSS autoral cuida das seções, responsividade e detalhes visuais. A página continua estilizada sem acesso ao CDN.
- **JavaScript puro**: navegação mobile, progresso de leitura, âncoras, FAQ acessível, carrossel, contador e voltar ao topo.
- **GSAP e ScrollTrigger**, por CDN, com parallax, reveal e animações progressivas. Se o CDN estiver indisponível, o site mantém as principais revelações via IntersectionObserver.
- Fontes **Barlow Condensed** e **DM Sans**, com alternativas locais quando offline.

## Navegação e interações testáveis

- A barra do topo liga à seção de oferta.
- A navegação do desktop usa âncoras internas reais.
- O menu mobile abre/fecha com mouse e teclado (Escape), e fecha ao navegar.
- O slider suporta setas, teclado e arrastar/deslizar.
- O FAQ abre uma resposta por vez; estrutura acessível com `aria-expanded`, `aria-controls` e `role=region`.
- Botões de compra externos apontam para o checkout Hotmart encontrado no site de referência.
- O botão flutuante volta ao início; a linha do topo mostra o progresso na página.
- `prefers-reduced-motion` respeitado em CSS e JS.

## Fidelidade e direitos de uso

A sequência e a função das seções foram identificadas a partir da página pública. Não foi possível extrair o CSS original nem screenshots responsivos da referência: esta recriação **não é pixel-perfect** e não reproduz os arquivos visuais originais.

### Fotografias fornecidas para esta atualização

As **seis fotos enviadas pelo usuário** foram adicionadas aos arquivos locais em `assets/images/` e integradas nas seguintes partes da página:

- `corrida-prova-hidratacao.jpg`: imagem principal do hero (corredor em prova).
- `treinador-praia.jpg`: seção da história do treinador.
- `corrida-dupla-calcadao.jpg`: banner panorâmico entre método e origem.
- `treino-coletivo-praia.jpg`: galeria editorial no fim da origem.
- `treino-futebol.jpg`: destaque visual da seção de módulos.
- `conquista-trofeu.jpg`: momento editorial anterior aos depoimentos.

Não há dependência de fotos externas: os seis arquivos originais JPEG estão incluídos e são carregados localmente. A CSS aplica apenas enquadramento, gradientes e transições de escala não destrutivas; os arquivos JPEG originais não foram alterados.

**Uso de imagens:** fotos fornecidas no chat são usadas no protótipo conforme solicitação. O responsável pela publicação deve assegurar que possui os direitos e permissões necessários. A imagem do troféu é apresentada como registro do ambiente esportivo, sem sugerir que a conquista foi resultado do curso.

Há dois pequenos excertos de depoimentos encontrados na página pública; os demais cards são **exemplos explicitamente identificados** e devem ser substituídos por depoimentos com autorização dos titulares antes de publicação.

### Atenção ao checkout (verificado em 22 de outubro de 2026)

O site de referência anuncia **R$ 49,90**, mas o link do checkout da Hotmart consultado apresentou **R$ 69,90 à vista**. A página implementada exibe o preço como *valor anunciado na landing page* e informa que o checkout prevalece. Antes de publicar comercialmente, atualize o valor, confirme a oferta real e obtenha autorização do proprietário para uso de marcas, fotos e declarações.

O projeto é uma demonstração front-end: não processa pagamentos nem armazena dados pessoais. O checkout pertence à Hotmart.

## Personalização

- Paleta de cores: variáveis `:root` em `assets/css/styles.css`.
- Textos e conteúdo: `index.html`.
- Animações e velocidades: `assets/js/main.js`.
- Fotografias: substitua os arquivos `assets/images/*.jpg` preservando seus nomes ou ajuste o `src` de cada imagem no HTML.
- Checkout: atualize a URL de todos os CTAs externos, se for o responsável autorizado.
