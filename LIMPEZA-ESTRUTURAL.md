# Limpeza estrutural — 13/09/2026

Estado inicial: Git limpo na branch bootstrap-refactor; nenhuma alteração preexistente. Nenhum commit ou push realizado.

Antes: quatro SCSS (entrypoint indireto, candidato e dois partials), três CSS Bootstrap, 67 arquivos em css-audit e ferramenta de auditoria na raiz.
Depois: entrypoint oficial real e dois partials; apenas CSS oficial expandido e minificado; três relatórios históricos em css-audit. Nenhum arquivo movido.

Alterados: README.txt, entrypoint SCSS, comentário da fundação, package.json, package-lock.json e os três relatórios históricos. Este relatório foi adicionado.

Preservados: HTML, Critical CSS inline, CSS próprio, JavaScript, todos os assets de produção (inclusive logos e fontes), utilities e parâmetros SCSS aprovados. Hashes de todos os 23 arquivos de produção conferidos.

CSS oficial e candidato eram idênticos byte a byte. SHA-256 de ambos: 54bf4b2540d1cd6f66c93f3806c5187b9c29518d78b166a84220a5e9ee711f0e. Após reorganização: expandido 18.976 bytes, 186 regras de estilo (sem wrappers de media queries); comprimido 15.457 bytes. Ambas as saídas compiladas idênticas ao início. npm run build:bootstrap passou; sintaxe CSS validada pelo Sass e imports resolvidos.

css-audit: 34080136 → 27180 bytes. Arquivos excluídos do projeto: 67, somando 34081898 bytes brutos. Medida exclui node_modules e histórico .git; não representa redução do histórico Git. Os 18 pares de screenshots foram conferidos byte a byte como idênticos antes da exclusão.

Dependências:
- Bootstrap e Sass: A, necessárias para compilação e watch; preservadas.
- bootstrap-icons: B, pacote não utilizado por HTML, imports, scripts ou build; ícones existentes são embutidos no HTML/CSS. Nenhuma rotina de cópia/manutenção automática encontrada. Removido com npm uninstall --offline --ignore-scripts --no-audit --no-fund.
- Ambos os pacotes Fontsource: C quanto à necessidade npm; fontes locais em uso, possível origem de manutenção manual. Preservados por cautela.
- GSAP: C quanto à necessidade npm; runtime local GSAP/ScrollTrigger em uso, possível origem de manutenção manual. Preservado.
- npm ls --depth=0 passou; package e lockfile consistentes; nenhuma versão remanescente foi atualizada. Não foi necessário reinstalar dependências.

Referências locais de src/href/srcset e URLs CSS verificadas; nenhuma ausente. HTML continua usando Bootstrap expandido, styles.css e os três scripts locais; inline preservado. Referências operacionais às ferramentas descartadas retiradas dos relatórios.

Limites: avisos existentes de depreciação Sass permanecem. Não houve nova auditoria visual; todos os bytes servidos pelo site foram preservados. As evidências temporárias não estão mais no workspace; resultados, decisões e limitações históricas permanecem nos três relatórios.

## Inventário anterior de css-audit

Os nomes abaixo são registro histórico de exclusões, não referências operacionais.

| Nome histórico | Tipo | Bytes | Função / destino |
|---|---|---:|---|
| css-audit/bootstrap/baseline-hashes.json | .json | 747 | Diagnóstico/evidência intermediária; removido |
| css-audit/bootstrap/baseline-recompiled.css | .css | 119715 | Cópia/baseline temporário; removido |
| css-audit/bootstrap/build.cjs | .cjs | 1557 | Ferramenta da auditoria concluída; removido |
| css-audit/bootstrap/build.json | .json | 2463 | Diagnóstico/evidência intermediária; removido |
| css-audit/bootstrap/inventory.json | .json | 293059 | Diagnóstico/evidência intermediária; removido |
| css-audit/bootstrap/menu-validation.json | .json | 11301 | Diagnóstico/evidência intermediária; removido |
| css-audit/bootstrap/metrics.json | .json | 247 | Diagnóstico/evidência intermediária; removido |
| css-audit/bootstrap/PROMOCAO.md | .md | 2021 | Relatório final; preservado |
| css-audit/bootstrap/promote.cjs | .cjs | 2302 | Ferramenta da auditoria concluída; removido |
| css-audit/bootstrap/promotion-before.json | .json | 72602 | Diagnóstico/evidência intermediária; removido |
| css-audit/bootstrap/promotion-build.log | .log | 12611 | Log de compilação; removido |
| css-audit/bootstrap/promotion.json | .json | 429 | Diagnóstico/evidência intermediária; removido |
| css-audit/bootstrap/RELATORIO.md | .md | 14855 | Relatório final; preservado |
| css-audit/bootstrap/screenshots/1024x768-candidate.png | .png | 663448 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/1024x768-original.png | .png | 663448 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/1025x768-candidate.png | .png | 689065 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/1025x768-original.png | .png | 689065 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/1180x820-candidate.png | .png | 783288 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/1180x820-original.png | .png | 783288 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/1199x820-candidate.png | .png | 787197 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/1199x820-original.png | .png | 787197 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/1200x820-candidate.png | .png | 803697 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/1200x820-original.png | .png | 803697 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/1440x900-candidate.png | .png | 3200330 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/1440x900-original.png | .png | 3200330 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/1920x1080-candidate.png | .png | 1025845 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/1920x1080-original.png | .png | 1025845 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/320x568-candidate.png | .png | 206222 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/320x568-original.png | .png | 206222 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/390x844-candidate.png | .png | 1365138 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/390x844-menu-candidate.png | .png | 265307 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/390x844-menu-original.png | .png | 265307 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/390x844-original.png | .png | 1365138 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/767x1024-candidate.png | .png | 517272 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/767x1024-original.png | .png | 517272 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/768x1024-candidate.png | .png | 2418567 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/768x1024-menu-candidate.png | .png | 552020 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/768x1024-menu-original.png | .png | 552020 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/768x1024-original.png | .png | 2418567 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/820x1180-candidate.png | .png | 669806 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/820x1180-original.png | .png | 669806 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/844x390-candidate.png | .png | 1393319 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/844x390-menu-candidate.png | .png | 99383 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/844x390-menu-original.png | .png | 99383 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/844x390-original.png | .png | 1393319 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/900x500-candidate.png | .png | 321293 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/900x500-original.png | .png | 321293 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/900x501-candidate.png | .png | 457691 | Comparação visual temporária; removido |
| css-audit/bootstrap/screenshots/900x501-original.png | .png | 457691 | Comparação visual temporária; removido |
| css-audit/bootstrap/validate.cjs | .cjs | 12952 | Ferramenta da auditoria concluída; removido |
| css-audit/bootstrap/validation-harness-initial.json | .json | 84137 | Diagnóstico/evidência intermediária; removido |
| css-audit/bootstrap/validation.json | .json | 19581 | Diagnóstico/evidência intermediária; removido |
| css-audit/bootstrap/verification.json | .json | 811 | Diagnóstico/evidência intermediária; removido |
| css-audit/bootstrap/verify.cjs | .cjs | 2783 | Ferramenta da auditoria concluída; removido |
| css-audit/final-search.json | .json | 996 | Diagnóstico/evidência intermediária; removido |
| css-audit/inventory.json | .json | 680133 | Diagnóstico/evidência intermediária; removido |
| css-audit/plan.cjs | .cjs | 2610 | Ferramenta da auditoria concluída; removido |
| css-audit/plan.json | .json | 1992 | Diagnóstico/evidência intermediária; removido |
| css-audit/RELATORIO.md | .md | 9136 | Relatório final; preservado |
| css-audit/repeated-properties.json | .json | 2 | Diagnóstico/evidência intermediária; removido |
| css-audit/state-map.json | .json | 5701 | Diagnóstico/evidência intermediária; removido |
| css-audit/styles.before.css | .css | 125028 | Cópia/baseline temporário; removido |
| css-audit/styles.proposed.css | .css | 124061 | Cópia/baseline temporário; removido |
| css-audit/validation.initial.json | .json | 11844 | Diagnóstico/evidência intermediária; removido |
| css-audit/validation.json | .json | 10876 | Diagnóstico/evidência intermediária; removido |
| css-audit/validation.retry-1789278995275.json | .json | 12014 | Diagnóstico/evidência intermediária; removido |
| css-audit/verify.cjs | .cjs | 3794 | Ferramenta da auditoria concluída; removido |

Além do inventário, removidos: CSS e SCSS temporários do candidato e ferramenta de auditoria da raiz. As ferramentas não integravam scripts npm/build; as instruções antigas de comparação foram aposentadas junto com os baselines.

Validação final: git diff --check passou sem erros de whitespace (apenas avisos da configuração Git sobre LF/CRLF). Busca sem referências ao CSS/SCSS candidato nem a Critical CSS externo.
