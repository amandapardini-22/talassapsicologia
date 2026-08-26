/* ==================================================
   MODAL — ESCOLHER PSICÓLOGA
================================================== */

const whatsappModal =
  document.getElementById("whatsappModal");

const whatsappButtons =
  document.querySelectorAll(".js-whatsapp");

const whatsappClose =
  document.querySelector(".whatsapp-modal-close");

const whatsappOverlay =
  document.querySelector(".whatsapp-modal-overlay");


/* ==================================================
   WHATSAPP DAS PSICÓLOGAS
================================================== */

const whatsappCarol =
  "551140407979";

const whatsappCarolina =
  "5511913678621";


/* ==================================================
   MENSAGEM INICIAL
================================================== */

const whatsappMessage =
  encodeURIComponent(
    "Olá! Vim pelo site da Talassa e gostaria de saber mais sobre a psicoterapia."
  );


/* ==================================================
   LINKS DAS PSICÓLOGAS
================================================== */

const carolLink =
  document.querySelector(".whatsapp-carol");

const carolinaLink =
  document.querySelector(".whatsapp-carolina");


if (carolLink) {
  carolLink.href =
    `https://wa.me/${whatsappCarol}?text=${whatsappMessage}`;
}


if (carolinaLink) {
  carolinaLink.href =
    `https://wa.me/${whatsappCarolina}?text=${whatsappMessage}`;
}


/* ==================================================
   ABRIR MODAL
================================================== */

whatsappButtons.forEach((button) => {

  button.addEventListener("click", (event) => {

    event.preventDefault();


    /* Rastreamento */

    window.dataLayer =
      window.dataLayer || [];

    window.dataLayer.push({
      event: "whatsapp_click",
      location: button.textContent.trim()
    });


    /* Abre o modal */

    if (!whatsappModal) {
      return;
    }

    whatsappModal.classList.add("open");

    whatsappModal.setAttribute(
      "aria-hidden",
      "false"
    );

  });

});


/* ==================================================
   FECHAR MODAL
================================================== */

function closeWhatsappModal() {

  if (!whatsappModal) {
    return;
  }

  whatsappModal.classList.remove("open");

  whatsappModal.setAttribute(
    "aria-hidden",
    "true"
  );

}


if (whatsappClose) {

  whatsappClose.addEventListener(
    "click",
    closeWhatsappModal
  );

}


if (whatsappOverlay) {

  whatsappOverlay.addEventListener(
    "click",
    closeWhatsappModal
  );

}


/* Fecha usando ESC */

document.addEventListener("keydown", (event) => {

  if (
    event.key === "Escape" &&
    whatsappModal &&
    whatsappModal.classList.contains("open")
  ) {

    closeWhatsappModal();

  }

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

/* ==================================================
   CARROSSEL — COMO FUNCIONA
================================================== */

const processGrid = document.querySelector(".process-grid");
const processSteps = document.querySelectorAll(".process-step");

const processPrev = document.querySelector(".process-prev");
const processNext = document.querySelector(".process-next");

const processPortrait = window.matchMedia(
  "(max-width: 1024px) and (orientation: portrait)"
);

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

let processIndex = 0;
let processTimer;


/* ==================================================
   IR PARA ETAPA
================================================== */

function goToProcessStep(index) {

  if (!processGrid || !processSteps[index]) {
    return;
  }

  processIndex = index;

  processGrid.scrollTo({
    left: processSteps[index].offsetLeft,
    behavior: "smooth"
  });
}


/* ==================================================
   PRÓXIMA ETAPA
   01 → 02 → 03 → 01
================================================== */

function nextProcessStep() {

  processIndex =
    (processIndex + 1) % processSteps.length;

  goToProcessStep(processIndex);
}


/* ==================================================
   ETAPA ANTERIOR
================================================== */

function previousProcessStep() {

  processIndex =
    (processIndex - 1 + processSteps.length)
    % processSteps.length;

  goToProcessStep(processIndex);
}


/* ==================================================
   AUTOPLAY
================================================== */

function startProcessCarousel() {

  clearInterval(processTimer);

  if (
    !processPortrait.matches ||
    reduceMotion.matches ||
    processSteps.length < 2
  ) {
    return;
  }

  processTimer = setInterval(
    nextProcessStep,
    4500
  );
}


/* ==================================================
   REINICIA O AUTOPLAY
================================================== */

function restartProcessCarousel() {

  clearInterval(processTimer);

  startProcessCarousel();
}


/* ==================================================
   SETA DIREITA
================================================== */

if (processNext) {

  processNext.addEventListener("click", () => {

    nextProcessStep();

    restartProcessCarousel();
  });
}


/* ==================================================
   SETA ESQUERDA
================================================== */

if (processPrev) {

  processPrev.addEventListener("click", () => {

    previousProcessStep();

    restartProcessCarousel();
  });
}


/* ==================================================
   ATUALIZA ÍNDICE APÓS ARRASTAR
================================================== */

let processScrollTimer;

if (processGrid) {

  processGrid.addEventListener("scroll", () => {

    clearTimeout(processScrollTimer);

    processScrollTimer = setTimeout(() => {

      let closestIndex = 0;
      let closestDistance = Infinity;

      processSteps.forEach((step, index) => {

        const distance = Math.abs(
          processGrid.scrollLeft -
          step.offsetLeft
        );

        if (distance < closestDistance) {

          closestDistance = distance;
          closestIndex = index;
        }
      });

      processIndex = closestIndex;

    }, 120);
  });
}


/* ==================================================
   CONFIGURAÇÃO RESPONSIVA
================================================== */

function setupProcessCarousel() {

  clearInterval(processTimer);

  processIndex = 0;

  if (!processPortrait.matches) {

    if (processGrid) {
      processGrid.scrollLeft = 0;
    }

    return;
  }

  goToProcessStep(0);

  startProcessCarousel();
}


setupProcessCarousel();

processPortrait.addEventListener(
  "change",
  setupProcessCarousel
);