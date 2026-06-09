const nav = document.querySelector(".nav");
const themeButton = document.querySelector(".theme-btn");
const copyButton = document.querySelector(".copy-btn");
const contactBg = document.querySelector(".contact-bg");
const cursorBadge = document.querySelector(".cursor-badge");
const projectVisuals = Array.from(document.querySelectorAll(".project-visual"));
const projectCards = Array.from(document.querySelectorAll(".project-card"));
const revealSections = Array.from(document.querySelectorAll(".page-reveal"));
const hero = document.querySelector(".hero");
const about = document.querySelector(".about");
const aboutCopy = document.querySelector(".about-copy");
const contact = document.querySelector(".contact");
const details = document.querySelector(".details");
let aboutTypingStarted = false;
let aboutTypeTargets = [];
let aboutTypingTimers = [];

const syncNav = () => {
  nav.classList.toggle("is-floating", window.scrollY > 28);
};

syncNav();
window.addEventListener("scroll", syncNav, { passive: true });

window.setTimeout(() => {
  document.body.classList.add("is-loaded");
}, 180);

window.setTimeout(() => {
  document.body.classList.add("intro-done");
  document.body.classList.remove("preload");
  syncScrollMotion();
}, 1500);

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  themeButton.querySelector("span:last-child").textContent = isLight ? "Dark" : "Light";
});

if (copyButton) {
  copyButton.addEventListener("click", async () => {
    const email = copyButton.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      copyButton.textContent = "Copied email";
      setTimeout(() => {
        copyButton.textContent = email;
      }, 1400);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });
}

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const prepareAboutTyping = () => {
  if (!aboutCopy || aboutTypeTargets.length) return;
  aboutTypeTargets = Array.from(aboutCopy.querySelectorAll("p")).map((paragraph) => {
    const strong = paragraph.querySelector("strong");
    const target = strong || paragraph;
    const text = target.textContent.trim();
    target.textContent = "";
    paragraph.classList.add("is-waiting");
    return { paragraph, target, text, index: 0, done: false };
  });
};

const syncCardOrigins = () => {
  projectCards.forEach((card) => {
    card.dataset.cardTop = String(card.getBoundingClientRect().top + window.scrollY);
  });
};

const syncScrollMotion = () => {
  if (hero) {
    const rect = hero.getBoundingClientRect();
    const progress = clamp(-rect.top / Math.max(rect.height * 0.72, 1));
    document.body.style.setProperty("--hero-exit", progress.toFixed(3));
  }

  if (about && aboutCopy) {
    const rect = about.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.72 && rect.bottom > window.innerHeight * 0.25;
    if (inView) {
      startAboutTyping();
    } else {
      resetAboutTyping();
    }
  }

  if (contactBg) {
    const rect = contactBg.parentElement.getBoundingClientRect();
    const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
    const shift = (progress - 0.5) * 320;
    contactBg.style.setProperty("--contact-shift", `${shift.toFixed(1)}px`);
  }

  if (contact) {
    const rect = contact.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.68 && rect.bottom > window.innerHeight * 0.2;
    contact.classList.toggle("is-typing", inView);
  }

  if (projectCards.length) {
    const stickyTop = Math.min(138, window.innerHeight * 0.18);
    projectCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const documentTop = Number(card.dataset.cardTop || rect.top + window.scrollY);
      const stuck = clamp((window.scrollY + stickyTop - documentTop) / Math.max(rect.height * 0.74, 1));
      const entering = clamp((window.innerHeight - rect.top) / Math.max(window.innerHeight * 0.78, 1));
      const nextTop = projectCards[index + 1]
        ? Number(projectCards[index + 1].dataset.cardTop || 0)
        : Number.POSITIVE_INFINITY;
      const nextViewportTop = nextTop - window.scrollY;
      const covered = clamp((stickyTop + 170 - nextViewportTop) / 170);
      const scale = 1 - stuck * 0.045;
      const lift = -stuck * (22 + index * 4);
      const tilt = -stuck * 1.6;
      card.style.setProperty("--card-scale", scale.toFixed(3));
      card.style.setProperty("--card-y", `${lift.toFixed(1)}px`);
      card.style.setProperty("--card-tilt", `${tilt.toFixed(2)}deg`);
      card.style.setProperty("--card-enter", entering.toFixed(3));
      card.style.setProperty("--card-opacity", (entering * (1 - covered)).toFixed(3));
      card.style.setProperty("--card-z", String(10 + index));
    });
  }
};

prepareAboutTyping();
syncCardOrigins();
syncScrollMotion();
window.addEventListener("scroll", syncScrollMotion, { passive: true });
window.addEventListener("resize", () => {
  syncCardOrigins();
  syncScrollMotion();
});

const syncPageReveals = () => {
  revealSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const visible = rect.top < window.innerHeight * 1.05 && rect.bottom > -window.innerHeight * 0.15;
    if (visible) {
      section.classList.add("is-visible");
    }
  });
};

syncPageReveals();
window.addEventListener("load", syncPageReveals);
window.addEventListener("scroll", syncPageReveals, { passive: true });
window.addEventListener("resize", syncPageReveals);
window.setInterval(syncPageReveals, 250);

function startAboutTyping() {
  if (aboutTypingStarted || !aboutTypeTargets.length) return;
  aboutTypingStarted = true;
  aboutCopy.classList.add("is-typing");

  aboutTypeTargets.forEach((item, itemIndex) => {
    const startTimer = window.setTimeout(() => {
      item.paragraph.classList.remove("is-waiting");
      const timer = window.setInterval(() => {
        item.index = Math.min(item.text.length, item.index + 5);
        item.target.textContent = item.text.slice(0, item.index);
        if (item.index >= item.text.length) {
          item.done = true;
          window.clearInterval(timer);
          item.paragraph.classList.add("is-typed");
        }
      }, 18);
      aboutTypingTimers.push(timer);
    }, itemIndex * 260);
    aboutTypingTimers.push(startTimer);
  });
}

function resetAboutTyping() {
  if (!aboutTypingStarted || !aboutTypeTargets.length) return;
  aboutTypingTimers.forEach((timer) => {
    window.clearTimeout(timer);
    window.clearInterval(timer);
  });
  aboutTypingTimers = [];
  aboutTypingStarted = false;
  aboutCopy.classList.remove("is-typing");

  aboutTypeTargets.forEach((item) => {
    item.index = 0;
    item.done = false;
    item.target.textContent = "";
    item.paragraph.classList.remove("is-typed");
    item.paragraph.classList.add("is-waiting");
  });
}

if (cursorBadge && projectVisuals.length) {
  projectVisuals.forEach((visual) => {
    visual.addEventListener("pointerenter", () => {
      cursorBadge.classList.add("is-visible");
    });

    visual.addEventListener("pointermove", (event) => {
      cursorBadge.style.left = `${event.clientX}px`;
      cursorBadge.style.top = `${event.clientY}px`;
    });

    visual.addEventListener("pointerleave", () => {
      cursorBadge.classList.remove("is-visible");
    });
  });
}
