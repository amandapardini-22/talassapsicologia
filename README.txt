TALASSA — LANDING PAGE

Arquivos:
- index.html   -> conteúdo/estrutura da página
- styles.css  -> cores, espaçamentos, tipografia e responsividade
- script.js   -> WhatsApp, menu mobile, FAQ e carrossel
- assets/     -> imagens do site

ALTERAÇÕES MAIS IMPORTANTES
1. Número do WhatsApp:
   Abra script.js e altere WHATSAPP_NUMBER.

2. E-mail:
   Procure por contato@talassapsicologia.com.br em index.html.

3. Instagram:
   No rodapé, substitua href="#" pelo link real.

4. Cores:
   No início do styles.css há variáveis CSS:
   --navy: #2C2F51
   --teal: #387F88
   --gold: #B69769
   --purple: #94599A

5. Imagens:
   Basta substituir arquivos dentro de assets mantendo os mesmos nomes.

6. Google Ads / Analytics:
   Todos os botões do WhatsApp disparam o evento "whatsapp_click" no dataLayer.
   Quando o Google Tag Manager for instalado, esse evento pode ser usado como conversão.

7. Hospedagem Hostinger:
   Envie todos os arquivos e a pasta assets para public_html.
   O index.html deve ficar diretamente dentro de public_html.
