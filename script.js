const root = document.documentElement;
root.classList.replace("no-js", "js");

const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const navLinks = [...document.querySelectorAll("[data-nav-link]")];

const closeNav = (returnFocus = false) => {
  if (!header || !toggle) return;
  header.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open menu");
  if (returnFocus) toggle.focus();
};

if (header && toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => closeNav());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("is-open")) {
      event.preventDefault();
      closeNav(true);
    }
  });

  document.addEventListener("click", (event) => {
    if (header.classList.contains("is-open") && !header.contains(event.target)) {
      closeNav();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeNav();
  });
}

let scrollQueued = false;

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
  scrollQueued = false;
};

updateHeader();

window.addEventListener(
  "scroll",
  () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(updateHeader);
  },
  { passive: true }
);

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const sectionIds = [...new Set(navLinks.map((link) => link.getAttribute("href")).filter((href) => href && href.startsWith("#")))];

if ("IntersectionObserver" in window) {
  const sections = sectionIds.map((id) => document.querySelector(id)).filter(Boolean);
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible && visible.target.id) setActiveNav(visible.target.id);
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.2, 0.5, 1] }
  );

  sections.forEach((section) => navObserver.observe(section));
}

const revealItems = [...document.querySelectorAll("[data-reveal]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

// Animate skill bars when skills section comes into view
const skillFills = [...document.querySelectorAll(".skill-fill[data-level]")];
const setSkillLevels = () => {
  skillFills.forEach((fill) => {
    fill.style.width = fill.getAttribute("data-level") || "0%";
  });
};

if (reduceMotion || !("IntersectionObserver" in window)) {
  setSkillLevels();
} else if (skillFills.length) {
  const skillsSection = document.querySelector("#skills");
  if (skillsSection) {
    const skillsObserver = new IntersectionObserver(
      (entries, observer) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSkillLevels();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    skillsObserver.observe(skillsSection);
  } else {
    setSkillLevels();
  }
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    if (window.location.protocol !== "file:") return;
    event.preventDefault();
    const name = (contactForm.querySelector('[name="name"]')?.value || "").trim();
    const email = (contactForm.querySelector('[name="email"]')?.value || "").trim();
    const subject = (contactForm.querySelector('[name="subject"]')?.value || "New portfolio contact message").trim();
    const message = (contactForm.querySelector('[name="message"]')?.value || "").trim();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailto = `mailto:uwiduhayemichel472@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
}
