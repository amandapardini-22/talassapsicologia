> Registro histórico da etapa concluída. As expressões “atual” e “candidato” abaixo descrevem aquele momento. A promoção foi concluída; hoje o entrypoint oficial contém a configuração aprovada. Artefatos intermediários e ferramentas temporárias foram removidos na limpeza estrutural. Resultados e decisões foram preservados neste relatório.

# Auditoria de CSS — Talassa

## Relatório anterior à limpeza

Escopo: leitura de `index.html` (incluindo o `<style>`), `styles.css`, `script.js`, CSS Bootstrap carregado e seu SCSS. O inventário completo de classes, IDs e regras com contextos de media queries está em um artefato histórico da auditoria (removido na limpeza). O navegador analisou o DOM completo, independentemente da visibilidade, relaxando estados transitórios e pseudo-elementos para procurar seus elementos de origem. Isso é uma triagem conservadora, não cobertura visual nem prova de que cada declaração seja necessária.

### A. CSS certamente não utilizado

Nenhum bloco inteiro de seletores de `styles.css` foi demonstrado órfão. Nenhum keyframe está sem referência. Não se propõe exclusão por ausência textual ou por cobertura de uma viewport.

A normalização conservadora deixou seis regras de `styles.css` sem resultado automático (`count: null`): três variantes do header com `:not(.scrolled)`, duas dos cards com `:not(.open)` e o grupo universal de redução de movimento. Foram conferidas como estados/elementos existentes e preservadas. Três grupos de acessibilidade do Bootstrap também ficaram indeterminados e não entram na contagem de regras sem correspondência.

### B. CSS provavelmente não utilizado

Algumas alternativas em listas de seletores e propriedades de layouts anteriores podem ser dispensáveis, mas uma correspondência do seletor não prova que cada declaração vença a cascata. Regras repetidas de `.hero`, `.hero-photo`, `.main-nav`, `.process-grid` e componentes responsivos ficam preservadas. Risco de remoção: médio/alto; economia não quantificada sem análise adicional da cascata.

### C. CSS duplicado/sobrescrito

Há 163 correspondências exatas de blocos normalizados entre o inline e `styles.css`, considerando também seu contexto. Incluem base, Header, Hero, botões, fontes e animações. Não serão removidos em conjunto: a posição do CSS externo em relação às regras responsivas inline pode ser relevante.

Limpeza proposta exclusivamente em `styles.css` (linhas originais):

| Bloco | Linha | Economia | Motivo e risco |
|---|---:|---:|---|
| `@font-face` Montserrat 400 | 1 | 172 bytes | Descritores e URL integralmente idênticos no inline; baixo risco na página atual. |
| `@font-face` Montserrat 600 | 9 | 172 bytes | Mesma comprovação. |
| `@font-face` Cormorant Garamond 600 | 33 | 188 bytes | Mesma comprovação. |
| `@keyframes talassa-button-sheen` | 2426 | 210 bytes | Definição integralmente idêntica, global, presente no inline; referências mantidas. |
| `@keyframes talassa-button-sheen-auto` | 2455 | 225 bytes | Mesma comprovação; preserva brilho em dispositivos de toque. |

Total proposto: 967 bytes (0,944 KiB), cinco blocos, 28 quebras de linha. `styles.css`: 125.028 → 124.061 bytes. Não há remoção de seletor de elemento, propriedade visual ativa ou media query. As definições continuam no documento, inclusive com JavaScript desativado. O arquivo externo passa a depender do inline para essas cinco definições; se outra página vier a reutilizá-lo sem esse inline, será necessário disponibilizá-las nessa página.

Também há repetição exata de uma regra de redução de movimento do pseudo-elemento de botões, em contextos de media query equivalentes. Mantida nesta etapa; repetição de texto não é prova geral de sobrescrita inócua. Não foi feita consolidação de propriedades nem eliminação de fallbacks.

A inspeção adicional de declarações dentro de blocos não encontrou propriedades repetidas no mesmo bloco (um artefato histórico da auditoria (removido na limpeza)). Isso não é uma prova de ausência de sobrescritas entre blocos diferentes. A economia gzip simulada com Node é de apenas 85 bytes (22.540 → 22.455 bytes); o servidor pode usar compressão diferente.

### D. CSS que deve ser mantido

`script.js` adiciona/remove `.open` em `.whatsapp-modal`, `.main-nav`, `.concern-card` e `.faq-item`, além de `.scrolled` no header. Atualiza `aria-expanded`, `aria-hidden`, IDs `faq-answer-*` e estilos inline de opacity/transform/will-change. GSAP/ScrollTrigger e Web Animations executam entradas; o processo usa scroll, timers e matchMedia. Nenhum desses comportamentos foi alterado.

Preservar todas as regras de menu, modal, FAQ, demandas, processo, cards de psicólogas, WhatsApp, `:hover`, `:focus`, `:focus-visible`, `::before`, `::after`, orientação, altura, breakpoints, hover/pointer e reduced-motion. Preservar Montserrat 700 e Cormorant Garamond 500: não estão duplicadas no inline. As duas animações continuam definidas no inline e referenciadas no CSS externo.

### E. Bootstrap

`assets/css/bootstrap-talassa.css`: 119.715 bytes; 1.688 regras inventariadas. Na triagem conservadora, 1.653 regras (97,9% por contagem) não encontraram elementos. Seus textos serializados pelo navegador somam aproximadamente 97.042 bytes (94,77 KiB), sem wrappers/comentários/formatação original. Isso não mede transferência comprimida nem equivale aos 25 KiB informados pelo PageSpeed.

Candidatas: variantes não utilizadas de `.row-cols-*`, `.col-*`, `.offset-*`, gutters `.g-*`, espaçamento, display, flex, cores, helpers, utilidades de impressão e tema escuro. O inventário lista exatamente cada seletor e contexto. Risco de remoção em lote: alto sem lista de preservação e validação.

O SCSS já importa apenas fundação, root, containers, grid, helpers e utilities/api; não importa os componentes de modal, accordion, carousel, navbar ou buttons do Bootstrap. Os componentes homônimos do site são próprios. Preservar `.container`, `.row`, colunas e utilidades presentes no inventário de classes, inclusive variantes `md`, `lg` e `xl`. O breakpoint `lg` é customizado para 1025px.

Recomenda-se uma segunda etapa específica no SCSS: restringir a geração de utilidades e variantes, revisar helpers e grid, gerar um arquivo candidato e comparar antes de substituir o carregado. O Bootstrap e seu SCSS não serão editados nesta limpeza.

## Validação manual recomendada

Desktop 1440×900 e 1920×1080; tablet portrait 768×1024 e 820×1180; tablet landscape 1024×768 e 1180×820; mobile portrait 320×568 e 390×844; mobile landscape 844×390. Conferir também fronteiras 767/768, 1024/1025 e 1199/1200px e alturas 500/501px.

Em cada modo: header antes/depois do scroll, menu aberto/fechado, Hero, cards expansíveis, FAQ, modal por todos os CTAs, fechamento por overlay/Escape, processo por setas/arraste, hover e foco de teclado, brilho dos botões e preferência de movimento reduzido. Verificar carregamento inicial com cache vazio e JavaScript desativado. Comparações automatizadas de estilos não substituem essa inspeção visual.

## Resultado da limpeza e validação

Aplicada localmente a proposta de cinco blocos, com economia de 967 bytes. O diff do Git registra 33 linhas de definições removidas e cinco linhas vazias em seu lugar: redução líquida de 28 linhas. Nenhum seletor de elemento foi removido.

- Único arquivo de produção alterado: `styles.css` (125.028 → 124.061 bytes).
- `index.html`, inline, `script.js` e `assets/css/bootstrap-talassa.css`: conteúdo idêntico ao início, confirmado por SHA-256. SCSS e Bootstrap minificado não foram editados.
- Documentação e ferramentas adicionadas: um artefato histórico da auditoria (removido na limpeza) e diretório `css-audit/`, com relatório, inventários, proposta, cópia anterior, plano e evidências.
- Sintaxe validada com o parser CSS do Sass; estrutura comparada byte a byte: apenas os cinco blocos previstos. `git diff --check` passou.
- Busca final das três fontes e das duas animações em HTML, JS, CSS próprio e Bootstrap registrada em um artefato histórico da auditoria (removido na limpeza). Definições inline e referências externas às animações preservadas. Nenhum estado dinâmico foi removido.
- Chrome headless: 60 combinações (15 tamanhos × duas preferências de movimento × aberto/fechado), comparando todas as propriedades computadas de 398 elementos e seus `::before`/`::after`. Resultado final: nenhuma diferença. Abertura de modal/menu/card/FAQ e fechamento do modal por Escape também passaram.
- Um cenário apresentou primeiro movimento do GSAP e depois carregamento de fontes durante a comparação. A repetição com GSAP pausado, eventos de media query estabilizados e layout calculado antes de aguardar as fontes passou. Resultados anteriores e explicação permanecem nos JSONs de validação. Não houve ajuste no site para fazer o teste passar.
- Limites: não foi feita comparação de screenshots nem simulação automatizada de touch/hover/foco, autoplay completo, rede lenta ou JavaScript desativado. As animações foram estabilizadas na comparação de estilos; a equivalência dos keyframes foi verificada separadamente por conteúdo integral. A lista manual acima continua recomendada.

Não foi identificado risco de quebra responsiva decorrente destas cinco remoções na página atual. As outras duplicações e candidatas ficaram preservadas por cautela. Não houve commit nem push. As quatro exclusões de imagens WebP já existentes no Git não foram alteradas.
