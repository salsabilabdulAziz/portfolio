/* =========================================================
   Salsabil — Portfolio interactions
   ========================================================= */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ---------- Header state ---------- */
  const header = document.querySelector(".site-header");

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  if (navToggle && mobileNav) {
    const setNavOpen = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
      mobileNav.hidden = !open;
      document.body.classList.toggle("nav-open", open);
    };

    navToggle.addEventListener("click", () => {
      setNavOpen(mobileNav.hidden);
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileNav.hidden) {
        setNavOpen(false);
        navToggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        !mobileNav.hidden &&
        !mobileNav.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        setNavOpen(false);
      }
    });

    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const handleDesktop = (event) => {
      if (event.matches) setNavOpen(false);
    };

    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", handleDesktop);
    } else if (typeof desktopQuery.addListener === "function") {
      desktopQuery.addListener(handleDesktop);
    }

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && !mobileNav.hidden) setNavOpen(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealItems = document.querySelectorAll(".reveal");

  if (revealItems.length) {
    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );

      revealItems.forEach((item) => revealObserver.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    }
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  /* ---------- Project filters (projects page) ---------- */
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const projectCards = Array.from(document.querySelectorAll("[data-category]"));
  const projectsCount = document.querySelector("[data-projects-count]");

  const countLabel = (count) => {
    if (count === 0) return "لا مشاريع";
    if (count === 1) return "مشروع واحد";
    if (count === 2) return "مشروعان";
    return count + " مشاريع";
  };

  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter || "all";
        let visible = 0;

        filterButtons.forEach((item) => {
          const isCurrent = item === button;
          item.classList.toggle("is-active", isCurrent);
          item.setAttribute("aria-pressed", String(isCurrent));
        });

        projectCards.forEach((card) => {
          const show = filter === "all" || card.dataset.category === filter;
          card.classList.toggle("is-filtered-out", !show);
          if (show) visible += 1;
        });

        if (projectsCount) projectsCount.textContent = countLabel(visible);
      });
    });
  }

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contact-form");

  if (form) {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");
    const submitButton = form.querySelector(".btn-submit");
    const submitLabel = submitButton ? submitButton.querySelector(".btn-label") : null;
    const successBox = document.getElementById("form-success");
    const charCounter = document.querySelector("[data-char-count]");
    const projectContext = document.querySelector("[data-project-context]");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const rules = [
      {
        input: nameInput,
        error: document.getElementById("name-error"),
        validate: (value) => {
          if (!value) return "من فضلك اكتبي اسمك.";
          if (value.length < 2) return "الاسم قصير جدًا — حرفان على الأقل.";
          return "";
        },
      },
      {
        input: emailInput,
        error: document.getElementById("email-error"),
        validate: (value) => {
          if (!value) return "من فضلك اكتبي بريدك الإلكتروني.";
          if (!emailPattern.test(value)) return "صيغة البريد الإلكتروني غير صحيحة.";
          return "";
        },
      },
      {
        input: messageInput,
        error: document.getElementById("message-error"),
        validate: (value) => {
          if (!value) return "من فضلك اكتبي رسالتك.";
          if (value.length < 10) return "أضيفي تفاصيل أكثر (10 أحرف على الأقل).";
          if (value.length > 600) return "الرسالة أطول من الحد المسموح (600 حرف).";
          return "";
        },
      },
    ];

    const setFieldError = (rule, message) => {
      if (!rule.input || !rule.error) return;
      const field = rule.input.closest(".field");
      if (field) field.classList.toggle("has-error", Boolean(message));
      rule.input.setAttribute("aria-invalid", message ? "true" : "false");
      rule.error.textContent = message;
    };

    const validateRule = (rule) => {
      if (!rule.input) return "";
      const message = rule.validate(rule.input.value.trim());
      setFieldError(rule, message);
      return message;
    };

    const updateCounter = () => {
      if (charCounter && messageInput) {
        charCounter.textContent = String(messageInput.value.length);
      }
    };

    rules.forEach((rule) => {
      if (!rule.input) return;

      rule.input.addEventListener("input", () => {
        if (successBox) successBox.hidden = true;
        if (rule.error && rule.error.textContent) validateRule(rule);
        if (rule.input === messageInput) updateCounter();
      });

      rule.input.addEventListener("blur", () => {
        if (rule.input.value.trim()) validateRule(rule);
      });
    });

    updateCounter();

    /* Prefill when arriving from a project card. */
    const projectNames = {
      "secure-network": "محاكاة تصميم وإدارة الشبكات الآمنة",
      "task-system": "نظام إدارة المهام البرمجية",
      "seafood-interface": "واجهة مطعم مأكولات بحرية",
    };

    const projectKey = new URLSearchParams(window.location.search).get("project");

    if (projectKey && projectNames[projectKey] && messageInput) {
      messageInput.value =
        "مرحبًا سلسبيل، أرغب بمعرفة المزيد عن مشروع «" +
        projectNames[projectKey] +
        "».";
      updateCounter();

      if (projectContext) {
        projectContext.textContent = "استفسار عن: " + projectNames[projectKey];
        projectContext.hidden = false;
      }
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      let firstInvalid = null;

      rules.forEach((rule) => {
        const message = validateRule(rule);
        if (message && !firstInvalid && rule.input) {
          firstInvalid = rule.input;
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      if (!submitButton) return;

      submitButton.disabled = true;
      submitButton.classList.add("is-loading");
      submitButton.setAttribute("aria-busy", "true");
      if (submitLabel) submitLabel.textContent = "جارٍ الإرسال...";

      window.setTimeout(() => {
        form.reset();
        rules.forEach((rule) => setFieldError(rule, ""));
        updateCounter();

        if (successBox) {
          successBox.hidden = false;
          successBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        submitButton.disabled = false;
        submitButton.classList.remove("is-loading");
        submitButton.removeAttribute("aria-busy");
        if (submitLabel) submitLabel.textContent = "إرسال الرسالة";
      }, 850);
    });
  }
})();
