// ===== CONFIGURAÇÃO WHATSAPP =====
const WHATSAPP_NUMBER = '5511999999999';
const WHATSAPP_MESSAGE = 'Olá! Vim pelo site da Talassa e gostaria de saber mais sobre a psicoterapia.';

function buildWhatsAppUrl() {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}

document.querySelectorAll('.js-whatsapp').forEach(link => {
  link.href = buildWhatsAppUrl();

  link.addEventListener('click', () => {
    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
      event: 'whatsapp_click',
      location: link.textContent.trim()
    });
  });
});

// ===== HEADER =====
const header = document.querySelector('.site-header');

function updateHeader() {
  if (!header) return;

  header.classList.toggle('scrolled', window.scrollY > 40);
}

window.addEventListener('scroll', updateHeader);
updateHeader();

// ===== MENU MOBILE =====
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== FAQ =====
document.querySelectorAll('.faq-item').forEach(item => {
  const button = item.querySelector('button');

  if (!button) return;

  button.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach(el => {
      el.classList.remove('open');
    });

    if (!wasOpen) {
      item.classList.add('open');
    }
  });
});

// ===== ÍCONES LUCIDE =====
if (window.lucide) {
  window.lucide.createIcons();
}
