# Minificação de produção — candidatos

Status: validação de navegador em andamento. As referências oficiais não foram promovidas.

Workspace inicialmente limpo na branch `bootstrap-refactor`. Nenhum commit ou push.

## Tamanhos

Todos os valores abaixo estão em bytes; gzip calculado localmente com `zlib.gzipSync` nas mesmas condições.

| Arquivo | Original | Minificado | Redução | Gzip original | Gzip minificado | Redução gzip |
|---|---:|---:|---:|---:|---:|---:|
| CSS próprio | 124.061 | 78.012 | 37,12% | 22.455 | 15.054 | 32,96% |
| JavaScript próprio | 18.005 | 12.259 | 31,91% | 4.782 | 3.515 | 26,50% |
| Bootstrap | 18.976 | 15.457 | 18,54% | 3.346 | 3.183 | 4,87% |

Economia potencial dos três arquivos: **55.314 bytes sem gzip; 8.831 bytes em gzip (8,62 KiB)**. O total gzip passa de 30.583 para 21.752 bytes. A transferência real depende da configuração do servidor; HTML e demais assets não entram nessa comparação.

## Configuração

- CSS: `clean-css` 5.3.3 pela API, nível numérico 0, sem rebase ou inline de imports. Valores das custom properties protegidos literalmente. O parser CSS do Sass já instalado remove comentários comuns e serializa a saída. Igualdade canônica integral entre fonte e candidato é condição obrigatória do build.
- JS: Terser 5.51.2, `compress: false`, `mangle: false`. Nomes globais e locais, propriedades, callbacks e lógica preservados. A saída é novamente parseada e comparada à serialização canônica do fonte antes da gravação.
- Bootstrap: configuração e versões existentes preservadas. Compilações expanded/compressed correspondem byte a byte aos arquivos aprovados. O arquivo minificado mantém SHA-256 `5906ef5a36ef510c3c042a137230752830e7298dc30309137c8fc191924e564e`.
- Nenhum source map é gerado. Fontes, imagens, URLs CSS, logos e bibliotecas GSAP/ScrollTrigger não foram editados.

O único handler inline identificado no HTML é o `onload` do CSS. O JS usa funções globais, callbacks de eventos, `window.dataLayer`, GSAP e ScrollTrigger. Todos os identificadores foram preservados, dispensando uma lista frágil de exceções ao mangling.

Referências de configuração: [clean-css](https://github.com/clean-css/clean-css#optimization-levels) e [API do Terser](https://terser.org/docs/api-reference/).

## Build e prévia

Adicionados: `build:css`, `build:js`, `build:prod`, `preview:prod`, `test:prod`. Os scripts `build:bootstrap` e `dev:bootstrap` permanecem iguais.

`npm run build:prod` gera apenas os três assets minificados. Não escreve nem minifica HTML.

`npm run preview:prod` disponibiliza:

- Original: `http://127.0.0.1:8767/`
- Candidato: `http://127.0.0.1:8767/?minified=1`

O servidor troca apenas três caminhos na resposta HTTP: Bootstrap, CSS próprio e JS próprio. São quatro atributos porque o CSS aparece também no fallback `noscript`. O HTML original no disco e seu Critical CSS permanecem idênticos. As URLs do GSAP e ScrollTrigger permanecem iguais. Encerrar a prévia com Ctrl+C.

## Verificações

- Sintaxe CSS/JS validada; equivalência canônica CSS/JS aprovada.
- URLs CSS idênticas e existentes; caminhos locais de `src`, `href` e `srcset` verificados.
- Prévia conferida: exatamente as quatro substituições previstas, inline idêntico, três candidatos servidos com HTTP 200 e bytes corretos.
- `npm ls --depth=0` aprovado; nenhuma versão anteriormente registrada no lockfile foi atualizada.
- A matriz do Chrome compara todas as propriedades computadas de todos os elementos e seus pseudo-elementos, interações, screenshots e erros de rede/console. Resultados serão consolidados ao concluir.

## Ajustes feitos durante a validação

A CLI de clean-css foi experimentada e retirada: a implementação instalada mantinha opções de nível 1 junto de `-O0`. A configuração final usa a API explícita e não depende da CLI. Isso também retirou suas dependências transitivas dispensáveis. Restaram somente `clean-css` e `terser` como novas devDependencies.

A serialização CSSOM pode conservar grafias distintas de números dentro de `var()` (por exemplo `.06` e `0.06`). A equivalência de valores é verificada pelo parser, enquanto a checagem CSSOM confere estrutura, ordem das propriedades e custom properties. A comparação de estilos computados verifica o resultado no navegador.

Em uma captura inicial de 1920×1080 com movimento normal, um título estava em momentos ligeiramente diferentes de uma animação Web Animations iniciada pelo scroll (opacity 0,340779/0,342523). O harness passou a concluir essa animação e aguardar seu callback de limpeza antes de capturar. Nenhuma alteração foi feita no site para acomodar o teste.

## Arquivos

Modificados: `package.json`, `package-lock.json`, `README.txt`.

Criados: `styles.min.css`, `script.min.js`; `scripts/build-css.cjs`, `scripts/build-js.cjs`, `scripts/preview-prod.cjs`, `scripts/validate-prod.cjs`; este relatório e os registros de métricas/validação em `docs/`.

Preservados: `index.html` inteiro, Critical CSS inline, `styles.css`, `script.js`, SCSS, Bootstrap expandido/minificado, imagens, SVGs, fontes e bibliotecas JS locais. Hashes iniciais registrados em [production-metrics.json](production-metrics.json).

Limites: as capturas estabilizam as animações e usam Chrome desktop com viewports emuladas. Não constituem testes em hardware touch, outros motores ou rede lenta. Os avisos existentes de depreciação Sass permanecem. A promoção depende da revisão deste relatório pelo usuário.
