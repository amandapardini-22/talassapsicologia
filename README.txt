TALASSA PSICOLOGIA

Site estático. Abra index.html para uma prévia local.

Estrutura
- index.html: conteúdo da página e Critical CSS inline no <head>.
- styles.css: estilos próprios, com carregamento diferido e fallback noscript.
- script.js: interações e animações da página.
- assets/: imagens, logos SVG, fontes locais, bibliotecas JS e CSS compilado.
- assets/css/bootstrap-talassa.css: Bootstrap oficial expandido, carregado pelo HTML.
- assets/css/bootstrap-talassa.min.css: versão comprimida gerada pelo build, ainda não carregada pelo HTML.
- scss/bootstrap-talassa.scss: entrypoint oficial com a configuração aprovada.
- scss/_bootstrap-talassa-foundation.scss: variáveis, breakpoints e dependências.
- scss/_bootstrap-talassa-utilities.scss: seleção das utilities utilizadas.
- css-audit/: relatórios históricos de auditoria e promoção.

Build do Bootstrap (Node.js e npm necessários)
1. npm ci — instala as versões registradas no package-lock.json.
2. npm run build:bootstrap — gera a versão minificada.
3. npm run dev:bootstrap — gera a versão expandida e acompanha alterações; encerre com Ctrl+C.

Os dois scripts usam o mesmo entrypoint. Não edite os CSS compilados manualmente.
Ao adicionar utilities Bootstrap à página, revise a seleção SCSS e valide o resultado visual.
Sass pode emitir avisos de depreciação; a compilação funciona com as versões do lockfile.

Fontes e GSAP/ScrollTrigger são servidos de assets/. Os pacotes Fontsource e GSAP
foram preservados como possíveis fontes de manutenção; não há cópia automática configurada.

Candidatos minificados (aguardando promoção)
- npm run build:css — gera styles.min.css com clean-css no nível 0 e o parser CSS do Sass, sem rebase ou inline de imports; preserva valores das custom properties e confere equivalência canônica.
- npm run build:js — gera script.min.js com Terser, sem compress ou mangling.
- npm run build:prod — executa os builds de Bootstrap, CSS próprio e JavaScript.
- npm run preview:prod — abre um servidor local; use os endereços exibidos para comparar original e candidato.
- npm run test:prod — compara as duas versões no Chrome e grava docs/production-validation.json.

O teste procura Chrome no caminho padrão do Windows; CHROME_PATH permite indicar outro executável.
Screenshots e o perfil isolado do navegador ficam em uma pasta temporária informada pelo teste.
A prévia troca três caminhos somente na resposta HTTP (CSS próprio também no fallback noscript).
index.html, Critical CSS inline, styles.css e script.js permanecem legíveis e intactos.
Os builds não promovem candidatos nem minificam o HTML. Não edite os arquivos .min manualmente.
