# Promoção do Bootstrap aprovado

Aprovado manualmente pelo usuário e promovido apenas no workspace, sem commit ou push.

- `bootstrap-talassa-candidate.css` recompilado em memória a partir do SCSS aprovado: idêntico byte a byte.
- `assets/css/bootstrap-talassa.css` gerado pelo entrypoint principal: **18.976 bytes**, **3.346 bytes gzip local**, **186 regras**; idêntico byte a byte ao candidato, inclusive SHA-256.
- `scss/bootstrap-talassa.scss` agora importa a configuração otimizada aprovada em `bootstrap-talassa-candidate.scss`. A configuração do candidato, a fundação e a seleção de utilities não foram alteradas. Os builds futuros usam essa mesma configuração.
- `assets/css/bootstrap-talassa.min.css` também foi atualizado pelo build aprovado: 15.457 bytes. `npm run build:bootstrap` passou e produziu exatamente essa saída. O script existente gera o minificado; `dev:bootstrap` continua gerando o oficial expandido pelo mesmo entrypoint.
- `index.html` apontava temporariamente para o candidato; somente esse href foi restaurado para `assets/css/bootstrap-talassa.css`. O restante do HTML, inclusive o Critical CSS, ficou idêntico ao início desta promoção.
- `styles.css`, `script.js`, imagens e exclusões pendentes no Git não foram alterados. Todos os arquivos de auditoria anteriores foram preservados.
- `git diff --check` passou. Não foram feitas novas otimizações nem repetidos testes visuais: o CSS promovido é exatamente o candidato já validado e aprovado manualmente.

Arquivos de produção alterados nesta promoção: `scss/bootstrap-talassa.scss`, `assets/css/bootstrap-talassa.css`, `assets/css/bootstrap-talassa.min.css` e o href temporário de `index.html`.

Evidências adicionadas: `promotion-before.json`, `promotion.json`, `promotion-build.log`, `promote.cjs` e este documento. Os scripts de auditoria anteriores continuam como registro da comparação contra o Bootstrap antigo; suas verificações de baseline não se aplicam ao oficial após esta promoção.
