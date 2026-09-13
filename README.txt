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
