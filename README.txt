TALASSA — teste de Critical CSS

Arquivos alterados:
1. index.html
2. critical.css (novo)

Arquivos que NÃO foram alterados:
- styles.css
- assets/css/bootstrap-talassa.css
- script.js
- imagens e demais assets

Mudança no carregamento:
- Bootstrap continua sendo carregado normalmente no <head>.
- critical.css continua sendo carregado normalmente no <head> e contém somente os estilos necessários para a primeira tela (base + Header + Hero, incluindo regras responsivas relevantes).
- styles.css continua intacto, mas passa a ser carregado sem bloquear a primeira renderização usando media="print" + onload.
- Há fallback <noscript> para styles.css.

Como testar:
1. Copie critical.css para a raiz do projeto, ao lado de styles.css.
2. Substitua index.html pela versão deste pacote (ou aplique somente a alteração no <head>).
3. Abra localmente e teste desktop, tablet em pé, tablet deitado, celular em pé e celular deitado.
4. Se estiver tudo visualmente igual, faça commit/push e rode o PageSpeed mobile novamente.

Rollback:
Se houver qualquer comportamento visual inesperado, volte o <head> para:
<link rel="stylesheet" href="assets/css/bootstrap-talassa.css" />
<link rel="stylesheet" href="styles.css" />
E remova critical.css.
