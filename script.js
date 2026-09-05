/* ==== MODAL — ESCOLHER PSICÓLOGA ====== */

const whatsappModal =
  document.getElementById("whatsappModal");
const whatsappButtons =
  document.querySelectorAll(".js-whatsapp");
const whatsappClose =
  document.querySelector(".whatsapp-modal-close");
const whatsappOverlay =
  document.querySelector(".whatsapp-modal-overlay");

/* ===== WHATSAPP DAS PSICÓLOGAS ======== */

const whatsappCarol =
  "551140407979";
const whatsappCarolina =
  "5511913678621";

/* ======== MENSAGEM INICIAL ================== */

const whatsappMessage =
  encodeURIComponent(
    "Olá! Vim pelo site da Talassa e gostaria de saber mais sobre a psicoterapia."
  );

/* ======== LINKS DAS PSICÓLOGAS ============ */

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

/* ============  ABRIR MODAL ===================== */

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

/* =============== FECHAR MODAL ============== */

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

    menuToggle.setAttribute(
      'aria-expanded',
      String(isOpen)
    );

    if (isOpen) {

      /* Sempre abre o menu no primeiro item */
      nav.scrollTop = 0;

      /*
        Reforça a posição depois que
        o navegador renderiza o dropdown.
      */
      requestAnimationFrame(() => {
        nav.scrollTop = 0;
      });
    }

  });


  nav.querySelectorAll('a').forEach(link => {

    link.addEventListener('click', () => {

      nav.classList.remove('open');

      menuToggle.setAttribute(
        'aria-expanded',
        'false'
      );

      nav.scrollTop = 0;

    });

  });

}

/* ============ CARDS — DEMANDAS ================= */

const concernCards =
  document.querySelectorAll(".concern-card");

concernCards.forEach((card) => {

  const trigger =
    card.querySelector(".concern-trigger");

  const description =
    card.querySelector(".concern-description");


  if (!trigger || !description) {
    return;
  }

  trigger.addEventListener("click", () => {
    const wasOpen =
      card.classList.contains("open");

    /* Fecha todos os cards */

    concernCards.forEach((otherCard) => {
      otherCard.classList.remove("open");

      const otherTrigger =
        otherCard.querySelector(".concern-trigger");

      const otherDescription =
        otherCard.querySelector(".concern-description");

      if (otherTrigger) {
        otherTrigger.setAttribute(
          "aria-expanded",
          "false"
        );
      }

      if (otherDescription) {
        otherDescription.setAttribute(
          "aria-hidden",
          "true"
        );
      }

    });

    /* Abre o card clicado */
    if (!wasOpen) {
      card.classList.add("open");
      trigger.setAttribute(
        "aria-expanded",
        "true"
      );
      description.setAttribute(
        "aria-hidden",
        "false"
      );

    }

  });

});

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


/* ========== CARROSSEL — COMO FUNCIONA ============= */

const processGrid = document.querySelector(".process-grid");
const processSteps = document.querySelectorAll(".process-step");

const processPrev = document.querySelector(".process-prev");
const processNext = document.querySelector(".process-next");

const processPortrait = window.matchMedia(
  "(max-width: 1024px) and (orientation: portrait), " +
  "(max-width: 1024px) and (orientation: landscape) and (max-height: 500px)"
);

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

let processIndex = 0;
let processTimer;


/* ============= IR PARA ETAPA ================ */

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

/* ==== PRÓXIMA ETAPA 01 → 02 → 03 → 01 =========== */

function nextProcessStep() {

  processIndex =
    (processIndex + 1) % processSteps.length;

  goToProcessStep(processIndex);
}

/* ====== ETAPA ANTERIOR ==================== */

function previousProcessStep() {

  processIndex =
    (processIndex - 1 + processSteps.length)
    % processSteps.length;

  goToProcessStep(processIndex);
}


/* ========= AUTOPLAY ===================== */

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
    6000
  );
}

/* ========= REINICIA O AUTOPLAY  ============= */

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

/* ============ FUNÇÃO DE REVEAL ============ */

function revealOnScroll(
  selector,
  {
    y = 18,
    x = 0,
    duration = 600,
    stagger = 70,
    threshold = 0.15
  } = {}
) {

  const elements = [
    ...document.querySelectorAll(selector)
  ];

  if (
    !elements.length ||
    reduceMotion.matches
  ) {
    return;
  }

  /* ESTADO INICIAL */

  elements.forEach((element) => {

    element.style.opacity = "0";

    element.style.transform =
      `translate(${x}px, ${y}px)`;

  });

  /* OBSERVADOR */

  const observer = new IntersectionObserver(

    (entries) => {

      entries.forEach((entry) => {

        if (!entry.isIntersecting) {
          return;
        }

        const element = entry.target;

        const index =
          elements.indexOf(element);

        element.style.willChange =
          "opacity, transform";

        const animation = element.animate(
          [
            {
              opacity: 0,
              transform:
                `translate(${x}px, ${y}px)`
            },

            {
              opacity: 1,
              transform:
                "translate(0px, 0px)"
            }
          ],

          {
            duration,
            delay: index * stagger,

            easing:
              "cubic-bezier(.22, 1, .36, 1)",

            fill: "forwards"
          }

        );

        animation.onfinish = () => {

          element.style.removeProperty(
            "opacity"
          );

          element.style.removeProperty(
            "transform"
          );

          element.style.removeProperty(
            "will-change"
          );

          animation.cancel();

        };

        observer.unobserve(element);

      });

    },

    {
      threshold,
      rootMargin:
        "0px 0px -8% 0px"
    }

  );

  elements.forEach((element) => {

    observer.observe(element);

  });

}

/* ============ DEMANDAS ============== */

/* TÍTULO E LINHA DOURADA */
revealOnScroll(
  ".concerns h2, .concerns .gold-line.centered",
  {
    y: 18,
    duration: 600,
    stagger: 100
  }
);

/* CARDS */
// Card entrances are handled by the GSAP concerns timeline below.

/* FRASE FINAL */
revealOnScroll(
  ".concerns-message",
  {
    y: 18,
    duration: 600,
    stagger: 0
  }
);

/* ============ PSICÓLOGAS  ====================== */

/* TÍTULO E INTRODUÇÃO */
revealOnScroll(
  ".psychologists h2, .psychologists .section-intro",
  {
    y: 18,
    duration: 600,
    stagger: 100
  }
);

/* CARDS */
revealOnScroll(
  ".psych-card",
  {
    y: 26,
    duration: 650,
    stagger: 120,
    threshold: 0.12
  }
);

/* ============= DÚVIDAS ==================== */

/* PERGUNTAS */


/* ====== COMO FUNCIONA — SOMENTE DESKTOP ====== */


// Progressive section entrances: no CSS-hidden content and no Hero animation.
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const played = new Set();
  const motion = gsap.matchMedia();
  motion.add({
    allowed: "(prefers-reduced-motion: no-preference)",
    mobilePortrait: "(max-width: 767px) and (orientation: portrait)",
    tabletPortrait: "(min-width: 768px) and (max-width: 1024px) and (orientation: portrait)"
  }, context => {
    const { allowed, mobilePortrait, tabletPortrait } = context.conditions;
    if (!allowed || (!mobilePortrait && !tabletPortrait) || played.has("therapy-image")) return;
    const therapyImage = document.querySelector(".therapy-image");
    if (!therapyImage) return;
    gsap.from(therapyImage, {
      x: tabletPortrait ? 120 : 90,
      opacity: 0,
      scale: .97,
      duration: tabletPortrait ? 1.05 : 1,
      ease: "power3.out",
      clearProps: "transform,opacity",
      scrollTrigger: { trigger: therapyImage, start: "top 85%", once: true },
      onStart: () => played.add("therapy-image")
    });
  });
  motion.add({
    allowed: "(prefers-reduced-motion: no-preference)",
    desktop: "(min-width: 1025px)",
    landscape: "(orientation: landscape)",
    tablet: "(min-width: 768px)",
    low: "(orientation: landscape) and (max-height: 500px)"
  }, context => {
    const { allowed, desktop, landscape, tablet, low } = context.conditions;
    if (!allowed) return;
    function entrance(key, trigger) {
      if (played.has(key) || !document.querySelector(trigger)) return null;
      return gsap.timeline({
        defaults: { duration: .5, ease: "power2.out", immediateRender: true },
        scrollTrigger: { trigger, start: "top 88%", once: true },
        onStart: () => played.add(key)
      });
    }
    const info = entrance("info", ".info-section");
    if (info) {
      const interval = low ? .16 : (landscape || desktop ? .24 : .21);
      const portrait = !landscape && !desktop;
      document.querySelectorAll(".info-item").forEach((item, i) => {
        info.from(item.querySelector(".info-icon"), { opacity: 0, scale: portrait ? .73 : .78, duration: .35 }, i * interval)
          .from(item.querySelector(".info-icon + div"), { opacity: 0, y: portrait ? 22 : 18 }, i * interval + .12);
      });
    }
    const concerns = entrance("concerns", ".concerns-grid");
    if (concerns) {
      const interval = low ? .09 : .13;
      document.querySelectorAll(".concern-card").forEach((card, i) => {
        const at = i * interval;
        // Column transform is independent of the card hover/open transform.
        concerns.from(card.parentElement, { opacity: 0, y: low ? 22 : (landscape || desktop ? 32 : 28), scale: .97, duration: .45, clearProps: "transform,opacity" }, at)
          .from(card.querySelector(".concern-icon svg"), { opacity: 0, scale: .75, duration: .32, clearProps: "transform,opacity" }, at + .04)
          .from(card.querySelector(".concern-title"), { opacity: 0, y: 12, duration: .38, clearProps: "transform,opacity" }, at + .13);
      });
    }
    // Mirrors the actual CSS carousel modes; timers and scrolling stay untouched.
    if (!low && (desktop || (tablet && landscape))) {
      const process = entrance("process", ".process-grid");
      if (process) document.querySelectorAll(".process-step").forEach((step, i) => {
        const at = i * .72;
        process.from(step.querySelector(".step-number"), { opacity: 0, y: 38, scale: .96, ease: "power3.out" }, at)
          .from(step.querySelector(":scope > div"), { opacity: 0, y: 38, scale: .96 }, at + .18);
        const arrow = step.nextElementSibling;
        if (arrow && arrow.matches(".process-arrow")) process.from(arrow, { opacity: 0, x: -10, duration: .3 }, at + .48);
      });
    }
    const faq = entrance("faq", ".faq-grid");
    if (faq) {
      const horizontal = desktop || landscape;
      if (horizontal && !low) {
        faq.from(".faq-intro > *", { opacity: 0, x: -40, y: 0, stagger: .1 })
          .from(".faq-item", { opacity: 0, x: 40, y: 0, stagger: .14 }, .35);
      } else {
        faq.from(".faq-intro > *", { opacity: 0, y: low ? 16 : 26, stagger: low ? .08 : .12, duration: .45 });
        document.querySelectorAll(".faq-item").forEach((item, i) => {
          const at = (low ? .45 : .70) + i * (low ? .10 : .16);
          faq.from(item, { opacity: 0, y: low ? 14 : 26, duration: .38, clearProps: "transform,opacity" }, at)
            .from(item.querySelector("button b"), { opacity: 0, scale: .73, duration: .25, clearProps: "transform,opacity" }, at)
            .from(item.querySelector("button span"), { opacity: 0, y: low ? 12 : 20, duration: .4, clearProps: "transform,opacity" }, at + .10);
        });
      }
    }
  });
}
