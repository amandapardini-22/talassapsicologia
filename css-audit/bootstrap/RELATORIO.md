# Bootstrap Talassa — candidato para revisão

O Bootstrap atual **não foi substituído**. O candidato foi gerado exclusivamente pelo SCSS, sem apagar blocos do CSS compilado, sem PurgeCSS e sem alterar HTML, CSS próprio, Critical CSS inline, JavaScript, imagens ou dependências.

## Tamanhos

| Medida | Atual | Candidato | Economia |
|---|---:|---:|---:|
| Bytes sem compressão | 119.715 | 18.976 | 100.739 bytes — **84,15%** |
| KiB sem compressão | 116,91 | 18,53 | 98,38 KiB |
| Gzip local | 13.802 | 3.346 | 10.456 bytes — **75,76%** |
| Regras de estilo | 1.688 | 186 | 1.502 — **88,98%** |

Contagem de regras pelo CSSOM do Chrome, incluindo regras dentro de media queries e excluindo os wrappers. Uma lista agrupada de seletores conta como uma regra. Gzip calculado com `zlib.gzipSync` do Node, nas mesmas condições para os dois arquivos. Não representa necessariamente os bytes transferidos pelo servidor nem a métrica de CSS ocioso do PageSpeed. Evidência: `metrics.json`.

## Escopo e classes utilizadas

Foram analisados integralmente `index.html`, seu inline, `styles.css`, `script.js`, o inventário anterior, o SCSS do projeto e os arquivos SCSS do Bootstrap 5.3.8 instalado. A busca de páginas e templates do projeto identificou apenas `index.html`; cópias de auditoria não são páginas de produção. GSAP e ScrollTrigger são locais; o código do site não configura pin nem gera templates Bootstrap.

O JavaScript adiciona/remove somente `.open` e `.scrolled`, que pertencem ao CSS próprio. Também atualiza atributos ARIA, IDs e estilos inline. Não introduz utilities Bootstrap. Há 26 classes Bootstrap necessárias, preservadas:

```text
container row
col col-6 col-12 col-md-6 col-lg col-lg-auto col-lg-3 col-xl-3
d-block d-flex d-xl-none
flex-column flex-shrink-0 flex-wrap flex-xl-row flex-xl-grow-1
justify-content-center justify-content-between
align-items-start align-items-center align-items-stretch align-items-xl-center
w-100 h-100
```

O inventário também registra o token `.bi`, dos SVGs inline. O CSS Bootstrap só o estiliza como descendente de `.icon-link`, inexistente no site. Não há regra independente `.bi` necessária no build auditado. Portanto, remover o helper `icon-link` não remove o desenho dos ícones. Nomes como `.btn`, `.btn-primary` e `.accordion` pertencem aqui à implementação própria; os componentes Bootstrap correspondentes não eram importados.

`inventory.json` contém classes do DOM, as 186 regras preservadas e todas as 1.502 regras removidas, com seletores, declarações e contextos. As regras do candidato são textualmente idênticas às correspondentes do original após normalização pelo navegador e mantêm a ordem relativa.

## Utilities: geração exata

| Família | Valores básicos necessários | Variantes responsivas necessárias | Decisão |
|---|---|---|---|
| Display | `block`, `flex` | `xl: none` | Apenas `.d-block`, `.d-flex`, `.d-xl-none` |
| Flex shorthand (`flex-fill`) | Nenhum | Nenhuma | Não gerar |
| Flex direction | `column` | `xl: row` | Duas classes |
| Flex grow | Nenhum | `xl: grow-1` | Apenas `.flex-xl-grow-1` |
| Flex shrink | `shrink-0` | Nenhuma | Apenas `.flex-shrink-0` |
| Flex wrap | `wrap` | Nenhuma | Apenas `.flex-wrap` |
| Justify content | `center`, `between` | Nenhuma | Duas classes |
| Align items | `start`, `center`, `stretch` | `xl: center` | Quatro classes |
| Align content / align self | Nenhum | Nenhuma | Não gerar |
| Order | Nenhum | Nenhuma | Não gerar |
| Margin: m/mt/mb/ms/me/mx/my | Nenhum | Nenhuma | Não gerar |
| Padding: p/pt/pb/ps/pe/px/py | Nenhum | Nenhuma | Não gerar |
| Gap / row-gap / column-gap | Nenhum | Nenhuma | Não gerar |
| Width | `100` | Nenhuma | Apenas `.w-100` |
| Height | `100` | Nenhuma | Apenas `.h-100` |
| Outras sizing utilities | Nenhum | Nenhuma | Não gerar |
| Position / top / bottom / start / end / translate | Nenhum | Nenhuma | Não gerar |
| Visibility | Nenhum | Nenhuma | Não gerar |
| Overflow / overflow-x / overflow-y | Nenhum | Nenhuma | Não gerar |
| Text, fontes, alinhamento de texto, cores | Nenhum | Nenhuma | Não gerar |
| Float, object-fit, opacity, shadow, borders, rounded, background, links, z-index, interações | Nenhum | Nenhuma | Não gerar |
| Print utilities | Nenhum | Nenhuma | Não gerar |

São **12 utilities básicas e quatro em xl**, sem variantes sm/md/lg/xxl nem classes exclusivas de impressão. Isso não remove as propriedades equivalentes definidas em `styles.css` ou estruturalmente pelo grid.

`_bootstrap-talassa-utilities.scss` seleciona valores do mapa original, sem reescrever suas propriedades ou valores. Substitui `$utilities` antes de importar `utilities/api`, com `responsive: false` e `print: false`. Para as quatro variantes xl, usa `media-breakpoint-up`, `breakpoint-infix` e `generate-utility` do próprio Bootstrap. O booleano `responsive: true` da API normal geraria toda a matriz; por isso o gerador é chamado apenas em xl. As chaves selecionadas são verificadas na compilação, com erro para famílias/valores desconhecidos. Referência: [API oficial de utilities](https://getbootstrap.com/docs/5.3/utilities/api/) e implementação instalada em `node_modules/bootstrap/scss/utilities/_api.scss` e `mixins/_utilities.scss`.

## Grid e containers

O candidato continua importando os módulos oficiais `containers` e `grid`. Nenhum layout foi convertido em CSS manual, e nenhum mixin do grid foi sobrescrito.

- `$grid-row-columns: 0`: deixa de gerar `.row-cols-1` a `.row-cols-6` e suas variantes, ausentes no site. Remove 36 regras.
- `$gutters: ()`: deixa de gerar `.g-*`, `.gx-*`, `.gy-*` de 0 a 5 e suas variantes, também ausentes. Remove 72 regras agrupadas.
- **Gutters estruturais preservados:** `$grid-gutter-width`, `.row`, `.row > *`, padding das colunas e variáveis `--bs-gutter-x/y` continuam idênticos. `styles.css` atribui essas variáveis diretamente em várias seções; não depende das classes opcionais retiradas.
- Preservados: todas as 12 colunas em todos os breakpoints, `.col`, `.col-auto`, variantes, offsets e `.row-cols-*-auto`. Há classes não usadas nesse conjunto, mas o gerador oficial não oferece uma lista de seleção por coluna/offset. Reduzir `$grid-columns` alteraria as frações e ainda seria incompatível com `.col-12`. Não foi criado um gerador alternativo.
- Só `.container` aparece no HTML. `.container-fluid` e containers responsivos permanecem como saída do módulo oficial, que compartilha regras com `.container` por `@extend`.
- Breakpoints intactos: xs 0, sm 576, md 768, **lg 1025**, xl 1200, xxl 1400px.
- Container padding intacto: 40px, dividido entre os lados. Limites: sm 100%, md 100%, lg 1220px.

## Helpers

Não há elementos elegíveis para os seletores dos helpers no DOM, nem geração dessas classes pelo JS ou dependência no CSS próprio. O candidato omite o import agregado `helpers`, retirando:

`clearfix`, `color-bg`, `colored-links`, `focus-ring`, `icon-link`, `ratio`, `position` (fixed/sticky), `stacks`, `visually-hidden`, `stretched-link`, `text-truncation` e `vr`.

Os estados de foco do CSS próprio permanecem intactos. Remover o helper `.focus-ring` não remove `:focus-visible`. Não há texto oculto por `.visually-hidden` nem links estendidos por `.stretched-link` no site atual.

## Imports e arquivos SCSS

| Import | Atual | Candidato | Motivo |
|---|---|---|---|
| functions | Sim | Sim | Funções usadas por variáveis e mixins; não emite CSS |
| variables | Sim | Sim | Configuração base, medidas, mapas e flags |
| variables-dark | Sim | Sim | Dependência dos mapas/root; preserva definição de temas |
| maps | Sim | Sim | Mapas usados pelo Bootstrap |
| mixins | Sim | Sim | Geradores de containers, grid, media queries e utilities |
| utilities | Sim | Sim | Definições oficiais; mapa filtrado no candidato |
| root | Sim | Sim | Variáveis CSS e tema escuro preservados integralmente |
| reboot | Não | Não | Não fazia parte do projeto; não foi introduzido |
| containers | Sim | Sim | Estrutura original |
| grid | Sim | Sim | Gerador original com apenas duas opções de redução |
| helpers | Sim | Não | Nenhum helper utilizado |
| utilities/api | Sim | Sim | Gera apenas o mapa selecionado no candidato |

`scss/bootstrap-talassa.scss` apenas passou a importar `_bootstrap-talassa-foundation.scss` no lugar do bloco comum de configuração. Essa extração evita duas cópias dos breakpoints e dimensões. **Seu resultado compilado continua byte a byte igual ao `bootstrap-talassa.css` atual**, inclusive comentários e formatação. Os scripts existentes do `package.json` continuam usando esse entrypoint original.

O candidato tem entrypoint separado: `scss/bootstrap-talassa-candidate.scss`, que compartilha a fundação, configura o grid e usa `_bootstrap-talassa-utilities.scss`. Nenhum script de produção foi redirecionado para ele.

## Validação automatizada

Chrome headless, com Bootstrap na mesma posição da cascata e `styles.css`/inline originais:

- **Matriz principal:** 45 cenários, três estados em 15 dimensões: normal/fechado, cards + FAQ + modal abertos com header após scroll, e foco de teclado `:focus-visible` com os estados abertos. **Zero diferenças** nas propriedades computadas.
- **Screenshots principais:** 15 pares, **zero pixels diferentes**. Quatro pares cobrem a página completa (1440×900, 768×1024, 390×844, 844×390); os outros 11 cobrem a viewport. As páginas completas incluem Hero, demandas, Therapy, psicólogas, processo, informações práticas, FAQ e footer.
- **Menu mobile:** 24 cenários antes/depois do scroll em 12 dimensões abaixo de 1200px, **zero diferenças** computadas; três pares adicionais de screenshots (768×1024, 390×844 e 844×390), **zero pixels diferentes**. O menu aberto foi confirmado em todos os 24 cenários. Essa matriz é separada porque abrir o modal pelo link do header fecha o menu por comportamento do próprio site. Evidência em `menu-validation.json`.
- Comparação de todas as propriedades computadas de **399 elementos** (`html`, `body` e descendentes), incluindo `::before` e `::after`.
- Nenhum seletor removido encontrou elemento elegível nos estados testados. Nenhuma declaração das 186 regras mantidas foi alterada; sua ordem relativa permaneceu igual à do original.
- Fechamento do modal por Escape, overlay e botão verificado nas duas versões. O foco de teclado foi acionado e `:focus-visible` confirmado em todas as dimensões.
- **Total final: 69 cenários computados e 18 pares de screenshots, todos sem diferenças.** Sem exceções JavaScript nas duas matrizes. CSS compilado/parseado com Sass e Chrome; saída atual reconstituída byte a byte pelo entrypoint original. Hashes dos arquivos protegidos preservados; `git diff --check` passou.

Dimensões: 1440×900, 1920×1080, 768×1024, 820×1180, 1024×768, 1180×820, 320×568, 390×844, 844×390, 767×1024, 1025×768, 1199×820, 1200×820, 900×500 e 900×501. Cobrem as fronteiras 767/768, 1024/1025 e 1199/1200, além de 500/501px de altura.

**Limites:** a comparação visual usa movimento reduzido para evitar diferenças por instantes de animação. Imagens lazy são carregadas antecipadamente apenas no navegador de teste. Não simula a cronologia de carregamento em rede lenta, autoplay/arraste completo, hardware touch, todos os estados hover ou outros motores de navegador. As fontes, animações e regras de hover/pointer/reduced-motion do site não foram editadas. Recomenda-se revisão manual com movimento normal, teclado, swipe e navegadores/dispositivos de uso real.

O arquivo `validation-harness-initial.json` documenta uma execução **inválida** do teste, em que alternar links desativados provocava recarregamento assíncrono de CSS. Essa execução não fundamenta aprovação nem reprovação do candidato. A ferramenta corrigida troca o conteúdo sincronicamente na mesma posição da cascata e verifica uma variável Bootstrap sentinela antes de cada captura. Os resultados finais são `validation.json`, `menu-validation.json` e `verification.json`.

## Como revisar sem modificar o site

Na raiz do projeto:

```powershell
node css-audit/bootstrap/build.cjs
node css-audit/bootstrap/validate.cjs --serve
```

Abrir a versão atual em `http://127.0.0.1:8766/` e a candidata em `http://127.0.0.1:8766/?bootstrap=candidate`. A prévia muda apenas a resposta HTML em memória do servidor local; `index.html` no disco continua intacto. Encerrar com Ctrl+C.

Para reproduzir a comparação automatizada, encerrar primeiro a prévia e executar, em sequência:

```powershell
node css-audit/bootstrap/validate.cjs
node css-audit/bootstrap/validate.cjs --menu
node css-audit/bootstrap/verify.cjs
```

O teste usa Chrome instalado e grava evidências neste diretório. Screenshots completos carregam antecipadamente imagens lazy apenas no navegador de teste.

## Riscos e decisão

O candidato está limitado às classes da página atual. Ao adicionar novas utilities/helpers ao HTML ou ao JS, será necessário atualizar a seleção SCSS e recompilar; elas não estarão disponíveis automaticamente. O grid mais amplo foi deliberadamente mantido para evitar alterações frágeis. Root e temas também permanecem.

Sass emite avisos de depreciação de imports/funções globais usados pelo Bootstrap 5.3.8; a compilação passa com as versões já instaladas. Não foram atualizados pacotes. Uma migração de Sass/Bootstrap deve ter sua própria validação.

**Recomendação: o candidato está apto a substituir o Bootstrap atual nesta página após sua revisão manual.** Não foi identificado risco de quebra responsiva decorrente da redução nos cenários auditados. Essa recomendação se apoia na equivalência das regras necessárias, na ordem da cascata e nos testes computados/visuais; não é garantia para páginas futuras ou todos os navegadores. Recomenda-se a revisão com movimento normal em desktop, tablet e celular, portrait/landscape, com menu, modal, FAQ, cards, processo, foco e scroll.

O arquivo atual permanece sem substituição. Não houve commit nem push.

## Arquivos desta etapa

- Alterado: `scss/bootstrap-talassa.scss`, apenas para compartilhar a fundação; seu build continua idêntico ao atual.
- Criados: `scss/_bootstrap-talassa-foundation.scss`, `scss/_bootstrap-talassa-utilities.scss` e `scss/bootstrap-talassa-candidate.scss`.
- Gerado: `assets/css/bootstrap-talassa-candidate.css`.
- Adicionados: relatório, scripts e evidências em `css-audit/bootstrap/`.
- Intactos nesta etapa: `index.html`/inline, `styles.css`, `script.js`, Bootstrap atual e minificado, imagens, `package.json` e lockfile. A modificação de `styles.css` da primeira etapa e as quatro exclusões de imagens WebP preexistentes no Git continuam como estavam.
